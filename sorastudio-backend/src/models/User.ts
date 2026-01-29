// 简单的用户模型（生产环境应该使用数据库）
export interface User {
  id: string;
  email: string;
  password: string; // 加密后的密码
  name: string;
  role: 'user' | 'admin';
  createdAt: Date;
  lastLoginAt?: Date;
  isActive: boolean;
  displayName?: string;
  bio?: string;
}

export interface Project {
  id: string;
  userId: string;
  name: string;
  type: 'prompt' | 'script' | 'analysis' | 'digital_human';
  data: any;
  status: 'draft' | 'completed' | 'archived';
  createdAt: Date;
  updatedAt: Date;
  tags?: string[];
}

// 内存存储（生产环境应该使用数据库）
const users: Map<string, User> = new Map();
const projects: Map<string, Project> = new Map();

// 用户相关操作
export const UserModel = {
  // 创建用户
  create: (userData: Omit<User, 'id' | 'createdAt'>): User => {
    const user: User = {
      ...userData,
      id: `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      createdAt: new Date(),
    };
    users.set(user.id, user);
    return user;
  },

  // 通过邮箱查找用户
  findByEmail: (email: string): User | null => {
    for (const user of users.values()) {
      if (user.email === email) {
        return user;
      }
    }
    return null;
  },

  // 通过ID查找用户
  findById: (id: string): User | null => {
    return users.get(id) || null;
  },

  // 更新用户
  update: (id: string, updates: Partial<User>): User | null => {
    const user = users.get(id);
    if (user) {
      const updatedUser = { ...user, ...updates };
      users.set(id, updatedUser);
      return updatedUser;
    }
    return null;
  },

  // 删除用户
  delete: (id: string): boolean => {
    return users.delete(id);
  },

  // 获取所有用户（管理员功能）
  getAll: (): User[] => {
    return Array.from(users.values());
  }
};

// 项目相关操作
export const ProjectModel = {
  // 创建项目
  create: (projectData: Omit<Project, 'id' | 'createdAt' | 'updatedAt'>): Project => {
    const project: Project = {
      ...projectData,
      id: `project_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    projects.set(project.id, project);
    return project;
  },

  // 通过ID查找项目
  findById: (id: string): Project | null => {
    return projects.get(id) || null;
  },

  // 通过用户ID查找项目
  findByUserId: (userId: string): Project[] => {
    return Array.from(projects.values()).filter(project => project.userId === userId);
  },

  // 更新项目
  update: (id: string, updates: Partial<Project>): Project | null => {
    const project = projects.get(id);
    if (project) {
      const updatedProject = {
        ...project,
        ...updates,
        updatedAt: new Date()
      };
      projects.set(id, updatedProject);
      return updatedProject;
    }
    return null;
  },

  // 删除项目
  delete: (id: string): boolean => {
    return projects.delete(id);
  },

  // 搜索项目
  search: (userId: string, query: string): Project[] => {
    const userProjects = ProjectModel.findByUserId(userId);
    if (!query || !userProjects) return userProjects || [];

    return userProjects.filter((project: Project) =>
      project.name.toLowerCase().includes(query.toLowerCase()) ||
      project.tags?.some((tag: string) => tag.toLowerCase().includes(query.toLowerCase()))
    );
  }
};