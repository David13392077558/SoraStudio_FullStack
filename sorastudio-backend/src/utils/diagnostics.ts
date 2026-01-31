import { Request, Response } from 'express';

// 诊断接口：返回系统状态
export function diagnosticHandler(req: Request, res: Response) {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    message: '诊断接口正常运行',
  });
}

// 定期清理任务：接受间隔时间（毫秒）
export function startPeriodicCleanup(interval: number) {
  console.log(`🧹 定期清理任务已启动，每 ${interval / 1000} 秒执行一次`);

  setInterval(() => {
    console.log(`🧹 执行清理任务: ${new Date().toISOString()}`);
    // 这里可以加入你真正的清理逻辑，例如：
    // - 清理临时文件
    // - 清理 Redis 过期任务
    // - 清理缓存
  }, interval);
}
