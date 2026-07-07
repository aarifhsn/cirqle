import axios from "axios";
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

const appKey = import.meta.env.VITE_PUSHER_APP_KEY;
const cluster = import.meta.env.VITE_PUSHER_APP_CLUSTER;

if (!appKey || !cluster) {
    console.warn(
        "Missing Pusher configuration. Please check your .env file for VITE_PUSHER_APP_KEY and VITE_PUSHER_APP_CLUSTER",
    );
}

const echo = new Echo({
    broadcaster: "pusher",
    key: appKey,
    cluster: cluster,
    forceTLS: true,
    authorizer: (channel) => ({
        authorize: (socketId, callback) => {
            axios
                .post(
                    `${import.meta.env.VITE_SERVER_BASE_URL}/broadcasting/auth`,
                    { socket_id: socketId, channel_name: channel.name },
                    { headers: { Authorization: `Bearer ${getToken()}` } },
                )
                .then((response) => callback(false, response.data))
                .catch((error) => callback(true, error));
        },
    }),
});

export default echo;
