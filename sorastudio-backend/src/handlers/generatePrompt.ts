import { Request, Response } from 'express';
import { taskQueue } from '../app';
import { v4 as uuidv4 } from 'uuid';
import { fileBuffers } from '../middleware/upload';

export const generatePromptHandler = async (req: Request, res: Response) => {
  try {
    const { style, description } = req.body;
    const imageFile = (req.files as any)?.['image']?.[0];
    const videoFile = (req.files as any)?.['video']?.[0];

    if (!style) {
      return res.status(400).json({ error: '风格参数必填' });
    }

    if (!imageFile && !videoFile) {
      return res.status(400).json({ error: '请上传图片或视频文件' });
    }

    const taskId = uuidv4();
    const fileData: any = {
      taskId,
      type: 'prompt',
      style,
      description,
    };

    // 将文件 Buffer 存储到内存，传递 fileId 而不是路径
    if (imageFile) {
      const imageFileId = `${taskId}-image`;
      fileBuffers.set(imageFileId, {
        buffer: imageFile.buffer,
        mimetype: imageFile.mimetype,
        originalname: imageFile.originalname
      });
      fileData.imageFileId = imageFileId;
      fileData.imageInfo = {
        originalname: imageFile.originalname,
        size: imageFile.size,
        mimetype: imageFile.mimetype
      };
    }

    if (videoFile) {
      const videoFileId = `${taskId}-video`;
      fileBuffers.set(videoFileId, {
        buffer: videoFile.buffer,
        mimetype: videoFile.mimetype,
        originalname: videoFile.originalname
      });
      fileData.videoFileId = videoFileId;
      fileData.videoInfo = {
        originalname: videoFile.originalname,
        size: videoFile.size,
        mimetype: videoFile.mimetype
      };
    }

    // 添加任务到队列
    await taskQueue.add('generate-prompt', fileData);

    res.json({
      taskId,
      message: '提示词生成任务已提交',
      status: 'queued',
      fileInfo: fileData.imageInfo || fileData.videoInfo
    });
  } catch (error) {
    console.error('生成提示词失败:', error);
    res.status(500).json({ error: '服务器内部错误' });
  }
};