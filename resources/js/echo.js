import Echo from "laravel-echo";
import Pusher from "pusher-js";

window.Pusher = Pusher;

const getToken = () => {
    try {
        const auth = JSON.parse(localStorage.getItem("auth"));
        return auth?.authToken ?? null;
    } catch {
        return null;
    }
};

const appKey = import.meta.env.VITE_REVERB_APP_KEY;
const host = import.meta.env.VITE_REVERB_HOST;
const port = import.meta.env.VITE_REVERB_PORT;
const scheme = import.meta.env.VITE_REVERB_SCHEME ?? "http";

if (!appKey || !host || !port) {
    console.warn(
        "Missing Reverb configuration. Please check your .env file for VITE_REVERB_APP_KEY, VITE_REVERB_HOST, and VITE_REVERB_PORT",
    );
}

const echo = new Echo({
    broadcaster: "reverb",
    key: appKey,
    wsHost: host,
    wsPort: port,
    wssPort: port,
    forceTLS: scheme === "https",
    enabledTransports: ["ws", "wss"],
    authEndpoint: `${import.meta.env.VITE_SERVER_BASE_URL}/broadcasting/auth`,
    auth: {
        headers: () => ({
            Authorization: `Bearer ${getToken()}`,
        }),
    },
});

// Connection debug listeners (deferred until socket is ready)
if (echo.connector?.socket) {
    echo.connector.socket.on("connected", () => {
        console.log("Echo connected to Reverb");
    });

    echo.connector.socket.on("disconnected", () => {
        console.warn("Echo disconnected from Reverb");
    });

    echo.connector.socket.on("error", (error) => {
        console.error("Echo connection error:", error);
    });
} else {
    // Fallback: attach listeners after a brief delay
    setTimeout(() => {
        if (echo.connector?.socket) {
            echo.connector.socket.on("connected", () => {
                console.log("Echo connected to Reverb");
            });

            echo.connector.socket.on("disconnected", () => {
                console.warn("Echo disconnected from Reverb");
            });

            echo.connector.socket.on("error", (error) => {
                console.error("Echo connection error:", error);
            });
        }
    }, 1000);
}

export default echo;
