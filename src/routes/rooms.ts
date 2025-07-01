import express from "express";
import prisma from "../lib/prisma";

const router = express.Router();

router.post("/", async (req, res) => {
  const { key } = req.body;

  try {
    const room = await prisma.room.create({ data: { key } });
    res.status(201).json({
      message: "Room created successfully",
      room,
    });
  } catch (error) {
    res.status(400).json({ error: "Room creation failed!!" });
  }
});

export default router;
