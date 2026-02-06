import express, { Request, Response } from "express";
import { redis } from "../services/redis";

const router = express.Router();

router.get("/task/:id", async (req: Request, res: Response) => {
  const id = req.params.id;

  // 读取 Redis 中的 JSON 字符串
  const raw = await redis.hGet(`task:${id}`, "data");

  if (!raw) {
    return res.status(404).json({
      success: false,
      message: "任务不存在",
    });
  }

  // 解析 JSON
  const task = JSON.parse(raw);

  res.json({
    success: true,
    task,
  });
});

export default router;
