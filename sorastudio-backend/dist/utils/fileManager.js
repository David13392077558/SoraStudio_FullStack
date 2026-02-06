// src/utils/fileManager.ts
import * as fs from 'fs';
import * as path from 'path';
import os from 'os';
export const fileBuffers = new Map();
export function getFileBuffer(fileId) {
    return fileBuffers.get(fileId)?.buffer || null;
}
export async function bufferToTempFile(fileId) {
    const file = fileBuffers.get(fileId);
    if (!file)
        return null;
    const tempPath = path.join(os.tmpdir(), `${fileId}-${Date.now()}`);
    fs.writeFileSync(tempPath, file.buffer);
    return tempPath;
}
export function cleanupTempFile(filePath) {
    if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
    }
}
export function cleanupFileBuffer(fileId) {
    fileBuffers.delete(fileId);
}
