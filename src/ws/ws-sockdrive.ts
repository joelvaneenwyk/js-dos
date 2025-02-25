import { Drive } from "sockdrive-asyncify/src/sockdrive/drive";
import { Handle, Stats } from "sockdrive-asyncify/src/sockdrive/types";

interface Template {
    name: string;
    size: number;
    heads: number;
    cylinders: number;
    sectors: number;
    sectorSize: number;
}

export interface ReadResponse {
    buffer?: Uint8Array;
    code: number;
}

export function createSockdrive(
    onOpen: (
        drive: string,
        read: boolean,
        write: boolean,
        imageSize: number,
        preloadQueue: number[],
    ) => void,
    onError: (e: Error) => void,
    onPreloadProgress: (drive: string, restBytes: number) => void,
) {
    let seq = 0;
    const mapping: { [handle: Handle]: Drive } = {};
    const templates: { [handle: number]: Template } = {};
    const memory: { [handle: number]: Uint8Array } = {};
    const stats: Stats = {
        read: 0,
        write: 0,
        readTotalTime: 0,
        cacheHit: 0,
        cacheMiss: 0,
        cacheUsed: 0,
    };
    const sockdrive = {
        stats,
        open: async (
            url: string,
            owner: string,
            name: string,
            token: string,
        ): Promise<{
            handle: Handle;
            aheadRange: number;
        }> => {
            const response = await fetch(
                url.replace("wss://", "https://").replace("ws://", "http://") +
                    "/template/" +
                    owner +
                    "/" +
                    name,
            );
            const template = await response.json();
            if (template.error) {
                throw new Error(template.error);
            }
            seq++;
            templates[seq] = {
                name: template.name,
                size: template.size ?? 0,
                heads: template.heads ?? 1,
                cylinders: template.cylinders ?? 520,
                sectors: template.sectors ?? 63,
                sectorSize: template.sector_size ?? 512,
            };

            const sectorSize = templates[seq].sectorSize;
            const module = { HEAPU8: new Uint8Array(0) };
            mapping[seq] = new Drive(url, owner, name, token, stats, module, true, true);
            return new Promise<{ handle: Handle; aheadRange: number }>((resolve, reject) => {
                const drive = owner + "/" + name;
                mapping[seq].onOpen(
                    (
                        read: boolean,
                        write: boolean,
                        imageSize: number,
                        preloadQueue: number[],
                        aheadRange: number,
                    ) => {
                        memory[seq] = new Uint8Array(
                            sectorSize /* write */ + sectorSize * aheadRange,
                        );
                        module.HEAPU8 = memory[seq];
                        onOpen(drive, read, write, imageSize, preloadQueue);
                        resolve({
                            handle: seq,
                            aheadRange,
                        });
                    },
                );
                mapping[seq].onPreloadProgress((restBytes: number) => {
                    onPreloadProgress(drive, restBytes);
                });
                mapping[seq].onError((e: Error) => {
                    onError(e);
                    reject(e);
                });
            });
        },
        read: async (handle: Handle, sector: number): Promise<ReadResponse> => {
            if (mapping[handle]) {
                const ptr = templates[seq].sectorSize;
                let code = mapping[handle].read(sector, ptr, true) as number;
                if ((code = 255)) {
                    code = await mapping[handle].read(sector, ptr, false);
                }
                return {
                    code,
                    buffer: memory[handle].slice(ptr),
                };
            }

            console.error("ERROR! sockdrive handle", handle, "not found");
            return Promise.resolve({ code: 1 });
        },
        write: (handle: Handle, sector: number, buffer: Uint8Array): number => {
            if (buffer.byteLength != templates[handle].sectorSize) {
                onError(
                    new Error(
                        "sockdrive write buffer size " +
                            buffer.byteLength +
                            " != sector size " +
                            templates[handle].sectorSize,
                    ),
                );
                return 1;
            }
            if (mapping[handle]) {
                memory[handle].set(buffer, 0);
                return mapping[handle].write(sector, 0);
            }
            console.error("ERROR! sockdrive handle", handle, "not found");
            return 1;
        },
        close: (handle: Handle) => {
            if (mapping[handle]) {
                mapping[handle].close();
                delete memory[handle];
                delete templates[handle];
                delete mapping[handle];
            }
        },
        template: (handle: Handle) => {
            return templates[handle];
        },
    };

    return sockdrive;
}
