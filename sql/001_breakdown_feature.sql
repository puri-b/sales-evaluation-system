-- ============================================================================
-- Migration: Breakdown Cost Feature
-- วิธีใช้: เปิดไฟล์นี้ใน DBeaver แล้ว Execute Script (Alt+X) กับฐานข้อมูลที่ใช้งานจริง
-- ปลอดภัยสำหรับรันซ้ำ (ใช้ IF NOT EXISTS / ON CONFLICT)
-- ============================================================================

-- ตารางเก็บ "อัตราต้นทุน" ที่ใช้คำนวณ Breakdown (แก้ไขได้ผ่านหน้าตั้งค่าในเว็บ)
CREATE TABLE IF NOT EXISTS "X_SalesApp".cost_settings (
  id SERIAL PRIMARY KEY,
  setting_key VARCHAR(100) UNIQUE NOT NULL,
  setting_value NUMERIC NOT NULL,
  label TEXT,
  unit_label TEXT,
  setting_group VARCHAR(50),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- ตารางเก็บผลการคำนวณ Breakdown ล่าสุดของแต่ละ evaluation
CREATE TABLE IF NOT EXISTS "X_SalesApp".breakdown_results (
  id SERIAL PRIMARY KEY,
  evaluation_id INTEGER NOT NULL REFERENCES "X_SalesApp".evaluations(id) ON DELETE CASCADE,
  breakdown_data JSONB NOT NULL,
  overrides JSONB,
  workers INTEGER,
  contract_months INTEGER,
  total_cost NUMERIC,
  selling_price NUMERIC,
  selling_price_vat NUMERIC,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  UNIQUE (evaluation_id)
);

-- ค่าเริ่มต้น (Default) ของอัตราต้นทุน — ถอดแบบจาก Breakdown Cost - DS/SN (BD.pdf)
-- ค่า rate ทั้งหมดเก็บเป็น "หน่วยเปอร์เซ็นต์เต็ม" เช่น 25 หมายถึง 25%
INSERT INTO "X_SalesApp".cost_settings (setting_key, setting_value, label, unit_label, setting_group) VALUES
  ('working_days_per_month',            20,    'จำนวนวันทำงานต่อเดือน',                        'วัน/เดือน',              'ทั่วไป'),
  ('gp_rate_default',                   25,    'อัตรากำไรเป้าหมาย (GP) เริ่มต้น',                '% ของราคาขาย',          'ทั่วไป'),
  ('risk_rate',                         2,     'ค่าความเสี่ยง (Risk)',                          '% ของราคาขาย',          'ทั่วไป'),
  ('vat_rate',                          7,     'อัตราภาษีมูลค่าเพิ่ม (VAT)',                     '% ของราคาขาย',          'ทั่วไป'),

  ('labor_daily_rate',                  500,   'ค่าแรงพนักงาน',                                 'บาท/คน/วัน',            'ค่าแรง'),
  ('transport_monthly',                 1000,  'ค่าเดินทาง',                                     'บาท/คน/เดือน',          'ค่าแรง'),
  ('social_security_monthly',           650,   'ประกันสังคม',                                    'บาท/คน/เดือน',          'ค่าแรง'),
  ('provident_fund_rate',               1.25,  'กองทุนสำรองเลี้ยงชีพ',                          '% ของค่าแรงรวม',        'ค่าแรง'),
  ('compensation_fund_rate',            0.5,   'กองทุนทดแทน',                                   '% ของค่าแรงรวม',        'ค่าแรง'),

  ('uniform_cost_per_person',           100,   'เครื่องแบบ / บัตรพนักงาน',                       'บาท/คน (ครั้งเดียว)',   'เครื่องแบบ'),

  ('pc_monthly_rate',                   3000,  'คอมพิวเตอร์ + จอมอนิเตอร์',                      'บาท/ชุด/เดือน',         'Hardware'),
  ('scanner_monthly_rate',              3500,  'เครื่องสแกนเอกสาร (เฉพาะงานสแกน)',               'บาท/เครื่อง/เดือน',     'Hardware'),
  ('hdd_cost_per_unit',                 2000,  'External HDD',                                  'บาท/ชุด (ครั้งเดียว)',  'Hardware'),
  ('workers_per_hdd',                   2,     'จำนวนพนักงานต่อ HDD 1 ชุด',                      'คน/ชุด',                'Hardware'),

  ('office_supplies_flat',              2500,  'วัสดุอุปกรณ์สำนักงาน',                           'บาท/สัญญา (ครั้งเดียว)', 'ค่าใช้จ่ายอื่นๆ'),
  ('prep_cost_flat',                    4100,  'ค่าเตรียมงาน',                                   'บาท/สัญญา (ครั้งเดียว)', 'ค่าใช้จ่ายอื่นๆ'),
  ('travel_operation_flat',             2000,  'ค่าเดินทาง - Operation',                         'บาท/สัญญา (ครั้งเดียว)', 'ค่าใช้จ่ายอื่นๆ'),
  ('electricity_monthly_per_worker',    0,     'ค่าไฟฟ้า (กรณีบริษัทเป็นผู้จ่าย)',               'บาท/คน/เดือน',          'ค่าใช้จ่ายอื่นๆ'),

  ('scan_capacity_per_person_per_day',  1500,  'กำลังสแกนเอกสาร',                                'แผ่น/คน/วัน',           'Capacity'),
  ('data_entry_capacity_per_person_per_day', 500, 'กำลังบันทึกข้อมูล',                           'รายการ/คน/วัน',         'Capacity')
ON CONFLICT (setting_key) DO NOTHING;
