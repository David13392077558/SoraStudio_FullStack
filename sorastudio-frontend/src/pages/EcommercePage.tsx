import React, { useState } from 'react';
import { ImageUploader } from '../components/shared/ImageUploader';
import { StyleSelector } from '../components/shared/StyleSelector';
import { ResultCard } from '../components/shared/ResultCard';
import { getStylesByCategory } from '../config/styles';
import { apiClient } from '../api/client';
import { useTaskStore } from '../store/useTaskStore';
import { useVideoPolling } from '../hooks/useVideoPolling';

export const EcommercePage: React.FC = () => {
  const [productUrl, setProductUrl] = useState('');
  const [productImage, setProductImage] = useState<File | null>(null);
  const [productDescription, setProductDescription] = useState('');
  const [selectedStyle, setSelectedStyle] = useState('');
  const [currentTaskId, setCurrentTaskId] = useState<string | null>(null);

  const { addTask } = useTaskStore();
  const currentTask = useVideoPolling(currentTaskId);

  const styleOptions = getStylesByCategory('带货');

  const handleGenerate = async () => {
    if (!productDescription.trim()) {
      alert('请输入产品描述');
      return;
    }

    if (!selectedStyle) {
      alert('请选择风格');
      return;
    }

    try {
      const taskId = `task_${Date.now()}`;
      addTask({
        id: taskId,
        type: 'script',
        status: 'pending',
        progress: 0,
      });
      setCurrentTaskId(taskId);

      const response = await apiClient.generateScript({
        productUrl: productUrl || undefined,
        productImage: productImage || undefined,
        productDescription,
        style: selectedStyle,
      });

      if (response.data.taskId) {
        setCurrentTaskId(response.data.taskId);
      }
    } catch (error) {
      console.error('生成失败:', error);
      alert('生成失败，请重试');
    }
  };

  const handleCopy = (content: string) => {
    navigator.clipboard.writeText(content);
    alert('已复制到剪贴板');
  };

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      <div className="text-center">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">电商带货脚本生成</h1>
        <p className="text-gray-600">输入产品信息，自动生成爆款带货脚本</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* 输入区域 */}
        <div className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              产品链接（可选）
            </label>
            <input
              type="url"
              value={productUrl}
              onChange={(e) => setProductUrl(e.target.value)}
              placeholder="https://..."
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              产品图片（可选）
            </label>
            <ImageUploader
              onImageSelect={setProductImage}
              preview={productImage ? URL.createObjectURL(productImage) : undefined}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              产品描述 *
            </label>
            <textarea
              value={productDescription}
              onChange={(e) => setProductDescription(e.target.value)}
              placeholder="详细描述产品特点、卖点、使用场景等..."
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              rows={4}
              required
            />
          </div>

          <StyleSelector
            options={styleOptions}
            selectedStyle={selectedStyle}
            onStyleChange={setSelectedStyle}
          />

          <button
            onClick={handleGenerate}
            disabled={!productDescription.trim() || !selectedStyle}
            className="w-full px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
          >
            生成带货脚本
          </button>
        </div>

        {/* 结果区域 */}
        <div>
          <h2 className="text-xl font-semibold mb-4">生成结果</h2>
          {currentTask ? (
            <div className="space-y-4">
              <div className="bg-white border border-gray-200 rounded-lg p-4">
                <div className="flex justify-between items-center mb-2">
                  <span className="font-medium">任务状态</span>
                  <span className={`px-2 py-1 text-xs rounded-full ${
                    currentTask.status === 'completed' ? 'bg-green-100 text-green-800' :
                    currentTask.status === 'failed' ? 'bg-red-100 text-red-800' :
                    'bg-yellow-100 text-yellow-800'
                  }`}>
                    {currentTask.status === 'completed' ? '完成' :
                     currentTask.status === 'failed' ? '失败' :
                     '处理中'}
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-green-600 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${currentTask.progress}%` }}
                  />
                </div>
                <div className="text-sm text-gray-600 mt-1">{currentTask.progress}%</div>
              </div>

              {currentTask.status === 'completed' && currentTask.result && (
                <div className="space-y-4">
                  <ResultCard
                    title="带货脚本"
                    content={currentTask.result.script}
                    type="script"
                    onCopy={() => handleCopy(currentTask.result.script)}
                  />
                  {currentTask.result.highlights && (
                    <ResultCard
                      title="卖点亮点"
                      content={currentTask.result.highlights}
                      type="analysis"
                      onCopy={() => handleCopy(currentTask.result.highlights)}
                    />
                  )}
                </div>
              )}

              {currentTask.status === 'failed' && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                  <p className="text-red-800">{currentTask.error || '生成失败'}</p>
                </div>
              )}
            </div>
          ) : (
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-8 text-center text-gray-500">
              暂无结果
            </div>
          )}
        </div>
      </div>
    </div>
  );
};