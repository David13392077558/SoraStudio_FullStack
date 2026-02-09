"use strict";
// src/routes/task.ts
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const redis_1 = __importDefault(require("../services/redis"));
const router = express_1.default.Router();
// 获取任务状态（统一使用 GET + JSON 字符串）
router.get("/task/:id", async (req, res) => {
    const id = req.params.id;
    try {
        const raw = await redis_1.default.get(`task:${id}`);
        if (!raw) {
            return res.status(404).json({
                success: false,
                message: "任务不存在"
            });
        }
        let task;
        try {
            task = JSON.parse(raw);
        }
        catch {
            task = raw;
        }
        res.json({
            success: true,
            task
        });
    }
    catch (err) {
        console.error("读取任务失败:", err);
        res.status(500).json({
            success: false,
            message: "服务器内部错误"
        });
    }
});
exports.default = router;
