// src/routes/task.ts

import express, { Request, Response } from "express";
import redis from "../services/redis";

const router = express.Router();

router.get("/task/:id", async (req: Request, res: Response) => {
  const id = req.params.id;

  try {
    // 从 Redis 读取任务数据
    const raw = await redis.hget(`task:${id}`, "data");

    if (!raw) {
      return res.status(404).json({
        success: false,
        message: "任务不存在"
      });
    }

    const task = JSON.parse(raw);

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
