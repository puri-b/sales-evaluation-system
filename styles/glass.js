/**
 * styles/glass.js
 *
 * ชุดสไตล์กลางของทั้งแอป — ธีม "เรียบ" (flat) โทนม่วงเข้ม + มิ้นต์
 * ชื่อ export เดิมยังใช้ได้ทั้งหมด (glassCard, glassButton ฯลฯ) เพื่อไม่ต้องแก้ทุก component
 * ถ้าจะปรับสีทั้งระบบ ให้แก้ที่ `theme` ด้านล่างจุดเดียว
 */

export const theme = {
  bg: '#f5f4f8',
  surface: '#ffffff',
  surfaceAlt: '#faf9fc',
  border: '#e6e3ed',
  borderStrong: '#d6d1e0',
  ink: '#221a2e',
  muted: '#6f6a7a',
  plum900: '#2a1a3e',
  plum700: '#3d2459',
  plum500: '#5b3b8a',
  plum50: '#f3eff8',
  mint: '#6ee7d2',
  mintInk: '#123c35',
  mintSoft: '#e6faf6',
  danger: '#c62828',
  radius: '14px',
};

// กล่องหลักของแต่ละหน้า (การ์ดขาวขอบบาง)
export const glassPanel = {
  position: 'relative',
  background: theme.surface,
  border: `1px solid ${theme.border}`,
  borderRadius: '16px',
  padding: 'clamp(16px, 4vw, 28px)',
};

// กล่องย่อยด้านใน — พื้นเทาอ่อน ไม่มีเงา จะได้ไม่เป็น "การ์ดซ้อนการ์ด"
export const glassCard = {
  background: theme.surfaceAlt,
  border: `1px solid ${theme.border}`,
  borderRadius: '12px',
  padding: '18px 20px',
  marginBottom: '16px',
};

export function glassTint(bg, border, color) {
  return { ...glassCard, background: bg, border: `1px solid ${border}`, color };
}

export const glassTintInfo = glassTint('#f3eff8', '#ddd2ec', '#3d2459');
export const glassTintSuccess = glassTint('#e6faf6', '#bfeee3', '#0f5a4e');
export const glassTintWarning = glassTint('#fff8e6', '#f3dfa8', '#7a5300');
export const glassTintDanger = glassTint('#fdecec', '#f1c4c4', '#9b1c1c');

export const glassInput = {
  width: '100%',
  padding: '10px 12px',
  borderRadius: '10px',
  border: `1px solid ${theme.borderStrong}`,
  background: theme.surface,
  fontSize: '15px',
  outline: 'none',
  color: theme.ink,
  boxSizing: 'border-box',
  fontFamily: 'inherit',
};

export const glassSelect = { ...glassInput, cursor: 'pointer' };
export const glassTextarea = { ...glassInput, resize: 'vertical' };

export const glassFileInput = {
  ...glassInput,
  border: `1px dashed ${theme.borderStrong}`,
  background: theme.surfaceAlt,
  cursor: 'pointer',
};

export const glassCheckbox = {
  width: '18px',
  height: '18px',
  accentColor: theme.plum500,
  cursor: 'pointer',
};

// ปุ่มแบบเรียบ: (สีพื้น, สีตัวอักษร, สีขอบ)
export function glassButton(bg, color = '#fff', border = bg) {
  return {
    padding: '11px 18px',
    borderRadius: '10px',
    border: `1px solid ${border}`,
    background: bg,
    color,
    fontWeight: 600,
    fontSize: '14px',
    fontFamily: 'inherit',
    cursor: 'pointer',
    transition: 'filter 0.15s ease',
    whiteSpace: 'nowrap',
  };
}

export const buttonColors = {
  primary: [theme.mint, theme.mintInk, '#5fd9c3'],     // ปุ่มหลัก (มิ้นต์)
  success: [theme.plum700, '#ffffff', theme.plum700],  // ปุ่มยืนยัน/บันทึก (ม่วงเข้ม)
  neutral: [theme.surface, '#3a3346', theme.borderStrong], // ปุ่มรอง (ขอบเทา)
  danger: [theme.surface, theme.danger, '#f1c4c4'],
  pink: [theme.plum500, '#ffffff', theme.plum500],
};

export const hoverLift = (e) => { e.currentTarget.style.filter = 'brightness(0.95)'; };
export const hoverReset = (e) => { e.currentTarget.style.filter = ''; };

// การ์ดเลือกบริการ
export function glassSelectableCard(active) {
  return {
    background: active ? theme.plum50 : theme.surface,
    border: active ? `2px solid ${theme.plum500}` : `1px solid ${theme.border}`,
    borderRadius: theme.radius,
    padding: active ? '21px' : '22px',
    cursor: 'pointer',
    transition: 'border-color 0.15s ease, background 0.15s ease',
    textAlign: 'center',
  };
}

// ชิปสถิติ (สไตล์การ์ด KPI)
export const statChipStyle = {
  display: 'flex',
  alignItems: 'center',
  gap: '12px',
  background: theme.surface,
  border: `1px solid ${theme.border}`,
  borderRadius: '12px',
  padding: '14px 16px',
};

// หัวข้อบล็อก (ไอคอน + ชื่อ) — แบบเรียบ ไม่มีกรอบ
export const glassTitlePill = {
  display: 'flex',
  alignItems: 'center',
  gap: '10px',
  padding: '4px 0',
  fontWeight: 600,
  color: theme.ink,
};

export const rowStyle = {
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'flex-start',
  padding: '10px 0',
  borderBottom: `1px solid ${theme.border}`,
  fontSize: '14px',
  gap: '10px',
};

// เดิมเป็นบับเบิ้ลเบลอ — ธีมเรียบไม่ใช้แล้ว (คงไว้เพื่อไม่ให้ import เดิมพัง)
export function GlassBlobs() {
  return null;
}

export function formatBaht(n) {
  if (n == null) return '-';
  return Number(n).toLocaleString('th-TH', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}
