import ExcelJS from 'exceljs';
import { query } from '../../../../lib/db';

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

function thb(n) {
  const v = typeof n === 'number' ? n : parseFloat(n) || 0;
  return v;
}

export default async function handler(req, res) {
  const { id } = req.query;
  const evaluationId = parseInt(id, 10);

  if (!evaluationId) {
    return res.status(400).json({ success: false, message: 'evaluation id ไม่ถูกต้อง' });
  }

  if (req.method !== 'GET') {
    res.setHeader('Allow', ['GET']);
    return res.status(405).end(`Method ${req.method} Not Allowed`);
  }

  try {
    const breakdownResult = await query(
      `SELECT * FROM "X_SalesApp".breakdown_results WHERE evaluation_id = $1`,
      [evaluationId]
    );

    if (breakdownResult.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'ยังไม่มีการคำนวณ Breakdown สำหรับรายการนี้ กรุณากด "คำนวณ Breakdown Cost" ก่อน',
      });
    }

    const breakdownRow = breakdownResult.rows[0];
    const breakdown = breakdownRow.breakdown_data;

    const evalData = await getEvaluationWithDetails(evaluationId);
    if (!evalData) {
      return res.status(404).json({ success: false, message: 'ไม่พบข้อมูลการประเมิน' });
    }
    const { evaluation, serviceDetails } = evalData;

    const serviceLabel = evaluation.service_type === 'scanning' ? 'บริการสแกนเอกสาร' : 'บริการบันทึกข้อมูล';

    const workbook = new ExcelJS.Workbook();
    workbook.creator = 'Sales Evaluation System';
    workbook.created = new Date();

    const sheet = workbook.addWorksheet('Breakdown Cost', {
      pageSetup: { paperSize: 9, orientation: 'portrait', fitToPage: true, fitToWidth: 1 },
    });

    sheet.columns = [
      { width: 38 },
      { width: 26 },
      { width: 16 },
      { width: 16 },
    ];

    const titleFont = { name: 'Arial', bold: true, size: 14 };
    const headerFont = { name: 'Arial', bold: true, size: 11 };
    const normalFont = { name: 'Arial', size: 11 };
    const grayFill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFF2F2F2' } };
    const greenFill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFE9F7EF' } };
    const thinBorder = {
      top: { style: 'thin', color: { argb: 'FFCCCCCC' } },
      left: { style: 'thin', color: { argb: 'FFCCCCCC' } },
      bottom: { style: 'thin', color: { argb: 'FFCCCCCC' } },
      right: { style: 'thin', color: { argb: 'FFCCCCCC' } },
    };

    let row = 1;

    // ---------------- Header ----------------
    sheet.mergeCells(`A${row}:D${row}`);
    sheet.getCell(`A${row}`).value = 'บริษัท สยามราชธานี จำกัด (มหาชน)';
    sheet.getCell(`A${row}`).font = titleFont;
    sheet.getCell(`A${row}`).alignment = { horizontal: 'center' };
    row += 1;

    sheet.mergeCells(`A${row}:D${row}`);
    sheet.getCell(`A${row}`).value = `Breakdown Cost (เบื้องต้น) - ${serviceLabel}`;
    sheet.getCell(`A${row}`).font = headerFont;
    sheet.getCell(`A${row}`).alignment = { horizontal: 'center' };
    row += 1;

    sheet.mergeCells(`A${row}:D${row}`);
    sheet.getCell(`A${row}`).value = `วันที่พิมพ์: ${new Date().toLocaleString('th-TH')}`;
    sheet.getCell(`A${row}`).font = { name: 'Arial', size: 9, italic: true, color: { argb: 'FF666666' } };
    sheet.getCell(`A${row}`).alignment = { horizontal: 'center' };
    row += 2;

    // ---------------- ข้อมูลการประเมิน ----------------
    const addInfoRow = (label, value) => {
      sheet.getCell(`A${row}`).value = label;
      sheet.getCell(`A${row}`).font = headerFont;
      sheet.mergeCells(`B${row}:D${row}`);
      sheet.getCell(`B${row}`).value = value ?? '-';
      sheet.getCell(`B${row}`).font = normalFont;
      row += 1;
    };

    addInfoRow('รหัสการประเมิน', `#${evaluation.id}`);
    addInfoRow('ลูกค้า', evaluation.customer_name);
    addInfoRow('พนักงานขาย', evaluation.salesperson_name);
    addInfoRow('วันที่ประเมิน', evaluation.evaluation_date ? new Date(evaluation.evaluation_date).toLocaleDateString('th-TH') : '-');
    if (evaluation.service_type === 'scanning') {
      addInfoRow('จำนวนเอกสารรวม', serviceDetails.doc_count ? `${serviceDetails.doc_count} แผ่น` : '-');
      addInfoRow('ขนาดเอกสาร', serviceDetails.doc_type || '-');
    } else {
      addInfoRow('ปริมาณข้อมูล', serviceDetails.data_volume || '-');
      addInfoRow('ประเภทข้อมูล', serviceDetails.data_type || '-');
    }
    addInfoRow('ระยะเวลาที่ต้องการให้แล้วเสร็จ', serviceDetails.deadline ? `${serviceDetails.deadline} วัน` : '-');
    addInfoRow('จำนวนคนที่ใช้ (ประมาณการ)', `${breakdown.staffing.workers} คน`);
    addInfoRow('ระยะเวลาสัญญา (ประมาณการ)', `${breakdown.staffing.months} เดือน`);
    row += 1;

    // ---------------- ตารางกลุ่มต้นทุน ----------------
    const addGroupHeader = (title) => {
      sheet.mergeCells(`A${row}:D${row}`);
      const cell = sheet.getCell(`A${row}`);
      cell.value = title;
      cell.font = headerFont;
      cell.fill = grayFill;
      row += 1;

      const headers = ['รายการ', 'อัตรา', '', 'จำนวนเงิน (บาท)'];
      sheet.mergeCells(`B${row}:C${row}`);
      ['A', 'B', 'D'].forEach((col, idx) => {
        const c = sheet.getCell(`${col}${row}`);
        c.value = headers[col === 'A' ? 0 : col === 'B' ? 1 : 3];
        c.font = { ...headerFont, size: 10 };
        c.border = thinBorder;
      });
      row += 1;
    };

    const addItemRow = (label, rateLabel, total) => {
      sheet.getCell(`A${row}`).value = label;
      sheet.getCell(`A${row}`).font = normalFont;
      sheet.getCell(`A${row}`).border = thinBorder;

      sheet.mergeCells(`B${row}:C${row}`);
      sheet.getCell(`B${row}`).value = rateLabel || '-';
      sheet.getCell(`B${row}`).font = { ...normalFont, size: 9, color: { argb: 'FF666666' } };
      sheet.getCell(`B${row}`).border = thinBorder;

      sheet.getCell(`D${row}`).value = thb(total);
      sheet.getCell(`D${row}`).numFmt = '#,##0.00';
      sheet.getCell(`D${row}`).font = normalFont;
      sheet.getCell(`D${row}`).border = thinBorder;
      row += 1;
    };

    const addSubtotalRow = (label, total) => {
      sheet.mergeCells(`A${row}:C${row}`);
      sheet.getCell(`A${row}`).value = label;
      sheet.getCell(`A${row}`).font = headerFont;
      sheet.getCell(`A${row}`).fill = greenFill;
      sheet.getCell(`A${row}`).border = thinBorder;
      ['B', 'C'].forEach((col) => {
        sheet.getCell(`${col}${row}`).fill = greenFill;
        sheet.getCell(`${col}${row}`).border = thinBorder;
      });

      sheet.getCell(`D${row}`).value = thb(total);
      sheet.getCell(`D${row}`).numFmt = '#,##0.00';
      sheet.getCell(`D${row}`).font = headerFont;
      sheet.getCell(`D${row}`).fill = greenFill;
      sheet.getCell(`D${row}`).border = thinBorder;
      row += 2;
    };

    addGroupHeader('1) ต้นทุน : ลูกจ้างหลัก');
    breakdown.groups.labor.items.forEach((item) => addItemRow(item.label, item.rateLabel, item.total));
    addSubtotalRow('รวม : ลูกจ้างหลัก', breakdown.groups.labor.total);

    addGroupHeader('2) ต้นทุนอื่น : เครื่องแบบ');
    breakdown.groups.uniform.items.forEach((item) => addItemRow(item.label, item.rateLabel, item.total));
    addSubtotalRow('รวม : เครื่องแบบ', breakdown.groups.uniform.total);

    addGroupHeader('3) ต้นทุนอื่น : Hardware');
    breakdown.groups.hardware.items.forEach((item) => addItemRow(item.label, item.rateLabel, item.total));
    addSubtotalRow('รวม : Hardware', breakdown.groups.hardware.total);

    addGroupHeader('4) ค่าใช้จ่ายอื่นๆ');
    breakdown.groups.other.items.forEach((item) => addItemRow(item.label, item.rateLabel, item.total));
    addSubtotalRow('รวม : ค่าใช้จ่ายอื่นๆ', breakdown.groups.other.total);

    // ---------------- สรุป Breakdown Cost ----------------
    sheet.mergeCells(`A${row}:D${row}`);
    sheet.getCell(`A${row}`).value = 'สรุป Breakdown Cost';
    sheet.getCell(`A${row}`).font = { ...headerFont, size: 12 };
    sheet.getCell(`A${row}`).fill = grayFill;
    row += 1;

    const addSummaryRow = (label, value, bold = false, highlight = false) => {
      sheet.mergeCells(`A${row}:C${row}`);
      sheet.getCell(`A${row}`).value = label;
      sheet.getCell(`A${row}`).font = bold ? headerFont : normalFont;
      sheet.getCell(`A${row}`).border = thinBorder;
      sheet.getCell(`B${row}`).border = thinBorder;
      sheet.getCell(`C${row}`).border = thinBorder;

      sheet.getCell(`D${row}`).value = thb(value);
      sheet.getCell(`D${row}`).numFmt = '#,##0.00';
      sheet.getCell(`D${row}`).font = bold ? headerFont : normalFont;
      sheet.getCell(`D${row}`).border = thinBorder;
      if (highlight) {
        sheet.getCell(`A${row}`).fill = greenFill;
        sheet.getCell(`B${row}`).fill = greenFill;
        sheet.getCell(`C${row}`).fill = greenFill;
        sheet.getCell(`D${row}`).fill = greenFill;
      }
      row += 1;
    };

    addSummaryRow('ต้นทุนรวม (ไม่รวม Risk)', breakdown.summary.baseCostExcludingRisk);
    addSummaryRow(`ค่าความเสี่ยง (Risk ${breakdown.summary.riskRatePercent}%)`, breakdown.summary.riskAmount);
    addSummaryRow('รวมต้นทุนทั้งหมด', breakdown.summary.totalCost, true);
    addSummaryRow(`กำไร (GP ${breakdown.summary.gpRatePercent}%)`, breakdown.summary.profitAmount);
    addSummaryRow('ราคาขาย (ไม่รวม VAT)', breakdown.summary.sellingPrice, true, true);
    addSummaryRow(`ราคาขาย / ${breakdown.input.unitLabel || 'หน่วย'} (ไม่รวม VAT)`, breakdown.summary.pricePerUnit);
    addSummaryRow(`VAT (${breakdown.summary.vatRatePercent}%)`, breakdown.summary.vatAmount);
    addSummaryRow('ราคาขายรวม VAT', breakdown.summary.priceWithVat, true, true);
    addSummaryRow(`ราคาขาย / ${breakdown.input.unitLabel || 'หน่วย'} (รวม VAT)`, breakdown.summary.pricePerUnitWithVat);
    row += 1;

    sheet.mergeCells(`A${row}:D${row}`);
    sheet.getCell(`A${row}`).value = 'หมายเหตุ: ตัวเลขนี้เป็นการประมาณการเบื้องต้นจากอัตราต้นทุนมาตรฐาน กรุณาตรวจสอบและปรับปรุงก่อนนำไปเสนอราคาจริง';
    sheet.getCell(`A${row}`).font = { name: 'Arial', size: 9, italic: true, color: { argb: 'FF999999' } };

    const buffer = await workbook.xlsx.writeBuffer();

    const filename = `Breakdown_Cost_${evaluation.id}_${evaluation.customer_name || ''}`.replace(/[^a-zA-Z0-9ก-๙_-]/g, '_') + '.xlsx';

    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    res.status(200).send(Buffer.from(buffer));
  } catch (error) {
    console.error('Error exporting breakdown to Excel:', error);
    res.status(500).json({
      success: false,
      message: 'เกิดข้อผิดพลาดในการสร้างไฟล์ Excel: ' + error.message,
    });
  }
}
