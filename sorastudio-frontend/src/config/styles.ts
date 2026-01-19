export interface StyleOption {
  id: string;
  name: string;
  description: string;
  category: string;
}

export const STYLE_OPTIONS: StyleOption[] = [
  // 电影级风格
  { id: 'cinematic', name: '电影级', description: '专业电影制作风格，包含复杂光影和构图', category: '电影' },
  { id: 'documentary', name: '纪录片', description: '真实记录风格，注重真实感和叙事性', category: '电影' },
  { id: 'anime', name: '动漫风格', description: '日本动漫风格，鲜艳色彩和夸张表情', category: '动漫' },
  { id: 'cartoon', name: '卡通风格', description: '西方卡通风格，可爱活泼的视觉效果', category: '动漫' },

  // 商业广告
  { id: 'luxury', name: '奢华高端', description: '高端奢侈品广告风格，金色调和优雅构图', category: '商业' },
  { id: 'minimalist', name: '极简现代', description: '现代极简风格，干净简洁的设计语言', category: '商业' },
  { id: 'vintage', name: '复古怀旧', description: '怀旧复古风格，温暖的色调和经典元素', category: '商业' },
  { id: 'futuristic', name: '未来科技', description: '科幻未来风格，霓虹灯效和科技感', category: '商业' },

  // 带货风格
  { id: 'lifestyle', name: '生活方式', description: '日常生活场景，真实自然的展示方式', category: '带货' },
  { id: 'studio', name: '工作室', description: '专业摄影棚环境，纯色背景突出产品', category: '带货' },
  { id: 'outdoor', name: '户外场景', description: '户外自然环境，融入生活场景', category: '带货' },
  { id: 'fashion', name: '时尚潮流', description: '时尚杂志风格，高端模特和造型', category: '带货' },

  // 探店风格
  { id: 'cozy', name: '温馨舒适', description: '咖啡厅书店等舒适环境，营造温馨氛围', category: '探店' },
  { id: 'urban', name: '都市现代', description: '城市街道和现代建筑，展现都市生活', category: '探店' },
  { id: 'nature', name: '自然清新', description: '公园海边等自然环境，清新舒适的感觉', category: '探店' },
  { id: 'industrial', name: '工业风', description: '废弃工厂或现代工业环境，独特个性', category: '探店' },
];

export const getStylesByCategory = (category: string): StyleOption[] => {
  return STYLE_OPTIONS.filter(style => style.category === category);
};

export const getStyleById = (id: string): StyleOption | undefined => {
  return STYLE_OPTIONS.find(style => style.id === id);
};