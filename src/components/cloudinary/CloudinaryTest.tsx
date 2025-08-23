'use client'

import React, { useState } from 'react';
import { CloudinaryUpload, CloudinaryImage } from '@/components/cloudinary';

interface UploadedImage {
  public_id: string;
  secure_url: string;
  width: number;
  height: number;
  format: string;
  bytes: number;
}

export default function CloudinaryTestPage() {
  const [uploadedImages, setUploadedImages] = useState<UploadedImage[]>([]);

  const handleImageUpload = (result: UploadedImage) => {
    console.log('Upload result:', result);
    setUploadedImages(prev => [...prev, result]);
  };

  const handleImageDelete = (publicId: string) => {
    setUploadedImages(prev => prev.filter(img => img.public_id !== publicId));
  };

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1048576) return Math.round(bytes / 1024) + ' KB';
    return Math.round(bytes / 1048576) + ' MB';
  };

  return (
    <div className="container mx-auto p-6 max-w-4xl">
      <h1 className="text-3xl font-bold mb-8 text-center">
        Cloudinary Test Sayfası
      </h1>

      <div className="bg-white rounded-lg shadow-md p-6 mb-8">
        <h2 className="text-xl font-semibold mb-4">Görsel Yükleme</h2>
        <CloudinaryUpload
          onUpload={handleImageUpload}
          folder="test"
          tags="test,demo"
          maxFiles={5}
        />
      </div>

      {uploadedImages.length > 0 && (
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold mb-4">
            Yüklenen Görseller ({uploadedImages.length})
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {uploadedImages.map((image) => (
              <div key={image.public_id} className="border border-gray-200 rounded-lg p-4">
                <CloudinaryImage
                  publicId={image.public_id}
                  alt="Yüklenen görsel"
                  className="w-full h-48 rounded-md"
                  showDeleteButton={true}
                  onDelete={() => handleImageDelete(image.public_id)}
                  transformation={{
                    width: 300,
                    height: 200,
                    crop: 'fill'
                  }}
                />
                
                <div className="mt-3 text-sm text-gray-600">
                  <p><strong>ID:</strong> {image.public_id}</p>
                  <p><strong>Boyut:</strong> {image.width} x {image.height}</p>
                  <p><strong>Format:</strong> {image.format.toUpperCase()}</p>
                  <p><strong>Dosya Boyutu:</strong> {formatFileSize(image.bytes)}</p>
                </div>
                
                <div className="mt-3">
                  <a 
                    href={image.secure_url} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:text-blue-800 text-sm underline"
                  >
                    Orijinali Görüntüle
                  </a>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="mt-8 bg-gray-50 rounded-lg p-6">
        <h3 className="text-lg font-semibold mb-3">Kullanım Bilgileri</h3>
        <ul className="text-sm text-gray-700 space-y-2">
          <li>• Desteklenen formatlar: JPG, PNG, WEBP, GIF</li>
          <li>• Maksimum dosya boyutu: 10MB</li>
          <li>• Görseller otomatik olarak optimize edilir</li>
          <li>• Responsive boyutlandırma desteklenir</li>
          <li>• Güvenli HTTPS URL'ler sağlanır</li>
        </ul>
      </div>
    </div>
  );
}
