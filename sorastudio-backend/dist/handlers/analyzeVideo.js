"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.analyzeVideoHandler = void 0;
const app_1 = require("../app");
const uuid_1 = require("uuid");
const upload_1 = require("../middleware/upload");
const analyzeVideoHandler = async (req, res) => {
    try {
        const videoFile = req.file;
        if (!videoFile) {
            return res.status(400).json({ error: '请上传视频文件' });
        }
        const taskId = (0, uuid_1.v4)();
        const fileId = `${taskId}-video`;
        // 将文件 Buffer 存储到内存中
        upload_1.fileBuffers.set(fileId, {
            buffer: videoFile.buffer,
            mimetype: videoFile.mimetype,
            originalname: videoFile.originalname
        });
        // 添加任务到队列（传递 fileId 而不是文件路径）
        await app_1.taskQueue.add('analyze-video', {
            taskId,
            type: 'analysis',
            fileId,
            originalname: videoFile.originalname,
            size: videoFile.size
        });
        res.json({
            taskId,
            message: '视频分析任务已提交',
            status: 'queued',
            fileInfo: {
                originalname: videoFile.originalname,
                size: videoFile.size,
                mimetype: videoFile.mimetype
            }
        });
    }
    catch (error) {
        console.error('视频分析失败:', error);
        res.status(500).json({ error: '服务器内部错误' });
    }
};
exports.analyzeVideoHandler = analyzeVideoHandler;
