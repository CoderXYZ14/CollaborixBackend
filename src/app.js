import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import userRouter from "./routes/user.routes.js";
import problemRouter from "./routes/problem.routes.js";

const app = express();

// Allow access from any origin
app.use(
  cors({
    origin: process.env.FRONTEND_URL || "http://localhost:5173", // Use environment variable or default
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    credentials: true,
    allowedHeaders: ["Content-Type", "Authorization", "X-Requested-With"],
    exposedHeaders: ["Set-Cookie"],
    maxAge: 86400,
  })
);
app.use(express.json({ limit: "16kb" }));
app.use(express.urlencoded({ extended: true, limit: "16kb" }));
app.use(express.static("public"));
app.use(cookieParser());

// Add OPTIONS handling for preflight requests
app.options("*", cors()); // Enable pre-flight for all routes

// Routes
app.use("/api/v1/users", userRouter);
app.use("/api/v1/problems", problemRouter);

// Default route
app.get("/", (req, res) => res.send("Express on Vercel"));

export { app };
