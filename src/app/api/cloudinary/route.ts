import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

export async function POST(request: NextRequest) {
  console.log('=== Cloudinary Upload Debug ===');
  
  try {
    // Environment check
    console.log('Environment check:');
    console.log('- CLOUD_NAME:', process.env.CLOUDINARY_CLOUD_NAME || 'MISSING');
    console.log('- API_KEY:', process.env.CLOUDINARY_API_KEY || 'MISSING');
    console.log('- API_SECRET:', process.env.CLOUDINARY_API_SECRET ? 'SET' : 'MISSING');
    
    if (!process.env.CLOUDINARY_CLOUD_NAME || !process.env.CLOUDINARY_API_KEY || !process.env.CLOUDINARY_API_SECRET) {
      throw new Error('Cloudinary environment variables missing');
    }

    console.log('Checking session...');
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      console.log('No session found');
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    console.log('Session OK, user:', session.user.id);

    console.log('Getting form data...');
    const formData = await request.formData();
    const file = formData.get('file') as File;
    const folder = formData.get('folder') as string || 'general';
    const tags = formData.get('tags') as string;
    
    console.log('- File received:', !!file, file?.name, file?.size);
    console.log('- Folder:', folder);
    console.log('- Tags:', tags);
    
    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 });
    }

    // Validate file type
    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json({ error: 'Invalid file type' }, { status: 400 });
    }

    // Validate file size (max 10MB)
    if (file.size > 10 * 1024 * 1024) {
      return NextResponse.json({ error: 'File too large (max 10MB)' }, { status: 400 });
    }

    console.log('Importing Cloudinary...');
    const cloudinary = await import('cloudinary').then(mod => mod.v2);
    
    console.log('Configuring Cloudinary...');
    cloudinary.config({
      cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
      api_key: process.env.CLOUDINARY_API_KEY,
      api_secret: process.env.CLOUDINARY_API_SECRET,
      secure: true,
    });
    
    console.log('Converting file...');
    const buffer = await file.arrayBuffer();
    const base64 = Buffer.from(buffer).toString('base64');
    const fileData = `data:${file.type};base64,${base64}`;
    
    console.log('Calling cloudinary.uploader.upload...');
    const uploadOptions = {
      folder: `randevu-platform/${folder}`,
      tags: tags ? tags.split(',') : [`user_${session.user.id}`],
      quality: 'auto' as const
      // format: 'auto' kaldırıldı - Cloudinary hatası nedeniyle
    };
    
    console.log('Upload options:', uploadOptions);
    const result = await cloudinary.uploader.upload(fileData, uploadOptions);
    
    console.log('Upload result success:', result.public_id);

    const responseData = {
      public_id: result.public_id,
      secure_url: result.secure_url,
      url: result.url,
      format: result.format,
      width: result.width,
      height: result.height,
      bytes: result.bytes,
      created_at: result.created_at,
    };
    
    return NextResponse.json(responseData);
    
  } catch (error) {
    console.error('Upload error:', error);
    console.error('Error stack:', error instanceof Error ? error.stack : 'No stack');
    return NextResponse.json({ 
      error: 'Upload failed',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const publicId = searchParams.get('publicId');
    
    if (!publicId) {
      return NextResponse.json({ error: 'Public ID required' }, { status: 400 });
    }

    console.log('Deleting image:', publicId);
    const cloudinary = await import('cloudinary').then(mod => mod.v2);
    
    cloudinary.config({
      cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
      api_key: process.env.CLOUDINARY_API_KEY,
      api_secret: process.env.CLOUDINARY_API_SECRET,
      secure: true,
    });
    
    const result = await cloudinary.uploader.destroy(publicId);
    
    if (result.result === 'ok') {
      return NextResponse.json({ success: true });
    } else {
      return NextResponse.json({ error: 'Delete failed' }, { status: 500 });
    }
  } catch (error) {
    console.error('Delete error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
