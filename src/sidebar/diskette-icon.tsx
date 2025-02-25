export function DisketteIcon(props: { class?: string }) {
    return (
        <svg
            xmlns="http://www.w3.org/2000/svg"
            style="padding: 2px"
            viewBox="0 0 16 16"
            enable-background="new 0 0 16 16"
            fill="currentColor"
            class={"w-full h-full rounded-lg " + props.class}
        >
            <path
                fill-rule="evenodd"
                clip-rule="evenodd"
                d="M15.71,2.29l-2-2C13.53,0.11,13.28,0,13,0h-1v6H4V0H1C0.45,0,0,0.45,0,1v14
                c0,0.55,0.45,1,1,1h14c0.55,0,1-0.45,1-1V3C16,2.72,15.89,2.47,15.71,2.29z
                M14,15H2V9c0-0.55,0.45-1,1-1h10c0.55,0,1,0.45,1,1V15
                z M11,1H9v4h2V1z"
            />
        </svg>
    );
}
