"use strict";
// src/app.ts
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const dotenv_1 = __importDefault(require("dotenv"));
const upload_1 = __importDefault(require("./routes/upload"));
const task_1 = __importDefault(require("./routes/task"));
const generatePrompt_1 = require("./handlers/generatePrompt");
const generateScript_1 = require("./handlers/generateScript");
const analyzeVideo_1 = require("./handlers/analyzeVideo");
const getTaskStatus_1 = require("./handlers/getTaskStatus");
const auth_1 = require("./handlers/auth");
const upload_2 = require("./middleware/upload");
const auth_2 = require("./middleware/auth");
const redis_1 = __importDefault(require("./services/redis")); // ⭐ 使用统一 Redis 客户端
const diagnostics_1 = require("./utils/diagnostics");
dotenv_1.default.config();
const app = (0, express_1.default)();
// CORS
const allowedOrigins = [
    "http://localhost:5173",
    "http://localhost:3000",
    "https://sorastudio-frontend-v2.vercel.app",
];
const corsOptions = {
    origin(origin, callback) {
        if (!origin || allowedOrigins.includes(origin)) {
            return callback(null, true);
        }
        const isVercelPreview = origin.includes("sorastudio-frontend-v2") &&
            origin.endsWith(".vercel.app");
        if (isVercelPreview)
            return callback(null, true);
        console.error("❌ 拒绝的 CORS 来源:", origin);
        return callback(new Error("Not allowed by CORS"));
    },
    credentials: true,
};
app.use((0, cors_1.default)(corsOptions));
app.use(express_1.default.json({ limit: "50mb" }));
app.use(express_1.default.urlencoded({ limit: "50mb" }));
// ⭐ 打印 Redis URL（关键）
redis_1.default.on("connect", () => {
    console.log("Redis connected from app.ts");
    console.log("后端使用的 Redis URL:", process.env.REDIS_URL);
});
// Auth
app.post("/auth/register", auth_1.registerHandler);
app.post("/auth/login", auth_1.loginHandler);
app.get("/auth/profile", auth_2.authenticateToken, auth_1.getProfileHandler);
app.put("/auth/profile", auth_2.authenticateToken, auth_1.updateProfileHandler);
app.put("/auth/change-password", auth_2.authenticateToken, auth_1.changePasswordHandler);
// Projects
app.post("/projects", auth_2.authenticateToken, auth_1.createProjectHandler);
app.get("/projects", auth_2.authenticateToken, auth_1.getUserProjectsHandler);
app.put("/projects/:projectId", auth_2.authenticateToken, auth_1.updateProjectHandler);
app.delete("/projects/:projectId", auth_2.authenticateToken, auth_1.deleteProjectHandler);
// AI
app.post("/ai/generate-prompt", auth_2.optionalAuth, upload_2.upload.fields([{ name: "image" }, { name: "video" }]), upload_2.handleMulterError, generatePrompt_1.generatePromptHandler);
app.post("/ai/generate-script", auth_2.optionalAuth, upload_2.upload.fields([{ name: "productImage" }]), upload_2.handleMulterError, generateScript_1.generateScriptHandler);
app.post("/ai/analyze-video", auth_2.optionalAuth, upload_2.upload.single("video"), upload_2.handleMulterError, analyzeVideo_1.analyzeVideoHandler);
// 上传接口
app.use("/api", upload_1.default);
// 任务查询（支持多种路径）
app.use("/api", task_1.default);
app.get("/ai/task-status/:taskId", auth_2.optionalAuth, getTaskStatus_1.getTaskStatusHandler);
app.get("/ai/task/:taskId", auth_2.optionalAuth, getTaskStatus_1.getTaskStatusHandler);
// 健康检查
app.get("/health", (req, res) => {
    res.json({ status: "ok", timestamp: new Date().toISOString() });
});
// 诊断接口
app.get("/diagnostics", diagnostics_1.diagnosticHandler);
// ⭐ 临时调试接口：删除某个 task key（用于清理旧的 hash 类型）
app.get("/debug/delete-task/:id", async (req, res) => {
    try {
        const key = `task:${req.params.id}`;
        await redis_1.default.del(key);
        res.json({ deleted: key });
    }
    catch (err) {
        console.error("❌ 删除任务 key 失败:", err);
        res.status(500).json({ error: "删除失败", detail: err });
    }
});
// 全局错误处理
app.use((error, req, res, next) => {
    console.error("❌ 未处理的错误:", error);
    res.status(500).json({ error: "服务器内部错误" });
});
// 启动服务
const PORT = Number(process.env.PORT) || 3000;
const server = app.listen(PORT, "0.0.0.0", () => {
    console.log(`\n✅ 后端服务运行在端口 ${PORT}`);
    (0, diagnostics_1.startPeriodicCleanup)(600000);
});
// 优雅关闭
process.on("SIGTERM", () => {
    console.log("⚠️ 收到 SIGTERM，开始优雅关闭...");
    server.close(() => process.exit(0));
});
