// Server-side only Cloudinary utilities
// DO NOT import this in client components - will cause build errors

import { v2 as cloudinary } from 'cloudinary';

// Server-side Cloudinary operations
export async function uploadImageToCloudinary(
  file: File | string,
  options: {
    folder?: string;
    public_id?: string;
    tags?: string[];
    transformation?: any;
    quality?: string | number;
    format?: string;
  } = {}
) {
  try {
    let fileData: string;

    if (typeof file === 'string') {
      fileData = file;
    } else {
      // Convert File to base64
      const buffer = await file.arrayBuffer();
      const base64 = Buffer.from(buffer).toString('base64');
      fileData = `data:${file.type};base64,${base64}`;
    }

    const uploadOptions = {
      folder: options.folder || 'randevu-platform',
      public_id: options.public_id,
      tags: options.tags || [],
      quality: options.quality || 'auto',
      format: options.format || 'auto',
      ...options.transformation && { transformation: options.transformation }
    };

    const result = await cloudinary.uploader.upload(fileData, uploadOptions);
    
    return {
      success: true,
      data: {
        public_id: result.public_id,
        secure_url: result.secure_url,
        url: result.url,
        format: result.format,
        width: result.width,
        height: result.height,
        bytes: result.bytes,
        created_at: result.created_at,
      }
    };
  } catch (error) {
    console.error('Cloudinary upload error:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Upload failed'
    };
  }
}

export async function deleteImageFromCloudinary(publicId: string) {
  try {
    const result = await cloudinary.uploader.destroy(publicId);
    
    return {
      success: result.result === 'ok',
      result: result.result
    };
  } catch (error) {
    console.error('Cloudinary delete error:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Delete failed'
    };
  }
}

// Client-side URL generation (no Cloudinary SDK needed)
export function generateCloudinaryUrl(
  publicId: string,
  options: {
    width?: number;
    height?: number;
    quality?: string | number;
    format?: string;
    crop?: string;
    gravity?: string;
  } = {}
) {
  const baseUrl = 'https://res.cloudinary.com/ddapurgju/image/upload';
  const transforms = [];
  
  if (options.width && options.height) {
    transforms.push(`w_${options.width},h_${options.height}`);
  }
  if (options.crop) {
    transforms.push(`c_${options.crop}`);
  }
  if (options.gravity) {
    transforms.push(`g_${options.gravity}`);
  }
  if (options.quality) {
    transforms.push(`q_${options.quality}`);
  }
  if (options.format) {
    transforms.push(`f_${options.format}`);
  }
  
  // Always add auto optimization
  transforms.push('q_auto', 'f_auto');
  
  const transformString = transforms.length > 0 ? `/${transforms.join(',')}` : '';
  
  return `${baseUrl}${transformString}/${publicId}`;
}

export const imageTransformations = {
  avatar: {
    small: { width: 40, height: 40, crop: 'fill', gravity: 'face' },
    medium: { width: 80, height: 80, crop: 'fill', gravity: 'face' },
    large: { width: 150, height: 150, crop: 'fill', gravity: 'face' }
  },
  gallery: {
    thumbnail: { width: 200, height: 200, crop: 'fill' },
    preview: { width: 400, height: 300, crop: 'fill' },
    full: { width: 800, height: 600, crop: 'limit' }
  },
  logo: {
    small: { width: 60, height: 60, crop: 'fit' },
    medium: { width: 120, height: 120, crop: 'fit' },
    large: { width: 200, height: 200, crop: 'fit' }
  },
  service: {
    card: { width: 300, height: 200, crop: 'fill' },
    detail: { width: 600, height: 400, crop: 'fill' }
  }
};
