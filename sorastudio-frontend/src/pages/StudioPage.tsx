import React, { useState } from 'react';
import { ImageUploader } from '../components/shared/ImageUploader';
import { ResultCard } from '../components/shared/ResultCard';

export const StudioPage: React.FC = () => {
  const [script, setScript] = useState('');
  const [avatarImage, setAvatarImage] = useState<File | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);

  const handleGenerate = async () => {
    if (!script.trim()) {
      alert('请输入脚本内容');
      return;
    }

    setIsGenerating(true);
    // 这里会调用数字人生成API
    setTimeout(() => {
      setIsGenerating(false);
      alert('数字人视频生成功能开发中...');
    }, 2000);
  };

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      <div className="text-center">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">数字人工作台</h1>
        <p className="text-gray-600">创建专业的数字人视频内容</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* 输入区域 */}
        <div className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              脚本内容 *
            </label>
            <textarea
              value={script}
              onChange={(e) => setScript(e.target.value)}
              placeholder="输入数字人要说的台词内容..."
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              rows={6}
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              数字人形象（可选）
            </label>
            <ImageUploader
              onImageSelect={setAvatarImage}
              preview={avatarImage ? URL.createObjectURL(avatarImage) : undefined}
            />
          </div>

          <button
            onClick={handleGenerate}
            disabled={!script.trim() || isGenerating}
            className="w-full px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
          >
            {isGenerating ? '生成中...' : '生成数字人视频'}
          </button>
        </div>

        {/* 预览区域 */}
        <div>
          <h2 className="text-xl font-semibold mb-4">预览与结果</h2>
          <div className="bg-gray-50 border border-gray-200 rounded-lg p-8 text-center text-gray-500">
            <div className="text-6xl mb-4">🎭</div>
            <p>数字人视频将在此处预览</p>
            <p className="text-sm mt-2">功能开发中，敬请期待</p>
          </div>

          {script && (
            <div className="mt-4">
              <ResultCard
                title="脚本预览"
                content={script}
                type="script"
                onCopy={() => navigator.clipboard.writeText(script)}
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
};