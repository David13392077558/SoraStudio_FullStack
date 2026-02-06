"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.requireAdmin = exports.generateToken = exports.optionalAuth = exports.authenticateToken = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const authenticateToken = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN
    if (!token) {
        return res.status(401).json({ error: '访问令牌缺失' });
    }
    jsonwebtoken_1.default.verify(token, process.env.JWT_SECRET || 'default_secret', (err, user) => {
        if (err) {
            return res.status(403).json({ error: '无效的访问令牌' });
        }
        req.user = user;
        next();
    });
};
exports.authenticateToken = authenticateToken;
// 可选认证中间件（用于公开接口）
const optionalAuth = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];
    if (token) {
        jsonwebtoken_1.default.verify(token, process.env.JWT_SECRET || 'default_secret', (err, user) => {
            if (!err) {
                req.user = user;
            }
            next();
        });
    }
    else {
        next();
    }
};
exports.optionalAuth = optionalAuth;
// 生成JWT令牌
const generateToken = (payload) => {
    return jsonwebtoken_1.default.sign(payload, process.env.JWT_SECRET || 'default_secret', {
        expiresIn: '7d' // 7天过期
    });
};
exports.generateToken = generateToken;
// 验证管理员权限
const requireAdmin = (req, res, next) => {
    if (!req.user) {
        return res.status(401).json({ error: '未认证' });
    }
    if (req.user.role !== 'admin') {
        return res.status(403).json({ error: '需要管理员权限' });
    }
    next();
};
exports.requireAdmin = requireAdmin;
