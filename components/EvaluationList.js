import { useState, useEffect } from 'react';

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
        <p>กำลังโหลดข้อมูล...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ textAlign: 'center', padding: '50px' }}>
        <p style={{ color: 'red' }}>เกิดข้อผิดพลาด: {error}</p>
        <button
          onClick={fetchEvaluations}
          style={{
            padding: '10px 20px',
            backgroundColor: '#007bff',
            color: 'white',
            border: 'none',
            borderRadius: '5px',
            cursor: 'pointer',
            marginTop: '10px'
          }}
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
        marginBottom: '20px' 
      }}>
        <h2 style={{ color: '#333', margin: 0 }}>ข้อมูลการประเมินทั้งหมด</h2>
        <button
          onClick={onBack}
          style={{
            padding: '10px 20px',
            backgroundColor: '#6c757d',
            color: 'white',
            border: 'none',
            borderRadius: '5px',
            cursor: 'pointer'
          }}
        >
          กลับหน้าหลัก
        </button>
      </div>

      <div style={{ marginBottom: '20px' }}>
        <p style={{ color: '#666' }}>
          รวมทั้งหมด: <strong>{evaluations.length}</strong> รายการ
        </p>
      </div>

      {evaluations.length === 0 ? (
        <div style={{
          textAlign: 'center',
          padding: '50px',
          backgroundColor: '#f8f9fa',
          borderRadius: '8px'
        }}>
          <p style={{ color: '#666' }}>ยังไม่มีข้อมูลการประเมิน</p>
        </div>
      ) : (
        <div style={{ 
          display: 'grid', 
          gap: '15px' 
        }}>
          {evaluations.map((evaluation) => (
            <div
              key={evaluation.id}
              style={{
                backgroundColor: 'white',
                border: '1px solid #e0e0e0',
                borderRadius: '8px',
                padding: '20px',
                boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
                transition: 'transform 0.2s, box-shadow 0.2s'
              }}
            >
              <div style={{ 
                display: 'grid', 
                gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', 
                gap: '15px',
                marginBottom: '15px'
              }}>
                <div>
                  <strong style={{ color: '#007bff' }}>รหัสการประเมิน:</strong>
                  <div>#{evaluation.id}</div>
                </div>
                <div>
                  <strong style={{ color: '#007bff' }}>บริการ:</strong>
                  <div>{getServiceName(evaluation.service_type)}</div>
                </div>
                <div>
                  <strong style={{ color: '#007bff' }}>วันที่ประเมิน:</strong>
                  <div>{formatDate(evaluation.evaluation_date)}</div>
                </div>
                <div>
                  <strong style={{ color: '#007bff' }}>พนักงานขาย:</strong>
                  <div>{evaluation.salesperson_name}</div>
                </div>
                <div>
                  <strong style={{ color: '#007bff' }}>ลูกค้า:</strong>
                  <div>{evaluation.customer_name}</div>
                </div>
                <div>
                  <strong style={{ color: '#007bff' }}>รูปภาพ:</strong>
                  <div>{evaluation.image_count} รูป</div>
                </div>
              </div>
              
              <div style={{ 
                display: 'flex', 
                gap: '10px', 
                justifyContent: 'flex-end',
                borderTop: '1px solid #f0f0f0',
                paddingTop: '15px'
              }}>
                <button
                  onClick={() => onViewDetail(evaluation.id)}
                  style={{
                    padding: '8px 16px',
                    backgroundColor: '#007bff',
                    color: 'white',
                    border: 'none',
                    borderRadius: '5px',
                    cursor: 'pointer',
                    fontSize: '14px'
                  }}
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