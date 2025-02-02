import { createServer } from "http";
import express from "express";
import { Server } from "socket.io";
import { initializeSocket } from "./socket/index.js";
import cors from "cors";
import dotenv from "dotenv";

dotenv.config();

const app = express();
const server = createServer(app);

// CORS for Socket.IO
app.use(
  cors({
    origin: process.env.CORS_ORIGIN || "https://collaborix-phi.vercel.app",
    methods: ["GET", "POST"],
    credentials: true,
  })
);

const io = initializeSocket(server);

const PORT = process.env.SOCKET_PORT || 4000;
server.listen(PORT, () => {
  console.log(`Socket server running on port ${PORT}`);
});
