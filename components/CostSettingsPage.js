import { useState, useEffect } from 'react';
import {
  glassPanel, glassCard, glassButton, buttonColors,
  hoverLift, hoverReset, glassTitlePill, glassTintDanger, glassTintSuccess, GlassBlobs,
} from '../styles/glass';

const glassSettingInput = {
  width: '150px',
  padding: '9px 12px',
  borderRadius: '12px',
  border: '1px solid rgba(255,255,255,0.8)',
  background: 'rgba(255,255,255,0.7)',
  backdropFilter: 'blur(10px)',
  WebkitBackdropFilter: 'blur(10px)',
  fontSize: '14px',
  textAlign: 'right',
  outline: 'none',
  boxShadow: 'inset 0 1px 3px rgba(0,0,0,0.04)',
};

export default function CostSettingsPage({ onBack }) {
  const [settings, setSettings] = useState([]);
  const [values, setValues] = useState({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await fetch('/api/cost-settings');
      const result = await res.json();
      if (result.success) {
        setSettings(result.data);
        const v = {};
        result.data.forEach((s) => { v[s.setting_key] = s.setting_value; });
        setValues(v);
      } else {
        setError(result.message);
      }
    } catch (e) {
      setError('เกิดข้อผิดพลาดในการดึงข้อมูลการตั้งค่า');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (key, value) => {
    setValues({ ...values, [key]: value });
  };

  const handleSave = async () => {
    setSaving(true);
    setMessage('');
    setError('');
    try {
      const res = await fetch('/api/cost-settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ settings: values }),
      });
      const result = await res.json();
      if (result.success) {
        setMessage('บันทึกการตั้งค่าสำเร็จ');
        fetchSettings();
      } else {
        setError(result.message || 'บันทึกไม่สำเร็จ');
      }
    } catch (e) {
      setError('เกิดข้อผิดพลาดในการเชื่อมต่อเซิร์ฟเวอร์');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div style={glassPanel}>
        <p style={{ color: '#8b8fa3', margin: 0 }}>กำลังโหลดข้อมูล...</p>
      </div>
    );
  }

  const groups = {};
  settings.forEach((s) => {
    const g = s.setting_group || 'อื่นๆ';
    if (!groups[g]) groups[g] = [];
    groups[g].push(s);
  });

  return (
    <div style={glassPanel}>
      <GlassBlobs variant="single" />

      <div style={{ position: 'relative' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '18px', flexWrap: 'wrap', gap: '12px' }}>
          <div style={glassTitlePill}>
            <span style={{ fontSize: '20px' }}></span>
            <h2 style={{ color: '#1f2937', margin: 0, fontSize: '17px', fontWeight: 700 }}>ตั้งค่าอัตราต้นทุน (Breakdown Cost)</h2>
          </div>
          <button
            onClick={onBack}
            style={glassButton(...buttonColors.neutral)}
            onMouseOver={hoverLift}
            onMouseOut={hoverReset}
          >
            กลับ
          </button>
        </div>

        <p style={{ color: '#6b7280', fontSize: '14px', marginBottom: '18px' }}>
          ค่าเหล่านี้เป็นอัตรามาตรฐานที่ระบบใช้คำนวณ Breakdown Cost เบื้องต้นให้ทุกรายการประเมิน
          แก้ไขได้ตามนโยบายบริษัทหรือสถานการณ์ปัจจุบัน โดยไม่ต้องแก้โค้ด
        </p>

        {message && (
          <div style={{ ...glassTintSuccess, padding: '12px 18px' }}>{message}</div>
        )}
        {error && (
          <div style={{ ...glassTintDanger, padding: '12px 18px' }}>{error}</div>
        )}

        {Object.entries(groups).map(([groupName, items]) => (
          <div key={groupName} style={glassCard}>
            <h4 style={{ color: '#3730a3', marginTop: 0, marginBottom: '10px', fontSize: '15px' }}>{groupName}</h4>
            {items.map((item) => (
              <div
                key={item.setting_key}
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  padding: '10px 0',
                  borderBottom: '1px solid rgba(0,0,0,0.06)',
                  gap: '10px',
                  flexWrap: 'wrap',
                }}
              >
                <div>
                  <div style={{ fontWeight: 600, fontSize: '14px', color: '#1f2937' }}>{item.label}</div>
                  <div style={{ fontSize: '12px', color: '#8b8fa3' }}>{item.unit_label}</div>
                </div>
                <input
                  type="number"
                  step="any"
                  style={glassSettingInput}
                  value={values[item.setting_key] ?? ''}
                  onChange={(e) => handleChange(item.setting_key, e.target.value)}
                />
              </div>
            ))}
          </div>
        ))}

        <button
          onClick={handleSave}
          disabled={saving}
          style={{
            ...glassButton(...buttonColors.success),
            width: '100%',
            padding: '15px',
            fontSize: '16px',
            opacity: saving ? 0.7 : 1,
          }}
          onMouseOver={hoverLift}
          onMouseOut={hoverReset}
        >
          {saving ? 'กำลังบันทึก...' : '💾 บันทึกการตั้งค่า'}
        </button>
      </div>
    </div>
  );
}
