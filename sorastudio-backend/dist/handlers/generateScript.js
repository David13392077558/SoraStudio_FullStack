"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.generateScriptHandler = void 0;
const redis_1 = __importDefault(require("../services/redis"));
const uuid_1 = require("uuid");
const generateScriptHandler = async (req, res) => {
    try {
        const { productUrl, productDescription, style } = req.body;
        if (!productDescription || !style) {
            return res.status(400).json({ error: "产品描述和风格参数必填" });
        }
        const taskId = (0, uuid_1.v4)();
        const task = {
            id: taskId,
            type: "generate_script",
            payload: {
                productUrl: productUrl || "",
                productDescription,
                style,
            },
            status: "queued",
            createdAt: Date.now(),
            updatedAt: Date.now(),
            result: null,
        };
        await redis_1.default.set(`task:${taskId}`, JSON.stringify(task));
        await redis_1.default.lpush("tasks:queue", taskId);
        return res.json({
            taskId,
            message: "脚本生成任务已提交",
        });
    }
    catch (err) {
        console.error("generateScriptHandler error:", err);
        return res.status(500).json({ error: "服务器内部错误" });
    }
};
exports.generateScriptHandler = generateScriptHandler;
