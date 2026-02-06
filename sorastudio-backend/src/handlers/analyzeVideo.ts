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
      task_id: taskId,
      type: "video_analysis",
      video_path: tempPath,
      originalname: videoFile.originalname,
      size: videoFile.size,
      createdAt: Date.now(),
      status: "queued"
    };

    // 写入 Redis（pending_task）
    await redis.set(
      `pending_task:${taskId}`,
      JSON.stringify(task),
      "EX",
      3600
    );

    console.log(`任务已写入 Redis: pending_task:${taskId}`);

    res.json({
      taskId,
      message: "视频分析任务已提交",
      status: "queued",
      fileInfo: {
        originalname: videoFile.originalname,
        size: videoFile.size,
        mimetype: videoFile.mimetype
      }
    });
  } catch (error) {
    console.error("视频分析失败:", error);
    res.status(500).json({ error: "服务器内部错误" });
  }
};
