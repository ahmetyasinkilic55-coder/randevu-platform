import React, { useRef, useState } from 'react';
import { useCloudinary } from '@/hooks/useCloudinary';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { X, Upload, Image } from 'lucide-react';

interface CloudinaryUploadProps {
  onUpload: (result: {
    public_id: string;
    secure_url: string;
    url: string;
    format: string;
    width: number;
    height: number;
    bytes: number;
  }) => void;
  folder?: string;
  tags?: string;
  maxFiles?: number;
  acceptedTypes?: string[];
  className?: string;
  children?: React.ReactNode;
}

export default function CloudinaryUpload({
  onUpload,
  folder = 'general',
  tags,
  maxFiles = 1,
  acceptedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'],
  className = '',
  children
}: CloudinaryUploadProps) {
  const { uploadImage, uploading } = useCloudinary();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [progress, setProgress] = useState(0);
  const [dragOver, setDragOver] = useState(false);

  const handleFileSelect = (files: FileList | null) => {
    if (!files || files.length === 0) return;

    const selectedFiles = Array.from(files).slice(0, maxFiles);
    
    selectedFiles.forEach(async (file) => {
      // Validate file type
      if (!acceptedTypes.includes(file.type)) {
        alert(`Desteklenmeyen dosya türü: ${file.type}`);
        return;
      }

      // Validate file size (max 10MB)
      if (file.size > 10 * 1024 * 1024) {
        alert('Dosya çok büyük (maksimum 10MB)');
        return;
      }

      const result = await uploadImage(file, {
        folder,
        tags,
        onProgress: setProgress
      });

      if (result) {
        onUpload(result);
      }
    });
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    handleFileSelect(e.dataTransfer.files);
  };

  const openFileDialog = () => {
    fileInputRef.current?.click();
  };

  if (children) {
    return (
      <>
        <div onClick={openFileDialog} className="cursor-pointer">
          {children}
        </div>
        <input
          ref={fileInputRef}
          type="file"
          multiple={maxFiles > 1}
          accept={acceptedTypes.join(',')}
          onChange={(e) => handleFileSelect(e.target.files)}
          className="hidden"
        />
      </>
    );
  }

  return (
    <div className={`w-full ${className}`}>
      <div
        className={`
          border-2 border-dashed border-gray-300 rounded-lg p-6 text-center cursor-pointer
          transition-colors duration-200
          ${dragOver ? 'border-blue-500 bg-blue-50' : 'hover:border-gray-400'}
          ${uploading ? 'pointer-events-none opacity-50' : ''}
        `}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={openFileDialog}
      >
        <div className="flex flex-col items-center gap-4">
          {uploading ? (
            <div className="w-full max-w-xs">
              <div className="flex items-center gap-2 mb-2">
                <Upload className="h-5 w-5 animate-pulse" />
                <span>Yükleniyor...</span>
              </div>
              <Progress value={progress} className="w-full" />
              <div className="text-sm text-gray-500 mt-1">{progress}%</div>
            </div>
          ) : (
            <>
              <div className="p-3 bg-gray-100 rounded-full">
                <Image className="h-8 w-8 text-gray-400" />
              </div>
              <div>
                <p className="text-lg font-medium text-gray-700">
                  Görsel yüklemek için tıklayın veya sürükleyin
                </p>
                <p className="text-sm text-gray-500 mt-1">
                  PNG, JPG, WEBP, GIF (Maksimum 10MB)
                </p>
              </div>
              <Button type="button" variant="outline">
                Dosya Seç
              </Button>
            </>
          )}
        </div>
      </div>

      <input
        ref={fileInputRef}
        type="file"
        multiple={maxFiles > 1}
        accept={acceptedTypes.join(',')}
        onChange={(e) => handleFileSelect(e.target.files)}
        className="hidden"
      />
    </div>
  );
}
