import { GoogleGenerativeAI } from '@google/generative-ai';
import {
  AIModelAdapter,
  AIModelConfig,
  GeneratePromptResponse,
  GenerateScriptResponse,
  AnalyzeVideoResponse
} from './types';
import * as fs from 'fs';
import * as path from 'path';
import { getFileBuffer, bufferToTempFile, cleanupTempFile, cleanupFileBuffer } from '../utils/fileManager';

export class GeminiAdapter implements AIModelAdapter {
  private genAI: GoogleGenerativeAI;
  private model: any;
  private config: AIModelConfig;

  constructor(config: AIModelConfig) {
    this.config = config;
    this.genAI = new GoogleGenerativeAI(config.apiKey);
    this.model = this.genAI.getGenerativeModel({
      model: config.modelName || 'gemini-pro-vision',
      generationConfig: {
        temperature: config.temperature || 0.7,
        maxOutputTokens: config.maxTokens || 2048,
      },
    });
  }

  async generatePrompt(request: any): Promise<GeneratePromptResponse> {
    try {
      let prompt = `请根据以下要求生成高质量的Sora视频提示词：\n\n`;

      if (request.style) prompt += `风格：${request.style}\n`;
      if (request.description) prompt += `描述：${request.description}\n`;

      prompt += `\n请生成结构化的提示词，包含镜头语言、构图、光影等专业参数。`;

      let result;

      const imageFileId = request.imageFileId;
      const imagePath = request.imagePath;

      if (imageFileId) {
        const imageBuffer = getFileBuffer(imageFileId);
        if (imageBuffer) {
          const imagePart = {
            inlineData: {
              data: imageBuffer.toString('base64'),
              mimeType: request.imageInfo?.mimetype || 'image/jpeg',
            },
          };

          const fullPrompt = [{ text: prompt }, imagePart];
          result = await this.model.generateContent(fullPrompt);
          cleanupFileBuffer(imageFileId);
        } else {
          result = await this.model.generateContent(prompt);
        }
      } else if (imagePath && fs.existsSync(imagePath)) {
        const imageData = fs.readFileSync(imagePath);
        const imagePart = {
          inlineData: {
            data: imageData.toString('base64'),
            mimeType: this.getMimeType(imagePath),
          },
        };

        const fullPrompt = [{ text: prompt }, imagePart];
        result = await this.model.generateContent(fullPrompt);
      } else {
        result = await this.model.generateContent(prompt);
      }

      const response = await result.response;
      const generatedPrompt = response.text();

      return {
        prompt: generatedPrompt,
        style: request.style,
        confidence: 0.85,
        metadata: {
          model: this.config.modelName,
          tokens_used: response.usageMetadata?.totalTokenCount || 0,
        },
      };
    } catch (error: any) {
      console.error('Gemini generatePrompt error:', error);
      throw new Error(`Gemini API调用失败: ${error?.message || '未知错误'}`);
    }
  }

  async generateScript(request: any): Promise<GenerateScriptResponse> {
    try {
      let prompt = `请根据以下产品信息生成电商带货脚本：\n\n`;
      prompt += `产品描述：${request.productDescription}\n`;
      prompt += `风格：${request.style}\n\n`;
      prompt += `请生成包含开场白、卖点介绍、用户见证、促销活动的完整带货脚本。`;

      const imageFileId = request.productImageFileId;
      const productImagePath = request.productImagePath;

      if (imageFileId) {
        const imageBuffer = getFileBuffer(imageFileId);
        if (imageBuffer) {
          const imagePart = {
            inlineData: {
              data: imageBuffer.toString('base64'),
              mimeType: request.imageInfo?.mimetype || 'image/jpeg',
            },
          };

          const fullPrompt = [{ text: prompt }, imagePart];
          const result = await this.model.generateContent(fullPrompt);
          const response = await result.response;
          const script = response.text();

          cleanupFileBuffer(imageFileId);

          return {
            script,
            highlights: this.extractHighlights(script),
            style: request.style,
            metadata: {
              model: this.config.modelName,
              has_image: true,
            },
          };
        }
      }

      if (productImagePath && fs.existsSync(productImagePath)) {
        const imageData = fs.readFileSync(productImagePath);
        const imagePart = {
          inlineData: {
            data: imageData.toString('base64'),
            mimeType: this.getMimeType(productImagePath),
          },
        };

        const fullPrompt = [{ text: prompt }, imagePart];
        const result = await this.model.generateContent(fullPrompt);
        const response = await result.response;
        const script = response.text();

        return {
          script,
          highlights: this.extractHighlights(script),
          style: request.style,
          metadata: {
            model: this.config.modelName,
            has_image: true,
          },
        };
      }

      const result = await this.model.generateContent(prompt);
      const response = await result.response;
      const script = response.text();

      return {
        script,
        highlights: this.extractHighlights(script),
        style: request.style,
        metadata: {
          model: this.config.modelName,
          has_image: false,
        },
      };
    } catch (error: any) {
      console.error('Gemini generateScript error:', error);
      throw new Error(`Gemini API调用失败: ${error?.message || '未知错误'}`);
    }
  }

  async analyzeVideo(request: any): Promise<AnalyzeVideoResponse> {
    try {
      const videoFileId = request.fileId;
      const videoPath = request.videoPath;
      let tempFilePath: string | null = null;

      try {
        if (videoFileId) {
          tempFilePath = await bufferToTempFile(videoFileId);
          if (!tempFilePath) throw new Error('无法从内存中获取视频文件');
        } else if (!videoPath || !fs.existsSync(videoPath)) {
          throw new Error('视频文件不存在或无效');
        }

        const workingPath = tempFilePath || videoPath;
        const framePaths = await this.extractVideoFrames(workingPath);

        if (framePaths.length === 0) throw new Error('无法提取视频帧');

        const analysisPrompt = `请分析这个视频的风格特征，包括：
1. 视觉风格（色彩、构图、光影）
2. 镜头语言（运动、角度、景别）
3. 整体氛围和情感表达
4. 类似电影或视频风格的参考

请生成：
- 风格标签
- 同款视频的提示词
- 镜头语言分析
- 分镜脚本`;

        const imageParts = framePaths.slice(0, 3).map(framePath => ({
          inlineData: {
            data: fs.readFileSync(framePath).toString('base64'),
            mimeType: this.getMimeType(framePath),
          },
        }));

        const fullPrompt = [{ text: analysisPrompt }, ...imageParts];
        const result = await this.model.generateContent(fullPrompt);
        const response = await result.response;
        const analysis = response.text();

        const parsedResult = this.parseVideoAnalysis(analysis);

        if (videoFileId) cleanupFileBuffer(videoFileId);

        return {
          ...parsedResult,
          metadata: {
            model: this.config.modelName,
            frames_analyzed: framePaths.length,
          },
        };
      } finally {
        if (tempFilePath) cleanupTempFile(tempFilePath);
      }
    } catch (error: any) {
      console.error('Gemini analyzeVideo error:', error);
      throw new Error(`Gemini API调用失败: ${error?.message || '未知错误'}`);
    }
  }

  getModelName(): string {
    return `Gemini ${this.config.modelName}`;
  }

  isAvailable(): boolean {
    return !!this.config.apiKey;
  }

  private getMimeType(filePath: string): string {
    const ext = path.extname(filePath).toLowerCase();
    const mimeTypes: Record<string, string> = {
      '.jpg': 'image/jpeg',
      '.jpeg': 'image/jpeg',
      '.png': 'image/png',
      '.gif': 'image/gif',
      '.webp': 'image/webp',
    };
    return mimeTypes[ext] || 'image/jpeg';
  }

  private async extractVideoFrames(videoPath: string): Promise<string[]> {
    return [];
  }

  private extractHighlights(script: string): string {
    const highlights = script.match(/特点|优势|卖点|功能|效果/gi) || [];
    return highlights.slice(0, 5).join('、');
  }

  private parseVideoAnalysis(analysis: string): Omit<AnalyzeVideoResponse, 'metadata'> {
    return {
      styleTags: ['电影级', '专业光影', '动态构图'],
      similarPrompt: '电影级镜头，专业电影制作，4K分辨率，电影光影，景深效果',
      cameraAnalysis: '使用跟拍和摇臂镜头，营造专业电影感',
      storyboard: '0-5s: 建立镜头\n5-10s: 跟拍运动\n10-15s: 特写细节',
    };
  }
}
