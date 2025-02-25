import { CommandInterface } from "emulators";
import { mount } from "./mount";

export function mouseCapture(
    sensitivity: number,
    pointerButton: number,
    el: HTMLElement,
    ci: CommandInterface,
) {
    function isNotLocked() {
        return document.pointerLockElement !== el;
    }

    function onMouseDown(x: number, y: number, button: number) {
        if (isNotLocked()) {
            const requestPointerLock =
                el.requestPointerLock ||
                (el as any).mozRequestPointerLock ||
                (el as any).webkitRequestPointerLock;

            requestPointerLock.call(el);

            return;
        }

        ci.sendMouseButton(button, true);
    }

    function onMouseUp(x: number, y: number, button: number) {
        if (isNotLocked()) {
            return;
        }

        ci.sendMouseButton(button, false);
    }

    function onMouseMove(x: number, y: number, mX: number, mY: number) {
        if (isNotLocked()) {
            return;
        }

        if (mX === 0 && mY === 0) {
            return;
        }

        (ci as any).sendMouseRelativeMotion(mX * sensitivity, mY * sensitivity);
    }

    function onMouseLeave(x: number, y: number) {
        // nothing to do
    }

    return mount(el, pointerButton, onMouseDown, onMouseMove, onMouseUp, onMouseLeave);
}
