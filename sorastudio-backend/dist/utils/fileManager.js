"use strict";
// src/utils/fileManager.ts
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.fileBuffers = void 0;
exports.getFileBuffer = getFileBuffer;
exports.bufferToTempFile = bufferToTempFile;
exports.cleanupTempFile = cleanupTempFile;
exports.cleanupFileBuffer = cleanupFileBuffer;
const fs = __importStar(require("fs"));
const path = __importStar(require("path"));
const os_1 = __importDefault(require("os"));
exports.fileBuffers = new Map();
function getFileBuffer(fileId) {
    return exports.fileBuffers.get(fileId)?.buffer || null;
}
async function bufferToTempFile(fileId) {
    const file = exports.fileBuffers.get(fileId);
    if (!file)
        return null;
    const tempPath = path.join(os_1.default.tmpdir(), `${fileId}-${Date.now()}`);
    fs.writeFileSync(tempPath, file.buffer);
    return tempPath;
}
function cleanupTempFile(filePath) {
    if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
    }
}
function cleanupFileBuffer(fileId) {
    exports.fileBuffers.delete(fileId);
}
