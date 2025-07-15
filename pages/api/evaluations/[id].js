import { query } from '../../../lib/db';

export default async function handler(req, res) {
  const { id } = req.query;

  if (req.method === 'GET') {
    try {
      const evaluationResult = await query(
        'SELECT * FROM "X_SalesApp".evaluations WHERE id = $1',
        [id]
      );

      if (evaluationResult.rows.length === 0) {
        return res.status(404).json({ 
          success: false, 
          message: 'ไม่พบข้อมูลการประเมิน' 
        });
      }

      const evaluation = evaluationResult.rows[0];

      // ดึงรูปภาพจาก evaluation_images
      const imagesResult = await query(
        'SELECT id, filename, mime_type FROM "X_SalesApp".evaluation_images WHERE evaluation_id = $1',
        [id]
      );

      // สร้าง URL สำหรับแสดงรูป
      const images = imagesResult.rows.map(img => ({
        id: img.id,
        filename: img.filename,
        mime_type: img.mime_type,
        image_url: `/api/evaluation-image/${img.id}`
      }));

      let serviceDetails = null;
      if (evaluation.service_type === 'scanning') {
        const scanningResult = await query(
          'SELECT * FROM "X_SalesApp".scanning_details WHERE evaluation_id = $1',
          [id]
        );
        serviceDetails = scanningResult.rows[0] || null;
      } else if (evaluation.service_type === 'data_entry') {
        const dataEntryResult = await query(
          'SELECT * FROM "X_SalesApp".data_entry_details WHERE evaluation_id = $1',
          [id]
        );
        serviceDetails = dataEntryResult.rows[0] || null;
      }

      res.status(200).json({
        success: true,
        data: {
          ...evaluation,
          images: images,
          service_details: serviceDetails
        }
      });

    } catch (error) {
      console.error('Error fetching evaluation detail:', error);
      res.status(500).json({
        success: false,
        message: 'เกิดข้อผิดพลาดในการดึงข้อมูล: ' + error.message,
        error: error.message
      });
    }
  } else {
    res.setHeader('Allow', ['GET']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}