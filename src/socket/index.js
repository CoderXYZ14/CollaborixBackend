import { Server } from "socket.io";
import ACTIONS from "../utils/socket-actions/action.js";

export function initializeSocket(server) {
  const io = new Server(server);
  const userSocketMap = {}; // Keeps track of the usernames associated with socket IDs

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
      // Map the user's socket ID to their username
      userSocketMap[socket.id] = username;

      // Join the specified room
      socket.join(roomId);

      // Get all connected clients in the room
      const clients = getAllConnectedClients(roomId);

      // Notify all clients in the room of the new connection
      clients.forEach(({ socketId }) => {
        io.to(socketId).emit(ACTIONS.JOINED, {
          clients,
          username,
          socketId: socket.id,
        });
      });
    });

    //hangle code change

    socket.on(ACTIONS.CODE_CHANGE, ({ roomId, code }) => {
      io.to(roomId).emit(ACTIONS.CODE_CHANGE, { code });
    });

    // Handle user disconnection
    socket.on("disconnecting", () => {
      const rooms = [...socket.rooms];

      // Notify all rooms the user is about to leave
      rooms.forEach((roomId) => {
        socket.to(roomId).emit(ACTIONS.DISCONNECTED, {
          socketId: socket.id,
          username: userSocketMap[socket.id],
        });
      });

      // Clean up after disconnection
      delete userSocketMap[socket.id];
    });
  });

  return io;
}
