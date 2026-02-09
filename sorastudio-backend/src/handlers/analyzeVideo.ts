// src/handlers/analyzeVideo.ts

import { Request, Response } from "express";
import redis from "../services/redis";
import { v4 as uuidv4 } from "uuid";
import fs from "fs";
import path from "path";

export const analyzeVideoHandler = async (req: Request, res: Response) => {
  try {
    const videoFile = req.file;

    if (!videoFile) {
      return res.status(400).json({ error: "请上传视频文件" });
    }

    const taskId = uuidv4();
    const fileId = `${taskId}-video`;

    // Render 支持 /tmp 作为临时存储
    const tempPath = path.join("/tmp", `${fileId}.mp4`);
    fs.writeFileSync(tempPath, videoFile.buffer);

    // Worker 能识别的任务对象
    const task = {
      id: taskId,
      type: "video_analysis",
      videoUrl: tempPath,
      createdAt: Date.now(),
      status: "queued"
    };

    // 1. 写入 pending_task:{id}
    await redis.hset(`pending_task:${taskId}`, task);

    // 2. ⭐⭐ 推入队列（Worker 就能读到了）
    await redis.lpush("tasks:queue", taskId);

    console.log(`任务已写入 Redis: pending_task:${taskId}`);
    console.log(`任务已加入队列: tasks:queue -> ${taskId}`);

    res.json({
      taskId,
      message: "视频分析任务已提交",
      status: "queued"
    });

  } catch (error) {
    console.error("视频分析失败:", error);
    res.status(500).json({ error: "服务器内部错误" });
  }
};
