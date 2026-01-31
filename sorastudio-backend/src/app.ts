import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
// BullMQ 已迁移到外部 Python Worker，移除 bullmq 相关代码
import { generatePromptHandler } from './handlers/generatePrompt';
import { generateScriptHandler } from './handlers/generateScript';
import { analyzeVideoHandler } from './handlers/analyzeVideo';
import { getTaskStatusHandler } from './handlers/getTaskStatus';
import { registerHandler, loginHandler, getProfileHandler, updateProfileHandler, createProjectHandler, getUserProjectsHandler, updateProjectHandler, deleteProjectHandler, changePasswordHandler } from './handlers/auth';
import { upload, handleMulterError } from './middleware/upload';
import { authenticateToken, optionalAuth } from './middleware/auth';
import { initializeRedisConfig } from './utils/redisConfig';
import { diagnosticHandler, startPeriodicCleanup } from './utils/diagnostics';
import { fileBuffers } from './middleware/upload';

dotenv.config();
const app = express();

// 中间件
app.use(cors({
  origin: [process.env.VITE_BACKEND_URL || '*', 'http://localhost:5173', 'http://localhost:3000'],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb' }));

// 初始化 Redis 配置
initializeRedisConfig();

// 任务队列配置
const redisConfig = {
  host: process.env.REDIS_HOST || 'localhost',
  port: parseInt(process.env.REDIS_PORT || '6379'),
  password: process.env.REDIS_PASSWORD,
  tls: process.env.REDIS_TLS === 'true' ? {} : undefined,
};

// 任务由 Python Worker 轮询 Redis 处理，后端不再创建 BullMQ 队列

// 认证路由（公开）
app.post('/api/auth/register', registerHandler);
app.post('/api/auth/login', loginHandler);

// 需要认证的路由
app.get('/api/auth/profile', authenticateToken, getProfileHandler);
app.put('/api/auth/profile', authenticateToken, updateProfileHandler);
app.put('/api/auth/change-password', authenticateToken, changePasswordHandler);

// 项目管理路由
app.post('/api/projects', authenticateToken, createProjectHandler);
app.get('/api/projects', authenticateToken, getUserProjectsHandler);
app.put('/api/projects/:projectId', authenticateToken, updateProjectHandler);
app.delete('/api/projects/:projectId', authenticateToken, deleteProjectHandler);

// AI功能路由（可选认证）
app.post('/api/ai/generate-prompt', optionalAuth, upload.fields([
  { name: 'image', maxCount: 1 },
  { name: 'video', maxCount: 1 }
]), handleMulterError, generatePromptHandler);

app.post('/api/ai/generate-script', optionalAuth, upload.fields([
  { name: 'productImage', maxCount: 1 }
]), handleMulterError, generateScriptHandler);

app.post('/api/ai/analyze-video', optionalAuth, upload.single('video'), handleMulterError, analyzeVideoHandler);

// 兼容旧路径与新的 AI 任务查询路径
app.get('/api/ai/task/:taskId', optionalAuth, getTaskStatusHandler);
app.get('/api/tasks/:taskId', optionalAuth, getTaskStatusHandler);

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
  diagnosticHandler(req, res);
});

// 全局错误处理
app.use((error: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
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
  startPeriodicCleanup(600000); // 10分钟清理一次
  
  // 监控内存使用
  setInterval(() => {
    const memory = process.memoryUsage();
    console.log(`📊 内存: ${(memory.heapUsed / 1024 / 1024).toFixed(2)}MB / ${(memory.heapTotal / 1024 / 1024).toFixed(2)}MB (文件缓冲数: ${fileBuffers.size})`);
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