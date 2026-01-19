import React, { useState, useEffect } from 'react';
import { History, Heart, Download, Eye, Trash2, Search } from 'lucide-react';
import { authService, TaskHistory } from '../services/authService';

export const HistoryPage: React.FC = () => {
  const [tasks, setTasks] = useState<TaskHistory[]>([]);
  const [favorites, setFavorites] = useState<TaskHistory[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'history' | 'favorites'>('history');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedType, setSelectedType] = useState<TaskHistory['type'] | 'all'>('all');

  useEffect(() => {
    loadData();
  }, [activeTab, selectedType, searchTerm]);

  const loadData = async () => {
    try {
      if (activeTab === 'history') {
        const params: any = {};
        if (selectedType !== 'all') params.type = selectedType;
        if (searchTerm) params.search = searchTerm;

        const history = await authService.getTaskHistory(params);
        setTasks(history);
      } else {
        const favs = await authService.getFavorites();
        setFavorites(favs);
      }
    } catch (error) {
      console.error('加载数据失败:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleToggleFavorite = async (taskId: string, isFavorite: boolean) => {
    try {
      if (isFavorite) {
        await authService.removeFromFavorites(taskId);
        setTasks(tasks.map(task =>
          task.id === taskId ? { ...task, isFavorite: false } : task
        ));
        setFavorites(favorites.filter(fav => fav.id !== taskId));
      } else {
        await authService.addToFavorites(taskId);
        const task = tasks.find(t => t.id === taskId);
        if (task) {
          setTasks(tasks.map(t =>
            t.id === taskId ? { ...t, isFavorite: true } : t
          ));
          setFavorites([task, ...favorites]);
        }
      }
    } catch (error) {
      console.error('切换收藏失败:', error);
    }
  };

  const handleDeleteTask = async (taskId: string) => {
    if (!confirm('确定要删除这个任务记录吗？此操作不可撤销。')) return;

    try {
      await authService.deleteTask(taskId);
      setTasks(tasks.filter(task => task.id !== taskId));
      setFavorites(favorites.filter(fav => fav.id !== taskId));
    } catch (error) {
      console.error('删除任务失败:', error);
      alert('删除失败，请重试');
    }
  };

  const getTypeLabel = (type: TaskHistory['type']) => {
    const labels = {
      prompt: '提示词生成',
      script: '脚本生成',
      analysis: '视频分析',
      digital_human: '数字人'
    };
    return labels[type] || type;
  };

  const getStatusColor = (status: TaskHistory['status']) => {
    switch (status) {
      case 'completed': return 'bg-green-100 text-green-800';
      case 'failed': return 'bg-red-100 text-red-800';
      case 'processing': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const currentData = activeTab === 'history' ? tasks : favorites;

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <div className="text-gray-500">加载中...</div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">历史记录</h1>
          <p className="text-gray-600 mt-2">查看您的任务历史和收藏夹</p>
        </div>
      </div>

      {/* 标签页 */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          <button
            onClick={() => setActiveTab('history')}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'history'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            <History size={16} className="inline mr-2" />
            任务历史 ({tasks.length})
          </button>
          <button
            onClick={() => setActiveTab('favorites')}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'favorites'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            <Heart size={16} className="inline mr-2" />
            收藏夹 ({favorites.length})
          </button>
        </nav>
      </div>

      {/* 搜索和过滤（仅历史记录标签页） */}
      {activeTab === 'history' && (
        <div className="flex space-x-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
              <input
                type="text"
                placeholder="搜索任务..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
          <select
            value={selectedType}
            onChange={(e) => setSelectedType(e.target.value as TaskHistory['type'] | 'all')}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">所有类型</option>
            <option value="prompt">提示词生成</option>
            <option value="script">脚本生成</option>
            <option value="analysis">视频分析</option>
            <option value="digital_human">数字人</option>
          </select>
        </div>
      )}

      {/* 任务列表 */}
      {currentData.length === 0 ? (
        <div className="text-center py-12">
          <History className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-sm font-medium text-gray-900">
            {activeTab === 'history' ? '暂无任务历史' : '暂无收藏任务'}
          </h3>
          <p className="mt-1 text-sm text-gray-500">
            {activeTab === 'history'
              ? '开始使用AI功能后，您的任务记录将显示在这里'
              : '收藏您喜欢的任务，它们将显示在这里'
            }
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {currentData.map((task) => (
            <div key={task.id} className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm hover:shadow-md transition-shadow">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center space-x-3 mb-2">
                    <h3 className="text-lg font-semibold text-gray-900 truncate">{task.name}</h3>
                    <span className={`px-2 py-1 text-xs rounded-full ${getStatusColor(task.status)}`}>
                      {task.status === 'completed' ? '完成' :
                       task.status === 'failed' ? '失败' :
                       task.status === 'processing' ? '处理中' : task.status}
                    </span>
                  </div>
                  <p className="text-sm text-gray-600 mb-3">{getTypeLabel(task.type)}</p>

                  {task.description && (
                    <p className="text-sm text-gray-700 mb-3 line-clamp-2">{task.description}</p>
                  )}

                  {task.result && task.status === 'completed' && (
                    <div className="bg-gray-50 rounded-md p-3 mb-3">
                      <p className="text-sm text-gray-800 whitespace-pre-wrap line-clamp-3">
                        {typeof task.result === 'string' ? task.result : JSON.stringify(task.result, null, 2)}
                      </p>
                    </div>
                  )}

                  <div className="flex items-center justify-between text-sm text-gray-500">
                    <span>创建时间: {new Date(task.createdAt).toLocaleString()}</span>
                    {task.completedAt && (
                      <span>完成时间: {new Date(task.completedAt).toLocaleString()}</span>
                    )}
                  </div>
                </div>

                <div className="flex items-center space-x-2 ml-4">
                  <button
                    onClick={() => handleToggleFavorite(task.id, task.isFavorite || false)}
                    className={`p-2 rounded-md ${
                      task.isFavorite
                        ? 'text-red-600 hover:bg-red-50'
                        : 'text-gray-400 hover:text-red-600 hover:bg-red-50'
                    }`}
                    title={task.isFavorite ? '取消收藏' : '添加到收藏'}
                  >
                    <Heart size={16} fill={task.isFavorite ? 'currentColor' : 'none'} />
                  </button>

                  {task.result && task.status === 'completed' && (
                    <button
                      className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-50 rounded-md"
                      title="下载结果"
                    >
                      <Download size={16} />
                    </button>
                  )}

                  <button
                    className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-50 rounded-md"
                    title="查看详情"
                  >
                    <Eye size={16} />
                  </button>

                  <button
                    onClick={() => handleDeleteTask(task.id)}
                    className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-md"
                    title="删除"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};