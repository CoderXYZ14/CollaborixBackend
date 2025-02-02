import dotenv from "dotenv";
dotenv.config({ path: "./env" });
import connectDB from "../src/db/index.js";
import { app } from "../src/app.js";
import { createServer } from "http";

dotenv.config({ path: "./env" });

const server = createServer(app);

connectDB()
  .then(() => {
    server.listen(process.env.PORT || 8000, () => {
      console.log(`Server is running at port ${process.env.PORT}`);
    });
  })
  .catch((error) => console.log("MongoDB connection failed !!! ", error));
