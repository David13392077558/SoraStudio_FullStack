import { Request, Response } from 'express';
import { taskQueue } from '../app';
import { v4 as uuidv4 } from 'uuid';

// 修复 TS7053：为 Multer 的 files 定义类型
interface MulterRequest extends Request {
  files: {
    [fieldname: string]: Express.Multer.File[];
  };
}

export const generatePromptHandler = async (req: Request, res: Response) => {
  try {
    const { style, description } = req.body;

    // 使用 MulterRequest 让 TS 知道 files 的结构
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
  } catch (error: any) {
    console.error('生成提示词失败:', error);
    res.status(500).json({ error: '服务器内部错误' });
  }
};
