"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const bullmq_1 = require("bullmq");
const getTaskStatus_1 = require("./handlers/getTaskStatus");
const ModelManager_1 = require("./models/ModelManager");
// 创建 worker
const worker = new bullmq_1.Worker('video-tasks', async (job) => {
    console.log(`处理任务: ${job.name}, ID: ${job.data.taskId}`);
    try {
        let result;
        switch (job.name) {
            case 'generate-prompt': {
                const promptModel = ModelManager_1.modelManager.selectBestModel('prompt');
                if (!promptModel) {
                    throw new Error('没有可用的提示词生成模型');
                }
                result = await promptModel.generatePrompt(job.data);
                break;
            }
            case 'generate-script': {
                const scriptModel = ModelManager_1.modelManager.selectBestModel('script');
                if (!scriptModel) {
                    throw new Error('没有可用的脚本生成模型');
                }
                result = await scriptModel.generateScript(job.data);
                break;
            }
            case 'analyze-video': {
                const analysisModel = ModelManager_1.modelManager.selectBestModel('analysis');
                if (!analysisModel) {
                    throw new Error('没有可用的视频分析模型');
                }
                result = await analysisModel.analyzeVideo(job.data);
                break;
            }
            default:
                throw new Error(`未知任务类型: ${job.name}`);
        }
        // 保存结果
        (0, getTaskStatus_1.setTaskResult)(job.data.taskId, {
            status: 'completed',
            progress: 100,
            result
        });
        console.log(`任务完成: ${job.data.taskId}`);
        return result;
    }
    catch (error) {
        console.error(`任务失败: ${job.data.taskId}`, error);
        (0, getTaskStatus_1.setTaskResult)(job.data.taskId, {
            status: 'failed',
            progress: 0,
            error: error?.message || '未知错误'
        });
        throw error;
    }
}, {
    connection: {
        host: process.env.REDIS_HOST || 'localhost',
        port: parseInt(process.env.REDIS_PORT || '6379'),
    },
});
worker.on('completed', (job) => {
    console.log(`任务 ${job.id} 已完成`);
});
worker.on('failed', (job, err) => {
    console.error(`任务 ${job?.id} 失败:`, err);
});
console.log('Worker 已启动，等待任务...');
console.log('可用模型:', ModelManager_1.modelManager.getAvailableModels());
