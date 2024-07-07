import { useEffect, useRef } from "preact/hooks";
import { useDispatch, useSelector } from "react-redux";
import { Login } from "./login/login";
import { Frame } from "./frame/frame";
import { SideBar } from "./sidebar/sidebar";
import { State } from "./store";
import { dispatchLoginAction, uiSlice } from "./store/ui";
import { Window } from "./window/window";
import { useT } from "./i18n";

let currentWideScreen = uiSlice.getInitialState().wideScreen;
export function Ui() {
    const rootRef = useRef<HTMLDivElement>(null);
    const theme = useSelector((state: State) => state.ui.theme);
    const dispatch = useDispatch();

    useEffect(() => {
        if (rootRef === null || rootRef.current === null) {
            return;
        }

        const root = rootRef.current;
        function onResize() {
            const size = root.getBoundingClientRect().width;
            const wide = size > 640;
            if (wide !== currentWideScreen) {
                currentWideScreen = wide;
                dispatch(uiSlice.actions.setWideScreen(currentWideScreen));
            }
        }

        const resizeObserver = new ResizeObserver(onResize);
        resizeObserver.observe(root);
        window.addEventListener("resize", onResize);

        return () => {
            resizeObserver.disconnect();
            window.removeEventListener("resize", onResize);
        };
    }, [rootRef, dispatch]);

    return (
        <div ref={rootRef} class="w-full h-full relative" data-theme={theme}>
            <Window />
            <Frame />
            <SideBar />
            <Login />
            <Toast />
            <ReadOnlyWarning />
            <UpdateWsWarning />
        </div>
    );
}

function Toast() {
    const toast = useSelector((state: State) => state.ui.toast);
    const intent = useSelector((state: State) => state.ui.toastIntent);
    const readOnlyWarning = useSelector((state: State) => state.ui.readOnlyWarning);

    if (toast === null) {
        return null;
    }

    return (
        <div class={"absolute right-10 " + (readOnlyWarning ? "bottom-32" : "bottom-10")}>
            <div class={"alert alert-" + (intent === "panic" ? "error" : intent)}>{toast}</div>
        </div>
    );
}

function ReadOnlyWarning() {
    const readOnlyWarning = useSelector((state: State) => state.ui.readOnlyWarning);
    const account = useSelector((state: State) => state.auth.account);
    const t = useT();
    const dispatch = useDispatch();

    if (!readOnlyWarning) {
        return null;
    }

    function fix() {
        dispatch(uiSlice.actions.readOnlyWarning(false));
        dispatchLoginAction(account, dispatch);
    }

    function close() {
        dispatch(uiSlice.actions.readOnlyWarning(false));
    }

    return (
        <div class="absolute right-10 bottom-10">
            <div class="alert">
                <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    class="stroke-info shrink-0 w-6 h-6"
                >
                    <path
                        stroke-linecap="round"
                        stroke-linejoin="round"
                        stroke-width="2"
                        d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                    ></path>
                </svg>
                <span>{t("read_only_access")}</span>
                <div>
                    <button class="btn btn-sm btn-primary mr-2" onClick={fix}>
                        {t("fix")}
                    </button>
                    <button class="btn btn-sm" onClick={close}>
                        {t("close")}
                    </button>
                </div>
            </div>
        </div>
    );
}

function UpdateWsWarning() {
    const updateWsWarning = useSelector((state: State) => state.ui.updateWsWarning);
    const t = useT();
    const dispatch = useDispatch();

    if (!updateWsWarning) {
        return null;
    }

    function fix() {
        window.open("https://dos.zone/download/", "_blank");
        dispatch(uiSlice.actions.updateWsWarning(false));
    }

    function close() {
        dispatch(uiSlice.actions.updateWsWarning(false));
    }

    return (
        <div class="absolute left-20 right-10 top-10 flex justify-center">
            <div class="alert w-auto">
                <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke-width="1.5"
                    stroke="currentColor"
                    class="size-6 text-error"
                >
                    <path
                        stroke-linecap="round"
                        stroke-linejoin="round"
                        d="M12 9v3.75m-9.303 3.376c-.866 1.5.217
                    3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898
                    0L2.697 16.126ZM12 15.75h.007v.008H12v-.008Z"
                    />
                </svg>
                <span>{t("ws_outdated")}</span>
                <div>
                    <button class="btn btn-sm btn-primary mr-2" onClick={fix}>
                        {t("update")}
                    </button>
                    <button class="btn btn-sm" onClick={close}>
                        {t("close")}
                    </button>
                </div>
            </div>
        </div>
    );
}
