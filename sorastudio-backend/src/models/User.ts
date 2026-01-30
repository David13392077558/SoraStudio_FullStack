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
  create(userData: Omit<User, 'id' | 'createdAt'>): User {
    const user: User = {
      ...userData,
      id: `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      createdAt: new Date(),
    };
    users.set(user.id, user);
    return user;
  },

  findByEmail(email: string): User | null {
    for (const user of users.values()) {
      if (user.email === email) return user;
    }
    return null;
  },

  findById(id: string): User | null {
    return users.get(id) || null;
  },

  update(id: string, updates: Partial<User>): User | null {
    const user = users.get(id);
    if (!user) return null;
    const updatedUser = { ...user, ...updates };
    users.set(id, updatedUser);
    return updatedUser;
  },

  delete(id: string): boolean {
    return users.delete(id);
  },

  getAll(): User[] {
    return Array.from(users.values());
  }
};

// 项目相关操作
export const ProjectModel = {
  create(projectData: Omit<Project, 'id' | 'createdAt' | 'updatedAt'>): Project {
    const project: Project = {
      ...projectData,
      id: `project_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    projects.set(project.id, project);
    return project;
  },

  findById(id: string): Project | null {
    return projects.get(id) || null;
  },

  findByUserId(userId: string): Project[] {
    return Array.from(projects.values()).filter(p => p.userId === userId);
  },

  update(id: string, updates: Partial<Project>): Project | null {
    const project = projects.get(id);
    if (!project) return null;

    const updatedProject = {
      ...project,
      ...updates,
      updatedAt: new Date(),
    };

    projects.set(id, updatedProject);
    return updatedProject;
  },

  search(userId: string, query: string): Project[] {
    const userProjects = this.findByUserId(userId);
    if (!query) return userProjects;

    const lower = query.toLowerCase();

    return userProjects.filter((project: Project) => {
      const nameMatch = project.name.toLowerCase().includes(lower);
      const tagMatch = project.tags
        ? project.tags.some((tag: string) => tag.toLowerCase().includes(lower))
        : false;

      return nameMatch || tagMatch;
    });
  }
};

