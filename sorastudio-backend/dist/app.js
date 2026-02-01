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
const upload_2 = require("./middleware/upload");
dotenv_1.default.config();
const app = (0, express_1.default)();
// 中间件
app.use(cors({
    origin: [
        'http://localhost:5173',
        'http://localhost:3000',

        // Vercel 正式域名
        'https://sorastudio-frontend-v2.vercel.app',

        // Vercel Git 分支预览域名
        'https://sorastudio-frontend-v2-git-main-davids-projects-d041d44b.vercel.app',

        // Vercel 自动生成的部署域名
        'https://sorastudio-frontend-v2-by2abzpca-davids-projects-d041d44b.vercel.app'
    ],
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb' }));
// 初始化 Redis（使用 REDIS_URL）
(0, redisConfig_1.initializeRedisConfig)();
// 认证路由
app.post('/api/auth/register', auth_1.registerHandler);
app.post('/api/auth/login', auth_1.loginHandler);
// 需要认证的路由
app.get('/api/auth/profile', auth_2.authenticateToken, auth_1.getProfileHandler);
app.put('/api/auth/profile', auth_2.authenticateToken, auth_1.updateProfileHandler);
app.put('/api/auth/change-password', auth_2.authenticateToken, auth_1.changePasswordHandler);
// 项目管理路由
app.post('/api/projects', auth_2.authenticateToken, auth_1.createProjectHandler);
app.get('/api/projects', auth_2.authenticateToken, auth_1.getUserProjectsHandler);
app.put('/api/projects/:projectId', auth_2.authenticateToken, auth_1.updateProjectHandler);
app.delete('/api/projects/:projectId', auth_2.authenticateToken, auth_1.deleteProjectHandler);
// AI 功能路由
app.post('/api/ai/generate-prompt', auth_2.optionalAuth, upload_1.upload.fields([
    { name: 'image', maxCount: 1 },
    { name: 'video', maxCount: 1 }
]), upload_1.handleMulterError, generatePrompt_1.generatePromptHandler);
app.post('/api/ai/generate-script', auth_2.optionalAuth, upload_1.upload.fields([
    { name: 'productImage', maxCount: 1 }
]), upload_1.handleMulterError, generateScript_1.generateScriptHandler);
app.post('/api/ai/analyze-video', auth_2.optionalAuth, upload_1.upload.single('video'), upload_1.handleMulterError, analyzeVideo_1.analyzeVideoHandler);
// 任务查询
app.get('/api/ai/task/:taskId', auth_2.optionalAuth, getTaskStatus_1.getTaskStatusHandler);
app.get('/api/tasks/:taskId', auth_2.optionalAuth, getTaskStatus_1.getTaskStatusHandler);
// 健康检查（改成使用 REDIS_URL）
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
app.get('/api/diagnostics', diagnostics_1.diagnosticHandler);
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
    console.log(`🌍 CORS 允许源: ${process.env.VITE_BACKEND_URL || 'localhost'}`);
    console.log(`📊 诊断接口: GET http://localhost:${PORT}/api/diagnostics`);
    (0, diagnostics_1.startPeriodicCleanup)(600000);
    setInterval(() => {
        const memory = process.memoryUsage();
        console.log(`📊 内存: ${(memory.heapUsed / 1024 / 1024).toFixed(2)}MB / ${(memory.heapTotal / 1024 / 1024).toFixed(2)}MB (文件缓冲数: ${upload_2.fileBuffers.size})`);
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
