// 内存存储（生产环境应该使用数据库）
const users = new Map();
const projects = new Map();
// 用户相关操作
export const UserModel = {
    create(userData) {
        const user = {
            ...userData,
            id: `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
            createdAt: new Date(),
        };
        users.set(user.id, user);
        return user;
    },
    findByEmail(email) {
        for (const user of users.values()) {
            if (user.email === email)
                return user;
        }
        return null;
    },
    findById(id) {
        return users.get(id) || null;
    },
    update(id, updates) {
        const user = users.get(id);
        if (!user)
            return null;
        const updatedUser = { ...user, ...updates };
        users.set(id, updatedUser);
        return updatedUser;
    },
    delete(id) {
        return users.delete(id);
    },
    getAll() {
        return Array.from(users.values());
    }
};
// 项目相关操作
export const ProjectModel = {
    create(projectData) {
        const project = {
            ...projectData,
            id: `project_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
            createdAt: new Date(),
            updatedAt: new Date(),
        };
        projects.set(project.id, project);
        return project;
    },
    findById(id) {
        return projects.get(id) || null;
    },
    findByUserId(userId) {
        return Array.from(projects.values()).filter(p => p.userId === userId);
    },
    update(id, updates) {
        const project = projects.get(id);
        if (!project)
            return null;
        const updatedProject = {
            ...project,
            ...updates,
            updatedAt: new Date(),
        };
        projects.set(id, updatedProject);
        return updatedProject;
    },
    search(userId, query) {
        const userProjects = this.findByUserId(userId);
        if (!query)
            return userProjects;
        const lower = query.toLowerCase();
        return userProjects.filter((project) => {
            const nameMatch = project.name.toLowerCase().includes(lower);
            const tagMatch = project.tags
                ? project.tags.some((tag) => tag.toLowerCase().includes(lower))
                : false;
            return nameMatch || tagMatch;
        });
    },
    // ⭐ 必须添加的 delete 方法（Render 报错的根源）
    delete(id) {
        return projects.delete(id);
    }
};
