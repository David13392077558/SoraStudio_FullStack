import jwt from 'jsonwebtoken';
export const authenticateToken = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN
    if (!token) {
        return res.status(401).json({ error: '访问令牌缺失' });
    }
    jwt.verify(token, process.env.JWT_SECRET || 'default_secret', (err, user) => {
        if (err) {
            return res.status(403).json({ error: '无效的访问令牌' });
        }
        req.user = user;
        next();
    });
};
// 可选认证中间件（用于公开接口）
export const optionalAuth = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];
    if (token) {
        jwt.verify(token, process.env.JWT_SECRET || 'default_secret', (err, user) => {
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
// 生成JWT令牌
export const generateToken = (payload) => {
    return jwt.sign(payload, process.env.JWT_SECRET || 'default_secret', {
        expiresIn: '7d' // 7天过期
    });
};
// 验证管理员权限
export const requireAdmin = (req, res, next) => {
    if (!req.user) {
        return res.status(401).json({ error: '未认证' });
    }
    if (req.user.role !== 'admin') {
        return res.status(403).json({ error: '需要管理员权限' });
    }
    next();
};
