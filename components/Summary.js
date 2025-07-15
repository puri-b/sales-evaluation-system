import { useState } from 'react';

export default function Summary({ 
  selectedService, 
  evaluationDate, 
  scanningData, 
  dataEntryData, 
  images, 
  onBack, 
  onSave 
}) {
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [selectedImage, setSelectedImage] = useState(null);

  const handleSave = async () => {
    setSaving(true);
    setError('');
    
    try {
      const serviceData = selectedService === 'scanning' ? scanningData : dataEntryData;
      
      const requestData = {
        service_type: selectedService,
        evaluation_date: evaluationDate,
        salesperson_name: serviceData.salesperson_name,
        customer_name: serviceData.customer_name,
        scanning_data: selectedService === 'scanning' ? scanningData : null,
        data_entry_data: selectedService === 'data_entry' ? dataEntryData : null,
        images: images.map(img => ({ id: img.id, name: img.name, url: img.url })) 
      };

      console.log('Sending data:', requestData);

      const response = await fetch('/api/evaluations', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestData)
      });

      const result = await response.json();
      console.log('Response:', result);

      if (result.success) {
        onSave(result.evaluation_id);
      } else {
        setError(result.message || 'เกิดข้อผิดพลาดในการบันทึกข้อมูล');
      }
    } catch (error) {
      console.error('Error saving:', error);
      setError('เกิดข้อผิดพลาดในการเชื่อมต่อกับเซิร์ฟเวอร์');
    } finally {
      setSaving(false);
    }
  };

  const openImageModal = (imageUrl) => {
    setSelectedImage(imageUrl);
  };

  const closeImageModal = () => {
    setSelectedImage(null);
  };

  const renderServiceData = () => {
    if (selectedService === 'scanning') {
      return (
        <div>
          <h4 style={{ marginBottom: '10px', color: '#007bff' }}>ข้อมูลบริการสแกนเอกสาร</h4>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '10px' }}>
            <div><strong>จำนวนเอกสาร:</strong> {scanningData.doc_count || '-'}</div>
            <div><strong>ประเภทเอกสาร:</strong> {scanningData.doc_type || '-'}</div>
            <div><strong>รูปแบบการสแกน:</strong> {scanningData.scan_mode === 'color' ? 'สี' : scanningData.scan_mode === 'black_white' ? 'ขาวดำ' : '-'}</div>
            <div><strong>ความละเอียด:</strong> {scanningData.resolution_dpi ? `${scanningData.resolution_dpi} DPI` : '-'}</div>
            <div><strong>ระยะเวลาส่งงาน:</strong> {scanningData.deadline ? `${scanningData.deadline} วัน` : '-'}</div>
            <div><strong>คืนเอกสารแม็กเหมือนเดิม:</strong> {scanningData.return_stapled ? 'ใช่' : 'ไม่'}</div>
            <div><strong>การตั้งชื่อไฟล์:</strong> {scanningData.indexing_rules || '-'}</div>
            <div><strong>การตรวจรับงาน:</strong> {scanningData.qa_process || '-'}</div>
            <div><strong>ระยะเวลาแก้ไข:</strong> {scanningData.revision_period_days ? `${scanningData.revision_period_days} วัน` : '-'}</div>
            <div><strong>พื้นที่สแกน:</strong> {scanningData.scan_location === 'customer_site' ? 'พื้นที่ลูกค้า' : scanningData.scan_location === 'our_office' ? 'สำนักงานเรา' : '-'}</div>
            {scanningData.scan_location === 'customer_site' && (
              <>
                <div><strong>มีคอมพิวเตอร์:</strong> {scanningData.is_pc_provided ? 'ใช่' : 'ไม่'}</div>
                <div><strong>มีโต๊ะเก้าอี้:</strong> {scanningData.is_desk_provided ? 'ใช่' : 'ไม่'}</div>
                <div><strong>ผู้รับผิดชอบค่าไฟ:</strong> {scanningData.electricity_payer === 'customer' ? 'ลูกค้า' : scanningData.electricity_payer === 'company' ? 'บริษัท' : '-'}</div>
              </>
            )}
          </div>
        </div>
      );
    } else if (selectedService === 'data_entry') {
      return (
        <div>
          <h4 style={{ marginBottom: '10px', color: '#007bff' }}>ข้อมูลบริการบันทึกข้อมูล</h4>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '10px' }}>
            <div><strong>โปรแกรมที่ใช้:</strong> {dataEntryData.software_used || '-'}</div>
            <div><strong>ลักษณะข้อมูล:</strong> {dataEntryData.data_complexity || '-'}</div>
            <div><strong>ระยะเวลาส่งงาน:</strong> {dataEntryData.deadline ? `${dataEntryData.deadline} วัน` : '-'}</div>
            <div><strong>ปริมาณข้อมูล:</strong> {dataEntryData.data_volume || '-'}</div>
            <div><strong>ประเภทข้อมูล:</strong> {dataEntryData.data_type || '-'}</div>
            <div><strong>ภาษาที่บันทึก:</strong> {dataEntryData.entry_language || '-'}</div>
            <div><strong>รูปแบบต้นฉบับ:</strong> {dataEntryData.source_format || '-'}</div>
            <div><strong>การตรวจรับงาน:</strong> {dataEntryData.qa_process || '-'}</div>
            <div><strong>การแก้ไขงาน:</strong> {dataEntryData.revision_process || '-'}</div>
            <div><strong>ผู้รับผิดชอบขนส่ง:</strong> {dataEntryData.transport_responsibility || '-'}</div>
          </div>
        </div>
      );
    }
  };

  return (
    <div style={{ maxWidth: '800px', margin: '0 auto' }}>
      <h3 style={{ marginBottom: '20px', color: '#333', textAlign: 'center' }}>
        สรุปข้อมูลการประเมิน
      </h3>
      
      {error && (
        <div style={{
          backgroundColor: '#f8d7da',
          color: '#721c24',
          padding: '10px',
          borderRadius: '5px',
          marginBottom: '20px',
          border: '1px solid #f5c6cb'
        }}>
          {error}
        </div>
      )}
      
      <div style={{ 
        backgroundColor: '#f8f9fa', 
        padding: '20px', 
        borderRadius: '8px', 
        marginBottom: '20px' 
      }}>
        <h4 style={{ marginBottom: '10px', color: '#007bff' }}>ข้อมูลทั่วไป</h4>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '10px' }}>
          <div><strong>บริการที่เลือก:</strong> {selectedService === 'scanning' ? 'บริการสแกนเอกสาร' : 'บริการบันทึกข้อมูล'}</div>
          <div><strong>วันที่ประเมิน:</strong> {evaluationDate}</div>
          <div><strong>ชื่อพนักงานขาย:</strong> {selectedService === 'scanning' ? scanningData.salesperson_name : dataEntryData.salesperson_name}</div>
          <div><strong>ชื่อลูกค้า:</strong> {selectedService === 'scanning' ? scanningData.customer_name : dataEntryData.customer_name}</div>
        </div>
      </div>

      <div style={{ 
        backgroundColor: '#ffffff', 
        padding: '20px', 
        borderRadius: '8px', 
        marginBottom: '20px',
        border: '1px solid #e0e0e0'
      }}>
        {renderServiceData()}
      </div>

      {images.length > 0 && (
        <div style={{ 
          backgroundColor: '#f8f9fa', 
          padding: '20px', 
          borderRadius: '8px', 
          marginBottom: '20px' 
        }}>
          <h4 style={{ marginBottom: '10px', color: '#007bff' }}>รูปภาพประกอบ ({images.length} รูป)</h4>
          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', 
            gap: '10px' 
          }}>
            {images.map((image, index) => (
              <div 
                key={index} 
                style={{ 
                  textAlign: 'center',
                  border: '1px solid #ddd',
                  borderRadius: '8px',
                  padding: '10px',
                  backgroundColor: 'white'
                }}
              >
                <img
                  src={image.url}
                  alt={`รูปภาพที่ ${index + 1}`}
                  style={{
                    width: '100%',
                    height: '120px',
                    objectFit: 'cover',
                    borderRadius: '5px',
                    border: '1px solid #ddd',
                    cursor: 'pointer',
                    transition: 'transform 0.2s ease'
                  }}
                  onClick={() => openImageModal(image.url)}
                  onMouseOver={(e) => e.target.style.transform = 'scale(1.05)'}
                  onMouseOut={(e) => e.target.style.transform = 'scale(1)'}
                />
                <p style={{ fontSize: '12px', color: '#666', marginTop: '5px', wordBreak: 'break-all' }}>
                  {image.name}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}

      <div style={{ display: 'flex', gap: '10px', marginTop: '30px' }}>
        <button
          onClick={onBack}
          disabled={saving}
          style={{
            flex: '1',
            padding: '15px',
            backgroundColor: saving ? '#ccc' : '#6c757d',
            color: 'white',
            border: 'none',
            borderRadius: '8px',
            fontSize: '16px',
            cursor: saving ? 'not-allowed' : 'pointer'
          }}
        >
          ย้อนกลับ
        </button>
        <button
          onClick={handleSave}
          disabled={saving}
          style={{
            flex: '2',
            padding: '15px',
            backgroundColor: saving ? '#ccc' : '#28a745',
            color: 'white',
            border: 'none',
            borderRadius: '8px',
            fontSize: '16px',
            fontWeight: 'bold',
            cursor: saving ? 'not-allowed' : 'pointer'
          }}
        >
          {saving ? 'กำลังบันทึก...' : 'บันทึกข้อมูล'}
        </button>
      </div>

      {/* Modal แสดงรูปภาพขนาดใหญ่ */}
      {selectedImage && (
        <div
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.8)',
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
              backgroundColor: 'white',
              borderRadius: '8px',
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