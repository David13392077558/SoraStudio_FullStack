"use strict";
// src/routes/upload.ts
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const multer_1 = __importDefault(require("multer"));
const r2_1 = require("../services/r2");
const redis_1 = __importDefault(require("../services/redis"));
const uuid_1 = require("uuid");
const router = express_1.default.Router();
const upload = (0, multer_1.default)();
router.post("/upload", upload.single("file"), async (req, res) => {
    const file = req.file;
    if (!file) {
        return res.status(400).json({
            success: false,
            message: "未收到文件"
        });
    }
    try {
        const id = (0, uuid_1.v4)();
        const filename = `${id}.mp4`;
        // 上传到 R2
        const url = await (0, r2_1.uploadToR2)(file.buffer, filename);
        const task = {
            id,
            status: "queued",
            videoUrl: url,
            result: null,
            createdAt: Date.now(),
            updatedAt: Date.now()
        };
        // 写入 Redis（任务数据）
        await redis_1.default.hset(`task:${id}`, "data", JSON.stringify(task));
        // 推入任务队列
        await redis_1.default.rpush("tasks:queue", id);
        res.json({
            success: true,
            taskId: id,
            videoUrl: url
        });
    }
    catch (err) {
        console.error("Upload error:", err);
        res.status(500).json({ success: false });
    }
});
exports.default = router;
