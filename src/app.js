import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import userRouter from "./routes/user.routes.js";
import problemRouter from "./routes/problem.routes.js";

const app = express();

// First, let's ensure CORS_ORIGIN is properly set
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

app.use(express.json({ limit: "16kb" }));
app.use(express.urlencoded({ extended: true, limit: "16kb" }));
app.use(express.static("public"));
app.use(cookieParser());

// Add OPTIONS handling for preflight requests
app.options("*", cors()); // Enable pre-flight for all routes

app.use("/api/v1/users", userRouter);
app.use("/api/v1/problems", problemRouter);
app.get("/", (req, res) => res.send("Express on Vercel"));

export { app };
