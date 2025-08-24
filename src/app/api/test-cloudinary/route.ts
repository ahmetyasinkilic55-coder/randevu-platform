import { NextRequest, NextResponse } from 'next/server';

export async function GET() {
  console.log('=== Environment Test ===');
  
  const envVars = {
    CLOUDINARY_CLOUD_NAME: process.env.CLOUDINARY_CLOUD_NAME || 'MISSING',
    CLOUDINARY_API_KEY: process.env.CLOUDINARY_API_KEY || 'MISSING',
    CLOUDINARY_API_SECRET: process.env.CLOUDINARY_API_SECRET ? 'SET' : 'MISSING',
    CLOUDINARY_URL: process.env.CLOUDINARY_URL ? 'SET' : 'MISSING'
  };
  
  console.log('Environment variables:', envVars);
  
  return NextResponse.json({
    message: 'Environment test',
    env: envVars
  });
}

export async function POST(request: NextRequest) {
  try {
    console.log('=== Simple Upload Test ===');
    
    // Environment check
    if (!process.env.CLOUDINARY_CLOUD_NAME || !process.env.CLOUDINARY_API_KEY || !process.env.CLOUDINARY_API_SECRET) {
      throw new Error('Cloudinary environment variables missing');
    }
    
    console.log('Environment variables OK');
    
    // Test Cloudinary import - dynamic import for better error handling
    console.log('Testing Cloudinary import...');
    const cloudinary = await import('cloudinary').then(mod => mod.v2);
    console.log('Cloudinary imported successfully');
    
    console.log('Configuring Cloudinary...');
    cloudinary.config({
      cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
      api_key: process.env.CLOUDINARY_API_KEY,
      api_secret: process.env.CLOUDINARY_API_SECRET,
      secure: true,
    });
    console.log('Cloudinary configured');
    
    console.log('Getting form data...');
    const formData = await request.formData();
    const file = formData.get('file') as File;
    
    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 });
    }
    
    console.log('File info:', {
      name: file.name,
      size: file.size,
      type: file.type
    });
    
    console.log('Converting file to base64...');
    const buffer = await file.arrayBuffer();
    const base64 = Buffer.from(buffer).toString('base64');
    const fileData = `data:${file.type};base64,${base64}`;
    console.log('File converted, base64 length:', base64.length);
    
    console.log('Uploading to Cloudinary...');
    const result = await cloudinary.uploader.upload(fileData, {
      folder: 'randevu-platform/test',
      quality: 'auto'
      // format: 'auto' kaldırıldı - sorun buydu!
    });
    
    console.log('Upload successful:', result.public_id);
    
    return NextResponse.json({
      success: true,
      public_id: result.public_id,
      secure_url: result.secure_url
    });
    
  } catch (error) {
    console.error('Upload test error:', error);
    console.error('Error stack:', error instanceof Error ? error.stack : 'No stack');
    return NextResponse.json({ 
      error: 'Test failed', 
      details: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : null
    }, { status: 500 });
  }
}
