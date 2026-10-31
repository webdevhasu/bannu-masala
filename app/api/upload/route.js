import { NextResponse } from 'next/server';
import { v2 as cloudinary } from 'cloudinary';

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export async function POST(request) {
  try {
    const formData = await request.formData();
    const file = formData.get('file');

    if (!file) {
      return NextResponse.json({ error: "No files received." }, { status: 400 });
    }

    // Convert file to base64 for Cloudinary upload
    const originalBuffer = Buffer.from(await file.arrayBuffer());
    // Convert to WebP using Sharp (rotate handles EXIF orientation)
    const sharp = require('sharp');
    const webpBuffer = await sharp(originalBuffer).rotate().webp({ quality: 80 }).toBuffer();
    const buffer = webpBuffer;
    const base64 = buffer.toString('base64');
    // Use correct MIME type for WebP
    const dataURI = `data:image/webp;base64,${base64}`;

    // Upload to Cloudinary
    const result = await cloudinary.uploader.upload(dataURI, {
      folder: 'bannu-masala',
      transformation: [
        { width: 2000, height: 2000, crop: 'limit' }, // Max size
        { quality: 'auto' },                         // Auto compress
        { fetch_format: 'auto' }                     // Best format
      ]
    });

    return NextResponse.json({
      Message: "Success",
      status: 201,
      url: result.secure_url,
    });
  } catch (error) {
    console.error("Error uploading file:", error);
    return NextResponse.json({ Message: "Failed", status: 500, error: error.message });
  }
}
