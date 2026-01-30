import { GoogleGenerativeAI } from '@google/generative-ai';
import {
  AIModelAdapter,
  AIModelConfig,
  GeneratePromptRequest,
  GeneratePromptResponse,
  GenerateScriptRequest,
  GenerateScriptResponse,
  AnalyzeVideoRequest,
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
<<<<<<< HEAD
      
      // 支持新的 fileId 格式
      const imageFileId = request.imageFileId;
      const videoFileId = request.videoFileId;
      const imagePath = request.imagePath;
      const videoPath = request.videoPath;

      if (imageFileId) {
        // 从内存 Buffer 获取图片
        const imageBuffer = getFileBuffer(imageFileId);
        if (imageBuffer) {
          const imagePart = {
            inlineData: {
              data: imageBuffer.toString('base64'),
              mimeType: request.imageInfo?.mimetype || 'image/jpeg',
            },
          };

          const fullPrompt = [
            { text: prompt },
            imagePart,
          ];

          result = await this.model.generateContent(fullPrompt);
          cleanupFileBuffer(imageFileId);
        } else {
          result = await this.model.generateContent(prompt);
        }
      } else if (imagePath && fs.existsSync(imagePath)) {
        // 兼容旧的文件路径格式
        const imageData = fs.readFileSync(imagePath);
=======

      if (request.imagePath && fs.existsSync(request.imagePath)) {
        const imageData = fs.readFileSync(request.imagePath);
>>>>>>> 6365ea551c3f14b5479c27766b9428773db8d363
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
<<<<<<< HEAD
      throw new Error(`Gemini API调用失败: ${(error as Error).message}`);
=======
      throw new Error(`Gemini API调用失败: ${error?.message || '未知错误'}`);
>>>>>>> 6365ea551c3f14b5479c27766b9428773db8d363
    }
  }

  async generateScript(request: any): Promise<GenerateScriptResponse> {
    try {
      let prompt = `请根据以下产品信息生成电商带货脚本：\n\n`;
      prompt += `产品描述：${request.productDescription}\n`;
      prompt += `风格：${request.style}\n\n`;
      prompt += `请生成包含开场白、卖点介绍、用户见证、促销活动的完整带货脚本。`;

<<<<<<< HEAD
      const imageFileId = request.productImageFileId;
      const productImagePath = request.productImagePath;

      if (imageFileId) {
        // 从内存 Buffer 获取产品图片
        const imageBuffer = getFileBuffer(imageFileId);
        if (imageBuffer) {
          const imagePart = {
            inlineData: {
              data: imageBuffer.toString('base64'),
              mimeType: request.imageInfo?.mimetype || 'image/jpeg',
            },
          };

          const fullPrompt = [
            { text: prompt },
            imagePart,
          ];

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
        // imageBuffer 为空时，继续往下走没有图片的流程
      }
      
      if (productImagePath && fs.existsSync(productImagePath)) {
        // 兼容旧的文件路径格式
        const imageData = fs.readFileSync(productImagePath);
=======
      if (request.productImagePath && fs.existsSync(request.productImagePath)) {
        const imageData = fs.readFileSync(request.productImagePath);
>>>>>>> 6365ea551c3f14b5479c27766b9428773db8d363
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
      } else {
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
      }
    } catch (error: any) {
      console.error('Gemini generateScript error:', error);
<<<<<<< HEAD
      throw new Error(`Gemini API调用失败: ${(error as Error).message}`);
=======
      throw new Error(`Gemini API调用失败: ${error?.message || '未知错误'}`);
>>>>>>> 6365ea551c3f14b5479c27766b9428773db8d363
    }
  }

  async analyzeVideo(request: any): Promise<AnalyzeVideoResponse> {
    try {
<<<<<<< HEAD
      const videoFileId = request.fileId;
      const videoPath = request.videoPath;
      let tempFilePath: string | null = null;
=======
      const framePaths = await this.extractVideoFrames(request.videoPath);
>>>>>>> 6365ea551c3f14b5479c27766b9428773db8d363

      try {
        // 支持新的 fileId 格式
        if (videoFileId) {
          tempFilePath = await bufferToTempFile(videoFileId);
          if (!tempFilePath) {
            throw new Error('无法从内存中获取视频文件');
          }
        } else if (!videoPath || !fs.existsSync(videoPath)) {
          throw new Error('视频文件不存在或无效');
        }

<<<<<<< HEAD
        // 对于视频分析，我们需要先提取关键帧
        const workingPath = tempFilePath || videoPath;
        const framePaths = await this.extractVideoFrames(workingPath);

        if (framePaths.length === 0) {
          throw new Error('无法提取视频帧');
        }

        // 使用第一帧和中间帧进行分析
        const analysisPrompt = `请分析这个视频的风格特征，包括：
=======
      const analysisPrompt = `请分析这个视频的风格特征，包括：
>>>>>>> 6365ea551c3f14b5479c27766b9428773db8d363
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

<<<<<<< HEAD
        const fullPrompt = [
          { text: analysisPrompt },
          ...imageParts,
        ];
=======
      const fullPrompt = [{ text: analysisPrompt }, ...imageParts];
>>>>>>> 6365ea551c3f14b5479c27766b9428773db8d363

        const result = await this.model.generateContent(fullPrompt);
        const response = await result.response;
        const analysis = response.text();

<<<<<<< HEAD
        // 解析分析结果
        const parsedResult = this.parseVideoAnalysis(analysis);

        // 清理临时文件和内存缓冲
        if (videoFileId) {
          cleanupFileBuffer(videoFileId);
        }

        return {
          ...parsedResult,
          metadata: {
            model: this.config.modelName,
            frames_analyzed: framePaths.length,
          },
        };
      } finally {
        // 清理临时文件
        if (tempFilePath) {
          cleanupTempFile(tempFilePath);
        }
      }
    } catch (error) {
      console.error('Gemini analyzeVideo error:', error);
      throw new Error(`Gemini API调用失败: ${(error as Error).message}`);
=======
      const parsedResult = this.parseVideoAnalysis(analysis);

      return {
        ...parsedResult,
        metadata: {
          model: this.config.modelName,
          frames_analyzed: framePaths.length,
        },
      };
    } catch (error: any) {
      console.error('Gemini analyzeVideo error:', error);
      throw new Error(`Gemini API调用失败: ${error?.message || '未知错误'}`);
>>>>>>> 6365ea551c3f14b5479c27766b9428773db8d363
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
    // TODO: 使用 ffmpeg 提取帧
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
