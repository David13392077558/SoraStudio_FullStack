"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.generatePromptHandler = void 0;
const app_1 = require("../app");
const uuid_1 = require("uuid");
const upload_1 = require("../middleware/upload");
const generatePromptHandler = async (req, res) => {
    try {
        const { style, description } = req.body;
        const mReq = req;
        const imageFile = mReq.files?.['image']?.[0];
        const videoFile = mReq.files?.['video']?.[0];
        if (!style) {
            return res.status(400).json({ error: '风格参数必填' });
        }
        if (!imageFile && !videoFile) {
            return res.status(400).json({ error: '请上传图片或视频文件' });
        }
        const taskId = (0, uuid_1.v4)();
        // 用于传递给 worker 的数据
        const fileData = {
            taskId,
            type: 'prompt',
            style,
            description,
        };
        // 处理图片
        if (imageFile) {
            const imageFileId = `${taskId}-image`;
            upload_1.fileBuffers.set(imageFileId, {
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
        // 处理视频
        if (videoFile) {
            const videoFileId = `${taskId}-video`;
            upload_1.fileBuffers.set(videoFileId, {
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
        // 添加任务到队列（只添加一次）
        await app_1.taskQueue.add('generate-prompt', fileData);
        res.json({
            taskId,
            message: '提示词生成任务已提交',
            status: 'queued',
            fileInfo: fileData.imageInfo || fileData.videoInfo
        });
    }
    catch (error) {
        console.error('生成提示词失败:', error);
        res.status(500).json({ error: '服务器内部错误' });
    }
};
exports.generatePromptHandler = generatePromptHandler;
