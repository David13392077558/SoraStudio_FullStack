"use strict";
// src/handlers/getTaskStatus.ts
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.setTaskResult = exports.getTaskStatusHandler = void 0;
const redis_1 = __importDefault(require("../services/redis"));
// 内存缓存（可选）
const taskResults = {};
const getTaskStatusHandler = async (req, res) => {
    try {
        const { taskId } = req.params;
        // 从 Redis 读取 worker 写入的任务状态
        const raw = await redis_1.default.get(`task:${taskId}`);
        if (!raw) {
            return res.status(404).json({ error: "任务不存在" });
        }
        let parsed;
        try {
            parsed = JSON.parse(raw);
        }
        catch {
            parsed = raw;
        }
        const status = parsed.status || "pending";
        const progress = parsed.progress ?? 0;
        const result = parsed.result ?? null;
        const error = parsed.error ?? null;
        res.json({ status, progress, result, error });
    }
    catch (err) {
        console.error("获取任务状态失败:", err);
        res.status(500).json({ error: "服务器内部错误" });
    }
};
exports.getTaskStatusHandler = getTaskStatusHandler;
// Worker 写入任务结果
const setTaskResult = async (taskId, result) => {
    taskResults[taskId] = result;
    try {
        await redis_1.default.set(`task:${taskId}`, JSON.stringify(result), "EX", 7200 // 2小时
        );
    }
    catch (err) {
        console.error("缓存任务结果失败:", err);
    }
};
exports.setTaskResult = setTaskResult;
