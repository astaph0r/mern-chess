import { io } from "socket.io-client"; // import connection function

const socket = io(import.meta.env.VITE_SOCKETS_URL); // initialize websocket connection

export default socket;