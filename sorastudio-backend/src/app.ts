import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { Queue, Worker } from 'bullmq';
import { generatePromptHandler } from './handlers/generatePrompt';
import { generateScriptHandler } from './handlers/generateScript';
import { analyzeVideoHandler } from './handlers/analyzeVideo';
import { getTaskStatusHandler } from './handlers/getTaskStatus';
import { registerHandler, loginHandler, getProfileHandler, updateProfileHandler, createProjectHandler, getUserProjectsHandler, updateProjectHandler, deleteProjectHandler, changePasswordHandler } from './handlers/auth';
import { upload, handleMulterError } from './middleware/upload';
import { authenticateToken, optionalAuth } from './middleware/auth';

dotenv.config();
const app = express();

// 中间件
app.use(cors());
app.use(express.json());

// 任务队列
export const taskQueue = new Queue('video-tasks', {
  connection: {
    host: process.env.REDIS_HOST || 'localhost',
    port: parseInt(process.env.REDIS_PORT || '6379'),
  },
});

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

app.get('/api/tasks/:taskId', optionalAuth, getTaskStatusHandler);

// 健康检查
app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    version: '1.0.0'
  });
});

// 全局错误处理
app.use((error: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error('Unhandled error:', error);
  res.status(500).json({
    error: '服务器内部错误',
    message: process.env.NODE_ENV === 'development' ? error.message : '请稍后重试'
  });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`后端服务运行在端口 ${PORT}`);
  console.log('支持的 API:');
  console.log('认证相关:');
  console.log('- POST /api/auth/register');
  console.log('- POST /api/auth/login');
  console.log('- GET /api/auth/profile');
  console.log('- PUT /api/auth/profile');
  console.log('项目管理:');
  console.log('- POST /api/projects');
  console.log('- GET /api/projects');
  console.log('- PUT /api/projects/:projectId');
  console.log('- DELETE /api/projects/:projectId');
  console.log('AI功能:');
  console.log('- POST /api/ai/generate-prompt (文件大小限制: 图片10MB, 视频500MB)');
  console.log('- POST /api/ai/generate-script (文件大小限制: 图片10MB)');
  console.log('- POST /api/ai/analyze-video (文件大小限制: 视频500MB)');
  console.log('- GET /api/tasks/:taskId');
  console.log('- GET /health');
});