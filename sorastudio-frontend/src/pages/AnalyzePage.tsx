import React, { useState } from 'react';
import { VideoUploader } from '../components/shared/VideoUploader';
import { ResultCard } from '../components/shared/ResultCard';
import { apiClient } from '../api/client';
import { useTaskStore } from '../store/useTaskStore';
import { useVideoPolling } from '../hooks/useVideoPolling';

export const AnalyzePage: React.FC = () => {
  const [selectedVideo, setSelectedVideo] = useState<File | null>(null);
  const [currentTaskId, setCurrentTaskId] = useState<string | null>(null);

  const { addTask } = useTaskStore();
  const currentTask = useVideoPolling(currentTaskId);

  const handleAnalyze = async () => {
    if (!selectedVideo) {
      alert('请上传视频文件');
      return;
    }

    try {
      const taskId = `task_${Date.now()}`;
      addTask({
        id: taskId,
        type: 'analysis',
        status: 'pending',
        progress: 0,
      });
      setCurrentTaskId(taskId);

      const response = await apiClient.analyzeVideo({
        video: selectedVideo,
      });

      if (response.data.taskId) {
        setCurrentTaskId(response.data.taskId);
      }
    } catch (error) {
      console.error('分析失败:', error);
      alert('分析失败，请重试');
    }
  };

  const handleCopy = (content: string) => {
    navigator.clipboard.writeText(content);
    alert('已复制到剪贴板');
  };

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      <div className="text-center">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">视频风格分析</h1>
        <p className="text-gray-600">上传视频，自动分析风格并生成同款提示词</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* 输入区域 */}
        <div className="space-y-6">
          <div>
            <h2 className="text-xl font-semibold mb-4">上传视频</h2>
            <VideoUploader
              onVideoSelect={setSelectedVideo}
              preview={selectedVideo ? URL.createObjectURL(selectedVideo) : undefined}
            />
          </div>

          <button
            onClick={handleAnalyze}
            disabled={!selectedVideo}
            className="w-full px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
          >
            开始分析
          </button>
        </div>

        {/* 结果区域 */}
        <div>
          <h2 className="text-xl font-semibold mb-4">分析结果</h2>
          {currentTask ? (
            <div className="space-y-4">
              <div className="bg-white border border-gray-200 rounded-lg p-4">
                <div className="flex justify-between items-center mb-2">
                  <span className="font-medium">分析状态</span>
                  <span className={`px-2 py-1 text-xs rounded-full ${
                    currentTask.status === 'completed' ? 'bg-green-100 text-green-800' :
                    currentTask.status === 'failed' ? 'bg-red-100 text-red-800' :
                    'bg-yellow-100 text-yellow-800'
                  }`}>
                    {currentTask.status === 'completed' ? '完成' :
                     currentTask.status === 'failed' ? '失败' :
                     '分析中'}
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-purple-600 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${currentTask.progress}%` }}
                  />
                </div>
                <div className="text-sm text-gray-600 mt-1">{currentTask.progress}%</div>
              </div>

              {currentTask.status === 'completed' && currentTask.result && (
                <div className="space-y-4">
                  <ResultCard
                    title="风格标签"
                    content={currentTask.result.styleTags?.join(', ') || '无'}
                    type="analysis"
                    onCopy={() => handleCopy(currentTask.result.styleTags?.join(', ') || '')}
                  />
                  <ResultCard
                    title="同款提示词"
                    content={currentTask.result.similarPrompt}
                    type="prompt"
                    onCopy={() => handleCopy(currentTask.result.similarPrompt)}
                  />
                  <ResultCard
                    title="镜头语言分析"
                    content={currentTask.result.cameraAnalysis}
                    type="analysis"
                    onCopy={() => handleCopy(currentTask.result.cameraAnalysis)}
                  />
                  {currentTask.result.storyboard && (
                    <ResultCard
                      title="分镜表"
                      content={currentTask.result.storyboard}
                      type="analysis"
                      onCopy={() => handleCopy(currentTask.result.storyboard)}
                    />
                  )}
                </div>
              )}

              {currentTask.status === 'failed' && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                  <p className="text-red-800">{currentTask.error || '分析失败'}</p>
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