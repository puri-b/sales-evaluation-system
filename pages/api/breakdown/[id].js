import { query } from '../../../lib/db';
import { settingsRowsToMap, calculateBreakdown, DEFAULT_SETTINGS } from '../../../lib/breakdownCalculator';

async function getSettingsMap() {
  const result = await query(
    `SELECT setting_key, setting_value FROM "X_SalesApp".cost_settings`
  );
  if (result.rows.length > 0) {
    return settingsRowsToMap(result.rows);
  }
  // fallback ถ้ายังไม่ได้รัน SQL migration
  const map = {};
  DEFAULT_SETTINGS.forEach((s) => { map[s.key] = s.value; });
  return map;
}

async function getEvaluationWithDetails(evaluationId) {
  const evalResult = await query(
    `SELECT * FROM "X_SalesApp".evaluations WHERE id = $1`,
    [evaluationId]
  );
  if (evalResult.rows.length === 0) return null;

  const evaluation = evalResult.rows[0];
  let serviceDetails = null;

  if (evaluation.service_type === 'scanning') {
    const r = await query(
      `SELECT * FROM "X_SalesApp".scanning_details WHERE evaluation_id = $1`,
      [evaluationId]
    );
    serviceDetails = r.rows[0] || {};
  } else if (evaluation.service_type === 'data_entry') {
    const r = await query(
      `SELECT * FROM "X_SalesApp".data_entry_details WHERE evaluation_id = $1`,
      [evaluationId]
    );
    serviceDetails = r.rows[0] || {};
  }

  return { evaluation, serviceDetails };
}

export default async function handler(req, res) {
  const { id } = req.query;
  const evaluationId = parseInt(id, 10);

  if (!evaluationId) {
    return res.status(400).json({ success: false, message: 'evaluation id ไม่ถูกต้อง' });
  }

  if (req.method === 'GET') {
    try {
      const result = await query(
        `SELECT * FROM "X_SalesApp".breakdown_results WHERE evaluation_id = $1`,
        [evaluationId]
      );

      if (result.rows.length === 0) {
        return res.status(200).json({ success: true, data: null });
      }

      res.status(200).json({ success: true, data: result.rows[0] });
    } catch (error) {
      console.error('Error fetching breakdown:', error);
      res.status(500).json({
        success: false,
        message: 'เกิดข้อผิดพลาดในการดึงข้อมูล Breakdown: ' + error.message,
      });
    }
  } else if (req.method === 'POST') {
    try {
      const overrides = req.body?.overrides || {};

      const data = await getEvaluationWithDetails(evaluationId);
      if (!data) {
        return res.status(404).json({ success: false, message: 'ไม่พบข้อมูลการประเมิน' });
      }
      const { evaluation, serviceDetails } = data;

      if (evaluation.service_type !== 'scanning' && evaluation.service_type !== 'data_entry') {
        return res.status(400).json({ success: false, message: 'ประเภทบริการนี้ยังไม่รองรับการคำนวณ Breakdown' });
      }

      const settingsMap = await getSettingsMap();

      const breakdown = calculateBreakdown({
        serviceType: evaluation.service_type,
        serviceDetails,
        settingsMap,
        overrides,
      });

      const upsertResult = await query(
        `INSERT INTO "X_SalesApp".breakdown_results
           (evaluation_id, breakdown_data, overrides, workers, contract_months, total_cost, selling_price, selling_price_vat, updated_at)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, NOW())
         ON CONFLICT (evaluation_id)
         DO UPDATE SET
           breakdown_data = EXCLUDED.breakdown_data,
           overrides = EXCLUDED.overrides,
           workers = EXCLUDED.workers,
           contract_months = EXCLUDED.contract_months,
           total_cost = EXCLUDED.total_cost,
           selling_price = EXCLUDED.selling_price,
           selling_price_vat = EXCLUDED.selling_price_vat,
           updated_at = NOW()
         RETURNING *`,
        [
          evaluationId,
          JSON.stringify(breakdown),
          JSON.stringify(overrides),
          breakdown.staffing.workers,
          breakdown.staffing.months,
          breakdown.summary.totalCost,
          breakdown.summary.sellingPrice,
          breakdown.summary.priceWithVat,
        ]
      );

      res.status(200).json({ success: true, data: upsertResult.rows[0] });
    } catch (error) {
      console.error('Error calculating breakdown:', error);
      res.status(500).json({
        success: false,
        message: 'เกิดข้อผิดพลาดในการคำนวณ Breakdown: ' + error.message,
      });
    }
  } else {
    res.setHeader('Allow', ['GET', 'POST']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
