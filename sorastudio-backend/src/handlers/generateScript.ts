import { Request, Response } from 'express';
import { taskQueue } from '../app';
import { v4 as uuidv4 } from 'uuid';
import { fileBuffers } from '../middleware/upload';

export const generateScriptHandler = async (req: Request, res: Response) => {
  try {
    const { productUrl, productDescription, style } = req.body;
    const productImageFile = (req.files as any)?.['productImage']?.[0];

    if (!productDescription || !style) {
      return res.status(400).json({ error: '产品描述和风格参数必填' });
    }

    const taskId = uuidv4();
    const fileData: any = {
      taskId,
      type: 'script',
      productUrl,
      productDescription,
      style,
    };

    // 将文件 Buffer 存储到内存，传递 fileId 而不是路径
    if (productImageFile) {
      const imageFileId = `${taskId}-productImage`;
      fileBuffers.set(imageFileId, {
        buffer: productImageFile.buffer,
        mimetype: productImageFile.mimetype,
        originalname: productImageFile.originalname
      });
      fileData.productImageFileId = imageFileId;
      fileData.imageInfo = {
        originalname: productImageFile.originalname,
        size: productImageFile.size,
        mimetype: productImageFile.mimetype
      };
    }

    // 添加任务到队列
    await taskQueue.add('generate-script', fileData);

    res.json({
      taskId,
      message: '脚本生成任务已提交',
      status: 'queued',
      fileInfo: fileData.imageInfo
    });
  } catch (error) {
    console.error('生成脚本失败:', error);
    res.status(500).json({ error: '服务器内部错误' });
  }
};