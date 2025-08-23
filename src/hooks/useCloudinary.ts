import { useState } from 'react';
import toast from 'react-hot-toast';

interface UploadResult {
  public_id: string;
  secure_url: string;
  url: string;
  format: string;
  width: number;
  height: number;
  bytes: number;
}

interface UseCloudinaryReturn {
  uploadImage: (file: File, options?: {
    folder?: string;
    tags?: string;
    onProgress?: (progress: number) => void;
  }) => Promise<UploadResult | null>;
  deleteImage: (publicId: string) => Promise<boolean>;
  uploading: boolean;
  deleting: boolean;
}

export function useCloudinary(): UseCloudinaryReturn {
  const [uploading, setUploading] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const uploadImage = async (
    file: File, 
    options: {
      folder?: string;
      tags?: string;
      onProgress?: (progress: number) => void;
    } = {}
  ): Promise<UploadResult | null> => {
    if (uploading) {
      toast.error('Bir yükleme işlemi devam ediyor');
      return null;
    }

    setUploading(true);
    
    try {
      const formData = new FormData();
      formData.append('file', file);
      
      if (options.folder) {
        formData.append('folder', options.folder);
      }
      
      if (options.tags) {
        formData.append('tags', options.tags);
      }

      // Progress simulation since we can't get real progress with FormData
      let progress = 0;
      const progressInterval = setInterval(() => {
        progress += 10;
        if (progress <= 90 && options.onProgress) {
          options.onProgress(progress);
        }
      }, 200);

      const response = await fetch('/api/cloudinary', {
        method: 'POST',
        body: formData,
      });

      clearInterval(progressInterval);

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Upload failed');
      }

      const result = await response.json();
      
      if (options.onProgress) {
        options.onProgress(100);
      }
      
      toast.success('Görsel başarıyla yüklendi');
      return result;
    } catch (error) {
      console.error('Upload error:', error);
      toast.error(error instanceof Error ? error.message : 'Görsel yüklenemedi');
      return null;
    } finally {
      setUploading(false);
      if (options.onProgress) {
        setTimeout(() => options.onProgress?.(0), 1000);
      }
    }
  };

  const deleteImage = async (publicId: string): Promise<boolean> => {
    if (deleting) {
      toast.error('Bir silme işlemi devam ediyor');
      return false;
    }

    setDeleting(true);
    
    try {
      const response = await fetch(`/api/cloudinary?publicId=${encodeURIComponent(publicId)}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Delete failed');
      }

      toast.success('Görsel başarıyla silindi');
      return true;
    } catch (error) {
      console.error('Delete error:', error);
      toast.error(error instanceof Error ? error.message : 'Görsel silinemedi');
      return false;
    } finally {
      setDeleting(false);
    }
  };

  return {
    uploadImage,
    deleteImage,
    uploading,
    deleting
  };
}
