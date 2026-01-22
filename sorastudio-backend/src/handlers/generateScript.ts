import { Request, Response } from 'express';
import { taskQueue } from '../app';
import { v4 as uuidv4 } from 'uuid';

// 修复 TS7053：为 Multer 的 files 定义类型
interface MulterRequest extends Request {
  files: {
    [fieldname: string]: Express.Multer.File[];
  };
}

export const generateScriptHandler = async (req: Request, res: Response) => {
  try {
    const { productUrl, productDescription, style } = req.body;

    // 使用 MulterRequest 让 TS 知道 files 的结构
    const mReq = req as MulterRequest;

    const productImageFile = mReq.files?.['productImage']?.[0];

    if (!productDescription || !style) {
      return res.status(400).json({ error: '产品描述和风格参数必填' });
    }

    const taskId = uuidv4();

    await taskQueue.add('generate-script', {
      taskId,
      type: 'script',
      productUrl,
      productDescription,
      style,
      productImagePath: productImageFile?.path,
    });

    res.json({
      taskId,
      message: '脚本生成任务已提交',
      status: 'queued'
    });
  } catch (error: any) {
    console.error('生成脚本失败:', error);
    res.status(500).json({ error: '服务器内部错误' });
  }
};
