import React, { useState } from 'react';
import { Play, X } from 'lucide-react';

interface VideoUploaderProps {
  onVideoSelect: (file: File) => void;
  preview?: string;
  className?: string;
}

export const VideoUploader: React.FC<VideoUploaderProps> = ({
  onVideoSelect,
  preview,
  className = ''
}) => {
  const [dragOver, setDragOver] = useState(false);

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    const files = Array.from(e.dataTransfer.files);
    if (files[0] && files[0].type.startsWith('video/')) {
      onVideoSelect(files[0]);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      onVideoSelect(file);
    }
  };

  return (
    <div className={`relative ${className}`}>
      <div
        className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
          dragOver ? 'border-blue-500 bg-blue-50' : 'border-gray-300 hover:border-gray-400'
        }`}
        onDragOver={(e) => {
          e.preventDefault();
          setDragOver(true);
        }}
        onDragLeave={() => setDragOver(false)}
        onDrop={handleDrop}
      >
        {preview ? (
          <div className="relative">
            <video src={preview} controls className="max-w-full max-h-64 mx-auto rounded" />
            <button
              className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
              onClick={() => onVideoSelect(null as any)}
            >
              <X size={16} />
            </button>
          </div>
        ) : (
          <>
            <Play className="mx-auto mb-4 text-gray-400" size={48} />
            <p className="text-gray-600">拖拽视频到此处或点击上传</p>
            <input
              type="file"
              accept="video/*"
              onChange={handleFileSelect}
              className="hidden"
              id="video-upload"
            />
            <label
              htmlFor="video-upload"
              className="mt-4 inline-block px-4 py-2 bg-blue-500 text-white rounded cursor-pointer hover:bg-blue-600"
            >
              选择文件
            </label>
          </>
        )}
      </div>
    </div>
  );
};