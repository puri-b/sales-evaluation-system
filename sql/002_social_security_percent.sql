-- ============================================================================
-- Migration 002: เปลี่ยนประกันสังคมจาก "ค่าคงที่ต่อเดือน" เป็น "% ของค่าแรง + เพดานสูงสุด"
-- วิธีใช้: เปิดไฟล์นี้ใน DBeaver แล้ว Execute Script (Alt+X) กับฐานข้อมูลที่ใช้งานจริง
-- ปลอดภัยสำหรับรันซ้ำ (ใช้ ON CONFLICT / IF EXISTS)
-- ============================================================================

-- เพิ่ม setting ใหม่: อัตราประกันสังคม (% ของค่าแรง/คน/เดือน) และเพดานสูงสุด
INSERT INTO "X_SalesApp".cost_settings (setting_key, setting_value, label, unit_label, setting_group) VALUES
  ('social_security_rate',        5,   'ประกันสังคม',                    '% ของค่าแรง/คน/เดือน',   'ค่าแรง'),
  ('social_security_cap_monthly', 750, 'เพดานประกันสังคมสูงสุด',          'บาท/คน/เดือน',           'ค่าแรง')
ON CONFLICT (setting_key) DO NOTHING;

-- ลบ setting เก่าที่ไม่ใช้แล้ว (ค่าประกันสังคมแบบตายตัว)
DELETE FROM "X_SalesApp".cost_settings WHERE setting_key = 'social_security_monthly';
