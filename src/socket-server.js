import { createServer } from "http";
import express from "express";
import { initializeSocket } from "./socket/index.js";
import cors from "cors";
import dotenv from "dotenv";

dotenv.config();

const app = express();
const server = createServer(app);

// CORS for Socket.IO
const corsOrigin =
  process.env.CORS_ORIGIN?.trim() || "https://collaborix-phi.vercel.app";

// Configure CORS with more detailed options
app.use(
  cors({
    origin: function (origin, callback) {
      // Remove trailing slash for comparison
      const normalizedOrigin = origin?.replace(/\/$/, "");
      const normalizedAllowedOrigin = corsOrigin.replace(/\/$/, "");

      if (!origin || normalizedOrigin === normalizedAllowedOrigin) {
        callback(null, true);
      } else {
        callback(new Error("Not allowed by CORS"));
      }
    },
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"], // Added OPTIONS explicitly
    credentials: true,
    allowedHeaders: ["Content-Type", "Authorization", "X-Requested-With"],
    exposedHeaders: ["Set-Cookie"],
    maxAge: 86400, // Cache preflight request results for 24 hours
  })
);

const io = initializeSocket(server);

const PORT = process.env.SOCKET_PORT || 4000;
server.listen(PORT, () => {
  console.log(`Socket server running on port ${PORT}`);
});
