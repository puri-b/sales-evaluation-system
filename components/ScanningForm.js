import { useState } from 'react';

export default function ScanningForm({ formData, onFormChange, onNext, onBack }) {
  const [localData, setLocalData] = useState({
    salesperson_name: formData.salesperson_name || '',
    customer_name: formData.customer_name || '',
    doc_count: formData.doc_count || '',
    doc_type: formData.doc_type || '',
    scan_mode: formData.scan_mode || '',
    resolution_dpi: formData.resolution_dpi || '',
    deadline: formData.deadline || '',
    return_stapled: formData.return_stapled || false,
    indexing_rules: formData.indexing_rules || '',
    qa_process: formData.qa_process || '',
    revision_period_days: formData.revision_period_days || '',
    scan_location: formData.scan_location || '',
    is_pc_provided: formData.is_pc_provided || false,
    is_desk_provided: formData.is_desk_provided || false,
    electricity_payer: formData.electricity_payer || ''
  });

  const handleInputChange = (field, value) => {
    const newData = { ...localData, [field]: value };
    setLocalData(newData);
    onFormChange(newData);
  };

  const handleSubmit = () => {
    const requiredFields = ['salesperson_name', 'customer_name', 'doc_count', 'doc_type', 'scan_mode', 'resolution_dpi', 'deadline'];
    const missingFields = requiredFields.filter(field => !localData[field]);
    
    if (missingFields.length > 0) {
      alert('กรุณากรอกข้อมูลให้ครบถ้วน');
      return;
    }
    
    onNext();
  };

  return (
    <div style={{ maxWidth: '600px', margin: '0 auto' }}>
      <h3 style={{ marginBottom: '20px', color: '#333' }}>ข้อมูลการประเมินบริการสแกนเอกสาร</h3>
      
      <div style={{ marginBottom: '20px' }}>
        <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
          ชื่อพนักงานขาย *
        </label>
        <input
          type="text"
          value={localData.salesperson_name}
          onChange={(e) => handleInputChange('salesperson_name', e.target.value)}
          style={{
            width: '100%',
            padding: '10px',
            border: '1px solid #ddd',
            borderRadius: '5px',
            fontSize: '16px'
          }}
          placeholder="กรอกชื่อพนักงานขาย"
        />
      </div>

      <div style={{ marginBottom: '20px' }}>
        <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
          ชื่อลูกค้า *
        </label>
        <input
          type="text"
          value={localData.customer_name}
          onChange={(e) => handleInputChange('customer_name', e.target.value)}
          style={{
            width: '100%',
            padding: '10px',
            border: '1px solid #ddd',
            borderRadius: '5px',
            fontSize: '16px'
          }}
          placeholder="กรอกชื่อลูกค้า"
        />
      </div>

      <div style={{ marginBottom: '20px' }}>
        <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
          จำนวนเอกสารที่ต้องการสแกน *
        </label>
        <input
          type="number"
          value={localData.doc_count}
          onChange={(e) => handleInputChange('doc_count', e.target.value)}
          style={{
            width: '100%',
            padding: '10px',
            border: '1px solid #ddd',
            borderRadius: '5px',
            fontSize: '16px'
          }}
          placeholder="กรอกจำนวนเอกสาร"
        />
      </div>

      <div style={{ marginBottom: '20px' }}>
        <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
          ประเภทของเอกสาร *
        </label>
        <select
          value={localData.doc_type}
          onChange={(e) => handleInputChange('doc_type', e.target.value)}
          style={{
            width: '100%',
            padding: '10px',
            border: '1px solid #ddd',
            borderRadius: '5px',
            fontSize: '16px'
          }}
        >
          <option value="">เลือกประเภทเอกสาร</option>
          <option value="A1">A1</option>
          <option value="A2">A2</option>
          <option value="A3">A3</option>
          <option value="A4">A4</option>
        </select>
      </div>

      <div style={{ marginBottom: '20px' }}>
        <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
          สแกนสีหรือขาวดำ *
        </label>
        <select
          value={localData.scan_mode}
          onChange={(e) => handleInputChange('scan_mode', e.target.value)}
          style={{
            width: '100%',
            padding: '10px',
            border: '1px solid #ddd',
            borderRadius: '5px',
            fontSize: '16px'
          }}
        >
          <option value="">เลือกรูปแบบการสแกน</option>
          <option value="color">สี</option>
          <option value="black_white">ขาวดำ</option>
        </select>
      </div>

      <div style={{ marginBottom: '20px' }}>
        <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
          ความละเอียดในการสแกน (DPI) *
        </label>
        <select
          value={localData.resolution_dpi}
          onChange={(e) => handleInputChange('resolution_dpi', e.target.value)}
          style={{
            width: '100%',
            padding: '10px',
            border: '1px solid #ddd',
            borderRadius: '5px',
            fontSize: '16px'
          }}
        >
          <option value="">เลือกความละเอียด</option>
          <option value="150">150 DPI</option>
          <option value="300">300 DPI</option>
          <option value="600">600 DPI</option>
          <option value="1200">1200 DPI</option>
        </select>
      </div>

      <div style={{ marginBottom: '20px' }}>
        <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
          ระยะเวลาที่ต้องการให้แล้วเสร็จ (วัน) *
        </label>
        <input
          type="number"
          value={localData.deadline}
          onChange={(e) => handleInputChange('deadline', e.target.value)}
          style={{
            width: '100%',
            padding: '10px',
            border: '1px solid #ddd',
            borderRadius: '5px',
            fontSize: '16px'
          }}
          placeholder="กรอกจำนวนวัน"
        />
      </div>

      <div style={{ marginBottom: '20px' }}>
        <label style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <input
            type="checkbox"
            checked={localData.return_stapled}
            onChange={(e) => handleInputChange('return_stapled', e.target.checked)}
            style={{ transform: 'scale(1.2)' }}
          />
          <span style={{ fontWeight: 'bold' }}>การคืนเอกสาร - กรณีเย็บแม็กมา ต้องแม็กคืนเหมือนเดิม</span>
        </label>
      </div>

      <div style={{ marginBottom: '20px' }}>
        <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
          การจัดตั้ง Index ตั้งชื่อไฟล์สแกน
        </label>
        <textarea
          value={localData.indexing_rules}
          onChange={(e) => handleInputChange('indexing_rules', e.target.value)}
          style={{
            width: '100%',
            padding: '10px',
            border: '1px solid #ddd',
            borderRadius: '5px',
            fontSize: '16px',
            height: '80px'
          }}
          placeholder="ระบุวิธีการตั้งชื่อไฟล์และจัดเรียง"
        />
      </div>

      <div style={{ marginBottom: '20px' }}>
        <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
          การตรวจรับงาน
        </label>
        <select
          value={localData.qa_process}
          onChange={(e) => handleInputChange('qa_process', e.target.value)}
          style={{
            width: '100%',
            padding: '10px',
            border: '1px solid #ddd',
            borderRadius: '5px',
            fontSize: '16px'
          }}
        >
          <option value="">เลือกวิธีการตรวจรับงาน</option>
          <option value="manual">ตรวจสอบด้วยตนเอง</option>
          <option value="auto">ตรวจสอบอัตโนมัติ</option>
          <option value="both">ตรวจสอบทั้งสองแบบ</option>
        </select>
      </div>

      <div style={{ marginBottom: '20px' }}>
        <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
          การแก้ไขงาน (มีระยะเวลากี่วัน)
        </label>
        <input
          type="number"
          value={localData.revision_period_days}
          onChange={(e) => handleInputChange('revision_period_days', e.target.value)}
          style={{
            width: '100%',
            padding: '10px',
            border: '1px solid #ddd',
            borderRadius: '5px',
            fontSize: '16px'
          }}
          placeholder="กรอกจำนวนวันที่สามารถแก้ไขได้"
        />
      </div>

      <div style={{ marginBottom: '20px' }}>
        <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
          พื้นที่ในการสแกนเอกสาร
        </label>
        <select
          value={localData.scan_location}
          onChange={(e) => handleInputChange('scan_location', e.target.value)}
          style={{
            width: '100%',
            padding: '10px',
            border: '1px solid #ddd',
            borderRadius: '5px',
            fontSize: '16px'
          }}
        >
          <option value="">เลือกพื้นที่สแกน</option>
          <option value="customer_site">พื้นที่ลูกค้า</option>
          <option value="our_office">สำนักงานเรา</option>
        </select>
      </div>

      {localData.scan_location === 'customer_site' && (
        <>
          <div style={{ marginBottom: '20px' }}>
            <label style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <input
                type="checkbox"
                checked={localData.is_pc_provided}
                onChange={(e) => handleInputChange('is_pc_provided', e.target.checked)}
                style={{ transform: 'scale(1.2)' }}
              />
              <span style={{ fontWeight: 'bold' }}>มีเครื่องคอมพิวเตอร์ให้</span>
            </label>
          </div>

          <div style={{ marginBottom: '20px' }}>
            <label style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <input
                type="checkbox"
                checked={localData.is_desk_provided}
                onChange={(e) => handleInputChange('is_desk_provided', e.target.checked)}
                style={{ transform: 'scale(1.2)' }}
              />
              <span style={{ fontWeight: 'bold' }}>มีโต๊ะ มีเก้าอี้ให้</span>
            </label>
          </div>

          <div style={{ marginBottom: '20px' }}>
            <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
              ค่าไฟฟ้าใครเป็นผู้รับผิดชอบ
            </label>
            <select
              value={localData.electricity_payer}
              onChange={(e) => handleInputChange('electricity_payer', e.target.value)}
              style={{
                width: '100%',
                padding: '10px',
                border: '1px solid #ddd',
                borderRadius: '5px',
                fontSize: '16px'
              }}
            >
              <option value="">เลือกผู้รับผิดชอบค่าไฟฟ้า</option>
              <option value="customer">ลูกค้า</option>
              <option value="company">บริษัท</option>
            </select>
          </div>
        </>
      )}

      <div style={{ display: 'flex', gap: '10px', marginTop: '30px' }}>
        <button
          onClick={onBack}
          style={{
            flex: '1',
            padding: '15px',
            backgroundColor: '#6c757d',
            color: 'white',
            border: 'none',
            borderRadius: '8px',
            fontSize: '16px',
            cursor: 'pointer'
          }}
        >
          ย้อนกลับ
        </button>
        <button
          onClick={handleSubmit}
          style={{
            flex: '1',
            padding: '15px',
            backgroundColor: '#007bff',
            color: 'white',
            border: 'none',
            borderRadius: '8px',
            fontSize: '16px',
            cursor: 'pointer'
          }}
        >
          ถัดไป
        </button>
      </div>
    </div>
  );
}