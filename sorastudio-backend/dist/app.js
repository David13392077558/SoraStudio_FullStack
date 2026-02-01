"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const dotenv_1 = __importDefault(require("dotenv"));
// BullMQ 已迁移到外部 Python Worker，移除 bullmq 相关代码
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
app.use((0, cors_1.default)({
    origin: [process.env.VITE_BACKEND_URL || '*', 'http://localhost:5173', 'http://localhost:3000'],
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express_1.default.json({ limit: '50mb' }));
app.use(express_1.default.urlencoded({ limit: '50mb' }));
// 初始化 Redis 配置
(0, redisConfig_1.initializeRedisConfig)();
// 任务队列配置
const redisConfig = {
    host: process.env.REDIS_HOST || 'localhost',
    port: parseInt(process.env.REDIS_PORT || '6379'),
    password: process.env.REDIS_PASSWORD,
    tls: process.env.REDIS_TLS === 'true' ? {} : undefined,
};
// 任务由 Python Worker 轮询 Redis 处理，后端不再创建 BullMQ 队列
// 认证路由（公开）
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
// AI功能路由（可选认证）
app.post('/api/ai/generate-prompt', auth_2.optionalAuth, upload_1.upload.fields([
    { name: 'image', maxCount: 1 },
    { name: 'video', maxCount: 1 }
]), upload_1.handleMulterError, generatePrompt_1.generatePromptHandler);
app.post('/api/ai/generate-script', auth_2.optionalAuth, upload_1.upload.fields([
    { name: 'productImage', maxCount: 1 }
]), upload_1.handleMulterError, generateScript_1.generateScriptHandler);
app.post('/api/ai/analyze-video', auth_2.optionalAuth, upload_1.upload.single('video'), upload_1.handleMulterError, analyzeVideo_1.analyzeVideoHandler);
// 兼容旧路径与新的 AI 任务查询路径
app.get('/api/ai/task/:taskId', auth_2.optionalAuth, getTaskStatus_1.getTaskStatusHandler);
app.get('/api/tasks/:taskId', auth_2.optionalAuth, getTaskStatus_1.getTaskStatusHandler);
// 健康检查
app.get('/health', (req, res) => {
    res.json({
        status: 'ok',
        timestamp: new Date().toISOString(),
        version: '1.0.0',
        redis: {
            host: process.env.REDIS_HOST || 'localhost',
            port: process.env.REDIS_PORT || '6379',
        }
    });
});
// 诊断路由 (仅开发/调试)
app.get('/api/diagnostics', (req, res) => {
    // 可选：添加认证检查
    // if (!req.query.token || req.query.token !== process.env.DIAGNOSTIC_TOKEN) {
    //   return res.status(401).json({ error: '未授权' });
    // }
    (0, diagnostics_1.diagnosticHandler)(req, res);
});
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
    console.log(`🔄 Redis 配置: ${redisConfig.host}:${redisConfig.port}`);
    console.log(`🌍 CORS 允许源: ${process.env.VITE_BACKEND_URL || 'localhost'}`);
    console.log(`📊 诊断接口: GET http://localhost:${PORT}/api/diagnostics`);
    // 启动定期清理任务
    (0, diagnostics_1.startPeriodicCleanup)(600000); // 10分钟清理一次
    // 监控内存使用
    setInterval(() => {
        const memory = process.memoryUsage();
        console.log(`📊 内存: ${(memory.heapUsed / 1024 / 1024).toFixed(2)}MB / ${(memory.heapTotal / 1024 / 1024).toFixed(2)}MB (文件缓冲数: ${upload_2.fileBuffers.size})`);
    }, 30000);
});
// 优雅关闭
process.on('SIGTERM', () => {
    console.log('⚠️  收到 SIGTERM，开始优雅关闭...');
    server.close(() => {
        console.log('✅ 服务已关闭');
        process.exit(0);
    });
});
