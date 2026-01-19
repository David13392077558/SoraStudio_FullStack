import React from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@radix-ui/react-select';

interface StyleOption {
  id: string;
  name: string;
  description: string;
}

interface StyleSelectorProps {
  options: StyleOption[];
  selectedStyle: string;
  onStyleChange: (styleId: string) => void;
  className?: string;
}

export const StyleSelector: React.FC<StyleSelectorProps> = ({
  options,
  selectedStyle,
  onStyleChange,
  className = ''
}) => {
  return (
    <div className={`space-y-2 ${className}`}>
      <label className="block text-sm font-medium text-gray-700">选择风格</label>
      <Select value={selectedStyle} onValueChange={onStyleChange}>
        <SelectTrigger className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
          <SelectValue placeholder="选择一个风格" />
        </SelectTrigger>
        <SelectContent className="bg-white border border-gray-300 rounded-md shadow-lg">
          {options.map((option) => (
            <SelectItem
              key={option.id}
              value={option.id}
              className="px-3 py-2 hover:bg-gray-100 cursor-pointer"
            >
              <div>
                <div className="font-medium">{option.name}</div>
                <div className="text-sm text-gray-500">{option.description}</div>
              </div>
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
};