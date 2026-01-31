import { Request, Response } from 'express';
import redisClient from '../utils/redisClient';
import { v4 as uuidv4 } from 'uuid';
import { fileBuffers } from '../middleware/upload';

interface MulterRequest extends Request {
  files: {
    [fieldname: string]: Express.Multer.File[];
  };
}

export const generatePromptHandler = async (req: Request, res: Response) => {
  try {
    const { style, description } = req.body;
    const mReq = req as MulterRequest;

    const imageFile = mReq.files?.['image']?.[0];
    const videoFile = mReq.files?.['video']?.[0];

    if (!style) {
      return res.status(400).json({ error: '风格参数必填' });
    }

    if (!imageFile && !videoFile) {
      return res.status(400).json({ error: '请上传图片或视频文件' });
    }

    const taskId = uuidv4();

    // 用于传递给 worker 的统一任务对象（遵循 task schema）
    const task = {
      task_id: taskId,
      type: 'video_generation',
      payload: {
        style,
        description,
      }
    } as any;

    // 处理图片
    if (imageFile) {
      const imageFileId = `${taskId}-image`;
      fileBuffers.set(imageFileId, {
        buffer: imageFile.buffer,
        mimetype: imageFile.mimetype,
        originalname: imageFile.originalname
      });

      task.payload.imageFileId = imageFileId;
      task.payload.imageInfo = {
        originalname: imageFile.originalname,
        size: imageFile.size,
        mimetype: imageFile.mimetype
      };
    }

    // 处理视频
    if (videoFile) {
      const videoFileId = `${taskId}-video`;
      fileBuffers.set(videoFileId, {
        buffer: videoFile.buffer,
        mimetype: videoFile.mimetype,
        originalname: videoFile.originalname
      });

      task.payload.videoFileId = videoFileId;
      task.payload.videoInfo = {
        originalname: videoFile.originalname,
        size: videoFile.size,
        mimetype: videoFile.mimetype
      };
    }

    // 写入 Redis 作为待处理任务
    await redisClient.set(
      `pending_task:${taskId}`,
      JSON.stringify(task),
      'EX',
      3600
    );

    res.json({
      taskId,
      message: '提示词生成任务已提交',
      status: 'queued',
      fileInfo: task.payload.imageInfo || task.payload.videoInfo
    });

  } catch (error: any) {
    console.error('生成提示词失败:', error);
    res.status(500).json({ error: '服务器内部错误' });
  }
};
