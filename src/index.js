import dotenv from "dotenv";
dotenv.config({ path: "./env" });
import connectDB from "./db/index.js";
import { app } from "./app.js";
import { initializeSocket } from "./socket/index.js";
import { createServer } from "http";

dotenv.config({ path: "./env" });

const server = createServer(app);
const io = initializeSocket(server);

connectDB()
  .then(() => {
    app.listen(process.env.PORT || 8000, () => {
      console.log(`Server is running at port ${process.env.PORT}`);
    });
  })
  .catch((error) => console.log("MongoDB connection failed !!! ", error));

app.set("io", io);
