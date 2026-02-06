"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.generateScriptHandler = void 0;
const redisClient_1 = __importDefault(require("../utils/redisClient"));
const uuid_1 = require("uuid");
const upload_1 = require("../middleware/upload");
const generateScriptHandler = async (req, res) => {
    try {
        const { productUrl, productDescription, style } = req.body;
        const mReq = req;
        const productImageFile = mReq.files?.['productImage']?.[0];
        if (!productDescription || !style) {
            return res.status(400).json({ error: '产品描述和风格参数必填' });
        }
        const taskId = (0, uuid_1.v4)();
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
            upload_1.fileBuffers.set(imageFileId, {
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
        await redisClient_1.default.set(`pending_task:${taskId}`, JSON.stringify(task), 'EX', 3600);
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
exports.generateScriptHandler = generateScriptHandler;
