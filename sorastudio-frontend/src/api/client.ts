import axios from 'axios';
import { authService } from '../services/authService';

const api = axios.create({
  baseURL: import.meta.env.VITE_BACKEND_URL,
  timeout: 30000,
});

// 请求拦截器
api.interceptors.request.use(
  (config) => {
    // 添加认证令牌
    const token = authService.getToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// 响应拦截器
api.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error('API Error:', error);

    // 处理认证错误
    if (error.response?.status === 401) {
      authService.clearAuth();
      // 可以在这里触发重新登录的逻辑
      window.location.href = '/login';
    }

    return Promise.reject(error);
  }
);

export interface GeneratePromptParams {
  image?: File;
  video?: File;
  style: string;
  description?: string;
}

export interface GenerateScriptParams {
  productUrl?: string;
  productImage?: File;
  productDescription: string;
  style: string;
}

export interface AnalyzeVideoParams {
  video: File;
}

export const apiClient = {
  // 认证相关
  post: (url: string, data?: any) => api.post(url, data),
  get: (url: string, config?: any) => api.get(url, config),
  put: (url: string, data?: any) => api.put(url, data),
  delete: (url: string) => api.delete(url),

  // Sora提示词生成
  generatePrompt: async (params: GeneratePromptParams) => {
    const formData = new FormData();
    if (params.image) formData.append('image', params.image);
    if (params.video) formData.append('video', params.video);
    formData.append('style', params.style);
    if (params.description) formData.append('description', params.description);

    return api.post('/ai/generate-prompt', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
  },

  // 电商脚本生成
  generateScript: async (params: GenerateScriptParams) => {
    const formData = new FormData();
    if (params.productUrl) formData.append('productUrl', params.productUrl);
    if (params.productImage) formData.append('productImage', params.productImage);
    formData.append('productDescription', params.productDescription);
    formData.append('style', params.style);

    return api.post('/ai/generate-script', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
  },

  // 视频风格分析
  analyzeVideo: async (params: AnalyzeVideoParams) => {
    const formData = new FormData();
    formData.append('video', params.video);

    return api.post('/ai/analyze-video', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
  },

  // 获取任务状态
  getTaskStatus: async (taskId: string) => {
    return api.get(`/tasks/${taskId}`);
  },
};

export default api;