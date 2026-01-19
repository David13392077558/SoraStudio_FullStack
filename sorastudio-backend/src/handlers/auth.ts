import bcrypt from 'bcryptjs';
import { Request, Response } from 'express';
import { UserModel, ProjectModel } from '../models/User';
import { generateToken, AuthRequest } from '../middleware/auth';
import { cacheService } from '../cache/CacheService';

export const registerHandler = async (req: Request, res: Response) => {
  try {
    const { email, password, name } = req.body;

    if (!email || !password || !name) {
      return res.status(400).json({ error: '邮箱、密码和姓名都是必填项' });
    }

    // 检查邮箱是否已存在
    const existingUser = UserModel.findByEmail(email);
    if (existingUser) {
      return res.status(409).json({ error: '邮箱已被注册' });
    }

    // 加密密码
    const hashedPassword = await bcrypt.hash(password, 12);

    // 创建用户
    const user = UserModel.create({
      email,
      password: hashedPassword,
      name,
      role: 'user',
      isActive: true,
    });

    // 生成令牌
    const token = generateToken({
      id: user.id,
      email: user.email,
      role: user.role
    });

    // 缓存用户信息
    await cacheService.set(`user:${user.id}`, {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role
    }, 3600);

    res.status(201).json({
      message: '注册成功',
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role
      },
      token
    });
  } catch (error) {
    console.error('注册失败:', error);
    res.status(500).json({ error: '服务器内部错误' });
  }
};

export const loginHandler = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: '邮箱和密码都是必填项' });
    }

    // 查找用户
    const user = UserModel.findByEmail(email);
    if (!user || !user.isActive) {
      return res.status(401).json({ error: '邮箱或密码错误' });
    }

    // 验证密码
    const isValidPassword = await bcrypt.compare(password, user.password);
    if (!isValidPassword) {
      return res.status(401).json({ error: '邮箱或密码错误' });
    }

    // 更新最后登录时间
    UserModel.update(user.id, { lastLoginAt: new Date() });

    // 生成令牌
    const token = generateToken({
      id: user.id,
      email: user.email,
      role: user.role
    });

    // 缓存用户信息
    await cacheService.set(`user:${user.id}`, {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role
    }, 3600);

    res.json({
      message: '登录成功',
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role
      },
      token
    });
  } catch (error) {
    console.error('登录失败:', error);
    res.status(500).json({ error: '服务器内部错误' });
  }
};

export const getProfileHandler = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ error: '未认证' });
    }

    const user = UserModel.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ error: '用户不存在' });
    }

    // 获取用户统计信息
    const projects = ProjectModel.findByUserId(req.user.id);
    const completedProjects = projects.filter(p => p.status === 'completed');

    res.json({
      id: user.id,
      username: user.name, // 使用name作为username
      email: user.email,
      displayName: user.displayName || '',
      bio: user.bio || '',
      createdAt: user.createdAt,
      stats: {
        totalProjects: projects.length,
        completedProjects: completedProjects.length,
        totalTasks: 0 // TODO: 实现任务统计
      }
    });
  } catch (error) {
    console.error('获取用户信息失败:', error);
    res.status(500).json({ error: '服务器内部错误' });
  }
};

export const updateProfileHandler = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ error: '未认证' });
    }

    const { username, email, displayName, bio } = req.body;
    const updates: any = {};

    if (username) updates.name = username; // 将username映射到name字段
    if (email) updates.email = email;
    if (displayName !== undefined) updates.displayName = displayName;
    if (bio !== undefined) updates.bio = bio;

    // 检查邮箱是否已被其他用户使用
    if (email) {
      const existingUser = UserModel.findByEmail(email);
      if (existingUser && existingUser.id !== req.user.id) {
        return res.status(409).json({ error: '邮箱已被其他用户使用' });
      }
    }

    const user = UserModel.update(req.user.id, updates);
    if (!user) {
      return res.status(404).json({ error: '用户不存在' });
    }

    // 更新缓存
    await cacheService.set(`user:${user.id}`, {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
      displayName: user.displayName,
      bio: user.bio
    }, 3600);

    res.json({
      message: '更新成功',
      id: user.id,
      username: user.name,
      email: user.email,
      displayName: user.displayName || '',
      bio: user.bio || ''
    });
  } catch (error) {
    console.error('更新用户信息失败:', error);
    res.status(500).json({ error: '服务器内部错误' });
  }
};

// 项目管理处理器
export const createProjectHandler = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ error: '未认证' });
    }

    const { name, type, data, tags } = req.body;

    if (!name || !type) {
      return res.status(400).json({ error: '项目名称和类型都是必填项' });
    }

    const project = ProjectModel.create({
      userId: req.user.id,
      name,
      type,
      data: data || {},
      status: 'draft',
      tags: tags || []
    });

    res.status(201).json({
      message: '项目创建成功',
      project
    });
  } catch (error) {
    console.error('创建项目失败:', error);
    res.status(500).json({ error: '服务器内部错误' });
  }
};

export const getUserProjectsHandler = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ error: '未认证' });
    }

    const { type, search } = req.query;
    let projects = ProjectModel.findByUserId(req.user.id);

    // 按类型过滤
    if (type) {
      projects = projects.filter(p => p.type === type);
    }

    // 搜索
    if (search) {
      projects = projects.filter(p =>
        p.name.toLowerCase().includes((search as string).toLowerCase()) ||
        p.tags?.some(tag => tag.toLowerCase().includes((search as string).toLowerCase()))
      );
    }

    res.json({
      projects: projects.sort((a, b) => b.updatedAt.getTime() - a.updatedAt.getTime())
    });
  } catch (error) {
    console.error('获取用户项目失败:', error);
    res.status(500).json({ error: '服务器内部错误' });
  }
};

export const updateProjectHandler = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ error: '未认证' });
    }

    const { projectId } = req.params;
    const { name, data, status, tags } = req.body;

    const project = ProjectModel.findById(projectId);
    if (!project || project.userId !== req.user.id) {
      return res.status(404).json({ error: '项目不存在或无权限访问' });
    }

    const updates: any = {};
    if (name) updates.name = name;
    if (data) updates.data = data;
    if (status) updates.status = status;
    if (tags) updates.tags = tags;

    const updatedProject = ProjectModel.update(projectId, updates);
    if (!updatedProject) {
      return res.status(500).json({ error: '更新项目失败' });
    }

    res.json({
      message: '项目更新成功',
      project: updatedProject
    });
  } catch (error) {
    console.error('更新项目失败:', error);
    res.status(500).json({ error: '服务器内部错误' });
  }
};

export const deleteProjectHandler = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ error: '未认证' });
    }

    const { projectId } = req.params;

    const project = ProjectModel.findById(projectId);
    if (!project || project.userId !== req.user.id) {
      return res.status(404).json({ error: '项目不存在或无权限访问' });
    }

    const deleted = ProjectModel.delete(projectId);
    if (!deleted) {
      return res.status(500).json({ error: '删除项目失败' });
    }

    res.json({ message: '项目删除成功' });
  } catch (error) {
    console.error('删除项目失败:', error);
    res.status(500).json({ error: '服务器内部错误' });
  }
};

export const changePasswordHandler = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ error: '未认证' });
    }

    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({ error: '当前密码和新密码都是必填项' });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({ error: '新密码至少需要6个字符' });
    }

    const user = UserModel.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ error: '用户不存在' });
    }

    // 验证当前密码
    const isValidPassword = await bcrypt.compare(currentPassword, user.password);
    if (!isValidPassword) {
      return res.status(400).json({ error: '当前密码不正确' });
    }

    // 加密新密码
    const hashedNewPassword = await bcrypt.hash(newPassword, 12);

    // 更新密码
    const updatedUser = UserModel.update(req.user.id, { password: hashedNewPassword });
    if (!updatedUser) {
      return res.status(500).json({ error: '密码更新失败' });
    }

    res.json({ message: '密码修改成功' });
  } catch (error) {
    console.error('修改密码失败:', error);
    res.status(500).json({ error: '服务器内部错误' });
  }
};