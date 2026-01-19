import React from 'react';
import { Download, Copy, Eye } from 'lucide-react';

interface ResultCardProps {
  title: string;
  content: string;
  type: 'prompt' | 'script' | 'analysis';
  onDownload?: () => void;
  onCopy?: () => void;
  onPreview?: () => void;
  className?: string;
}

export const ResultCard: React.FC<ResultCardProps> = ({
  title,
  content,
  type,
  onDownload,
  onCopy,
  onPreview,
  className = ''
}) => {
  const getTypeColor = () => {
    switch (type) {
      case 'prompt': return 'bg-blue-100 text-blue-800';
      case 'script': return 'bg-green-100 text-green-800';
      case 'analysis': return 'bg-purple-100 text-purple-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className={`bg-white border border-gray-200 rounded-lg p-6 shadow-sm ${className}`}>
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
        <span className={`px-2 py-1 text-xs font-medium rounded-full ${getTypeColor()}`}>
          {type === 'prompt' ? '提示词' : type === 'script' ? '脚本' : '分析'}
        </span>
      </div>

      <div className="bg-gray-50 rounded-md p-4 mb-4">
        <pre className="text-sm text-gray-700 whitespace-pre-wrap">{content}</pre>
      </div>

      <div className="flex space-x-2">
        {onPreview && (
          <button
            onClick={onPreview}
            className="flex items-center px-3 py-2 text-sm bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200"
          >
            <Eye size={16} className="mr-2" />
            预览
          </button>
        )}
        {onCopy && (
          <button
            onClick={onCopy}
            className="flex items-center px-3 py-2 text-sm bg-blue-100 text-blue-700 rounded-md hover:bg-blue-200"
          >
            <Copy size={16} className="mr-2" />
            复制
          </button>
        )}
        {onDownload && (
          <button
            onClick={onDownload}
            className="flex items-center px-3 py-2 text-sm bg-green-100 text-green-700 rounded-md hover:bg-green-200"
          >
            <Download size={16} className="mr-2" />
            下载
          </button>
        )}
      </div>
    </div>
  );
};