import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import userRouter from "./routes/user.routes.js";
import problemRouter from "./routes/problem.routes.js";

const app = express();

// Allow access from any origin
app.use(
  cors({
    origin:
      process.env.FRONTEND_URL ||
      "https://collaborix-phi.vercel.app/" ||
      "http://localhost:5173",
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

app.options("*", cors());

app.use("/api/v1/users", userRouter);
app.use("/api/v1/problems", problemRouter);

app.get("/", (req, res) => res.send("Express on Vercel"));

export { app };
