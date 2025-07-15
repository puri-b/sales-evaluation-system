import { query, pool } from '../../lib/db';

export default async function handler(req, res) {
  if (req.method === 'POST') {
    try {
      const { 
        service_type, 
        evaluation_date, 
        salesperson_name, 
        customer_name,
        scanning_data,
        data_entry_data,
        images
      } = req.body;

      const client = await pool.connect();
      
      try {
        await client.query('BEGIN');

        const evaluationResult = await client.query(
          `INSERT INTO "X_SalesApp".evaluations 
           (service_type, evaluation_date, salesperson_name, customer_name, created_at) 
           VALUES ($1, $2, $3, $4, NOW()) 
           RETURNING id`,
          [service_type, evaluation_date, salesperson_name, customer_name]
        );

        const evaluationId = evaluationResult.rows[0].id;

        if (service_type === 'scanning' && scanning_data) {
          await client.query(
            `INSERT INTO "X_SalesApp".scanning_details 
             (evaluation_id, doc_count, doc_type, scan_mode, resolution_dpi, deadline, 
              return_stapled, indexing_rules, qa_process, revision_period_days, 
              scan_location, is_pc_provided, is_desk_provided, electricity_payer)
             VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14)`,
            [
              evaluationId,
              parseFloat(scanning_data.doc_count) || null,
              scanning_data.doc_type || null,
              scanning_data.scan_mode || null,
              parseFloat(scanning_data.resolution_dpi) || null,
              parseFloat(scanning_data.deadline) || null,
              scanning_data.return_stapled || false,
              scanning_data.indexing_rules || null,
              scanning_data.qa_process || null,
              parseFloat(scanning_data.revision_period_days) || null,
              scanning_data.scan_location || null,
              scanning_data.is_pc_provided || false,
              scanning_data.is_desk_provided || false,
              scanning_data.electricity_payer || null
            ]
          );
        }

        if (service_type === 'data_entry' && data_entry_data) {
          await client.query(
            `INSERT INTO "X_SalesApp".data_entry_details 
             (evaluation_id, software_used, data_complexity, deadline, data_volume, 
              data_type, entry_language, source_format, qa_process, revision_process, 
              transport_responsibility)
             VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)`,
            [
              evaluationId,
              data_entry_data.software_used || null,
              data_entry_data.data_complexity || null,
              parseFloat(data_entry_data.deadline) || null,
              parseFloat(data_entry_data.data_volume) || null,
              data_entry_data.data_type || null,
              data_entry_data.entry_language || null,
              data_entry_data.source_format || null,
              data_entry_data.qa_process || null,
              data_entry_data.revision_process || null,
              data_entry_data.transport_responsibility || null
            ]
          );
        }

        // ย้ายรูปภาพจาก temp_images ไปยัง evaluation_images
        if (images && images.length > 0) {
          for (const image of images) {
            // ดึงข้อมูลรูปจาก temp_images
            const tempImageResult = await client.query(
              'SELECT filename, mime_type, file_data FROM "X_SalesApp".temp_images WHERE id = $1',
              [image.id]
            );

            if (tempImageResult.rows.length > 0) {
              const { filename, mime_type, file_data } = tempImageResult.rows[0];
              
              // บันทึกลง evaluation_images
              await client.query(
                `INSERT INTO "X_SalesApp".evaluation_images 
                 (evaluation_id, filename, mime_type, file_data, created_at) 
                 VALUES ($1, $2, $3, $4, NOW())`,
                [evaluationId, filename, mime_type, file_data]
              );

              // ลบจาก temp_images
              await client.query(
                'DELETE FROM "X_SalesApp".temp_images WHERE id = $1',
                [image.id]
              );
            }
          }
        }

        await client.query('COMMIT');
        
        res.status(200).json({ 
          success: true, 
          message: 'บันทึกข้อมูลสำเร็จ',
          evaluation_id: evaluationId
        });

      } catch (error) {
        await client.query('ROLLBACK');
        console.error('Transaction error:', error);
        throw error;
      } finally {
        client.release();
      }

    } catch (error) {
      console.error('Error saving evaluation:', error);
      res.status(500).json({ 
        success: false, 
        message: 'เกิดข้อผิดพลาดในการบันทึกข้อมูล: ' + error.message,
        error: error.message 
      });
    }
  } else if (req.method === 'GET') {
    try {
      const result = await query(`
        SELECT 
          e.id,
          e.service_type,
          e.evaluation_date,
          e.salesperson_name,
          e.customer_name,
          e.created_at,
          COUNT(ei.id) as image_count
        FROM "X_SalesApp".evaluations e
        LEFT JOIN "X_SalesApp".evaluation_images ei ON e.id = ei.evaluation_id
        GROUP BY e.id, e.service_type, e.evaluation_date, e.salesperson_name, e.customer_name, e.created_at
        ORDER BY e.created_at DESC
      `);
      
      res.status(200).json({ 
        success: true, 
        data: result.rows 
      });
    } catch (error) {
      console.error('Error fetching evaluations:', error);
      res.status(500).json({ 
        success: false, 
        message: 'เกิดข้อผิดพลาดในการดึงข้อมูล: ' + error.message,
        error: error.message 
      });
    }
  } else {
    res.setHeader('Allow', ['POST', 'GET']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}