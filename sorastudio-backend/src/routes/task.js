import express from "express";
import { redis } from "../redis.js";

const router = express.Router();

// 查询任务状态
router.get("/task/:id", async (req, res) => {
  const id = req.params.id;

  // 从 Redis 获取任务信息
  const task = await redis.hGetAll(`task:${id}`);

  if (!task.id) {
    return res.status(404).json({
      success: false,
      message: "任务不存在",
    });
  }

  res.json({
    success: true,
    task,
  });
});

export default router;
