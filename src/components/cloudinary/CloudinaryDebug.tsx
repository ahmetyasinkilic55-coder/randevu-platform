'use client'

import React from 'react';
import CloudinaryImage from './CloudinaryImage';

interface CloudinaryDebugProps {
  publicId?: string;
  src?: string;
}

export default function CloudinaryDebug({ publicId, src }: CloudinaryDebugProps) {
  console.log('CloudinaryDebug props:', { publicId, src });

  return (
    <div className="bg-yellow-100 border border-yellow-300 rounded-lg p-4 m-4">
      <h3 className="font-bold text-yellow-800 mb-2">Cloudinary Debug</h3>
      <div className="text-sm text-yellow-700 mb-2">
        <p><strong>PublicId:</strong> {publicId || 'not provided'}</p>
        <p><strong>Src:</strong> {src || 'not provided'}</p>
      </div>
      
      <div className="bg-white border border-yellow-200 rounded p-2">
        <p className="text-xs text-gray-600 mb-2">CloudinaryImage render:</p>
        <div className="w-32 h-32 border border-gray-300 rounded">
          <CloudinaryImage
            publicId={publicId}
            src={src}
            alt="Debug test"
            className="w-full h-full object-cover rounded"
          />
        </div>
      </div>
    </div>
  );
}
