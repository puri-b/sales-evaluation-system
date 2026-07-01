import { glassCard, glassTintSuccess, glassButton, buttonColors, hoverLift, hoverReset } from '../styles/glass';

export default function SaveSuccess({ evaluationId, onNewEvaluation, onViewAll }) {
  return (
    <div style={{ maxWidth: '600px', margin: '0 auto', textAlign: 'center' }}>
      <div style={glassTintSuccess}>
        <h3 style={{ margin: '0 0 10px 0' }}>✅ บันทึกข้อมูลสำเร็จ</h3>
        <p style={{ margin: '0' }}>
          รหัสการประเมิน: <strong>#{evaluationId}</strong>
        </p>
      </div>

      <div style={glassCard}>
        <h4 style={{ marginTop: 0, marginBottom: '10px', color: '#1f2937' }}>
          ข้อมูลของคุณได้รับการบันทึกแล้ว
        </h4>
        <p style={{ color: '#6b7280', margin: '0' }}>
          คุณสามารถดูข้อมูลทั้งหมดหรือเริ่มการประเมินใหม่ได้
        </p>
      </div>

      <div style={{ display: 'flex', gap: '10px', justifyContent: 'center', flexWrap: 'wrap' }}>
        <button
          onClick={onNewEvaluation}
          style={{ ...glassButton(...buttonColors.primary), padding: '15px 30px' }}
          onMouseOver={hoverLift}
          onMouseOut={hoverReset}
        >
          ประเมินใหม่
        </button>
        <button
          onClick={onViewAll}
          style={{ ...glassButton(...buttonColors.success), padding: '15px 30px' }}
          onMouseOver={hoverLift}
          onMouseOut={hoverReset}
        >
          ดูข้อมูลทั้งหมด
        </button>
      </div>
    </div>
  );
}
