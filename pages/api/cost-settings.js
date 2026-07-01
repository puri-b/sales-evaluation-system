import { query } from '../../lib/db';
import { DEFAULT_SETTINGS } from '../../lib/breakdownCalculator';

export default async function handler(req, res) {
  if (req.method === 'GET') {
    try {
      const result = await query(
        `SELECT setting_key, setting_value, label, unit_label, setting_group
         FROM "X_SalesApp".cost_settings
         ORDER BY setting_group, id`
      );

      // ถ้ายังไม่มีข้อมูลในฐานข้อมูล (ยังไม่ได้รัน SQL migration) ให้ส่งค่า Default กลับไปก่อน
      const rows = result.rows.length > 0
        ? result.rows
        : DEFAULT_SETTINGS.map((s) => ({
            setting_key: s.key,
            setting_value: s.value,
            label: s.label,
            unit_label: s.unit,
            setting_group: s.group,
          }));

      res.status(200).json({ success: true, data: rows, seeded: result.rows.length > 0 });
    } catch (error) {
      console.error('Error fetching cost settings:', error);
      res.status(500).json({
        success: false,
        message: 'เกิดข้อผิดพลาดในการดึงข้อมูลการตั้งค่า: ' + error.message,
      });
    }
  } else if (req.method === 'PUT') {
    try {
      const { settings } = req.body; // { setting_key: value, ... }

      if (!settings || typeof settings !== 'object') {
        return res.status(400).json({ success: false, message: 'รูปแบบข้อมูลไม่ถูกต้อง' });
      }

      const keys = Object.keys(settings);
      for (const key of keys) {
        const value = parseFloat(settings[key]);
        if (Number.isNaN(value)) continue;

        await query(
          `INSERT INTO "X_SalesApp".cost_settings (setting_key, setting_value, updated_at)
           VALUES ($1, $2, NOW())
           ON CONFLICT (setting_key)
           DO UPDATE SET setting_value = EXCLUDED.setting_value, updated_at = NOW()`,
          [key, value]
        );
      }

      res.status(200).json({ success: true, message: 'บันทึกการตั้งค่าสำเร็จ' });
    } catch (error) {
      console.error('Error updating cost settings:', error);
      res.status(500).json({
        success: false,
        message: 'เกิดข้อผิดพลาดในการบันทึกการตั้งค่า: ' + error.message,
      });
    }
  } else {
    res.setHeader('Allow', ['GET', 'PUT']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
