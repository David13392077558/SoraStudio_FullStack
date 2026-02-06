import multer from 'multer';
// 文件类型验证
const allowedImageTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
const allowedVideoTypes = ['video/mp4', 'video/avi', 'video/mov', 'video/wmv', 'video/flv'];
// 内存存储 Buffer Map (用于在 Render 等容器环境中)
export const fileBuffers = new Map();
export const fileFilter = (req, file, cb) => {
    const fieldName = file.fieldname;
    if (fieldName === 'image' || fieldName === 'productImage') {
        if (allowedImageTypes.includes(file.mimetype)) {
            cb(null, true);
        }
        else {
            cb(new Error(`不支持的图片格式。支持的格式: ${allowedImageTypes.join(', ')}`));
        }
    }
    else if (fieldName === 'video') {
        if (allowedVideoTypes.includes(file.mimetype)) {
            cb(null, true);
        }
        else {
            cb(new Error(`不支持的视频格式。支持的格式: ${allowedVideoTypes.join(', ')}`));
        }
    }
    else {
        cb(new Error('未知的文件字段'));
    }
};
// 文件大小限制
const MAX_IMAGE_SIZE = 10 * 1024 * 1024; // 10MB
const MAX_VIDEO_SIZE = 500 * 1024 * 1024; // 500MB
export const limits = {
    fileSize: (req, file, cb) => {
        const fieldName = file.fieldname;
        if (fieldName === 'image' || fieldName === 'productImage') {
            if (file.size > MAX_IMAGE_SIZE) {
                cb(new Error(`图片文件过大。最大支持: ${MAX_IMAGE_SIZE / (1024 * 1024)}MB`));
            }
            else {
                cb(null, true);
            }
        }
        else if (fieldName === 'video') {
            if (file.size > MAX_VIDEO_SIZE) {
                cb(new Error(`视频文件过大。最大支持: ${MAX_VIDEO_SIZE / (1024 * 1024)}MB`));
            }
            else {
                cb(null, true);
            }
        }
        else {
            cb(null, true);
        }
    }
};
// 使用内存存储替代磁盘存储 (适合容器环境)
const storage = multer.memoryStorage();
// 创建multer实例
export const upload = multer({
    storage,
    fileFilter,
    limits: {
        fileSize: MAX_VIDEO_SIZE, // 使用最大的限制
        files: 2, // 最多2个文件
    }
});
// 错误处理中间件
export const handleMulterError = (error, req, res, next) => {
    if (error instanceof multer.MulterError) {
        if (error.code === 'LIMIT_FILE_SIZE') {
            return res.status(400).json({
                error: '文件大小超过限制',
                details: error.message
            });
        }
        if (error.code === 'LIMIT_FILE_COUNT') {
            return res.status(400).json({
                error: '上传文件数量超过限制',
                details: '最多只能上传2个文件'
            });
        }
    }
    if (error.message.includes('不支持的')) {
        return res.status(400).json({
            error: '文件类型不支持',
            details: error.message
        });
    }
    next(error);
};
