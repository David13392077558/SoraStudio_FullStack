import { Request, Response } from 'express';
import { taskQueue } from '../app';
import { v4 as uuidv4 } from 'uuid';
import { fileBuffers } from '../middleware/upload';

export const analyzeVideoHandler = async (req: Request, res: Response) => {
  try {
    const videoFile = req.file;

    if (!videoFile) {
      return res.status(400).json({ error: '请上传视频文件' });
    }

    const taskId = uuidv4();
    const fileId = `${taskId}-video`;

    // 将文件 Buffer 存储到内存中
    fileBuffers.set(fileId, {
      buffer: videoFile.buffer,
      mimetype: videoFile.mimetype,
      originalname: videoFile.originalname
    });

    // 添加任务到队列（传递 fileId 而不是文件路径）
    await taskQueue.add('analyze-video', {
      taskId,
      type: 'analysis',
      fileId,
      originalname: videoFile.originalname,
      size: videoFile.size
    });

    res.json({
      taskId,
      message: '视频分析任务已提交',
      status: 'queued',
      fileInfo: {
        originalname: videoFile.originalname,
        size: videoFile.size,
        mimetype: videoFile.mimetype
      }
    });
  } catch (error) {
    console.error('视频分析失败:', error);
    res.status(500).json({ error: '服务器内部错误' });
  }
};