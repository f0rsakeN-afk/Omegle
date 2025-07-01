import express from "express";
import dotenv from "dotenv";
dotenv.config();
import http from "http";
import { Server } from "socket.io";
import { registerSocketHandlers } from "./socket";
import roomRoutes from "./routes/rooms";
import path from "path";

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"],
  },
});

app.use(express.json());
app.use("/rooms", roomRoutes);
app.use(express.static(path.join(__dirname, "../public")));

app.get("/", (req, res) => {
  res.send("Websocket running");
});

io.on("connection", (socket) => {
  console.log(`User connected:${socket.id}`);
  registerSocketHandlers(socket, io);

  socket.on("disconnect", () => {
    console.log(`User disconnected ${socket.id}`);
  });
});

server.listen(process.env.PORT, () => {
  console.log(`Server listening on port ${process.env.PORT}`);
});
