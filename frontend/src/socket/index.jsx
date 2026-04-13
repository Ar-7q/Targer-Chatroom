import { io } from "socket.io-client";

let socket;

const socketInit = () => {
    if (!socket) {
        socket = io(import.meta.env.VITE_SOCKET_SERVER_URL, {
            reconnection: true,
            reconnectionAttempts: Infinity,
            timeout: 10000,
            transports: ["websocket"], // important for stability
            withCredentials: true,
        });

        socket.on("connect", () => {
            console.log(" 🔒Socket connected:", socket.id);
        });

        socket.on("connect_error", (err) => {
            console.error("❌ Socket error:", err.message);
        });
    }

    return socket;
};

export default socketInit;