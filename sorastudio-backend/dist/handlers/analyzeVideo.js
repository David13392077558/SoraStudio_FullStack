"use strict";
// src/handlers/analyzeVideo.ts
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.analyzeVideoHandler = void 0;
const redis_1 = __importDefault(require("../services/redis"));
const uuid_1 = require("uuid");
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const analyzeVideoHandler = async (req, res) => {
    try {
        const videoFile = req.file;
        if (!videoFile) {
            return res.status(400).json({ error: "请上传视频文件" });
        }
        const taskId = (0, uuid_1.v4)();
        const fileId = `${taskId}-video`;
        // Render 支持 /tmp 作为临时存储
        const tempPath = path_1.default.join("/tmp", `${fileId}.mp4`);
        fs_1.default.writeFileSync(tempPath, videoFile.buffer);
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
        await redis_1.default.set(`pending_task:${taskId}`, JSON.stringify(task), "EX", 3600);
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
    }
    catch (error) {
        console.error("视频分析失败:", error);
        res.status(500).json({ error: "服务器内部错误" });
    }
};
exports.analyzeVideoHandler = analyzeVideoHandler;
