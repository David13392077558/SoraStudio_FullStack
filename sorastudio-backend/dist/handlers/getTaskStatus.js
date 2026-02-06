"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.setTaskResult = exports.getTaskStatusHandler = void 0;
const redisClient_1 = __importDefault(require("../utils/redisClient"));
// 简单的内存存储，生产环境应该用Redis或数据库
const taskResults = {};
const getTaskStatusHandler = async (req, res) => {
    try {
        const { taskId } = req.params;
        // 直接从 Redis 读取 Python Worker 写入的状态
        const raw = await redisClient_1.default.get(`task:${taskId}`);
        if (!raw) {
            return res.status(404).json({ error: '任务不存在' });
        }
        let parsed;
        try {
            parsed = JSON.parse(raw);
        }
        catch (e) {
            // 如果已经是对象，则直接使用
            parsed = raw;
        }
        // 保持响应格式 status / progress / result / error
        const status = parsed.status || 'pending';
        const progress = parsed.progress ?? 0;
        const result = parsed.result ?? null;
        const error = parsed.error ?? null;
        res.json({ status, progress, result, error });
    }
    catch (err) {
        console.error('获取任务状态失败:', err);
        res.status(500).json({ error: '服务器内部错误' });
    }
};
exports.getTaskStatusHandler = getTaskStatusHandler;
// 导出设置任务结果的函数（供worker使用）
const setTaskResult = async (taskId, result) => {
    taskResults[taskId] = result;
    try {
        await redisClient_1.default.setex(`task:${taskId}`, 7200, JSON.stringify(result));
    }
    catch (err) {
        console.error('缓存任务结果失败:', err);
    }
};
exports.setTaskResult = setTaskResult;
