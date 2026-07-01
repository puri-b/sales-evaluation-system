import { useState, useEffect } from 'react';
import BreakdownPanel from './BreakdownPanel';
import { glassCard, glassButton, buttonColors, hoverLift, hoverReset, glassTitlePill, glassTintDanger } from '../styles/glass';

export default function EvaluationDetail({ evaluationId, onBack }) {
  const [evaluation, setEvaluation] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedImage, setSelectedImage] = useState(null);

  useEffect(() => {
    fetchEvaluationDetail();
  }, [evaluationId]);

  const fetchEvaluationDetail = async () => {
    try {
      const response = await fetch(`/api/evaluations/${evaluationId}`);
      const result = await response.json();
      
      if (result.success) {
        setEvaluation(result.data);
      } else {
        setError(result.message);
      }
    } catch (error) {
      setError('เกิดข้อผิดพลาดในการดึงข้อมูล');
    } finally {
      setLoading(false);
    }
  };

  const handlePrint = () => {
    window.print();
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

  const getScanModeLabel = (scanMode) => {
    if (scanMode === 'original') return 'ตามต้นฉบับ';
    if (scanMode === 'color') return 'สี';
    if (scanMode === 'black_white') return 'ขาวดำ';
    return '-';
  };

  const openImageModal = (imageUrl) => {
    setSelectedImage(imageUrl);
  };

  const closeImageModal = () => {
    setSelectedImage(null);
  };

  const renderServiceDetails = () => {
    if (!evaluation.service_details) return null;

    if (evaluation.service_type === 'scanning') {
      const details = evaluation.service_details;
      return (
        <div style={glassCard}>
          <h4 style={{ color: '#4338ca', marginTop: 0, marginBottom: '10px' }}>รายละเอียดบริการสแกนเอกสาร</h4>
          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', 
            gap: '10px',
          }}>
            <div><strong>จำนวนเอกสารรวม:</strong> {details.doc_count || '-'}</div>
            <div><strong>ขนาดเอกสาร:</strong> {details.doc_type || '-'}</div>
            <div><strong>รูปแบบการสแกน:</strong> {getScanModeLabel(details.scan_mode)}</div>
            <div><strong>ความละเอียด:</strong> {details.resolution_dpi ? `${details.resolution_dpi} DPI` : '-'}</div>
            <div><strong>ระยะเวลาส่งงาน:</strong> {details.deadline ? `${details.deadline} วัน` : '-'}</div>
            <div><strong>คืนเอกสารแม็กเหมือนเดิม:</strong> {details.return_stapled ? 'ใช่' : 'ไม่'}</div>
            <div><strong>การตั้งชื่อไฟล์:</strong> {details.indexing_rules || '-'}</div>
            <div><strong>การตรวจรับงาน:</strong> {details.qa_process || '-'}</div>
            <div><strong>ระยะเวลาแก้ไข:</strong> {details.revision_period_days ? `${details.revision_period_days} วัน` : '-'}</div>
            <div><strong>พื้นที่สแกน:</strong> {details.scan_location === 'customer_site' ? 'พื้นที่ลูกค้า' : details.scan_location === 'our_office' ? 'สำนักงานเรา' : '-'}</div>
            {details.scan_location === 'customer_site' && (
              <>
                <div><strong>มีคอมพิวเตอร์:</strong> {details.is_pc_provided ? 'ใช่' : 'ไม่'}</div>
                <div><strong>มีโต๊ะเก้าอี้:</strong> {details.is_desk_provided ? 'ใช่' : 'ไม่'}</div>
                <div><strong>ผู้รับผิดชอบค่าไฟ:</strong> {details.electricity_payer === 'customer' ? 'ลูกค้า' : details.electricity_payer === 'company' ? 'บริษัท' : '-'}</div>
              </>
            )}
          </div>
        </div>
      );
    } else if (evaluation.service_type === 'data_entry') {
      const details = evaluation.service_details;
      return (
        <div style={glassCard}>
          <h4 style={{ color: '#4338ca', marginTop: 0, marginBottom: '10px' }}>รายละเอียดบริการบันทึกข้อมูล</h4>
          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', 
            gap: '10px',
          }}>
            <div><strong>โปรแกรมที่ใช้:</strong> {details.software_used || '-'}</div>
            <div><strong>ลักษณะข้อมูล:</strong> {details.data_complexity || '-'}</div>
            <div><strong>ระยะเวลาส่งงาน:</strong> {details.deadline ? `${details.deadline} วัน` : '-'}</div>
            <div><strong>ปริมาณข้อมูล:</strong> {details.data_volume || '-'}</div>
            <div><strong>ประเภทข้อมูล:</strong> {details.data_type || '-'}</div>
            <div><strong>ภาษาที่บันทึก:</strong> {details.entry_language || '-'}</div>
            <div><strong>รูปแบบต้นฉบับ:</strong> {details.source_format || '-'}</div>
            <div><strong>การตรวจรับงาน:</strong> {details.qa_process || '-'}</div>
            <div><strong>การแก้ไขงาน:</strong> {details.revision_process || '-'}</div>
            <div><strong>ผู้รับผิดชอบขนส่ง:</strong> {details.transport_responsibility || '-'}</div>
          </div>
        </div>
      );
    }
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
        <div style={glassTintDanger}>เกิดข้อผิดพลาด: {error}</div>
        <button
          onClick={onBack}
          style={{ ...glassButton(...buttonColors.neutral), marginTop: '10px' }}
          onMouseOver={hoverLift}
          onMouseOut={hoverReset}
        >
          กลับ
        </button>
      </div>
    );
  }

  return (
    <div>
      <style jsx>{`
        @media print {
          .no-print {
            display: none !important;
          }
          body {
            font-size: 12px;
          }
        }
      `}</style>

      <div className="no-print" style={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center', 
        marginBottom: '20px',
        flexWrap: 'wrap',
        gap: '12px',
      }}>
        <div style={glassTitlePill}>
          <span style={{ fontSize: '20px' }}>📝</span>
          <h2 style={{ color: '#1f2937', margin: 0, fontSize: '17px', fontWeight: 700 }}>รายละเอียดการประเมิน</h2>
        </div>
        <div style={{ display: 'flex', gap: '10px' }}>
          <button
            onClick={handlePrint}
            style={glassButton(...buttonColors.success)}
            onMouseOver={hoverLift}
            onMouseOut={hoverReset}
          >
            🖨️ Print
          </button>
          <button
            onClick={onBack}
            style={glassButton(...buttonColors.neutral)}
            onMouseOver={hoverLift}
            onMouseOut={hoverReset}
          >
            กลับ
          </button>
        </div>
      </div>

      <div style={glassCard}>
        <h3 style={{ color: '#1f2937', marginTop: 0, marginBottom: '15px' }}>ข้อมูลทั่วไป</h3>
        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', 
          gap: '15px' 
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
            <strong style={{ color: '#4338ca' }}>วันที่บันทึก:</strong>
            <div>{formatDate(evaluation.created_at)}</div>
          </div>
        </div>
      </div>

      {renderServiceDetails()}

      <div className="no-print">
        <BreakdownPanel evaluationId={evaluation.id} serviceType={evaluation.service_type} />
      </div>

      {evaluation.images && evaluation.images.length > 0 && (
        <div style={glassCard}>
          <h4 style={{ color: '#4338ca', marginTop: 0, marginBottom: '10px' }}>
            รูปภาพประกอบ ({evaluation.images.length} รูป)
          </h4>
          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', 
            gap: '15px' 
          }}>
            {evaluation.images.map((image, index) => (
              <div 
                key={index} 
                style={{ 
                  textAlign: 'center',
                  border: '1px solid rgba(255,255,255,0.7)',
                  borderRadius: '12px',
                  padding: '10px',
                  background: 'rgba(255,255,255,0.55)',
                  backdropFilter: 'blur(10px)',
                  WebkitBackdropFilter: 'blur(10px)',
                }}
              >
                <img
                  src={image.image_url}
                  alt={`รูปภาพที่ ${index + 1}`}
                  style={{
                    width: '100%',
                    height: '150px',
                    objectFit: 'cover',
                    borderRadius: '8px',
                    cursor: 'pointer',
                    transition: 'transform 0.2s ease'
                  }}
                  onClick={() => openImageModal(image.image_url)}
                  onMouseOver={(e) => e.target.style.transform = 'scale(1.05)'}
                  onMouseOut={(e) => e.target.style.transform = 'scale(1)'}
                />
                <p style={{ fontSize: '12px', color: '#6b7280', marginTop: '5px' }}>
                  รูปภาพที่ {index + 1}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}

      {selectedImage && (
        <div
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.75)',
            backdropFilter: 'blur(4px)',
            WebkitBackdropFilter: 'blur(4px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 9999
          }}
          onClick={closeImageModal}
        >
          <div
            style={{
              position: 'relative',
              maxWidth: '90%',
              maxHeight: '90%',
              background: 'rgba(255,255,255,0.85)',
              backdropFilter: 'blur(20px)',
              WebkitBackdropFilter: 'blur(20px)',
              borderRadius: '20px',
              border: '1px solid rgba(255,255,255,0.6)',
              padding: '20px'
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={closeImageModal}
              style={{
                position: 'absolute',
                top: '10px',
                right: '10px',
                background: 'rgba(0, 0, 0, 0.5)',
                color: 'white',
                border: 'none',
                borderRadius: '50%',
                width: '30px',
                height: '30px',
                cursor: 'pointer',
                fontSize: '18px',
                zIndex: 10000
              }}
            >
              ×
            </button>
            <img
              src={selectedImage}
              alt="รูปภาพขนาดใหญ่"
              style={{
                maxWidth: '100%',
                maxHeight: '80vh',
                objectFit: 'contain'
              }}
            />
          </div>
        </div>
      )}
    </div>
  );
}
