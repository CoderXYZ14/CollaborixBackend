import { Server } from "socket.io";
import ACTIONS from "../utils/socket-actions/action.js";

export function initializeSocket(server) {
  const io = new Server(server);
  const userSocketMap = {}; // Maps socket IDs to usernames
  const roomCodeMap = {}; // Maps room IDs to the current code

  // Helper function to get all connected clients in a room
  function getAllConnectedClients(roomId) {
    return Array.from(io.sockets.adapter.rooms.get(roomId) || [])
      .map((socketId) => ({
        socketId,
        username: userSocketMap[socketId],
      }))
      .filter(({ username }) => username !== undefined);
  }

  io.on("connection", (socket) => {
    socket.on(ACTIONS.JOIN, ({ roomId, username }) => {
      userSocketMap[socket.id] = username;
      socket.join(roomId);

      if (!roomCodeMap[roomId]) roomCodeMap[roomId] = ""; // Start with an empty code

      const clients = getAllConnectedClients(roomId);

      // Notify existing clients about the new user
      clients.forEach(({ socketId }) => {
        io.to(socketId).emit(ACTIONS.JOINED, {
          clients,
          username,
          socketId: socket.id,
        });
      });

      io.to(socket.id).emit(ACTIONS.SYNC_CODE, {
        code: roomCodeMap[roomId],
      });
    });

    // Handle code changes
    socket.on(ACTIONS.CODE_CHANGE, ({ roomId, code }) => {
      roomCodeMap[roomId] = code;
      socket.to(roomId).emit(ACTIONS.CODE_CHANGE, { code });
    });

    // Sync code on request
    socket.on(ACTIONS.SYNC_CODE, ({ socketId, code }) => {
      io.to(socketId).emit(ACTIONS.CODE_CHANGE, { code });
    });

    // Handle disconnection
    socket.on("disconnecting", () => {
      const rooms = [...socket.rooms];
      rooms.forEach((roomId) => {
        socket.to(roomId).emit(ACTIONS.DISCONNECTED, {
          socketId: socket.id,
          username: userSocketMap[socket.id],
        });
      });

      delete userSocketMap[socket.id];
    });
  });

  return io;
}
