import { Server } from "socket.io";

export function initializeSocket(server) {
  const io = new Server(server, {
    cors: {
      origin: process.env.CORS_ORIGIN || "http://localhost:3000",
      methods: ["GET", "POST"],
      credentials: true,
    },
  });

  io.on("connection", (socket) => {
    console.log(`User connected: ${socket.id}`);
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
