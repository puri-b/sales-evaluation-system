/**
 * styles/glass.js
 *
 * ชุดสไตล์กลาง "Liquid Glass" (แรงบันดาลใจจาก iOS / macOS)
 * ใช้ร่วมกันทุกหน้าในระบบ เพื่อให้ดีไซน์เป็นภาษาเดียวกันทั้งแอป
 *
 * วิธีใช้:
 *   import { glassPanel, glassCard, glassInput, glassButton, GlassBlobs, hoverLift, hoverReset } from '../styles/glass';
 */

// พื้นหลังไล่สีพาสเทลหลัก (ใช้เป็น container ใหญ่สุดของแต่ละหน้า)
export const glassPanel = {
  position: 'relative',
  borderRadius: '28px',
  padding: '26px',
  overflow: 'hidden',
  background: 'linear-gradient(135deg, #eef2ff 0%, #f5f0ff 30%, #fdf1f8 60%, #eefcff 100%)',
  border: '1px solid rgba(255,255,255,0.6)',
  boxShadow: '0 20px 60px rgba(99,102,241,0.12), inset 0 1px 0 rgba(255,255,255,0.7)',
};

// การ์ดกระจกฝ้าโปร่งแสงด้านใน
export const glassCard = {
  background: 'rgba(255,255,255,0.55)',
  backdropFilter: 'blur(20px) saturate(180%)',
  WebkitBackdropFilter: 'blur(20px) saturate(180%)',
  border: '1px solid rgba(255,255,255,0.65)',
  borderRadius: '20px',
  boxShadow: '0 8px 32px rgba(31,38,135,0.10)',
  padding: '18px 20px',
  marginBottom: '16px',
};

// การ์ดกระจกแบบมีสีเน้น (info / success / warning / danger)
export function glassTint(bg, border, color) {
  return {
    ...glassCard,
    background: bg,
    border: `1px solid ${border}`,
    color,
  };
}

export const glassTintInfo = glassTint('rgba(219,234,254,0.7)', 'rgba(96,165,250,0.4)', '#1e3a8a');
export const glassTintSuccess = glassTint('rgba(209,250,229,0.7)', 'rgba(16,185,129,0.4)', '#065f46');
export const glassTintWarning = glassTint('rgba(254,243,199,0.7)', 'rgba(251,191,36,0.4)', '#92400e');
export const glassTintDanger = glassTint('rgba(254,226,226,0.7)', 'rgba(248,113,113,0.4)', '#991b1b');

// input / select / textarea กระจกโปร่งแสง
export const glassInput = {
  width: '100%',
  padding: '11px 14px',
  borderRadius: '12px',
  border: '1px solid rgba(255,255,255,0.8)',
  background: 'rgba(255,255,255,0.65)',
  backdropFilter: 'blur(10px)',
  WebkitBackdropFilter: 'blur(10px)',
  fontSize: '15px',
  outline: 'none',
  boxShadow: 'inset 0 1px 3px rgba(0,0,0,0.04)',
  color: '#1f2937',
  boxSizing: 'border-box',
};

export const glassSelect = { ...glassInput, cursor: 'pointer' };

export const glassTextarea = { ...glassInput, resize: 'vertical', fontFamily: 'inherit' };

export const glassFileInput = {
  ...glassInput,
  border: '2px dashed rgba(129,140,248,0.5)',
  background: 'rgba(255,255,255,0.45)',
  cursor: 'pointer',
};

export const glassCheckbox = {
  width: '18px',
  height: '18px',
  accentColor: '#6366f1',
  cursor: 'pointer',
};

// ปุ่มกระจกทรงแคปซูล ไล่สีตาม role
export function glassButton(gradientFrom, gradientTo) {
  return {
    padding: '13px 22px',
    borderRadius: '999px',
    border: '1px solid rgba(255,255,255,0.55)',
    background: `linear-gradient(135deg, ${gradientFrom}, ${gradientTo})`,
    color: 'white',
    fontWeight: 600,
    fontSize: '15px',
    cursor: 'pointer',
    boxShadow: '0 6px 16px rgba(0,0,0,0.14), inset 0 1px 0 rgba(255,255,255,0.4)',
    backdropFilter: 'blur(10px)',
    WebkitBackdropFilter: 'blur(10px)',
    transition: 'transform 0.15s ease, box-shadow 0.15s ease',
    whiteSpace: 'nowrap',
  };
}

// พรีเซ็ตสีปุ่มมาตรฐาน
export const buttonColors = {
  primary: ['#60a5fa', '#6366f1'],
  success: ['#34d399', '#059669'],
  neutral: ['#94a3b8', '#64748b'],
  danger: ['#f87171', '#dc2626'],
  pink: ['#f472b6', '#db2777'],
};

export const hoverLift = (e) => {
  e.currentTarget.style.transform = 'translateY(-2px)';
  e.currentTarget.style.boxShadow = '0 10px 22px rgba(0,0,0,0.18)';
};
export const hoverReset = (e) => {
  e.currentTarget.style.transform = 'translateY(0)';
  e.currentTarget.style.boxShadow = '0 6px 16px rgba(0,0,0,0.14), inset 0 1px 0 rgba(255,255,255,0.4)';
};

// การ์ดตัวเลือกแบบเลือกได้ (เช่น เลือกบริการ) พร้อมสถานะ active
export function glassSelectableCard(active) {
  return {
    background: active ? 'rgba(99,102,241,0.14)' : 'rgba(255,255,255,0.55)',
    backdropFilter: 'blur(16px) saturate(180%)',
    WebkitBackdropFilter: 'blur(16px) saturate(180%)',
    border: active ? '2px solid rgba(99,102,241,0.6)' : '1px solid rgba(255,255,255,0.65)',
    borderRadius: '20px',
    boxShadow: active
      ? '0 10px 30px rgba(99,102,241,0.25), inset 0 1px 0 rgba(255,255,255,0.5)'
      : '0 6px 20px rgba(31,38,135,0.08)',
    padding: '22px',
    cursor: 'pointer',
    transition: 'all 0.25s ease',
    textAlign: 'center',
  };
}

// ชิปสถิติเล็กๆ (icon + label + value)
export const statChipStyle = {
  display: 'flex',
  alignItems: 'center',
  gap: '10px',
  background: 'rgba(255,255,255,0.6)',
  backdropFilter: 'blur(14px)',
  WebkitBackdropFilter: 'blur(14px)',
  border: '1px solid rgba(255,255,255,0.7)',
  borderRadius: '16px',
  padding: '12px 16px',
  boxShadow: '0 4px 14px rgba(31,38,135,0.08)',
};

// pill เล็กสำหรับ header ของบล็อก (ไอคอน + หัวข้อ)
export const glassTitlePill = {
  display: 'flex',
  alignItems: 'center',
  gap: '10px',
  background: 'rgba(255,255,255,0.55)',
  backdropFilter: 'blur(14px)',
  WebkitBackdropFilter: 'blur(14px)',
  border: '1px solid rgba(255,255,255,0.7)',
  borderRadius: '999px',
  padding: '8px 18px 8px 14px',
  boxShadow: '0 4px 14px rgba(31,38,135,0.08)',
};

export const rowStyle = {
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'flex-start',
  padding: '9px 0',
  borderBottom: '1px solid rgba(0,0,0,0.06)',
  fontSize: '14px',
  gap: '10px',
};

// บับเบิ้ลสีเบลอ ใช้แต่งพื้นหลังให้มีมิติแบบ "liquid" — วางไว้ใน container ที่มี position: relative + overflow: hidden
export function GlassBlobs({ variant = 'default' }) {
  const variants = {
    default: [
      { top: '-60px', right: '-60px', size: 220, color: 'rgba(129,140,248,0.35)' },
      { bottom: '-80px', left: '-40px', size: 260, color: 'rgba(244,114,182,0.28)' },
    ],
    single: [
      { top: '-60px', right: '-60px', size: 220, color: 'rgba(129,140,248,0.35)' },
    ],
    reverse: [
      { top: '-60px', left: '-60px', size: 220, color: 'rgba(52,211,153,0.3)' },
      { bottom: '-80px', right: '-40px', size: 260, color: 'rgba(96,165,250,0.28)' },
    ],
  };
  const blobs = variants[variant] || variants.default;

  return (
    <>
      {blobs.map((b, i) => (
        <div
          key={i}
          style={{
            position: 'absolute',
            top: b.top,
            right: b.right,
            bottom: b.bottom,
            left: b.left,
            width: `${b.size}px`,
            height: `${b.size}px`,
            borderRadius: '50%',
            background: `radial-gradient(circle, ${b.color}, transparent)`,
            filter: 'blur(10px)',
            pointerEvents: 'none',
          }}
        />
      ))}
    </>
  );
}

export function formatBaht(n) {
  if (n == null) return '-';
  return Number(n).toLocaleString('th-TH', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}
