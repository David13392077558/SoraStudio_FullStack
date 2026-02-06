"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const redis_1 = require("../services/redis");
const router = express_1.default.Router();
router.get("/task/:id", async (req, res) => {
    const id = req.params.id;
    // 读取 Redis 中的 JSON 字符串
    const raw = await redis_1.redis.hGet(`task:${id}`, "data");
    if (!raw) {
        return res.status(404).json({
            success: false,
            message: "任务不存在",
        });
    }
    // 解析 JSON
    const task = JSON.parse(raw);
    res.json({
        success: true,
        task,
    });
});
exports.default = router;
