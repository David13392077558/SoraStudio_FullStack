// src/routes/task.ts

import express, { Request, Response } from "express";
import redis from "../services/redis";

const router = express.Router();

router.get("/task/:id", async (req: Request, res: Response) => {
  const id = req.params.id;

  try {
    // 读取整个任务哈希
    const task = await redis.hgetall(`task:${id}`);

    if (!task || Object.keys(task).length === 0) {
      return res.status(404).json({
        success: false,
        message: "任务不存在"
      });
    }

    // Redis 返回的都是字符串，需要处理 JSON 字段
    if (task.result) {
      try {
        task.result = JSON.parse(task.result);
      } catch {}
    }

    res.json({
      success: true,
      task
    });
  } catch (err) {
    console.error("读取任务失败:", err);
    res.status(500).json({
      success: false,
      message: "服务器内部错误"
    });
  }
});

export default router;
