import express from "express";
import multer from "multer";
import { uploadToR2 } from "../services/r2";
import { redis } from "../services/redis";
import { v4 as uuid } from "uuid";
const router = express.Router();
const upload = multer();
router.post("/upload", upload.single("file"), async (req, res) => {
    const file = req.file;
    if (!file) {
        return res.status(400).json({
            success: false,
            message: "未收到文件",
        });
    }
    try {
        const id = uuid();
        const filename = `${id}.mp4`;
        const url = await uploadToR2(file.buffer, filename);
        const task = {
            id,
            status: "queued",
            videoUrl: url,
            result: null,
            createdAt: Date.now(),
            updatedAt: Date.now(),
        };
        // ⭐ 将任务序列化成 JSON 存入 Redis（避免 TS 类型错误）
        await redis.hSet(`task:${id}`, {
            data: JSON.stringify(task)
        });
        // 推入任务队列
        await redis.rPush("tasks:queue", id);
        res.json({ success: true, taskId: id, videoUrl: url });
    }
    catch (err) {
        console.error("Upload error:", err);
        res.status(500).json({ success: false });
    }
});
export default router;
