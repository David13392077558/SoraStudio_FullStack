// 模型适配器接口定义
export interface AIModelConfig {
  apiKey: string;
  baseUrl?: string;
  modelName: string;
  maxTokens?: number;
  temperature?: number;
}

export interface GeneratePromptRequest {
  imagePath?: string;
  videoPath?: string;
  style: string;
  description?: string;
}

export interface GeneratePromptResponse {
  prompt: string;
  style: string;
  confidence?: number;
  metadata?: Record<string, any>;
}

export interface GenerateScriptRequest {
  productDescription: string;
  productImagePath?: string;
  style: string;
}

export interface GenerateScriptResponse {
  script: string;
  highlights: string;
  style: string;
  metadata?: Record<string, any>;
}

export interface AnalyzeVideoRequest {
  videoPath: string;
}

export interface AnalyzeVideoResponse {
  styleTags: string[];
  similarPrompt: string;
  cameraAnalysis: string;
  storyboard: string;
  metadata?: Record<string, any>;
}

export interface AIModelAdapter {
  generatePrompt(request: GeneratePromptRequest): Promise<GeneratePromptResponse>;
  generateScript(request: GenerateScriptRequest): Promise<GenerateScriptResponse>;
  analyzeVideo(request: AnalyzeVideoRequest): Promise<AnalyzeVideoResponse>;
  getModelName(): string;
  isAvailable(): boolean;
}