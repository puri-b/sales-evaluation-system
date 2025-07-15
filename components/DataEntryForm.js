import { useState } from 'react';

export default function DataEntryForm({ formData, onFormChange, onNext, onBack }) {
  const [localData, setLocalData] = useState({
    salesperson_name: formData.salesperson_name || '',
    customer_name: formData.customer_name || '',
    software_used: formData.software_used || '',
    data_complexity: formData.data_complexity || '',
    deadline: formData.deadline || '',
    data_volume: formData.data_volume || '',
    data_type: formData.data_type || '',
    entry_language: formData.entry_language || '',
    source_format: formData.source_format || '',
    qa_process: formData.qa_process || '',
    revision_process: formData.revision_process || '',
    transport_responsibility: formData.transport_responsibility || ''
  });

  const handleInputChange = (field, value) => {
    const newData = { ...localData, [field]: value };
    setLocalData(newData);
    onFormChange(newData);
  };

  const handleSubmit = () => {
    const requiredFields = ['salesperson_name', 'customer_name', 'software_used', 'data_complexity', 'deadline', 'data_volume', 'data_type', 'entry_language', 'source_format'];
    const missingFields = requiredFields.filter(field => !localData[field]);
    
    if (missingFields.length > 0) {
      alert('กรุณากรอกข้อมูลให้ครบถ้วน');
      return;
    }
    
    onNext();
  };

  return (
    <div style={{ maxWidth: '600px', margin: '0 auto' }}>
      <h3 style={{ marginBottom: '20px', color: '#333' }}>ข้อมูลการประเมินบริการบันทึกข้อมูล</h3>
      
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
          ชื่อโปรแกรมที่ใช้บันทึกข้อมูล *
        </label>
        <select
          value={localData.software_used}
          onChange={(e) => handleInputChange('software_used', e.target.value)}
          style={{
            width: '100%',
            padding: '10px',
            border: '1px solid #ddd',
            borderRadius: '5px',
            fontSize: '16px'
          }}
        >
          <option value="">เลือกโปรแกรม</option>
          <option value="Excel">Excel</option>
          <option value="Word">Word</option>
          <option value="Access">Access</option>
          <option value="Google Sheets">Google Sheets</option>
          <option value="Custom System">ระบบเฉพาะ</option>
          <option value="Other">อื่นๆ</option>
        </select>
      </div>

      <div style={{ marginBottom: '20px' }}>
        <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
          ลักษณะของข้อมูล *
        </label>
        <select
          value={localData.data_complexity}
          onChange={(e) => handleInputChange('data_complexity', e.target.value)}
          style={{
            width: '100%',
            padding: '10px',
            border: '1px solid #ddd',
            borderRadius: '5px',
            fontSize: '16px'
          }}
        >
          <option value="">เลือกลักษณะข้อมูล</option>
          <option value="ง่าย">ง่าย - มองเห็นได้ชัดเจน</option>
          <option value="ปานกลาง">ปานกลาง - มองเห็นได้พอสมควร</option>
          <option value="ยาก">ยาก - มองเห็นได้ยาก ต้องใช้เวลาในการแยกแยะ</option>
        </select>
      </div>

      <div style={{ marginBottom: '20px' }}>
        <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
          ระยะเวลาที่ต้องส่งข้อมูล (วัน) *
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
        <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
          ปริมาณข้อมูล *
        </label>
        <input
          type="number"
          value={localData.data_volume}
          onChange={(e) => handleInputChange('data_volume', e.target.value)}
          style={{
            width: '100%',
            padding: '10px',
            border: '1px solid #ddd',
            borderRadius: '5px',
            fontSize: '16px'
          }}
          placeholder="กรอกปริมาณข้อมูล (จำนวนหน้า/รายการ)"
        />
      </div>

      <div style={{ marginBottom: '20px' }}>
        <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
          ประเภทข้อมูล *
        </label>
        <select
          value={localData.data_type}
          onChange={(e) => handleInputChange('data_type', e.target.value)}
          style={{
            width: '100%',
            padding: '10px',
            border: '1px solid #ddd',
            borderRadius: '5px',
            fontSize: '16px'
          }}
        >
          <option value="">เลือกประเภทข้อมูล</option>
          <option value="ข้อความ">ข้อความ</option>
          <option value="ตัวเลข">ตัวเลข</option>
          <option value="ข้อความและตัวเลข">ข้อความและตัวเลข</option>
          <option value="ตาราง">ตาราง</option>
          <option value="รูปภาพ">รูปภาพ</option>
          <option value="ผสม">ผสม</option>
        </select>
      </div>

      <div style={{ marginBottom: '20px' }}>
        <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
          ภาษาที่ต้องการให้บันทึก *
        </label>
        <select
          value={localData.entry_language}
          onChange={(e) => handleInputChange('entry_language', e.target.value)}
          style={{
            width: '100%',
            padding: '10px',
            border: '1px solid #ddd',
            borderRadius: '5px',
            fontSize: '16px'
          }}
        >
          <option value="">เลือกภาษา</option>
          <option value="ไทย">ไทย</option>
          <option value="อังกฤษ">อังกฤษ</option>
          <option value="จีน">จีน</option>
          <option value="ญี่ปุ่น">ญี่ปุ่น</option>
          <option value="ไทยและอังกฤษ">ไทยและอังกฤษ</option>
          <option value="อื่นๆ">อื่นๆ</option>
        </select>
      </div>

      <div style={{ marginBottom: '20px' }}>
        <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
          ต้นฉบับเอกสารส่งมาเป็น *
        </label>
        <select
          value={localData.source_format}
          onChange={(e) => handleInputChange('source_format', e.target.value)}
          style={{
            width: '100%',
            padding: '10px',
            border: '1px solid #ddd',
            borderRadius: '5px',
            fontSize: '16px'
          }}
        >
          <option value="">เลือกรูปแบบเอกสาร</option>
          <option value="กระดาษ">กระดาษ</option>
          <option value="PDF">PDF file</option>
          <option value="รูปภาพ">รูปภาพ</option>
          <option value="ผสม">ผสม</option>
        </select>
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
          <option value="ตรวจสอบทั้งหมด">ตรวจสอบทั้งหมด</option>
          <option value="ตรวจสอบแบบสุ่ม">ตรวจสอบแบบสุ่ม</option>
          <option value="ไม่ตรวจสอบ">ไม่ตรวจสอบ</option>
        </select>
      </div>

      <div style={{ marginBottom: '20px' }}>
        <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
          การแก้ไขงาน
        </label>
        <textarea
          value={localData.revision_process}
          onChange={(e) => handleInputChange('revision_process', e.target.value)}
          style={{
            width: '100%',
            padding: '10px',
            border: '1px solid #ddd',
            borderRadius: '5px',
            fontSize: '16px',
            height: '80px'
          }}
          placeholder="ระบุกระบวนการแก้ไขงาน"
        />
      </div>

      <div style={{ marginBottom: '20px' }}>
        <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
          การรับส่งเอกสาร ใครรับผิดชอบ
        </label>
        <select
          value={localData.transport_responsibility}
          onChange={(e) => handleInputChange('transport_responsibility', e.target.value)}
          style={{
            width: '100%',
            padding: '10px',
            border: '1px solid #ddd',
            borderRadius: '5px',
            fontSize: '16px'
          }}
        >
          <option value="">เลือกผู้รับผิดชอบ</option>
          <option value="ลูกค้า">ลูกค้า</option>
          <option value="บริษัท">บริษัท</option>
          <option value="ร่วมกัน">ร่วมกัน</option>
        </select>
      </div>

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