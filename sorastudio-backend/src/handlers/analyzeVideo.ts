import { Request, Response } from 'express';
import { taskQueue } from '../app';
import { v4 as uuidv4 } from 'uuid';

export const analyzeVideoHandler = async (req: Request, res: Response) => {
  try {
    const videoFile = req.file;

    if (!videoFile) {
      return res.status(400).json({ error: '请上传视频文件' });
    }

    const taskId = uuidv4();

    // 添加任务到队列
    await taskQueue.add('analyze-video', {
      taskId,
      type: 'analysis',
      videoPath: videoFile.path,
    });

    res.json({
      taskId,
      message: '视频分析任务已提交',
      status: 'queued'
    });
  } catch (error) {
    console.error('视频分析失败:', error);
    res.status(500).json({ error: '服务器内部错误' });
  }
};