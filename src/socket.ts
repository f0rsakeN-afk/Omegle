import { Server, Socket } from "socket.io";
import prisma from "./lib/prisma";
import z from "zod";

export const joinRoomSchema = z.object({
  roomKey: z.string().min(3, "Room key must contain at least 3 characters"),
  username: z.string().min(1, "Username must contain at least a character"),
});

export const registerSocketHandlers = (socket: Socket, io: Server) => {
  socket.on("join-room", async (data) => {
    const parsed = joinRoomSchema.safeParse(data);
    if (!parsed.success) {
      socket.emit("error", { message: "Invalid join payload" });
    }

    // @ts-ignore
    const { roomKey, username } = parsed.data;

    let room = await prisma.room.findUnique({ where: { key: roomKey } });

    if (!room) {
      room = await prisma.room.create({
        data: { key: roomKey },
      });
    }

    await prisma.user.create({
      data: {
        socketId: socket.id,
        username,
        roomId: room.id,
      },
    });

    socket.join(roomKey);
    console.log(`${username} joined room ${roomKey}`);

    socket.to(roomKey).emit("user-joined", { username, id: socket.id });
  });

  socket.on("send-message", ({ roomKey, message, username }) => {
    io.to(roomKey).emit("receive-message", {
      username,
      message,
      time: new Date().toISOString(),
    });
  });

  socket.on("signal", ({ roomKey, signalData, targetId }) => {
    io.to(targetId).emit("signal", { signalData, from: socket.id });
  });

  socket.on("disconnect", async () => {
    await prisma.user.deleteMany({
      where: {
        socketId: socket.id,
      },
    });
  });
};
