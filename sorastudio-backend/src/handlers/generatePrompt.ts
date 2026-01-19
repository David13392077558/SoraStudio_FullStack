import { Request, Response } from 'express';
import { taskQueue } from '../app';
import { v4 as uuidv4 } from 'uuid';

export const generatePromptHandler = async (req: Request, res: Response) => {
  try {
    const { style, description } = req.body;
    const imageFile = req.files?.['image']?.[0];
    const videoFile = req.files?.['video']?.[0];

    if (!style) {
      return res.status(400).json({ error: '风格参数必填' });
    }

    if (!imageFile && !videoFile) {
      return res.status(400).json({ error: '请上传图片或视频文件' });
    }

    const taskId = uuidv4();

    // 添加任务到队列
    await taskQueue.add('generate-prompt', {
      taskId,
      type: 'prompt',
      style,
      description,
      imagePath: imageFile?.path,
      videoPath: videoFile?.path,
    });

    res.json({
      taskId,
      message: '提示词生成任务已提交',
      status: 'queued'
    });
  } catch (error) {
    console.error('生成提示词失败:', error);
    res.status(500).json({ error: '服务器内部错误' });
  }
};