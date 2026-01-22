// 搜索项目
search(userId: string, query: string): Project[] {
  const userProjects = ProjectModel.findByUserId(userId);

  if (!query) return userProjects;

  const lowerQuery = query.toLowerCase();

  return userProjects.filter((project: Project) => {
    const nameMatch = project.name.toLowerCase().includes(lowerQuery);

    const tagMatch = project.tags
      ? project.tags.some((tag: string) => tag.toLowerCase().includes(lowerQuery))
      : false;

    return nameMatch || tagMatch;
  });
}
