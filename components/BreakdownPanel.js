import { useState, useEffect } from 'react';
import {
  glassPanel, glassCard, glassInput, glassButton, buttonColors,
  hoverLift, hoverReset, rowStyle, statChipStyle, glassTitlePill,
  glassTintDanger, glassTintWarning, GlassBlobs, formatBaht,
} from '../styles/glass';

function GroupTable({ title, group }) {
  if (!group) return null;
  return (
    <div style={glassCard}>
      <div style={{ fontWeight: 700, color: '#3730a3', marginBottom: '8px', fontSize: '15px' }}>{title}</div>
      {group.items.map((item, idx) => (
        <div key={idx} style={rowStyle}>
          <div>
            <div style={{ color: '#1f2937' }}>{item.label}</div>
            <div style={{ fontSize: '12px', color: '#8b8fa3' }}>{item.rateLabel}</div>
          </div>
          <div style={{ fontWeight: 600, whiteSpace: 'nowrap', color: '#374151' }}>
            {formatBaht(item.total)} ฿
          </div>
        </div>
      ))}
      <div style={{ ...rowStyle, borderBottom: 'none', fontWeight: 700, color: '#0f9d58', paddingTop: '10px' }}>
        <div>รวม {title}</div>
        <div>{formatBaht(group.total)} ฿</div>
      </div>
    </div>
  );
}

function StatChip({ icon, label, value }) {
  return (
    <div style={statChipStyle}>
      <div style={{ fontSize: '20px' }}>{icon}</div>
      <div>
        <div style={{ fontSize: '12px', color: '#8b8fa3' }}>{label}</div>
        <div style={{ fontSize: '15px', fontWeight: 700, color: '#1f2937' }}>{value}</div>
      </div>
    </div>
  );
}

export default function BreakdownPanel({ evaluationId, serviceType }) {
  const [loading, setLoading] = useState(true);
  const [calculating, setCalculating] = useState(false);
  const [exporting, setExporting] = useState(false);
  const [breakdown, setBreakdown] = useState(null);
  const [error, setError] = useState('');
  const [showOverrides, setShowOverrides] = useState(false);

  const [overrides, setOverrides] = useState({
    workers: '',
    contract_months: '',
    gp_rate: '',
    risk_rate: '',
  });

  useEffect(() => {
    fetchSaved();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [evaluationId]);

  const fetchSaved = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await fetch(`/api/breakdown/${evaluationId}`);
      const result = await res.json();
      if (result.success && result.data) {
        setBreakdown(result.data.breakdown_data);
        const ov = result.data.overrides || {};
        setOverrides({
          workers: ov.workers ?? '',
          contract_months: ov.contract_months ?? '',
          gp_rate: ov.gp_rate ?? '',
          risk_rate: ov.risk_rate ?? '',
        });
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const buildOverridesPayload = () => {
    const payload = {};
    Object.entries(overrides).forEach(([key, value]) => {
      if (value !== '' && value != null) {
        payload[key] = parseFloat(value);
      }
    });
    return payload;
  };

  const handleCalculate = async () => {
    setCalculating(true);
    setError('');
    try {
      const res = await fetch(`/api/breakdown/${evaluationId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ overrides: buildOverridesPayload() }),
      });
      const result = await res.json();
      if (result.success) {
        setBreakdown(result.data.breakdown_data);
      } else {
        setError(result.message || 'เกิดข้อผิดพลาดในการคำนวณ');
      }
    } catch (e) {
      setError('เกิดข้อผิดพลาดในการเชื่อมต่อเซิร์ฟเวอร์');
    } finally {
      setCalculating(false);
    }
  };

  const handleExport = async () => {
    setExporting(true);
    setError('');
    try {
      const res = await fetch(`/api/breakdown/${evaluationId}/export`);
      if (!res.ok) {
        const result = await res.json().catch(() => ({}));
        throw new Error(result.message || 'ไม่สามารถสร้างไฟล์ Excel ได้');
      }
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      const disposition = res.headers.get('Content-Disposition') || '';
      const match = disposition.match(/filename="?([^"]+)"?/);
      a.download = match ? match[1] : `breakdown_${evaluationId}.xlsx`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
    } catch (e) {
      setError(e.message);
    } finally {
      setExporting(false);
    }
  };

  if (loading) {
    return (
      <div style={{ ...glassPanel, marginBottom: '20px' }}>
        <p style={{ color: '#8b8fa3', margin: 0 }}>กำลังตรวจสอบข้อมูล Breakdown...</p>
      </div>
    );
  }

  const unitLabel = breakdown?.input?.unitLabel || 'หน่วย';

  return (
    <div style={{ ...glassPanel, marginBottom: '20px' }}>
      <GlassBlobs />

      <div style={{ position: 'relative' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '18px', flexWrap: 'wrap', gap: '12px' }}>
          <div style={glassTitlePill}>
            <span style={{ fontSize: '20px' }}>💰</span>
            <h3 style={{ color: '#1f2937', margin: 0, fontSize: '17px', fontWeight: 700 }}>Breakdown Cost (เบื้องต้น)</h3>
          </div>
          <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
            <button
              onClick={() => setShowOverrides((v) => !v)}
              style={glassButton(...buttonColors.neutral)}
              onMouseOver={hoverLift}
              onMouseOut={hoverReset}
            >
              {showOverrides ? 'ซ่อนตัวเลือกปรับค่า' : '⚙️ ปรับค่าก่อนคำนวณ'}
            </button>
            <button
              onClick={handleCalculate}
              disabled={calculating}
              style={{ ...glassButton(...buttonColors.primary), opacity: calculating ? 0.7 : 1 }}
              onMouseOver={hoverLift}
              onMouseOut={hoverReset}
            >
              {calculating ? 'กำลังคำนวณ...' : breakdown ? '🔄 คำนวณใหม่' : 'คำนวณ Breakdown Cost'}
            </button>
            {breakdown && (
              <button
                onClick={handleExport}
                disabled={exporting}
                style={{ ...glassButton(...buttonColors.success), opacity: exporting ? 0.7 : 1 }}
                onMouseOver={hoverLift}
                onMouseOut={hoverReset}
              >
                {exporting ? 'กำลังสร้างไฟล์...' : '📊 Export Excel'}
              </button>
            )}
          </div>
        </div>

        {showOverrides && (
          <div style={glassCard}>
            <div style={{ fontSize: '13px', color: '#6b7280', marginBottom: '12px' }}>
              เว้นว่างไว้ = ให้ระบบประมาณการให้อัตโนมัติ / ใช้ค่าเริ่มต้นจากหน้าตั้งค่าต้นทุน
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '12px' }}>
              <div>
                <label style={{ fontSize: '13px', fontWeight: 600, color: '#4b5563' }}>จำนวนคน (Override)</label>
                <input
                  type="number"
                  style={{ ...glassInput, marginTop: '4px' }}
                  value={overrides.workers}
                  onChange={(e) => setOverrides({ ...overrides, workers: e.target.value })}
                  placeholder="เช่น 4"
                />
              </div>
              <div>
                <label style={{ fontSize: '13px', fontWeight: 600, color: '#4b5563' }}>ระยะเวลาสัญญา (เดือน)</label>
                <input
                  type="number"
                  style={{ ...glassInput, marginTop: '4px' }}
                  value={overrides.contract_months}
                  onChange={(e) => setOverrides({ ...overrides, contract_months: e.target.value })}
                  placeholder="เช่น 3"
                />
              </div>
              <div>
                <label style={{ fontSize: '13px', fontWeight: 600, color: '#4b5563' }}>% กำไรเป้าหมาย (GP)</label>
                <input
                  type="number"
                  style={{ ...glassInput, marginTop: '4px' }}
                  value={overrides.gp_rate}
                  onChange={(e) => setOverrides({ ...overrides, gp_rate: e.target.value })}
                  placeholder="เช่น 25"
                />
              </div>
              <div>
                <label style={{ fontSize: '13px', fontWeight: 600, color: '#4b5563' }}>% ความเสี่ยง (Risk)</label>
                <input
                  type="number"
                  style={{ ...glassInput, marginTop: '4px' }}
                  value={overrides.risk_rate}
                  onChange={(e) => setOverrides({ ...overrides, risk_rate: e.target.value })}
                  placeholder="เช่น 2"
                />
              </div>
            </div>
          </div>
        )}

        {error && (
          <div style={{ ...glassTintDanger, fontSize: '14px' }}>
            {error}
          </div>
        )}

        {!breakdown && !error && (
          <div style={glassCard}>
            <p style={{ color: '#8b8fa3', fontSize: '14px', margin: 0 }}>
              ยังไม่มีการคำนวณ Breakdown Cost สำหรับรายการนี้ — กดปุ่ม &quot;คำนวณ Breakdown Cost&quot; ด้านบนเพื่อเริ่ม
            </p>
          </div>
        )}

        {breakdown && (
          <div>
            {breakdown.warnings && breakdown.warnings.length > 0 && (
              <div style={{ ...glassTintWarning, fontSize: '13px' }}>
                {breakdown.warnings.map((w, i) => (
                  <div key={i}>⚠️ {w}</div>
                ))}
              </div>
            )}

            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))',
              gap: '12px',
              marginBottom: '18px',
            }}>
              <StatChip icon="👥" label="จำนวนคน" value={`${breakdown.staffing.workers} คน`} />
              <StatChip icon="🗓️" label="ระยะเวลาสัญญา" value={`${breakdown.staffing.months} เดือน`} />
              <StatChip icon="📄" label="จำนวนงาน" value={`${breakdown.input.volume?.toLocaleString('th-TH') || '-'} ${unitLabel}`} />
              <StatChip icon="🏷️" label={`ราคาขาย / ${unitLabel} (ไม่รวม VAT)`} value={`${formatBaht(breakdown.summary.pricePerUnit)} ฿`} />
              <StatChip icon="🧾" label={`ราคาขาย / ${unitLabel} (รวม VAT)`} value={`${formatBaht(breakdown.summary.pricePerUnitWithVat)} ฿`} />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '18px' }}>
              <div>
                <GroupTable title="ต้นทุนลูกจ้างหลัก" group={breakdown.groups.labor} />
                <GroupTable title="เครื่องแบบ" group={breakdown.groups.uniform} />
              </div>
              <div>
                <GroupTable title="Hardware" group={breakdown.groups.hardware} />
                <GroupTable title="ค่าใช้จ่ายอื่นๆ" group={breakdown.groups.other} />
              </div>
            </div>

            <div style={{
              ...glassCard,
              marginTop: '4px',
              background: 'rgba(255,255,255,0.65)',
            }}>
              <div style={rowStyle}>
                <div>ต้นทุนรวม (ไม่รวม Risk)</div>
                <div>{formatBaht(breakdown.summary.baseCostExcludingRisk)} ฿</div>
              </div>
              <div style={rowStyle}>
                <div>ค่าความเสี่ยง (Risk {breakdown.summary.riskRatePercent}%)</div>
                <div>{formatBaht(breakdown.summary.riskAmount)} ฿</div>
              </div>
              <div style={{ ...rowStyle, fontWeight: 700 }}>
                <div>รวมต้นทุนทั้งหมด</div>
                <div>{formatBaht(breakdown.summary.totalCost)} ฿</div>
              </div>
              <div style={rowStyle}>
                <div>กำไร (GP {breakdown.summary.gpRatePercent}%)</div>
                <div>{formatBaht(breakdown.summary.profitAmount)} ฿</div>
              </div>
              <div style={{ ...rowStyle, fontWeight: 700, fontSize: '16px', color: '#4338ca' }}>
                <div>ราคาขาย (ไม่รวม VAT)</div>
                <div>{formatBaht(breakdown.summary.sellingPrice)} ฿</div>
              </div>
              <div style={{ ...rowStyle, fontSize: '13px', color: '#6b7280' }}>
                <div>ราคาขาย / {unitLabel} (ไม่รวม VAT)</div>
                <div>{formatBaht(breakdown.summary.pricePerUnit)} ฿</div>
              </div>
              <div style={rowStyle}>
                <div>VAT ({breakdown.summary.vatRatePercent}%)</div>
                <div>{formatBaht(breakdown.summary.vatAmount)} ฿</div>
              </div>
              <div style={{ ...rowStyle, fontSize: '13px', color: '#6b7280' }}>
                <div>ราคาขาย / {unitLabel} (รวม VAT)</div>
                <div>{formatBaht(breakdown.summary.pricePerUnitWithVat)} ฿</div>
              </div>
              <div style={{
                display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                marginTop: '10px', padding: '14px 18px', borderRadius: '16px',
                background: 'linear-gradient(135deg, rgba(16,185,129,0.18), rgba(5,150,105,0.10))',
                border: '1px solid rgba(16,185,129,0.3)',
              }}>
                <div style={{ fontWeight: 700, fontSize: '16px', color: '#065f46' }}>ราคาขายรวม VAT</div>
                <div style={{ fontWeight: 800, fontSize: '19px', color: '#047857' }}>{formatBaht(breakdown.summary.priceWithVat)} ฿</div>
              </div>
            </div>

            <p style={{ fontSize: '12px', color: '#9ca3af', marginTop: '10px' }}>
              * ตัวเลขนี้เป็นการประมาณการเบื้องต้นจากอัตราต้นทุนมาตรฐาน (ปรับได้ที่หน้า &quot;ตั้งค่าต้นทุน&quot;) กรุณาตรวจสอบก่อนนำไปเสนอราคาจริง
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
