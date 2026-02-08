"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.r2 = void 0;
exports.uploadToR2 = uploadToR2;
const client_s3_1 = require("@aws-sdk/client-s3");
exports.r2 = new client_s3_1.S3Client({
    region: "auto",
    endpoint: `https://${process.env.R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
    credentials: {
        accessKeyId: process.env.R2_ACCESS_KEY,
        secretAccessKey: process.env.R2_SECRET_KEY,
    },
});
async function uploadToR2(buffer, filename, contentType = "video/mp4") {
    const command = new client_s3_1.PutObjectCommand({
        Bucket: process.env.R2_BUCKET,
        Key: filename,
        Body: buffer,
        ContentType: contentType,
    });
    await exports.r2.send(command);
    // ⭐ 使用正确的 Public URL，而不是手动拼接
    return `${process.env.R2_PUBLIC_URL}/${filename}`;
}
