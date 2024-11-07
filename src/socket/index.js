import { Server } from "socket.io";
import ACTIONS from "../utils/socket-actions/action.js";

export function initializeSocket(server) {
  const io = new Server(
    server
    //    {
    //   cors: {
    //     origin: process.env.CORS_ORIGIN || "http://localhost:3000",
    //     methods: ["GET", "POST"],
    //     credentials: true,
    //   },
    // }
  );
  const userSocketMap = {}; //better to use redis here

  function getAllConnectedCLients(roomId) {
    // returns all clients of socket id
    return Array.from(io.sockets.adapter.rooms.get(roomId) || [])
      .map((socketId) => {
        return {
          socketId,
          username: userSocketMap[socketId],
        };
      })
      .filter(({ username }) => username !== undefined);
  }

  io.on("connection", (socket) => {
    // console.log(`User connected: ${socket.id}`);
    socket.on(ACTIONS.JOIN, ({ roomId, username }) => {
      userSocketMap[socket.id] = username;
      socket.join(roomId);

      const clients = getAllConnectedCLients(roomId);
      //console.log(clients);
      clients.forEach(({ socketId }) => {
        io.to(socketId).emit(ACTIONS.JOINED, {
          clients,
          username,
          socketId: socket.id,
        });
      });
    });

    socket.on("disconnecting", () => {
      const rooms = [...socket.rooms];
      rooms.forEach((roomId) => {
        socket.in(roomId).emit(ACTIONS.DISCONNECTED, {
          socketId: socketId,
          username: userSocketMap[socket.id],
        });
      });
      delete userSocketMap[socket.id];
      socket.leave();
    });
  });

  return io;
}

// io.on("connection", (socket) => {
//   console.log(`User connected: ${socket.id}`);

//   // Register event handlers
//   handleUserConnection(io, socket);
//   handleProblemEvents(io, socket);

//   socket.on("disconnect", () => {
//     console.log(`User disconnected: ${socket.id}`);
//   });
// });
