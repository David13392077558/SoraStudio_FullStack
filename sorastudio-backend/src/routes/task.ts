// src/routes/task.ts

import express, { Request, Response } from "express";
import redis from "../services/redis";

const router = express.Router();

// 获取任务状态（统一使用 GET + JSON 字符串）
router.get("/task/:id", async (req: Request, res: Response) => {
  const id = req.params.id;

  try {
    const raw = await redis.get(`task:${id}`);

    if (!raw) {
      return res.status(404).json({
        success: false,
        message: "任务不存在"
      });
    }

    let task: any;
    try {
      task = JSON.parse(raw);
    } catch {
      task = raw;
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
