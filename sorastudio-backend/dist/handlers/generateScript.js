import redisClient from '../utils/redisClient';
import { v4 as uuidv4 } from 'uuid';
import { fileBuffers } from '../middleware/upload';
export const generateScriptHandler = async (req, res) => {
    try {
        const { productUrl, productDescription, style } = req.body;
        const mReq = req;
        const productImageFile = mReq.files?.['productImage']?.[0];
        if (!productDescription || !style) {
            return res.status(400).json({ error: '产品描述和风格参数必填' });
        }
        const taskId = uuidv4();
        const task = {
            task_id: taskId,
            type: 'generate_script',
            payload: {
                productUrl,
                productDescription,
                style
            }
        };
        // 处理产品图片
        if (productImageFile) {
            const imageFileId = `${taskId}-productImage`;
            fileBuffers.set(imageFileId, {
                buffer: productImageFile.buffer,
                mimetype: productImageFile.mimetype,
                originalname: productImageFile.originalname
            });
            task.payload.productImageFileId = imageFileId;
            task.payload.imageInfo = {
                originalname: productImageFile.originalname,
                size: productImageFile.size,
                mimetype: productImageFile.mimetype
            };
        }
        await redisClient.set(`pending_task:${taskId}`, JSON.stringify(task), 'EX', 3600);
        res.json({
            taskId,
            message: '脚本生成任务已提交',
            status: 'queued',
            fileInfo: task.payload.imageInfo
        });
    }
    catch (error) {
        console.error('生成脚本失败:', error);
        res.status(500).json({ error: '服务器内部错误' });
    }
};
