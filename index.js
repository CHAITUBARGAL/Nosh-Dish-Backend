import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import http from "http";
import { Server } from "socket.io";
import dotenv from "dotenv";
import dishRoutes from "./routes/dishes.js";
import Dish from "./models/Dish.js";
dotenv.config();
const PORT = process.env.PORT || 4000;

const app = express();
const server = http.createServer(app);
const io = new Server(server, { cors: { origin: "*" } });

app.use(cors());
app.use(express.json());

app.use((req, res, next) => {
  req.io = io;
  next();
});

mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log("MongoDB Connected"))
  .catch((err) => console.error(err));

app.use("/api/dishes", dishRoutes);

setInterval(async () => {
  const dishes = await Dish.find();
  io.emit("dishesSync", dishes);
}, 1000);

server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
