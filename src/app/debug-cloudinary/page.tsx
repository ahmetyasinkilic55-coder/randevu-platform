'use client'

import { useState } from 'react';

export default function CloudinaryDebugPage() {
  const [uploading, setUploading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');

  const testUpload = async (file: File) => {
    setUploading(true);
    setError('');
    setResult(null);

    try {
      const formData = new FormData();
      formData.append('file', file);

      // Test basit API'yi kullan
      const response = await fetch('/api/test-cloudinary', {
        method: 'POST',
        body: formData,
      });

      const data = await response.json();
      
      if (response.ok) {
        setResult(data);
        console.log('Test upload success:', data);
      } else {
        setError(data.error || 'Test failed');
        console.error('Test upload error:', data);
      }
    } catch (err) {
      console.error('Test upload exception:', err);
      setError('Network error');
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="p-8 max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">Cloudinary Debug Test</h1>
      
      <div className="space-y-6">
        {/* File Upload Test */}
        <div className="border p-4 rounded">
          <h2 className="font-semibold mb-2">Test Upload</h2>
          <input
            type="file"
            accept="image/*"
            onChange={(e) => {
              if (e.target.files && e.target.files[0]) {
                testUpload(e.target.files[0]);
              }
            }}
            disabled={uploading}
            className="mb-4"
          />
          
          {uploading && (
            <div className="text-blue-600">Uploading...</div>
          )}
          
          {error && (
            <div className="text-red-600 bg-red-50 p-2 rounded">
              Error: {error}
            </div>
          )}
          
          {result && (
            <div className="text-green-600 bg-green-50 p-2 rounded">
              <pre>{JSON.stringify(result, null, 2)}</pre>
            </div>
          )}
        </div>
        
        {/* Environment Check */}
        <div className="border p-4 rounded">
          <h2 className="font-semibold mb-2">Environment Check</h2>
          <button
            onClick={async () => {
              const response = await fetch('/api/test-cloudinary');
              const data = await response.json();
              console.log('Environment check:', data);
              alert(JSON.stringify(data, null, 2));
            }}
            className="bg-blue-500 text-white px-4 py-2 rounded"
          >
            Check Environment
          </button>
        </div>
        
        {/* Main API Test */}
        <div className="border p-4 rounded">
          <h2 className="font-semibold mb-2">Test Main API</h2>
          <input
            type="file"
            accept="image/*"
            onChange={async (e) => {
              if (e.target.files && e.target.files[0]) {
                const file = e.target.files[0];
                const formData = new FormData();
                formData.append('file', file);
                formData.append('folder', 'test');
                
                try {
                  const response = await fetch('/api/cloudinary', {
                    method: 'POST',
                    body: formData,
                  });
                  
                  const data = await response.json();
                  console.log('Main API response:', data);
                  
                  if (response.ok) {
                    alert('Main API Success: ' + JSON.stringify(data, null, 2));
                  } else {
                    alert('Main API Error: ' + JSON.stringify(data, null, 2));
                  }
                } catch (err) {
                  console.error('Main API error:', err);
                  alert('Main API Exception: ' + err);
                }
              }
            }}
            className="mb-2"
          />
          <div className="text-sm text-gray-600">
            This will test the main /api/cloudinary endpoint
          </div>
        </div>
      </div>
    </div>
  );
}
