import express, { Request, Response } from "express";
import multer from "multer";
import { uploadToR2 } from "../services/r2";
import redis from "../services/redis";
import { v4 as uuid } from "uuid";

const router = express.Router();
const upload = multer();

router.post("/upload", upload.single("file"), async (req: Request, res: Response) => {
  const file = req.file;

  if (!file) {
    return res.status(400).json({
      success: false,
      message: "未收到文件"
    });
  }

  try {
    const id = uuid();
    const filename = `${id}.mp4`;

    const url = await uploadToR2(file.buffer, filename);

    await redis.hset(`task:${id}`, {
      id,
      type: "video_analysis",
      status: "queued",
      videoUrl: url,
      result: "",
      createdAt: Date.now(),
      updatedAt: Date.now()
    });

    await redis.rpush("tasks:queue", id);

    res.json({
      success: true,
      taskId: id,
      videoUrl: url
    });
  } catch (err) {
    console.error("Upload error:", err);
    res.status(500).json({ success: false });
  }
});

export default router;
