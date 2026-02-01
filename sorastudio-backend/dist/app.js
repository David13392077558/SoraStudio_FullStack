"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const dotenv_1 = __importDefault(require("dotenv"));
const generatePrompt_1 = require("./handlers/generatePrompt");
const generateScript_1 = require("./handlers/generateScript");
const analyzeVideo_1 = require("./handlers/analyzeVideo");
const getTaskStatus_1 = require("./handlers/getTaskStatus");
const auth_1 = require("./handlers/auth");
const upload_1 = require("./middleware/upload");
const auth_2 = require("./middleware/auth");
const redisConfig_1 = require("./utils/redisConfig");
const diagnostics_1 = require("./utils/diagnostics");
dotenv_1.default.config();
const app = (0, express_1.default)();
// 中间件 - CORS
const allowedOrigins = [
    'http://localhost:5173',
    'http://localhost:3000',
    'https://sorastudio-frontend-v2.vercel.app', // 正式环境
];
const corsOptions = {
    origin(origin, callback) {
        // Postman / curl / 无 Origin 的情况
        if (!origin) {
            return callback(null, true);
        }
        // 明确允许的固定域名
        if (allowedOrigins.includes(origin)) {
            return callback(null, true);
        }
        // 自动放行所有本项目的 Vercel preview 域名
        const vercelPreviewPattern = /^https:\/\/sorastudio-frontend-v2-[a-z0-9-]+\.davids-projects-d041d44b\.vercel\.app$/;
        if (vercelPreviewPattern.test(origin)) {
            return callback(null, true);
        }
        console.error('❌ 拒绝的 CORS 来源:', origin);
        return callback(new Error('Not allowed by CORS'));
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
};
app.use((0, cors_1.default)(corsOptions));
app.use(express_1.default.json({ limit: '50mb' }));
app.use(express_1.default.urlencoded({ limit: '50mb' }));
// 初始化 Redis（使用 REDIS_URL）
(0, redisConfig_1.initializeRedisConfig)();
// 认证路由
app.post('/auth/register', auth_1.registerHandler);
app.post('/auth/login', auth_1.loginHandler);
// 需要认证的路由
app.get('/auth/profile', auth_2.authenticateToken, auth_1.getProfileHandler);
app.put('/auth/profile', auth_2.authenticateToken, auth_1.updateProfileHandler);
app.put('/auth/change-password', auth_2.authenticateToken, auth_1.changePasswordHandler);
// 项目管理路由
app.post('/projects', auth_2.authenticateToken, auth_1.createProjectHandler);
app.get('/projects', auth_2.authenticateToken, auth_1.getUserProjectsHandler);
app.put('/projects/:projectId', auth_2.authenticateToken, auth_1.updateProjectHandler);
app.delete('/projects/:projectId', auth_2.authenticateToken, auth_1.deleteProjectHandler);
// AI 功能路由
app.post('/ai/generate-prompt', auth_2.optionalAuth, upload_1.upload.fields([
    { name: 'image', maxCount: 1 },
    { name: 'video', maxCount: 1 }
]), upload_1.handleMulterError, generatePrompt_1.generatePromptHandler);
app.post('/ai/generate-script', auth_2.optionalAuth, upload_1.upload.fields([
    { name: 'productImage', maxCount: 1 }
]), upload_1.handleMulterError, generateScript_1.generateScriptHandler);
app.post('/ai/analyze-video', auth_2.optionalAuth, upload_1.upload.single('video'), upload_1.handleMulterError, analyzeVideo_1.analyzeVideoHandler);
// 任务查询
app.get('/ai/task/:taskId', auth_2.optionalAuth, getTaskStatus_1.getTaskStatusHandler);
app.get('/tasks/:taskId', auth_2.optionalAuth, getTaskStatus_1.getTaskStatusHandler);
// 健康检查
app.get('/health', (req, res) => {
    res.json({
        status: 'ok',
        timestamp: new Date().toISOString(),
        version: '1.0.0',
        redis: {
            url: process.env.REDIS_URL,
            tls: process.env.REDIS_TLS
        }
    });
});
// 诊断接口
app.get('/diagnostics', diagnostics_1.diagnosticHandler);
// 全局错误处理
app.use((error, req, res, next) => {
    console.error('❌ 未处理的错误:', {
        message: error.message,
        stack: error.stack,
        path: req.path,
        method: req.method,
    });
    res.status(error.status || 500).json({
        error: '服务器内部错误',
        message: process.env.NODE_ENV === 'development' ? error.message : '请稍后重试',
        path: req.path,
    });
});
const PORT = parseInt(process.env.PORT || '3000', 10);
const server = app.listen(PORT, '0.0.0.0', () => {
    console.log(`\n✅ 后端服务运行在端口 ${PORT}`);
    console.log(`📍 API 基础 URL: http://0.0.0.0:${PORT}`);
    console.log(`🔄 Redis URL: ${process.env.REDIS_URL}`);
    console.log(`🌍 CORS 允许源: ${allowedOrigins.join(', ')}`);
    console.log(`📊 诊断接口: GET http://localhost:${PORT}/diagnostics`);
    (0, diagnostics_1.startPeriodicCleanup)(600000);
    setInterval(() => {
        const memory = process.memoryUsage();
        console.log(`📊 内存: ${(memory.heapUsed / 1024 / 1024).toFixed(2)}MB / ${(memory.heapTotal / 1024 / 1024).toFixed(2)}MB (文件缓冲数: ${upload_1.fileBuffers.size})`);
    }, 30000);
});
// 优雅关闭
process.on('SIGTERM', () => {
    console.log('⚠️ 收到 SIGTERM，开始优雅关闭...');
    server.close(() => {
        console.log('✅ 服务已关闭');
        process.exit(0);
    });
});
