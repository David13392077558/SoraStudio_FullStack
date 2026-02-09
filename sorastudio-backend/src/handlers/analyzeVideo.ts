// src/handlers/analyzeVideo.ts

import { Request, Response } from "express";
import redis from "../services/redis";
import { v4 as uuidv4 } from "uuid";
import { uploadToR2 } from "../services/r2";

export const analyzeVideoHandler = async (req: Request, res: Response) => {
  try {
    const videoFile = req.file;

    if (!videoFile) {
      return res.status(400).json({ error: "请上传视频文件" });
    }

    const taskId = uuidv4();
    const filename = `${taskId}.mp4`;

    const publicUrl = await uploadToR2(
      videoFile.buffer,
      filename,
      videoFile.mimetype || "video/mp4"
    );

    const task = {
      id: taskId,
      type: "video_analysis",
      videoUrl: publicUrl,
      createdAt: Date.now(),
      status: "queued",
    };

    // ⭐ 正确写法：写入 task:<id>，类型为 STRING
    await redis.set(`task:${taskId}`, JSON.stringify(task));

    // 推入队列
    await redis.lpush("tasks:queue", taskId);

    console.log(`任务已写入 Redis: task:${taskId}`);
    console.log(`任务已加入队列: tasks:queue -> ${taskId}`);

    res.json({
      taskId,
      message: "视频分析任务已提交",
      status: "queued",
      videoUrl: publicUrl,
    });

  } catch (error) {
    console.error("视频分析失败:", error);
    res.status(500).json({ error: "服务器内部错误" });
  }
};
