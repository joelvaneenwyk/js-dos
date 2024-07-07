import { createSlice } from "@reduxjs/toolkit";
import { DosAction, getNonSerializableStore, makeStore, postJsDosEvent } from "../store";
import { Emulators } from "emulators";
import { lStorage } from "../host/lstorage";

const alphabet = "qwertyuiopasdfghjklzxcvbnm1234567890";
declare const emulators: Emulators;
export interface BundleConfig {
    name?: string;
    version?: string;
    backend?: string;
    render?: string;
}

export const BackendValues = <const>["dosbox", "dosboxX"];
export type Backend = (typeof BackendValues)[number];

export const RenderBackendValues = <const>["webgl", "canvas"];
export type RenderBackend = (typeof RenderBackendValues)[number];

export const RenderAspectValues = <const>["AsIs", "1/1", "5/4", "4/3", "16/10", "16/9", "Fit"];
export type RenderAspect = (typeof RenderAspectValues)[number];
export const FitConstant = 65535;

export const ImageRenderingValues = <const>["pixelated", "smooth"];
export type ImageRendering = (typeof ImageRenderingValues)[number];

export interface EmulatorStats {
    cyclesPerMs: number;
    nonSkippableSleepPreSec: number;
    sleepPerSec: number;
    sleepTimePerSec: number;
    framePerSec: number;
    soundPerSec: number;
    msgSentPerSec: number;
    msgRecvPerSec: number;
    netSent: number;
    netRecv: number;
    driveSent: number;
    driveRecv: number;
    driveRecvTime: number;
    driveCacheHit: number;
    driveCacheMiss: number;
    driveCacheUsed: number;
}

const initialState: {
    step:
        | "emu-init"
        | "emu-error"
        | "emu-ready"
        | "bnd-load"
        | "bnd-error"
        | "bnd-config"
        | "bnd-ready"
        | "bnd-play";
    emuVersion: string;
    worker: boolean;
    backend: Backend;
    backendLocked: boolean;
    backendHardware: boolean;
    renderBackend: RenderBackend;
    renderAspect: RenderAspect;
    volume: number;
    mouseSensitivity: number;
    mouseCapture: boolean;
    paused: boolean;
    error: null | undefined | string;
    bundle: string | null;
    config: BundleConfig;
    stats: EmulatorStats;
    ci: boolean;
    ciStartedAt: number;
    network: {
        server: "netherlands" | "newyork" | "singapore";
        room: string;
        ipx: "connecting" | "connected" | "disconnected" | "error";
    };
    imageRendering: ImageRendering;
    sockdriveWrite: boolean;
} = {
    step: "emu-init",
    emuVersion: "-",
    error: null,
    bundle: null,
    config: {},
    worker: lStorage.getItem("worker") !== "false",
    backend: (lStorage.getItem("backend") ?? "dosbox") as Backend,
    backendLocked: false,
    backendHardware: lStorage.getItem("backendHardware") !== "false",
    renderBackend: (lStorage.getItem("renderBackend") ?? "webgl") as RenderBackend,
    renderAspect: (lStorage.getItem("renderAspect") ?? "AsIs") as RenderAspect,
    volume: Number.parseFloat(lStorage.getItem("volume") ?? "1.0"),
    mouseSensitivity: Number.parseFloat(lStorage.getItem("mouse_sensitivity") ?? "1.0"),
    mouseCapture: false,
    paused: false,
    stats: {
        cyclesPerMs: 0,
        nonSkippableSleepPreSec: 0,
        sleepPerSec: 0,
        sleepTimePerSec: 0,
        framePerSec: 0,
        soundPerSec: 0,
        msgSentPerSec: 0,
        msgRecvPerSec: 0,
        netRecv: 0,
        netSent: 0,
        driveSent: 0,
        driveRecv: 0,
        driveRecvTime: 0,
        driveCacheHit: 0,
        driveCacheMiss: 0,
        driveCacheUsed: 0,
    },
    network: {
        server: (lStorage.getItem("net.server") ?? "netherlands") as any,
        room: randomRoom(),
        ipx: "disconnected",
    },
    ci: false,
    ciStartedAt: 0,
    imageRendering: (lStorage.getItem("imageRendering") ?? "pixelated") as any,
    sockdriveWrite: true,
};

export type DosState = typeof initialState;

export const dosSlice = createSlice({
    name: "dos",
    initialState,
    reducers: {
        emuReady: (s, a: { payload: string }) => {
            s.step = "emu-ready";
            s.emuVersion = a.payload;
        },
        emuError: (s, a: { payload: string }) => {
            s.step = "emu-error";
            s.error = a.payload ?? "Unexpeceted error";
        },
        bndLoad: (s, a: { payload: string }) => {
            s.step = "bnd-load";
            s.bundle = a.payload;
        },
        bndError: (s, a: { payload: string }) => {
            s.step = "bnd-error";
            s.error = a.payload ?? "Unexpeceted error";
        },
        bndConfig: (s) => {
            s.step = "bnd-config";
        },
        bndReady: (s, a: { payload: BundleConfig }) => {
            s.step = "bnd-ready";
            s.config = a.payload;
        },
        bndPlay: (s, a) => {
            s.step = "bnd-play";
            (a as unknown as DosAction).asyncStore((store) => {
                postJsDosEvent(getNonSerializableStore(store), "bnd-play");
            });
        },
        dosWorker: (s, a: { payload: boolean }) => {
            s.worker = a.payload;
            lStorage.setItem("worker", s.worker ? "true" : "false");
        },
        dosBackend: (s, a: { payload: Backend }) => {
            s.backend = a.payload as Backend;
        },
        dosBackendLocked: (s, a: { payload: boolean }) => {
            s.backendLocked = a.payload;
        },
        dosBackendHardware: (s, a: { payload: boolean }) => {
            s.backendHardware = a.payload;
            lStorage.setItem("backendHardware", s.backendHardware ? "true" : "false");
        },
        renderBackend: (s, a: { payload: RenderBackend }) => {
            s.renderBackend = a.payload;
            lStorage.setItem("renderBackend", s.renderBackend);
        },
        renderAspect: (s, a: { payload: RenderAspect }) => {
            s.renderAspect = a.payload;
            lStorage.setItem("renderAspect", s.renderAspect);
        },
        imageRendering: (s, a: { payload: ImageRendering }) => {
            s.imageRendering = a.payload;
            lStorage.setItem("imageRendering", s.imageRendering);
        },
        volume: (s, a: { payload: number }) => {
            s.volume = a.payload;
            lStorage.setItem("volume", s.volume + "");
        },
        mouseSensitivity: (s, a: { payload: number }) => {
            s.mouseSensitivity = a.payload;
            lStorage.setItem("mouse_sensitivity", s.mouseSensitivity + "");
        },
        mouseCapture: (s, a: { payload: boolean }) => {
            s.mouseCapture = a.payload;
        },
        paused: (s, a: { payload: boolean }) => {
            s.paused = a.payload;
        },
        stats: (s, a: { payload: EmulatorStats }) => {
            s.stats = a.payload;
        },
        ci: (s, a: { payload: boolean }) => {
            s.ci = a.payload;
            if (a.payload) {
                s.ciStartedAt = Date.now();
            }
        },
        connectIpx: (s, a: { payload: { room: string; address: string } }) => {
            if (s.network.ipx === "connected") {
                throw new Error("Already connected");
            }

            if (!s.ci) {
                throw new Error("DOS is not started");
            }

            const { room, address } = a.payload;
            s.network.ipx = "connecting";
            (a as unknown as DosAction).asyncStore((store) => {
                const nonSerializableStore = getNonSerializableStore(store);
                if (!nonSerializableStore.ci) {
                    throw new Error("DOS is not started");
                }

                const canonicalAddress = address.endsWith("/")
                    ? address.substring(0, address.length - 1)
                    : address;

                nonSerializableStore.ci
                    .networkConnect(
                        0 /* NetworkType.NETWORK_DOSBOX_IPX */,
                        canonicalAddress + ":1900/ipx/" + room.replaceAll("@", "_"),
                    )
                    .then(() => {
                        store.dispatch(dosSlice.actions.statusIpx("connected"));
                    })
                    .catch((e) => {
                        store.dispatch(dosSlice.actions.statusIpx("error"));
                        console.error(e);
                    });
            });
        },
        statusIpx: (s, a: { payload: "error" | "connected" | "connecting" }) => {
            s.network.ipx = a.payload;
        },
        disconnectIpx: (s, a) => {
            s.network.ipx = "disconnected";
            (a as unknown as DosAction).asyncStore((store) => {
                getNonSerializableStore(store).ci?.networkDisconnect(0 /* IPX */);
            });
        },
        setRoom: (s, a: { payload: string }) => {
            s.network.room = a.payload;
        },
        setServer: (s, a: { payload: typeof initialState.network.server }) => {
            s.network.server = a.payload;
            lStorage.setItem("net.server", a.payload);
        },
        setSockdriveWrite: (s, a: { payload: boolean }) => {
            s.sockdriveWrite = a.payload;
        },
    },
});

let emulatorsReady = false;
export function initEmulators(store: ReturnType<typeof makeStore>, pathPrefix: string) {
    store.dispatch(async (dispatch) => {
        try {
            if (!emulatorsReady) {
                await initEmulatorsJs(pathPrefix);
                emulatorsReady = true;
            }
            dispatch(dosSlice.actions.emuReady(emulators.version));
        } catch (e) {
            console.error("Unable to init emulators.js", e);
            dispatch(dosSlice.actions.emuError((e as any).message));
        }
    });
}

function initEmulatorsJs(pathPrefix: string) {
    const el = document.querySelector("#emulators.js");
    if (el !== null) {
        return Promise.resolve();
    }

    return new Promise<void>((resolve, reject) => {
        const script = document.createElement("script");
        script.async = true;
        script.type = "text/javascript";
        script.src = pathPrefix + "emulators.js";
        script.onload = () => {
            emulators.pathPrefix = pathPrefix;
            resolve();
        };
        script.onerror = (err) => {
            reject(
                new Error(
                    "Unable to add emulators.js. Probably you should set the " +
                        "'pathPrefix' option to point to the js-dos folder.",
                ),
            );
        };

        document.head.appendChild(script);
    });
}

function randomSymbol() {
    return alphabet[Math.round(Math.random() * (alphabet.length - 1))];
}

function randomRoom() {
    return randomSymbol() + randomSymbol() + randomSymbol();
}
