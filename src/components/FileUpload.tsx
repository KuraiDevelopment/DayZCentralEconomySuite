'use client';

import { useCallback } from 'react';
import { Upload } from 'lucide-react';

interface FileUploadProps {
  onFileSelect: (file: File) => void;
  acceptedTypes?: string;
  maxSizeMB?: number;
}

export default function FileUpload({
  onFileSelect,
  acceptedTypes = '.xml',
  maxSizeMB = 10,
}: FileUploadProps) {
  const validateAndSelect = useCallback((file: File) => {
    const maxSize = maxSizeMB * 1024 * 1024;
    if (file.size > maxSize) {
      alert(`File size exceeds ${maxSizeMB}MB limit`);
      return;
    }
    onFileSelect(file);
  }, [onFileSelect, maxSizeMB]);

  const handleDrop = useCallback(
    (e: React.DragEvent<HTMLDivElement>) => {
      e.preventDefault();
      const file = e.dataTransfer.files[0];
      if (file) {
        validateAndSelect(file);
      }
    },
    [validateAndSelect]
  );

  const handleFileInput = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file) {
        validateAndSelect(file);
      }
    },
    [validateAndSelect]
  );

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
  };

  return (
    <div
      onDrop={handleDrop}
      onDragOver={handleDragOver}
      className="border-2 border-dashed border-gray-600 rounded-lg p-8 text-center hover:border-green-500 transition-colors cursor-pointer bg-gray-800/30"
    >
      <input
        type="file"
        accept={acceptedTypes}
        onChange={handleFileInput}
        className="hidden"
        id="file-upload"
      />
      <label htmlFor="file-upload" className="cursor-pointer">
        <Upload className="h-12 w-12 mx-auto mb-4 text-gray-400" />
        <p className="text-lg font-medium text-white mb-2">
          Drop XML file here or click to browse
        </p>
        <p className="text-sm text-gray-400">
          Supports types.xml, events.xml, spawnable_types.xml, economy.xml
        </p>
        <p className="text-xs text-gray-500 mt-2">Max file size: {maxSizeMB}MB</p>
      </label>
    </div>
  );
}
