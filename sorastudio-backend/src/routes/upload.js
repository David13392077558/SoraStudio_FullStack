import express from "express";
import multer from "multer";
import { uploadToR2 } from "../r2.js"; // 上传到 R2 的函数
import { redis } from "../redis.js"; // Redis 客户端
import { v4 as uuid } from "uuid";

const router = express.Router();
const upload = multer(); // 用于接收 multipart/form-data

router.post("/upload", upload.single("file"), async (req, res) => {
  try {
    const file = req.file;

    // 生成任务 ID（唯一）
    const id = uuid();

    // 生成文件名
    const filename = `${id}.mp4`;

    // 上传视频到 R2，返回公网 URL
    const url = await uploadToR2(file.buffer, filename);

    // 创建任务对象（存入 Redis）
    const task = {
      id,                // 任务 ID
      status: "queued",  // 初始状态：排队中
      videoUrl: url,     // 视频在 R2 的地址
      result: null,      // 分析结果（初始为空）
      createdAt: Date.now(), // 创建时间
      updatedAt: Date.now(), // 更新时间
    };

    // 将任务信息存入 Redis（哈希结构）
    await redis.hSet(`task:${id}`, task);

    // 将任务 ID 推入队列（list）
    await redis.rPush("tasks:queue", id);

    // 返回给前端
    res.json({
      success: true,
      taskId: id,
      videoUrl: url,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false });
  }
});

export default router;
