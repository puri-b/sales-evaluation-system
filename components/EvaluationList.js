import { useState, useEffect } from 'react';
import { glassCard, glassButton, buttonColors, hoverLift, hoverReset, glassTitlePill, glassTintDanger } from '../styles/glass';

export default function EvaluationList({ onBack, onViewDetail }) {
  const [evaluations, setEvaluations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchEvaluations();
  }, []);

  const fetchEvaluations = async () => {
    try {
      const response = await fetch('/api/evaluations');
      const result = await response.json();
      
      if (result.success) {
        setEvaluations(result.data);
      } else {
        setError(result.message);
      }
    } catch (error) {
      setError('เกิดข้อผิดพลาดในการดึงข้อมูล');
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('th-TH', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const getServiceName = (serviceType) => {
    return serviceType === 'scanning' ? 'บริการสแกนเอกสาร' : 'บริการบันทึกข้อมูล';
  };

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '50px' }}>
        <p style={{ color: '#8b8fa3' }}>กำลังโหลดข้อมูล...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ textAlign: 'center', padding: '50px' }}>
        <div style={glassTintDanger}>{error}</div>
        <button
          onClick={fetchEvaluations}
          style={{ ...glassButton(...buttonColors.primary), marginTop: '10px' }}
          onMouseOver={hoverLift}
          onMouseOut={hoverReset}
        >
          โหลดใหม่
        </button>
      </div>
    );
  }

  return (
    <div>
      <div style={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center', 
        marginBottom: '20px',
        flexWrap: 'wrap',
        gap: '12px',
      }}>
        <div style={glassTitlePill}>
          <span style={{ fontSize: '20px' }}>📋</span>
          <h2 style={{ color: '#1f2937', margin: 0, fontSize: '17px', fontWeight: 700 }}>ข้อมูลการประเมินทั้งหมด</h2>
        </div>
        <button
          onClick={onBack}
          style={glassButton(...buttonColors.neutral)}
          onMouseOver={hoverLift}
          onMouseOut={hoverReset}
        >
          กลับหน้าหลัก
        </button>
      </div>

      <div style={{ marginBottom: '20px' }}>
        <p style={{ color: '#6b7280' }}>
          รวมทั้งหมด: <strong>{evaluations.length}</strong> รายการ
        </p>
      </div>

      {evaluations.length === 0 ? (
        <div style={{ ...glassCard, textAlign: 'center', padding: '50px' }}>
          <p style={{ color: '#8b8fa3', margin: 0 }}>ยังไม่มีข้อมูลการประเมิน</p>
        </div>
      ) : (
        <div style={{ display: 'grid', gap: '15px' }}>
          {evaluations.map((evaluation) => (
            <div
              key={evaluation.id}
              style={glassCard}
            >
              <div style={{ 
                display: 'grid', 
                gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', 
                gap: '15px',
                marginBottom: '15px'
              }}>
                <div>
                  <strong style={{ color: '#4338ca' }}>รหัสการประเมิน:</strong>
                  <div>#{evaluation.id}</div>
                </div>
                <div>
                  <strong style={{ color: '#4338ca' }}>บริการ:</strong>
                  <div>{getServiceName(evaluation.service_type)}</div>
                </div>
                <div>
                  <strong style={{ color: '#4338ca' }}>วันที่ประเมิน:</strong>
                  <div>{formatDate(evaluation.evaluation_date)}</div>
                </div>
                <div>
                  <strong style={{ color: '#4338ca' }}>พนักงานขาย:</strong>
                  <div>{evaluation.salesperson_name}</div>
                </div>
                <div>
                  <strong style={{ color: '#4338ca' }}>ลูกค้า:</strong>
                  <div>{evaluation.customer_name}</div>
                </div>
                <div>
                  <strong style={{ color: '#4338ca' }}>รูปภาพ:</strong>
                  <div>{evaluation.image_count} รูป</div>
                </div>
              </div>
              
              <div style={{ 
                display: 'flex', 
                gap: '10px', 
                justifyContent: 'flex-end',
                borderTop: '1px solid rgba(0,0,0,0.06)',
                paddingTop: '15px'
              }}>
                <button
                  onClick={() => onViewDetail(evaluation.id)}
                  style={{ ...glassButton(...buttonColors.primary), padding: '9px 18px', fontSize: '14px' }}
                  onMouseOver={hoverLift}
                  onMouseOut={hoverReset}
                >
                  ดูรายละเอียด
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
