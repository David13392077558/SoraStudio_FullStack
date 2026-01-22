import { Worker } from 'bullmq';
import { taskQueue } from './app';
import { setTaskResult } from './handlers/getTaskStatus';
import { modelManager } from './models/ModelManager';

// 创建 worker
const worker = new Worker('video-tasks', async (job) => {
  console.log(`处理任务: ${job.name}, ID: ${job.data.taskId}`);

  try {
    let result;

    switch (job.name) {
      case 'generate-prompt': {
        const promptModel = modelManager.selectBestModel('prompt');
        if (!promptModel) {
          throw new Error('没有可用的提示词生成模型');
        }
        result = await promptModel.generatePrompt(job.data);
        break;
      }

      case 'generate-script': {
        const scriptModel = modelManager.selectBestModel('script');
        if (!scriptModel) {
          throw new Error('没有可用的脚本生成模型');
        }
        result = await scriptModel.generateScript(job.data);
        break;
      }

      case 'analyze-video': {
        const analysisModel = modelManager.selectBestModel('analysis');
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
    setTaskResult(job.data.taskId, {
      status: 'completed',
      progress: 100,
      result
    });

    console.log(`任务完成: ${job.data.taskId}`);
    return result;

  } catch (error: any) {
    console.error(`任务失败: ${job.data.taskId}`, error);

    setTaskResult(job.data.taskId, {
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
console.log('可用模型:', modelManager.getAvailableModels());
