import { Request, Response } from 'express';
import { taskQueue } from '../app';
import { v4 as uuidv4 } from 'uuid';

export const generateScriptHandler = async (req: Request, res: Response) => {
  try {
    const { productUrl, productDescription, style } = req.body;
    const productImageFile = req.files?.['productImage']?.[0];

    if (!productDescription || !style) {
      return res.status(400).json({ error: '产品描述和风格参数必填' });
    }

    const taskId = uuidv4();

    // 添加任务到队列
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
  } catch (error) {
    console.error('生成脚本失败:', error);
    res.status(500).json({ error: '服务器内部错误' });
  }
};