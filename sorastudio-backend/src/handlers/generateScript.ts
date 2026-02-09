import { Request, Response } from "express";
import redis from "../services/redis";

import { v4 as uuidv4 } from "uuid";

export const generateScriptHandler = async (req: Request, res: Response) => {
  try {
    const { productUrl, productDescription, style } = req.body;

    if (!productDescription || !style) {
      return res.status(400).json({ error: "产品描述和风格参数必填" });
    }

    const taskId = uuidv4();

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

    await redis.set(`task:${taskId}`, JSON.stringify(task));
    await redis.lpush("tasks:queue", taskId);

    return res.json({
      taskId,
      message: "脚本生成任务已提交",
    });
  } catch (err) {
    console.error("generateScriptHandler error:", err);
    return res.status(500).json({ error: "服务器内部错误" });
  }
};
