import { Request, Response } from 'express';
import redisClient from '../utils/redisClient';
import { v4 as uuidv4 } from 'uuid';
import fs from 'fs';
import path from 'path';

export const analyzeVideoHandler = async (req: Request, res: Response) => {
  try {
    const videoFile = req.file;

    if (!videoFile) {
      return res.status(400).json({ error: '请上传视频文件' });
    }

    const taskId = uuidv4();
    const fileId = `${taskId}-video`;

    // ⭐ 将视频保存到 /tmp（Render 和 Linux 都支持）
    const tempPath = path.join('/tmp', `${fileId}.mp4`);
    fs.writeFileSync(tempPath, videoFile.buffer);

    // ⭐ 构建 worker 能识别的任务对象
    const task = {
      task_id: taskId,
      type: 'video_analysis',
      video_path: tempPath, // ⭐ 关键字段
      originalname: videoFile.originalname,
      size: videoFile.size
    };

    // ⭐ 写入 Redis，让 worker 读取
    await redisClient.set(
      `pending_task:${taskId}`,
      JSON.stringify(task),
      'EX',
      3600
    );

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
