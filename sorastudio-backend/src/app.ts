import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { generatePromptHandler } from './handlers/generatePrompt';
import { generateScriptHandler } from './handlers/generateScript';
import { analyzeVideoHandler } from './handlers/analyzeVideo';
import { getTaskStatusHandler } from './handlers/getTaskStatus';
import {
  registerHandler,
  loginHandler,
  getProfileHandler,
  updateProfileHandler,
  createProjectHandler,
  getUserProjectsHandler,
  updateProjectHandler,
  deleteProjectHandler,
  changePasswordHandler
} from './handlers/auth';
import { upload, handleMulterError, fileBuffers } from './middleware/upload';
import { authenticateToken, optionalAuth } from './middleware/auth';
import { initializeRedisConfig } from './utils/redisConfig';
import { diagnosticHandler, startPeriodicCleanup } from './utils/diagnostics';

dotenv.config();
const app = express();

// 中间件 - CORS
const allowedOrigins = [
  'http://localhost:5173',
  'http://localhost:3000',
  'https://sorastudio-frontend-v2.vercel.app', // 正式环境
];

const corsOptions: cors.CorsOptions = {
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
    const vercelPreviewPattern =
      /^https:\/\/sorastudio-frontend-v2-[a-z0-9-]+\.davids-projects-d041d44b\.vercel\.app$/;

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

app.use(cors(corsOptions));

app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb' }));

// 初始化 Redis（使用 REDIS_URL）
initializeRedisConfig();

// 认证路由
app.post('/auth/register', registerHandler);
app.post('/auth/login', loginHandler);

// 需要认证的路由
app.get('/auth/profile', authenticateToken, getProfileHandler);
app.put('/auth/profile', authenticateToken, updateProfileHandler);
app.put('/auth/change-password', authenticateToken, changePasswordHandler);

// 项目管理路由
app.post('/projects', authenticateToken, createProjectHandler);
app.get('/projects', authenticateToken, getUserProjectsHandler);
app.put('/projects/:projectId', authenticateToken, updateProjectHandler);
app.delete('/projects/:projectId', authenticateToken, deleteProjectHandler);

// AI 功能路由
app.post(
  '/ai/generate-prompt',
  optionalAuth,
  upload.fields([
    { name: 'image', maxCount: 1 },
    { name: 'video', maxCount: 1 }
  ]),
  handleMulterError,
  generatePromptHandler
);

app.post(
  '/ai/generate-script',
  optionalAuth,
  upload.fields([
    { name: 'productImage', maxCount: 1 }
  ]),
  handleMulterError,
  generateScriptHandler
);

app.post(
  '/ai/analyze-video',
  optionalAuth,
  upload.single('video'),
  handleMulterError,
  analyzeVideoHandler
);

// 任务查询
app.get('/ai/task/:taskId', optionalAuth, getTaskStatusHandler);
app.get('/tasks/:taskId', optionalAuth, getTaskStatusHandler);

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
app.get('/diagnostics', diagnosticHandler);

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
  console.log(`🔄 Redis URL: ${process.env.REDIS_URL}`);
  console.log(`🌍 CORS 允许源: ${allowedOrigins.join(', ')}`);
  console.log(`📊 诊断接口: GET http://localhost:${PORT}/diagnostics`);

  startPeriodicCleanup(600000);

  setInterval(() => {
    const memory = process.memoryUsage();
    console.log(
      `📊 内存: ${(memory.heapUsed / 1024 / 1024).toFixed(2)}MB / ${(memory.heapTotal / 1024 / 1024).toFixed(2)}MB (文件缓冲数: ${fileBuffers.size})`
    );
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
