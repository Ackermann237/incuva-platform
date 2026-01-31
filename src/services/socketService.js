import { io } from "socket.io-client";

let socket;

export const connectSocket = (chatId, callback) => {
  socket = io("http://localhost:5000/messaging", {
    withCredentials: true,
    query: { chatId },
  });

  socket.on("connect", () => {
    console.log("Connecté au serveur WebSocket");
  });

  socket.on("new_message", (data) => {
    if (data.chat_id === chatId) {
      callback(data.message);
    }
  });

  socket.on("disconnect", () => {
    console.log("Déconnecté du serveur WebSocket");
  });
};

export const disconnectSocket = () => {
  if (socket) {
    socket.disconnect();
  }
};
