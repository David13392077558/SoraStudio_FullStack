import { apiClient } from '../api/client';

export interface User {
  id: string;
  email: string;
  name: string;
  role: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  email: string;
  password: string;
  name: string;
}

export interface AuthResponse {
  user: User;
  token: string;
}

export interface TaskHistory {
  id: string;
  userId: string;
  name: string;
  type: 'prompt' | 'script' | 'analysis' | 'digital_human';
  status: 'processing' | 'completed' | 'failed';
  result?: any;
  description?: string;
  isFavorite?: boolean;
  createdAt: string;
  completedAt?: string;
}

export interface UserProfile {
  id: string;
  username: string;
  email: string;
  displayName?: string;
  bio?: string;
  createdAt: string;
  stats?: {
    totalProjects: number;
    completedProjects: number;
    totalTasks: number;
  };
}

export interface Project {
  id: string;
  userId: string;
  name: string;
  type: 'prompt' | 'script' | 'analysis' | 'digital_human';
  data: any;
  status: 'draft' | 'completed' | 'archived';
  createdAt: string;
  updatedAt: string;
  tags?: string[];
}

class AuthService {
  private tokenKey = 'auth_token';
  private userKey = 'auth_user';

  // 获取存储的令牌
  getToken(): string | null {
    return localStorage.getItem(this.tokenKey);
  }

  // 获取存储的用户信息
  getUser(): User | null {
    const userStr = localStorage.getItem(this.userKey);
    return userStr ? JSON.parse(userStr) : null;
  }

  // 设置认证信息
  setAuth(auth: AuthResponse): void {
    localStorage.setItem(this.tokenKey, auth.token);
    localStorage.setItem(this.userKey, JSON.stringify(auth.user));
  }

  // 清除认证信息
  clearAuth(): void {
    localStorage.removeItem(this.tokenKey);
    localStorage.removeItem(this.userKey);
  }

  // 检查是否已登录
  isAuthenticated(): boolean {
    return !!this.getToken() && !!this.getUser();
  }

  // 注册
  async register(data: RegisterRequest): Promise<AuthResponse> {
    const response = await apiClient.post('/auth/register', data);
    const auth = response.data;
    this.setAuth(auth);
    return auth;
  }

  // 登录
  async login(data: LoginRequest): Promise<AuthResponse> {
    const response = await apiClient.post('/auth/login', data);
    const auth = response.data;
    this.setAuth(auth);
    return auth;
  }

  // 获取用户信息
  async getProfile(): Promise<User> {
    const response = await apiClient.get('/auth/profile');
    return response.data;
  }

  // 更新用户信息
  async updateProfile(data: { name: string }): Promise<User> {
    const response = await apiClient.put('/auth/profile', data);
    const updatedUser = response.data.user;
    // 更新本地存储
    const currentUser = this.getUser();
    if (currentUser) {
      const newUser = { ...currentUser, ...updatedUser };
      localStorage.setItem(this.userKey, JSON.stringify(newUser));
    }
    return updatedUser;
  }

  // 登出
  logout(): void {
    this.clearAuth();
  }

  // 创建项目
  async createProject(data: {
    name: string;
    type: Project['type'];
    data?: any;
    tags?: string[];
  }): Promise<Project> {
    const response = await apiClient.post('/projects', data);
    return response.data.project;
  }

  // 获取用户项目
  async getUserProjects(params?: {
    type?: Project['type'];
    search?: string;
  }): Promise<Project[]> {
    const response = await apiClient.get('/projects', { params });
    return response.data.projects;
  }

  // 更新项目
  async updateProject(projectId: string, data: Partial<{
    name: string;
    data: any;
    status: Project['status'];
    tags: string[];
  }>): Promise<Project> {
    const response = await apiClient.put(`/projects/${projectId}`, data);
    return response.data.project;
  }

  // 删除项目
  async deleteProject(projectId: string): Promise<void> {
    await apiClient.delete(`/projects/${projectId}`);
  }

  // 获取用户资料
  async getUserProfile(): Promise<UserProfile> {
    const response = await apiClient.get('/auth/profile');
    return response.data;
  }

  // 更新用户资料
  async updateUserProfile(data: {
    username?: string;
    email?: string;
    displayName?: string;
    bio?: string;
  }): Promise<UserProfile> {
    const response = await apiClient.put('/auth/profile', data);
    return response.data;
  }

  // 修改密码
  async changePassword(data: {
    currentPassword: string;
    newPassword: string;
  }): Promise<void> {
    await apiClient.put('/auth/change-password', data);
  }

  // 获取任务历史
  async getTaskHistory(params?: {
    type?: TaskHistory['type'];
    search?: string;
    limit?: number;
    offset?: number;
  }): Promise<TaskHistory[]> {
    const response = await apiClient.get('/history/tasks', { params });
    return response.data.tasks;
  }

  // 获取收藏夹
  async getFavorites(): Promise<TaskHistory[]> {
    const response = await apiClient.get('/history/favorites');
    return response.data.tasks;
  }

  // 添加到收藏夹
  async addToFavorites(taskId: string): Promise<void> {
    await apiClient.post(`/history/favorites/${taskId}`);
  }

  // 从收藏夹移除
  async removeFromFavorites(taskId: string): Promise<void> {
    await apiClient.delete(`/history/favorites/${taskId}`);
  }

  // 删除任务记录
  async deleteTask(taskId: string): Promise<void> {
    await apiClient.delete(`/history/tasks/${taskId}`);
  }
}

export const authService = new AuthService();