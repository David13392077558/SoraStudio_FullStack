// src/handlers/getTaskStatus.ts

import { Request, Response } from "express";
import redis from "../services/redis";

// 内存缓存（可选）
const taskResults: Record<string, any> = {};

export const getTaskStatusHandler = async (req: Request, res: Response) => {
  try {
    const { taskId } = req.params;

    // 从 Redis 读取 worker 写入的任务状态
    const raw = await redis.get(`task:${taskId}`);

    if (!raw) {
      return res.status(404).json({ error: "任务不存在" });
    }

    let parsed: any;
    try {
      parsed = JSON.parse(raw);
    } catch {
      parsed = raw;
    }

    const status = parsed.status || "pending";
    const progress = parsed.progress ?? 0;
    const result = parsed.result ?? null;
    const error = parsed.error ?? null;

    res.json({ status, progress, result, error });
  } catch (err) {
    console.error("获取任务状态失败:", err);
    res.status(500).json({ error: "服务器内部错误" });
  }
};

// Worker 写入任务结果
export const setTaskResult = async (taskId: string, result: any) => {
  taskResults[taskId] = result;

  try {
    await redis.set(
      `task:${taskId}`,
      JSON.stringify(result),
      "EX",
      7200 // 2小时
    );
  } catch (err) {
    console.error("缓存任务结果失败:", err);
  }
};
