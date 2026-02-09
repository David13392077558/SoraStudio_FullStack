"use strict";
// src/handlers/analyzeVideo.ts
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.analyzeVideoHandler = void 0;
const redis_1 = __importDefault(require("../services/redis"));
const uuid_1 = require("uuid");
const r2_1 = require("../services/r2");
const analyzeVideoHandler = async (req, res) => {
    try {
        const videoFile = req.file;
        if (!videoFile) {
            return res.status(400).json({ error: "请上传视频文件" });
        }
        const taskId = (0, uuid_1.v4)();
        const filename = `${taskId}.mp4`;
        const publicUrl = await (0, r2_1.uploadToR2)(videoFile.buffer, filename, videoFile.mimetype || "video/mp4");
        const task = {
            id: taskId,
            type: "video_analysis",
            videoUrl: publicUrl,
            createdAt: Date.now(),
            status: "queued",
        };
        // ⭐ 正确写法：写入 task:<id>，类型为 STRING
        await redis_1.default.set(`task:${taskId}`, JSON.stringify(task));
        // 推入队列
        await redis_1.default.lpush("tasks:queue", taskId);
        console.log(`任务已写入 Redis: task:${taskId}`);
        console.log(`任务已加入队列: tasks:queue -> ${taskId}`);
        res.json({
            taskId,
            message: "视频分析任务已提交",
            status: "queued",
            videoUrl: publicUrl,
        });
    }
    catch (error) {
        console.error("视频分析失败:", error);
        res.status(500).json({ error: "服务器内部错误" });
    }
};
exports.analyzeVideoHandler = analyzeVideoHandler;
