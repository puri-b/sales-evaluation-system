import { query, pool } from '../../lib/db';
import { validateDataEntryFields, DataEntryValidationError, DATA_ENTRY_TEXT } from '../../lib/dataEntryFields';

const getDisplayDocType = (item) => {
  if (!item) return '';
  if (item.doc_type === 'อื่นๆ') return item.custom_doc_type || 'อื่นๆ';
  return item.doc_type || '';
};

const buildScanningDocumentSummary = (scanningData) => {
  if (Array.isArray(scanningData?.document_sizes) && scanningData.document_sizes.length > 0) {
    const validItems = scanningData.document_sizes.filter((item) => getDisplayDocType(item) && item.doc_count);
    const totalCount = validItems.reduce((sum, item) => sum + (parseFloat(item.doc_count) || 0), 0);
    const docTypeSummary = validItems
      .map((item) => `${getDisplayDocType(item)}: ${item.doc_count}`)
      .join(', ');

    return {
      doc_count: totalCount > 0 ? totalCount : null,
      doc_type: docTypeSummary || null
    };
  }

  return {
    doc_count: parseFloat(scanningData?.doc_count) || null,
    doc_type: scanningData?.doc_type || null
  };
};

export default async function handler(req, res) {
  if (req.method === 'POST') {
    try {
      if (!req.body || typeof req.body !== 'object' || Array.isArray(req.body)) {
        return res.status(400).json({ success: false, message: DATA_ENTRY_TEXT.invalidValue });
      }
      const { 
        service_type, 
        evaluation_date, 
        salesperson_name, 
        customer_name,
        scanning_data,
        data_entry_data,
        images
      } = req.body;

      if (!['scanning', 'data_entry'].includes(service_type)) {
        return res.status(400).json({ success: false, message: DATA_ENTRY_TEXT.invalidValue });
      }
      const entryFields = service_type === 'data_entry' ? validateDataEntryFields(data_entry_data) : null;

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
          const scanningDocumentSummary = buildScanningDocumentSummary(scanning_data);

          await client.query(
            `INSERT INTO "X_SalesApp".scanning_details 
             (evaluation_id, doc_count, doc_type, scan_mode, resolution_dpi, deadline, 
              return_stapled, indexing_rules, qa_process, revision_period_days, 
              scan_location, is_pc_provided, is_desk_provided, electricity_payer,
              training_required, food_location, note)
             VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17)`,
            [
              evaluationId,
              scanningDocumentSummary.doc_count,
              scanningDocumentSummary.doc_type,
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
              scanning_data.electricity_payer || null,
              scanning_data.training_required || false,
              scanning_data.food_location || null,
              scanning_data.note || null
            ]
          );
        }

        if (service_type === 'data_entry' && data_entry_data) {
          await client.query(
            `INSERT INTO "X_SalesApp".data_entry_details 
             (evaluation_id, software_used, data_complexity, deadline, data_volume, 
              data_type, entry_language, source_format, qa_process, revision_process, 
              transport_responsibility, training_required, food_location, remarks)
             VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14)`,
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
              data_entry_data.transport_responsibility || null,
              data_entry_data.training_required || false,
              data_entry_data.food_location || null,
              entryFields.remarks
            ]
          );
        }

        // Field definitions, details, parent evaluation and images share ONE transaction.
        if (entryFields && entryFields.fields.length > 0) {
          await client.query(
            `INSERT INTO "X_SalesApp".data_entry_fields
             (evaluation_id, field_name, data_type, remarks, sort_order)
             SELECT $1, f.field_name, f.data_type, f.remarks, f.sort_order
             FROM jsonb_to_recordset($2::jsonb)
               AS f(field_name text, data_type text, remarks text, sort_order integer)`,
            [evaluationId, JSON.stringify(entryFields.fields)]
          );
        }

        if (images && images.length > 0) {
          for (const image of images) {
            const tempImageResult = await client.query(
              'SELECT filename, mime_type, file_data FROM "X_SalesApp".temp_images WHERE id = $1',
              [image.id]
            );

            if (tempImageResult.rows.length > 0) {
              const { filename, mime_type, file_data } = tempImageResult.rows[0];
              
              await client.query(
                `INSERT INTO "X_SalesApp".evaluation_images 
                 (evaluation_id, filename, mime_type, file_data) 
                 VALUES ($1, $2, $3, $4)`,
                [evaluationId, filename, mime_type, file_data]
              );

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
      if (error instanceof DataEntryValidationError) {
        return res.status(400).json({ success: false, message: error.message, errors: error.details });
      }
      console.error('Error saving evaluation:', error);
      const missingMigration = req.body?.service_type === 'data_entry'
        && ['42P01', '42703'].includes(error.code);
      res.status(missingMigration ? 503 : 500).json({
        success: false,
        message: missingMigration ? DATA_ENTRY_TEXT.migrationRequired : DATA_ENTRY_TEXT.saveFailed,
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