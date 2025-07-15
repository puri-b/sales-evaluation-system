import formidable from 'formidable';
import fs from 'fs';
import path from 'path';

export const config = {
  api: {
    bodyParser: false,
  },
};

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    // สร้างโฟลเดอร์ uploads หากยังไม่มี
    const uploadDir = path.join(process.cwd(), 'public', 'uploads');
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }

    const form = formidable({
      uploadDir,
      keepExtensions: true,
      maxFileSize: 5 * 1024 * 1024, // 5MB
      multiples: true,
    });

    const [fields, files] = await form.parse(req);
    
    const uploadedFiles = [];
    const fileArray = Array.isArray(files.files) ? files.files : [files.files];

    for (const file of fileArray) {
      if (file) {
        const timestamp = Date.now();
        const originalName = file.originalFilename || 'unknown';
        const extension = path.extname(originalName);
        const newFileName = `${timestamp}_${Math.random().toString(36).substring(2)}${extension}`;
        const newPath = path.join(uploadDir, newFileName);

        // ย้ายไฟล์ไปยังชื่อใหม่
        fs.renameSync(file.filepath, newPath);

        uploadedFiles.push({
          name: originalName,
          filename: newFileName,
          path: `/uploads/${newFileName}`,
          size: file.size,
        });
      }
    }

    res.status(200).json({ 
      success: true, 
      files: uploadedFiles 
    });

  } catch (error) {
    console.error('Upload error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'เกิดข้อผิดพลาดในการอัพโหลด',
      error: error.message 
    });
  }
}