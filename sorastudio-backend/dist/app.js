import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import uploadRouter from "./routes/upload";
import { generatePromptHandler } from "./handlers/generatePrompt";
import { generateScriptHandler } from "./handlers/generateScript";
import { analyzeVideoHandler } from "./handlers/analyzeVideo";
import { getTaskStatusHandler } from "./handlers/getTaskStatus";
import { registerHandler, loginHandler, getProfileHandler, updateProfileHandler, createProjectHandler, getUserProjectsHandler, updateProjectHandler, deleteProjectHandler, changePasswordHandler } from "./handlers/auth";
import { upload, handleMulterError } from "./middleware/upload";
import { authenticateToken, optionalAuth } from "./middleware/auth";
import { initializeRedisConfig } from "./utils/redisConfig";
import { diagnosticHandler, startPeriodicCleanup } from "./utils/diagnostics";
dotenv.config();
const app = express();
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
app.use(cors(corsOptions));
app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ limit: "50mb" }));
// 初始化 Redis
initializeRedisConfig();
// Auth
app.post("/auth/register", registerHandler);
app.post("/auth/login", loginHandler);
app.get("/auth/profile", authenticateToken, getProfileHandler);
app.put("/auth/profile", authenticateToken, updateProfileHandler);
app.put("/auth/change-password", authenticateToken, changePasswordHandler);
// Projects
app.post("/projects", authenticateToken, createProjectHandler);
app.get("/projects", authenticateToken, getUserProjectsHandler);
app.put("/projects/:projectId", authenticateToken, updateProjectHandler);
app.delete("/projects/:projectId", authenticateToken, deleteProjectHandler);
// AI
app.post("/ai/generate-prompt", optionalAuth, upload.fields([{ name: "image" }, { name: "video" }]), handleMulterError, generatePromptHandler);
app.post("/ai/generate-script", optionalAuth, upload.fields([{ name: "productImage" }]), handleMulterError, generateScriptHandler);
app.post("/ai/analyze-video", optionalAuth, upload.single("video"), handleMulterError, analyzeVideoHandler);
// ⭐ 挂载 /api/upload
app.use("/api", uploadRouter);
// 任务查询
app.get("/ai/task-status/:taskId", optionalAuth, getTaskStatusHandler);
app.get("/ai/task/:taskId", optionalAuth, getTaskStatusHandler);
// 健康检查
app.get("/health", (req, res) => {
    res.json({ status: "ok", timestamp: new Date().toISOString() });
});
// 诊断接口
app.get("/diagnostics", diagnosticHandler);
// 全局错误处理
app.use((error, req, res, next) => {
    console.error("❌ 未处理的错误:", error);
    res.status(500).json({ error: "服务器内部错误" });
});
// 启动服务
const PORT = Number(process.env.PORT) || 3000;
const server = app.listen(PORT, "0.0.0.0", () => {
    console.log(`\n✅ 后端服务运行在端口 ${PORT}`);
    startPeriodicCleanup(600000);
});
// 优雅关闭
process.on("SIGTERM", () => {
    console.log("⚠️ 收到 SIGTERM，开始优雅关闭...");
    server.close(() => process.exit(0));
});
