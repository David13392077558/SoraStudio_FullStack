import { GeminiAdapter } from './GeminiAdapter';
export class ModelManager {
    constructor() {
        this.models = new Map();
        this.initializeModels();
    }
    initializeModels() {
        // Gemini模型
        const geminiConfig = {
            apiKey: process.env.GEMINI_API_KEY || '',
            modelName: 'gemini-pro-vision',
            temperature: 0.7,
            maxTokens: 2048,
        };
        if (geminiConfig.apiKey) {
            this.models.set('gemini', new GeminiAdapter(geminiConfig));
        }
        // 这里可以添加其他模型
        // OpenAI Sora (当可用时)
        // 国内模型等
    }
    getModel(modelName) {
        return this.models.get(modelName) || null;
    }
    getAvailableModels() {
        return Array.from(this.models.entries())
            .filter(([, model]) => model.isAvailable())
            .map(([name]) => name);
    }
    getAllModels() {
        return Array.from(this.models.values());
    }
    // 智能选择最佳模型
    selectBestModel(taskType) {
        const availableModels = this.getAllModels().filter(model => model.isAvailable());
        if (availableModels.length === 0) {
            return null;
        }
        // 根据任务类型选择模型
        switch (taskType) {
            case 'prompt':
                // 优先使用Gemini（支持视觉）
                return availableModels.find(model => model.getModelName().includes('Gemini')) || availableModels[0];
            case 'script':
                // 可以使用任何文本模型
                return availableModels[0];
            case 'analysis':
                // 优先使用视觉模型
                return availableModels.find(model => model.getModelName().includes('Gemini')) || availableModels[0];
            default:
                return availableModels[0];
        }
    }
}
// 全局模型管理器实例
export const modelManager = new ModelManager();
