"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.setTaskResult = exports.getTaskStatusHandler = void 0;
const app_1 = require("../app");
const CacheService_1 = require("../cache/CacheService");
// 简单的内存存储，生产环境应该用Redis或数据库
const taskResults = {};
const getTaskStatusHandler = async (req, res) => {
    try {
        const { taskId } = req.params;
        // 先检查缓存
        const cachedResult = await CacheService_1.cacheService.getCachedTaskResult(taskId);
        if (cachedResult) {
            return res.json(cachedResult);
        }
        // 检查内存中的任务结果
        if (taskResults[taskId]) {
            // 缓存结果
            await CacheService_1.cacheService.cacheTaskResult(taskId, taskResults[taskId]);
            return res.json(taskResults[taskId]);
        }
        // 检查队列中的任务
        const jobs = await app_1.taskQueue.getJobs(['active', 'waiting', 'completed', 'failed']);
        const job = jobs.find(j => j.data.taskId === taskId);
        if (!job) {
            return res.status(404).json({ error: '任务不存在' });
        }
        let status = 'pending';
        let progress = 0;
        let result = null;
        let error = null;
        if (job.opts.delay) {
            status = 'queued';
        }
        else if (await job.isActive()) {
            status = 'processing';
            progress = 50; // 模拟进度
        }
        else if (await job.isCompleted()) {
            status = 'completed';
            result = job.returnvalue;
            const finalResult = { status, progress: 100, result };
            taskResults[taskId] = finalResult;
            await CacheService_1.cacheService.cacheTaskResult(taskId, finalResult);
        }
        else if (await job.isFailed()) {
            status = 'failed';
            error = job.failedReason;
            const finalResult = { status, progress: 0, error };
            taskResults[taskId] = finalResult;
            await CacheService_1.cacheService.cacheTaskResult(taskId, finalResult);
        }
        res.json({ status, progress, result, error });
    }
    catch (error) {
        console.error('获取任务状态失败:', error);
        res.status(500).json({ error: '服务器内部错误' });
    }
};
exports.getTaskStatusHandler = getTaskStatusHandler;
// 导出设置任务结果的函数（供worker使用）
const setTaskResult = (taskId, result) => {
    taskResults[taskId] = result;
    // 异步缓存，不阻塞
    CacheService_1.cacheService.cacheTaskResult(taskId, result).catch(err => console.error('缓存任务结果失败:', err));
};
exports.setTaskResult = setTaskResult;
