import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Trash2 } from 'lucide-react';

interface CloudinaryImageProps {
  publicId: string;
  alt?: string;
  width?: number;
  height?: number;
  className?: string;
  onDelete?: () => void;
  showDeleteButton?: boolean;
  transformation?: {
    width?: number;
    height?: number;
    quality?: string | number;
    format?: string;
    crop?: string;
    gravity?: string;
  };
}

export default function CloudinaryImage({
  publicId,
  alt = '',
  width,
  height,
  className = '',
  onDelete,
  showDeleteButton = false,
  transformation
}: CloudinaryImageProps) {
  const [imageError, setImageError] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const handleDelete = async () => {
    if (deleting) return;
    
    if (confirm('Bu görseli silmek istediğinizden emin misiniz?')) {
      setDeleting(true);
      try {
        const response = await fetch(`/api/cloudinary?publicId=${encodeURIComponent(publicId)}`, {
          method: 'DELETE'
        });
        
        if (response.ok) {
          if (onDelete) onDelete();
        } else {
          alert('Silme işlemi başarısız');
        }
      } catch (error) {
        console.error('Delete error:', error);
        alert('Silme işlemi başarısız');
      } finally {
        setDeleting(false);
      }
    }
  };

  // Generate Cloudinary URL manually
  const generateImageUrl = () => {
    const baseUrl = 'https://res.cloudinary.com/ddapurgju/image/upload';
    const transforms = [];
    
    if (transformation) {
      if (transformation.width && transformation.height) {
        transforms.push(`w_${transformation.width},h_${transformation.height}`);
      }
      if (transformation.crop) {
        transforms.push(`c_${transformation.crop}`);
      }
      if (transformation.gravity) {
        transforms.push(`g_${transformation.gravity}`);
      }
      if (transformation.quality) {
        transforms.push(`q_${transformation.quality}`);
      }
      if (transformation.format) {
        transforms.push(`f_${transformation.format}`);
      }
    } else if (width && height) {
      transforms.push(`w_${width},h_${height},c_fill`);
    }
    
    transforms.push('q_auto', 'f_auto');
    
    const transformString = transforms.length > 0 ? `/${transforms.join(',')}` : '';
    
    // Handle publicId that might already be a full URL
    if (publicId.startsWith('http')) {
      return publicId;
    }
    
    return `${baseUrl}${transformString}/${publicId}`;
  };

  if (imageError) {
    return (
      <div className={`flex items-center justify-center bg-gray-100 text-gray-400 ${className}`}>
        <span>Görsel yüklenemedi</span>
      </div>
    );
  }

  const imageUrl = generateImageUrl();

  return (
    <div className="relative group">
      <img
        src={imageUrl}
        alt={alt}
        className={`object-cover ${className}`}
        onError={() => setImageError(true)}
        loading="lazy"
      />
      
      {showDeleteButton && (
        <Button
          variant="destructive"
          size="sm"
          className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200 p-1"
          onClick={handleDelete}
          disabled={deleting}
        >
          {deleting ? (
            <div className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full" />
          ) : (
            <Trash2 className="h-4 w-4" />
          )}
        </Button>
      )}
    </div>
  );
}
