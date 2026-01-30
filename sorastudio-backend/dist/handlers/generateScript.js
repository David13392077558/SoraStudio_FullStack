"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.generateScriptHandler = void 0;
const app_1 = require("../app");
const uuid_1 = require("uuid");
const upload_1 = require("../middleware/upload");
const generateScriptHandler = async (req, res) => {
    try {
        const { productUrl, productDescription, style } = req.body;
        // 使用 MulterRequest 让 TS 知道 files 的结构
        const mReq = req;
        const productImageFile = mReq.files?.['productImage']?.[0];
        if (!productDescription || !style) {
            return res.status(400).json({ error: '产品描述和风格参数必填' });
        }
        const taskId = (0, uuid_1.v4)();
        await app_1.taskQueue.add('generate-script', {
            taskId,
            type: 'script',
            productUrl,
            productDescription,
            style,
        });
        // 将文件 Buffer 存储到内存，传递 fileId 而不是路径
        if (productImageFile) {
            const imageFileId = `${taskId}-productImage`;
            upload_1.fileBuffers.set(imageFileId, {
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
        await app_1.taskQueue.add('generate-script', fileData);
        res.json({
            taskId,
            message: '脚本生成任务已提交',
            status: 'queued',
            fileInfo: fileData.imageInfo
        });
    }
    catch (error) {
        console.error('生成脚本失败:', error);
        res.status(500).json({ error: '服务器内部错误' });
    }
};
exports.generateScriptHandler = generateScriptHandler;
