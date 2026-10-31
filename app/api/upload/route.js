import { NextResponse } from 'next/server';
import { v2 as cloudinary } from 'cloudinary';

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key:    process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export async function POST(request) {
  try {
    const formData = await request.formData();
    const file = formData.get('file');

    if (!file) {
      return NextResponse.json({ error: 'No files received.' }, { status: 400 });
    }

    // Convert file to base64 data URI
    const buffer  = Buffer.from(await file.arrayBuffer());
    const base64  = buffer.toString('base64');
    const dataURI = `data:${file.type};base64,${base64}`;

    // Upload to Cloudinary — let Cloudinary handle WebP conversion
    // format: 'webp'  → forces output to WebP (no Sharp needed, works on all runtimes)
    // quality: 'auto' → smart compression
    // crop: 'limit'   → never upscale, only shrink if larger than 2000px
    const result = await cloudinary.uploader.upload(dataURI, {
      folder: 'bannu-masala',
      format: 'webp',          // ✅ Convert to WebP on Cloudinary's side
      transformation: [
        { width: 2000, height: 2000, crop: 'limit' },
        { quality: 'auto:good' },
      ],
    });

    return NextResponse.json({
      Message: 'Success',
      status: 201,
      url: result.secure_url,   // URL already ends with .webp
    });
  } catch (error) {
    console.error('Error uploading file:', error);
    return NextResponse.json({ Message: 'Failed', status: 500, error: error.message });
  }
}
