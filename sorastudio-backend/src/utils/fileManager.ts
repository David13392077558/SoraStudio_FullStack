// src/utils/fileManager.ts

import * as fs from 'fs';
import * as path from 'path';
import os from 'os';

export const fileBuffers = new Map<
  string,
  { buffer: Buffer; mimetype: string; originalname: string }
>();

export function getFileBuffer(fileId: string) {
  return fileBuffers.get(fileId)?.buffer || null;
}

export async function bufferToTempFile(fileId: string): Promise<string | null> {
  const file = fileBuffers.get(fileId);
  if (!file) return null;

  const tempPath = path.join(os.tmpdir(), `${fileId}-${Date.now()}`);
  fs.writeFileSync(tempPath, file.buffer);
  return tempPath;
}

export function cleanupTempFile(filePath: string) {
  if (fs.existsSync(filePath)) {
    fs.unlinkSync(filePath);
  }
}

export function cleanupFileBuffer(fileId: string) {
  fileBuffers.delete(fileId);
}
