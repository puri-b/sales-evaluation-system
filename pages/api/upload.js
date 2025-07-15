import formidable from 'formidable';
import fs from 'fs';
import { query } from '../../lib/db';

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
    const form = formidable({
      maxFileSize: 5 * 1024 * 1024, // 5MB
      multiples: true,
    });

    const [fields, files] = await form.parse(req);
    
    const uploadedFiles = [];
    const fileArray = Array.isArray(files.files) ? files.files : [files.files];

    for (const file of fileArray) {
      if (file) {
        // อ่านไฟล์เป็น binary
        const fileBuffer = fs.readFileSync(file.filepath);
        const base64Data = fileBuffer.toString('base64');
        
        // บันทึกลงฐานข้อมูล
        const result = await query(
          `INSERT INTO "X_SalesApp".temp_images (filename, mime_type, file_data, created_at) 
           VALUES ($1, $2, $3, NOW()) 
           RETURNING id`,
          [file.originalFilename, file.mimetype, base64Data]
        );

        uploadedFiles.push({
          id: result.rows[0].id,
          name: file.originalFilename,
          mimetype: file.mimetype,
          size: file.size,
        });

        // ลบไฟล์ temp
        fs.unlinkSync(file.filepath);
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
      message: 'เกิดข้อผิดพลาดในการอัพโหลด: ' + error.message 
    });
  }
}