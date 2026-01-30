import { Request, Response } from 'express';
import { taskQueue } from '../app';
import { v4 as uuidv4 } from 'uuid';
import { fileBuffers } from '../middleware/upload';

interface MulterRequest extends Request {
  files: {
    [fieldname: string]: Express.Multer.File[];
  };
}

export const generateScriptHandler = async (req: Request, res: Response) => {
  try {
    const { productUrl, productDescription, style } = req.body;
    const mReq = req as MulterRequest;

    const productImageFile = mReq.files?.['productImage']?.[0];

    if (!productDescription || !style) {
      return res.status(400).json({ error: '产品描述和风格参数必填' });
    }

    const taskId = uuidv4();

    // 用于传递给 worker 的数据
    const fileData: any = {
      taskId,
      type: 'script',
      productUrl,
      productDescription,
      style,
    };

    // 处理产品图片
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

    // 添加任务到队列（只添加一次）
    await taskQueue.add('generate-script', fileData);

    res.json({
      taskId,
      message: '脚本生成任务已提交',
      status: 'queued',
      fileInfo: fileData.imageInfo
    });

  } catch (error: any) {
    console.error('生成脚本失败:', error);
    res.status(500).json({ error: '服务器内部错误' });
  }
};
