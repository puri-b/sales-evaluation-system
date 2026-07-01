/**
 * lib/breakdownCalculator.js
 *
 * แกนกลางของการคำนวณ Breakdown Cost เบื้องต้น
 * Logic นี้ถอดแบบมาจากไฟล์ตัวอย่าง "Breakdown Cost - DS/SN" (BD.pdf)
 * ของบริษัท สยามราชธานี จำกัด (มหาชน) และปรับปรุงจากแนวคิดของ
 * My-Scan-Cost-App (สูตร: ราคาขาย = ต้นทุน / (1 - Risk% - GP%))
 *
 * ทุกอัตรา (rate) ถูกดึงมาจากตาราง cost_settings ในฐานข้อมูล
 * ผู้ใช้งานสามารถแก้ไขอัตราเหล่านี้ได้เองผ่านหน้า "ตั้งค่าต้นทุน"
 * โดยไม่ต้องแก้โค้ด
 */

// ---------------------------------------------------------------------------
// รายการ Setting เริ่มต้น (Default) — ใช้ตอน seed ฐานข้อมูลครั้งแรก
// ---------------------------------------------------------------------------
const DEFAULT_SETTINGS = [
  // ทั่วไป
  { key: 'working_days_per_month', label: 'จำนวนวันทำงานต่อเดือน', group: 'ทั่วไป', unit: 'วัน/เดือน', value: 20 },
  { key: 'gp_rate_default', label: 'อัตรากำไรเป้าหมาย (GP) เริ่มต้น', group: 'ทั่วไป', unit: '% ของราคาขาย', value: 25 },
  { key: 'risk_rate', label: 'ค่าความเสี่ยง (Risk)', group: 'ทั่วไป', unit: '% ของราคาขาย', value: 2 },
  { key: 'vat_rate', label: 'อัตราภาษีมูลค่าเพิ่ม (VAT)', group: 'ทั่วไป', unit: '% ของราคาขาย', value: 7 },

  // ค่าแรง / สวัสดิการ
  { key: 'labor_daily_rate', label: 'ค่าแรงพนักงาน', group: 'ค่าแรง', unit: 'บาท/คน/วัน', value: 500 },
  { key: 'transport_monthly', label: 'ค่าเดินทาง', group: 'ค่าแรง', unit: 'บาท/คน/เดือน', value: 1000 },
  { key: 'social_security_rate', label: 'ประกันสังคม', group: 'ค่าแรง', unit: '% ของค่าแรง/คน/เดือน', value: 5 },
  { key: 'social_security_cap_monthly', label: 'เพดานประกันสังคมสูงสุด', group: 'ค่าแรง', unit: 'บาท/คน/เดือน', value: 750 },
  { key: 'provident_fund_rate', label: 'กองทุนสำรองเลี้ยงชีพ', group: 'ค่าแรง', unit: '% ของค่าแรงรวม', value: 1.25 },
  { key: 'compensation_fund_rate', label: 'กองทุนทดแทน', group: 'ค่าแรง', unit: '% ของค่าแรงรวม', value: 0.5 },

  // เครื่องแบบ
  { key: 'uniform_cost_per_person', label: 'เครื่องแบบ / บัตรพนักงาน', group: 'เครื่องแบบ', unit: 'บาท/คน (ครั้งเดียว)', value: 100 },

  // Hardware
  { key: 'pc_monthly_rate', label: 'คอมพิวเตอร์ + จอมอนิเตอร์', group: 'Hardware', unit: 'บาท/ชุด/เดือน', value: 3000 },
  { key: 'scanner_monthly_rate', label: 'เครื่องสแกนเอกสาร (เฉพาะงานสแกน)', group: 'Hardware', unit: 'บาท/เครื่อง/เดือน', value: 3500 },
  { key: 'hdd_cost_per_unit', label: 'External HDD', group: 'Hardware', unit: 'บาท/ชุด (ครั้งเดียว)', value: 2000 },
  { key: 'workers_per_hdd', label: 'จำนวนพนักงานต่อ HDD 1 ชุด', group: 'Hardware', unit: 'คน/ชุด', value: 2 },

  // อื่นๆ
  { key: 'office_supplies_flat', label: 'วัสดุอุปกรณ์สำนักงาน', group: 'ค่าใช้จ่ายอื่นๆ', unit: 'บาท/สัญญา (ครั้งเดียว)', value: 2500 },
  { key: 'prep_cost_flat', label: 'ค่าเตรียมงาน', group: 'ค่าใช้จ่ายอื่นๆ', unit: 'บาท/สัญญา (ครั้งเดียว)', value: 4100 },
  { key: 'travel_operation_flat', label: 'ค่าเดินทาง - Operation', group: 'ค่าใช้จ่ายอื่นๆ', unit: 'บาท/สัญญา (ครั้งเดียว)', value: 2000 },
  { key: 'electricity_monthly_per_worker', label: 'ค่าไฟฟ้า (กรณีบริษัทเป็นผู้จ่าย)', group: 'ค่าใช้จ่ายอื่นๆ', unit: 'บาท/คน/เดือน', value: 0 },

  // Capacity (กำลังผลิตต่อคน/วัน) — ใช้ประมาณจำนวนคนที่ต้องใช้
  { key: 'scan_capacity_per_person_per_day', label: 'กำลังสแกนเอกสาร', group: 'Capacity', unit: 'แผ่น/คน/วัน', value: 1500 },
  { key: 'data_entry_capacity_per_person_per_day', label: 'กำลังบันทึกข้อมูล', group: 'Capacity', unit: 'รายการ/คน/วัน', value: 500 },
];

function num(v, fallback = 0) {
  const n = parseFloat(v);
  return Number.isFinite(n) ? n : fallback;
}

function round2(n) {
  return Math.round((n + Number.EPSILON) * 100) / 100;
}

/**
 * แปลง array ของ settings ที่ดึงจาก DB (rows: {setting_key, setting_value})
 * ให้เป็น object แบบ { key: value } เพื่อใช้งานสะดวก
 * ค่า rate ทั้งหมดถูกเก็บใน DB เป็น "หน่วยเปอร์เซ็นต์เต็ม" เช่น 25 = 25%
 * แต่ในการคำนวณเราต้องแปลงเป็นทศนิยม (0.25) สำหรับฟิลด์ที่ลงท้ายด้วย _rate
 */
function settingsRowsToMap(rows) {
  const map = {};
  for (const row of rows) {
    map[row.setting_key] = num(row.setting_value);
  }
  return map;
}

function getRateDecimal(settingsMap, key, fallbackPercent) {
  const percent = settingsMap[key] != null ? settingsMap[key] : fallbackPercent;
  return percent / 100;
}

/**
 * คำนวณ Breakdown Cost เบื้องต้น
 *
 * @param {Object} params
 * @param {'scanning'|'data_entry'} params.serviceType
 * @param {Object} params.serviceDetails - แถวจาก scanning_details หรือ data_entry_details
 * @param {Object} params.settingsMap - object ของค่า setting { key: value(percent-as-number) }
 * @param {Object} params.overrides - ค่าที่ผู้ใช้ปรับเอง (ทั้งหมด optional)
 *   overrides.workers            - บังคับจำนวนคน
 *   overrides.contract_months    - บังคับจำนวนเดือนของสัญญา
 *   overrides.working_days_per_month
 *   overrides.deadline_days      - ระยะเวลาที่ต้องทำให้เสร็จ (วัน) ถ้าต้องการ override จากฟอร์มเดิม
 *   overrides.volume             - จำนวนงาน (แผ่น/รายการ) ถ้าต้องการ override
 *   overrides.capacity_per_day   - กำลังผลิตต่อคนต่อวัน
 *   overrides.gp_rate            - % กำไรเป้าหมาย (หน่วย % เช่น 25 = 25%)
 *   overrides.risk_rate          - % ความเสี่ยง (หน่วย %)
 *   overrides.vat_rate           - % VAT (หน่วย %)
 */
function calculateBreakdown({ serviceType, serviceDetails, settingsMap, overrides = {} }) {
  const details = serviceDetails || {};
  const warnings = [];

  const workingDaysPerMonth = num(overrides.working_days_per_month, settingsMap.working_days_per_month || 20);

  const deadlineDays = num(
    overrides.deadline_days != null ? overrides.deadline_days : details.deadline,
    0
  );

  const isScanning = serviceType === 'scanning';

  const volume = num(
    overrides.volume != null ? overrides.volume : (isScanning ? details.doc_count : details.data_volume),
    0
  );

  const capacityPerDay = num(
    overrides.capacity_per_day != null
      ? overrides.capacity_per_day
      : (isScanning ? settingsMap.scan_capacity_per_person_per_day : settingsMap.data_entry_capacity_per_person_per_day),
    isScanning ? 1500 : 500
  );

  if (volume <= 0) warnings.push('ไม่พบจำนวนงาน (จำนวนเอกสาร/ปริมาณข้อมูล) กรุณาตรวจสอบข้อมูลการประเมิน หรือกรอกจำนวนงานเอง');
  if (deadlineDays <= 0) warnings.push('ไม่พบระยะเวลาที่ต้องการให้แล้วเสร็จ ระบบจะสมมติให้ใช้ 1 เดือน (ตามวันทำงาน/เดือน)');

  // -------------------------------------------------------------------
  // 1) จำนวนคนที่ต้องใช้
  // -------------------------------------------------------------------
  let workers;
  if (overrides.workers != null && num(overrides.workers) > 0) {
    workers = Math.max(1, Math.round(num(overrides.workers)));
  } else if (deadlineDays > 0 && capacityPerDay > 0 && volume > 0) {
    const raw = volume / (capacityPerDay * deadlineDays);
    workers = Math.max(1, Math.ceil(raw));
  } else {
    workers = 1;
  }

  // -------------------------------------------------------------------
  // 2) ระยะเวลาสัญญา (เดือน) — ใช้ปัดเศษขึ้นจากจำนวนวันที่ต้องทำงานจริง
  // -------------------------------------------------------------------
  const effectiveDeadlineDays = deadlineDays > 0 ? deadlineDays : workingDaysPerMonth;
  const months = overrides.contract_months != null && num(overrides.contract_months) > 0
    ? Math.max(1, Math.round(num(overrides.contract_months)))
    : Math.max(1, Math.ceil(effectiveDeadlineDays / workingDaysPerMonth));

  // -------------------------------------------------------------------
  // 3) กลุ่มต้นทุน: ลูกจ้างหลัก
  // -------------------------------------------------------------------
  const laborDailyRate = num(settingsMap.labor_daily_rate, 500);
  const transportMonthly = num(settingsMap.transport_monthly, 1000);
  const socialSecurityRate = getRateDecimal(settingsMap, 'social_security_rate', 5);
  const socialSecurityCapMonthly = num(settingsMap.social_security_cap_monthly, 750);
  const providentFundRate = getRateDecimal(settingsMap, 'provident_fund_rate', 1.25);
  const compensationFundRate = getRateDecimal(settingsMap, 'compensation_fund_rate', 0.5);

  const wageBase = laborDailyRate * workingDaysPerMonth * workers * months;
  const transportTotal = transportMonthly * workers * months;

  const wagePerPersonPerMonth = laborDailyRate * workingDaysPerMonth;
  const socialSecurityPerPersonPerMonth = Math.min(wagePerPersonPerMonth * socialSecurityRate, socialSecurityCapMonthly);
  const socialSecurityTotal = socialSecurityPerPersonPerMonth * workers * months;

  const providentFundTotal = wageBase * providentFundRate;
  const compensationFundTotal = wageBase * compensationFundRate;

  const laborItems = [
    { label: 'ค่าแรง', rateLabel: `${laborDailyRate.toLocaleString('th-TH')} บาท/คน/วัน`, total: wageBase },
    { label: 'ค่าเดินทาง', rateLabel: `${transportMonthly.toLocaleString('th-TH')} บาท/คน/เดือน`, total: transportTotal },
    { label: `ประกันสังคม (${(socialSecurityRate * 100).toFixed(2)}%)`, rateLabel: `${(socialSecurityRate * 100).toFixed(2)}% ของค่าแรง (สูงสุด ${socialSecurityCapMonthly.toLocaleString('th-TH')} บาท/คน/เดือน)`, total: socialSecurityTotal },
    { label: `กองทุนสำรองเลี้ยงชีพ (${(providentFundRate * 100).toFixed(2)}%)`, rateLabel: `${(providentFundRate * 100).toFixed(2)}% ของค่าแรง`, total: providentFundTotal },
    { label: `กองทุนทดแทน (${(compensationFundRate * 100).toFixed(2)}%)`, rateLabel: `${(compensationFundRate * 100).toFixed(2)}% ของค่าแรง`, total: compensationFundTotal },
  ];
  const laborTotal = wageBase + transportTotal + socialSecurityTotal + providentFundTotal + compensationFundTotal;

  // -------------------------------------------------------------------
  // 4) เครื่องแบบ / บัตรพนักงาน
  // -------------------------------------------------------------------
  const uniformCostPerPerson = num(settingsMap.uniform_cost_per_person, 100);
  const uniformTotal = uniformCostPerPerson * workers;
  const uniformItems = [
    { label: 'เครื่องแบบ/บัตรพนักงาน', rateLabel: `${uniformCostPerPerson.toLocaleString('th-TH')} บาท/คน (ครั้งเดียว)`, total: uniformTotal },
  ];

  // -------------------------------------------------------------------
  // 5) Hardware
  // -------------------------------------------------------------------
  const pcMonthlyRate = num(settingsMap.pc_monthly_rate, 3000);
  const scannerMonthlyRate = num(settingsMap.scanner_monthly_rate, 3500);
  const hddCostPerUnit = num(settingsMap.hdd_cost_per_unit, 2000);
  const workersPerHdd = Math.max(1, num(settingsMap.workers_per_hdd, 2));

  const customerProvidesPc = isScanning ? !!details.is_pc_provided : false;
  const needPc = overrides.need_pc != null ? !!overrides.need_pc : !customerProvidesPc;

  const pcTotal = needPc ? pcMonthlyRate * workers * months : 0;
  const scannerTotal = isScanning ? scannerMonthlyRate * workers * months : 0;
  const hddUnits = Math.ceil(workers / workersPerHdd);
  const hddTotal = hddUnits * hddCostPerUnit;

  const hardwareItems = [];
  if (needPc) {
    hardwareItems.push({ label: 'คอมพิวเตอร์ + จอมอนิเตอร์', rateLabel: `${workers} ชุด x ${pcMonthlyRate.toLocaleString('th-TH')} บาท/เดือน x ${months} เดือน`, total: pcTotal });
  } else {
    hardwareItems.push({ label: 'คอมพิวเตอร์ + จอมอนิเตอร์', rateLabel: 'ลูกค้าเป็นผู้จัดหาให้ (ไม่คิดต้นทุน)', total: 0 });
  }
  if (isScanning) {
    hardwareItems.push({ label: 'เครื่องสแกนเอกสาร', rateLabel: `${workers} เครื่อง x ${scannerMonthlyRate.toLocaleString('th-TH')} บาท/เดือน x ${months} เดือน`, total: scannerTotal });
  }
  hardwareItems.push({ label: 'External HDD', rateLabel: `${hddUnits} ชุด x ${hddCostPerUnit.toLocaleString('th-TH')} บาท (ครั้งเดียว)`, total: hddTotal });

  const hardwareTotal = pcTotal + scannerTotal + hddTotal;

  // -------------------------------------------------------------------
  // 6) วัสดุอุปกรณ์สำนักงาน + ค่าใช้จ่ายอื่นๆ
  // -------------------------------------------------------------------
  const officeSuppliesFlat = num(settingsMap.office_supplies_flat, 2500);
  const prepCostFlat = num(settingsMap.prep_cost_flat, 4100);
  const travelOperationFlat = num(settingsMap.travel_operation_flat, 2000);
  const electricityMonthlyPerWorker = num(settingsMap.electricity_monthly_per_worker, 0);

  const companyPaysElectricity = isScanning
    ? (details.scan_location === 'customer_site' && details.electricity_payer === 'company')
    : false;
  const electricityTotal = companyPaysElectricity ? electricityMonthlyPerWorker * workers * months : 0;

  const otherItems = [
    { label: 'วัสดุอุปกรณ์สำนักงาน', rateLabel: `${officeSuppliesFlat.toLocaleString('th-TH')} บาท/สัญญา`, total: officeSuppliesFlat },
    { label: 'ค่าเตรียมงาน', rateLabel: `${prepCostFlat.toLocaleString('th-TH')} บาท/สัญญา`, total: prepCostFlat },
    { label: 'ค่าเดินทาง - Operation', rateLabel: `${travelOperationFlat.toLocaleString('th-TH')} บาท/สัญญา`, total: travelOperationFlat },
  ];
  if (companyPaysElectricity) {
    otherItems.push({ label: 'ค่าไฟฟ้า (บริษัทจ่าย)', rateLabel: `${electricityMonthlyPerWorker.toLocaleString('th-TH')} บาท/คน/เดือน x ${workers} คน x ${months} เดือน`, total: electricityTotal });
  }
  const otherTotal = officeSuppliesFlat + prepCostFlat + travelOperationFlat + electricityTotal;

  // -------------------------------------------------------------------
  // 7) รวมต้นทุน (ยังไม่รวม Risk) แล้วคำนวณราคาขายจาก GP% และ Risk%
  //    สูตร: ราคาขาย = ต้นทุน(ไม่รวม Risk) / (1 - Risk% - GP%)
  // -------------------------------------------------------------------
  const baseCostExcludingRisk = laborTotal + uniformTotal + hardwareTotal + otherTotal;

  const gpRatePercent = overrides.gp_rate != null ? num(overrides.gp_rate) : (settingsMap.gp_rate_default != null ? settingsMap.gp_rate_default : 25);
  const riskRatePercent = overrides.risk_rate != null ? num(overrides.risk_rate) : (settingsMap.risk_rate != null ? settingsMap.risk_rate : 2);
  const vatRatePercent = overrides.vat_rate != null ? num(overrides.vat_rate) : (settingsMap.vat_rate != null ? settingsMap.vat_rate : 7);

  const gpRate = gpRatePercent / 100;
  const riskRate = riskRatePercent / 100;
  const vatRate = vatRatePercent / 100;

  const denom = 1 - riskRate - gpRate;

  let sellingPrice = 0;
  let riskAmount = 0;
  let profitAmount = 0;
  let totalCost = baseCostExcludingRisk;
  let vatAmount = 0;
  let priceWithVat = baseCostExcludingRisk;
  let pricePerUnit = 0;
  let pricePerUnitWithVat = 0;

  if (denom > 0) {
    sellingPrice = baseCostExcludingRisk / denom;
    riskAmount = sellingPrice * riskRate;
    profitAmount = sellingPrice * gpRate;
    totalCost = baseCostExcludingRisk + riskAmount;
    vatAmount = sellingPrice * vatRate;
    priceWithVat = sellingPrice + vatAmount;
    pricePerUnit = volume > 0 ? sellingPrice / volume : 0;
    pricePerUnitWithVat = volume > 0 ? priceWithVat / volume : 0;
  } else {
    warnings.push('ผลรวมของ Risk% + GP% ต้องน้อยกว่า 100% กรุณาปรับค่าในหน้าตั้งค่า หรือใส่ค่า Override ใหม่');
  }

  return {
    input: {
      serviceType,
      volume,
      capacityPerDay,
      deadlineDays,
      workingDaysPerMonth,
      unitLabel: isScanning ? 'แผ่น' : 'รายการ',
    },
    staffing: {
      workers,
      months,
      daysNeeded: capacityPerDay > 0 && workers > 0 ? round2(volume / (capacityPerDay * workers)) : null,
    },
    groups: {
      labor: { items: laborItems, total: round2(laborTotal) },
      uniform: { items: uniformItems, total: round2(uniformTotal) },
      hardware: { items: hardwareItems, total: round2(hardwareTotal) },
      other: { items: otherItems, total: round2(otherTotal) },
    },
    summary: {
      baseCostExcludingRisk: round2(baseCostExcludingRisk),
      riskRatePercent,
      riskAmount: round2(riskAmount),
      totalCost: round2(totalCost),
      gpRatePercent,
      profitAmount: round2(profitAmount),
      sellingPrice: round2(sellingPrice),
      pricePerUnit: round2(pricePerUnit),
      vatRatePercent,
      vatAmount: round2(vatAmount),
      priceWithVat: round2(priceWithVat),
      pricePerUnitWithVat: round2(pricePerUnitWithVat),
    },
    warnings,
  };
}

module.exports = {
  DEFAULT_SETTINGS,
  settingsRowsToMap,
  calculateBreakdown,
};
