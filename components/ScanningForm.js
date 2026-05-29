import { useState } from 'react';

const DOCUMENT_SIZE_OPTIONS = ['A0', 'A1', 'A2', 'A3', 'A4', 'A5', 'อื่นๆ'];

const inputStyle = {
  width: '100%',
  padding: '10px',
  border: '1px solid #ddd',
  borderRadius: '5px',
  fontSize: '16px'
};

const sectionCardStyle = {
  border: '1px solid #e5e7eb',
  borderRadius: '10px',
  padding: '15px',
  backgroundColor: '#f8f9fa',
  marginBottom: '20px'
};

const createDefaultDocumentSize = () => ({
  doc_type: '',
  doc_count: '',
  custom_doc_type: ''
});

const normalizeDocumentSizes = (formData) => {
  if (Array.isArray(formData.document_sizes) && formData.document_sizes.length > 0) {
    return formData.document_sizes.map((item) => ({
      doc_type: item.doc_type || '',
      doc_count: item.doc_count || '',
      custom_doc_type: item.custom_doc_type || ''
    }));
  }

  return [
    {
      doc_type: formData.doc_type || '',
      doc_count: formData.doc_count || '',
      custom_doc_type: ''
    }
  ];
};

const getDisplayDocType = (item) => {
  if (!item) return '';
  if (item.doc_type === 'อื่นๆ') return item.custom_doc_type || 'อื่นๆ';
  return item.doc_type || '';
};

const calculateDocumentSummary = (documentSizes) => {
  const validItems = documentSizes.filter((item) => getDisplayDocType(item) && item.doc_count);
  const totalCount = validItems.reduce((sum, item) => sum + (parseFloat(item.doc_count) || 0), 0);
  const docTypeSummary = validItems
    .map((item) => `${getDisplayDocType(item)}: ${item.doc_count}`)
    .join(', ');

  return {
    doc_count: totalCount > 0 ? String(totalCount) : '',
    doc_type: docTypeSummary
  };
};

export default function ScanningForm({ formData, onFormChange, onNext, onBack }) {
  const initialDocumentSizes = normalizeDocumentSizes(formData);
  const initialSummary = calculateDocumentSummary(initialDocumentSizes);

  const [localData, setLocalData] = useState({
    salesperson_name: formData.salesperson_name || '',
    customer_name: formData.customer_name || '',
    doc_count: initialSummary.doc_count || formData.doc_count || '',
    doc_type: initialSummary.doc_type || formData.doc_type || '',
    document_sizes: initialDocumentSizes,
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
    electricity_payer: formData.electricity_payer || '',
    training_required: formData.training_required || false,
    food_location: formData.food_location || ''
  });

  const updateLocalData = (newData) => {
    setLocalData(newData);
    onFormChange(newData);
  };

  const handleInputChange = (field, value) => {
    const newData = { ...localData, [field]: value };
    updateLocalData(newData);
  };

  const handleDocumentSizeChange = (index, field, value) => {
    const updatedDocumentSizes = localData.document_sizes.map((item, itemIndex) => {
      if (itemIndex !== index) return item;

      const updatedItem = { ...item, [field]: value };

      if (field === 'doc_type' && value !== 'อื่นๆ') {
        updatedItem.custom_doc_type = '';
      }

      return updatedItem;
    });

    const summary = calculateDocumentSummary(updatedDocumentSizes);
    const newData = {
      ...localData,
      document_sizes: updatedDocumentSizes,
      doc_count: summary.doc_count,
      doc_type: summary.doc_type
    };

    updateLocalData(newData);
  };

  const addDocumentSize = () => {
    const updatedDocumentSizes = [...localData.document_sizes, createDefaultDocumentSize()];
    const summary = calculateDocumentSummary(updatedDocumentSizes);

    updateLocalData({
      ...localData,
      document_sizes: updatedDocumentSizes,
      doc_count: summary.doc_count,
      doc_type: summary.doc_type
    });
  };

  const removeDocumentSize = (index) => {
    if (localData.document_sizes.length === 1) return;

    const updatedDocumentSizes = localData.document_sizes.filter((_, itemIndex) => itemIndex !== index);
    const summary = calculateDocumentSummary(updatedDocumentSizes);

    updateLocalData({
      ...localData,
      document_sizes: updatedDocumentSizes,
      doc_count: summary.doc_count,
      doc_type: summary.doc_type
    });
  };

  const handleSubmit = () => {
    const requiredFields = ['salesperson_name', 'customer_name', 'scan_mode', 'resolution_dpi', 'deadline'];
    const missingFields = requiredFields.filter(field => !localData[field]);

    const hasIncompleteDocumentSize = localData.document_sizes.some((item) => {
      const hasDocType = item.doc_type && (item.doc_type !== 'อื่นๆ' || item.custom_doc_type);
      const hasDocCount = item.doc_count && parseFloat(item.doc_count) > 0;
      return !hasDocType || !hasDocCount;
    });
    
    if (missingFields.length > 0 || hasIncompleteDocumentSize) {
      alert('กรุณากรอกข้อมูลให้ครบถ้วน โดยเฉพาะขนาดเอกสารและจำนวนเอกสารแต่ละขนาด');
      return;
    }
    
    onNext();
  };

  return (
    <div style={{ maxWidth: '650px', margin: '0 auto' }}>
      <h3 style={{ marginBottom: '20px', color: '#333' }}>ข้อมูลการประเมินบริการสแกนเอกสาร</h3>
      
      <div style={{ marginBottom: '20px' }}>
        <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
          ชื่อพนักงานขาย *
        </label>
        <input
          type="text"
          value={localData.salesperson_name}
          onChange={(e) => handleInputChange('salesperson_name', e.target.value)}
          style={inputStyle}
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
          style={inputStyle}
          placeholder="กรอกชื่อลูกค้า"
        />
      </div>

      <div style={sectionCardStyle}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '10px', marginBottom: '10px' }}>
          <div>
            <label style={{ display: 'block', marginBottom: '4px', fontWeight: 'bold' }}>
              ขนาดเอกสารและจำนวนเอกสาร *
            </label>
            <div style={{ fontSize: '13px', color: '#666' }}>
              กรณีมีเอกสารหลายขนาด เช่น A4 และ A3 ให้กด “เพิ่มขนาดเอกสาร”
            </div>
          </div>
          <button
            type="button"
            onClick={addDocumentSize}
            style={{
              padding: '10px 12px',
              backgroundColor: '#28a745',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              fontSize: '14px',
              fontWeight: 'bold',
              cursor: 'pointer',
              whiteSpace: 'nowrap'
            }}
          >
            + เพิ่มขนาดเอกสาร
          </button>
        </div>

        {localData.document_sizes.map((item, index) => (
          <div
            key={index}
            style={{
              backgroundColor: 'white',
              border: '1px solid #ddd',
              borderRadius: '8px',
              padding: '12px',
              marginBottom: '10px'
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
              <strong>รายการที่ {index + 1}</strong>
              {localData.document_sizes.length > 1 && (
                <button
                  type="button"
                  onClick={() => removeDocumentSize(index)}
                  style={{
                    padding: '6px 10px',
                    backgroundColor: '#dc3545',
                    color: 'white',
                    border: 'none',
                    borderRadius: '6px',
                    fontSize: '13px',
                    cursor: 'pointer'
                  }}
                >
                  ลบ
                </button>
              )}
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
              <div>
                <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
                  ขนาดเอกสาร *
                </label>
                <select
                  value={item.doc_type}
                  onChange={(e) => handleDocumentSizeChange(index, 'doc_type', e.target.value)}
                  style={inputStyle}
                >
                  <option value="">เลือกขนาดเอกสาร</option>
                  {DOCUMENT_SIZE_OPTIONS.map((size) => (
                    <option key={size} value={size}>{size}</option>
                  ))}
                </select>
              </div>

              <div>
                <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
                  จำนวนเอกสาร *
                </label>
                <input
                  type="number"
                  min="1"
                  value={item.doc_count}
                  onChange={(e) => handleDocumentSizeChange(index, 'doc_count', e.target.value)}
                  style={inputStyle}
                  placeholder="ระบุจำนวน"
                />
              </div>
            </div>

            {item.doc_type === 'อื่นๆ' && (
              <div style={{ marginTop: '10px' }}>
                <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
                  ระบุขนาดเอกสารอื่นๆ *
                </label>
                <input
                  type="text"
                  value={item.custom_doc_type}
                  onChange={(e) => handleDocumentSizeChange(index, 'custom_doc_type', e.target.value)}
                  style={inputStyle}
                  placeholder="เช่น Legal, Letter, ขนาดพิเศษ"
                />
              </div>
            )}
          </div>
        ))}

        <div style={{
          backgroundColor: '#e9f7ef',
          border: '1px solid #b7e4c7',
          borderRadius: '8px',
          padding: '10px',
          color: '#155724'
        }}>
          <div><strong>จำนวนเอกสารรวม:</strong> {localData.doc_count || 0}</div>
          <div><strong>สรุปขนาดเอกสาร:</strong> {localData.doc_type || '-'}</div>
        </div>
      </div>

      <div style={{ marginBottom: '20px' }}>
        <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
          สแกนสีหรือขาวดำ *
        </label>
        <select
          value={localData.scan_mode}
          onChange={(e) => handleInputChange('scan_mode', e.target.value)}
          style={inputStyle}
        >
          <option value="">เลือกรูปแบบการสแกน</option>
          <option value="original">ตามต้นฉบับ</option>
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
          style={inputStyle}
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
          style={inputStyle}
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
          style={{ ...inputStyle, height: '80px' }}
          placeholder="ระบุวิธีการตั้งชื่อไฟล์และจัดเรียง"
        />
      </div>

      <div style={{ marginBottom: '20px' }}>
        <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
          การตรวจรับงาน
        </label>
        <textarea
          value={localData.qa_process}
          onChange={(e) => handleInputChange('qa_process', e.target.value)}
          style={{ ...inputStyle, height: '100px' }}
          placeholder="ระบุรายละเอียดการตรวจรับงาน เช่น วิธีการตรวจสอบคุณภาพ, เกณฑ์การยอมรับ, ขั้นตอนการรับมอบงาน ฯลฯ"
        />
      </div>

      <div style={{ marginBottom: '20px' }}>
        <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
          การแก้ไขงาน (มีระยะเวลากี่วัน)
        </label>
        <input
          type="number"
          value={localData.revision_period_days}
          onChange={(e) => handleInputChange('revision_period_days', e.target.value)}
          style={inputStyle}
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
          style={inputStyle}
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
              style={inputStyle}
            >
              <option value="">เลือกผู้รับผิดชอบค่าไฟฟ้า</option>
              <option value="customer">ลูกค้า</option>
              <option value="company">บริษัท</option>
            </select>
          </div>
        </>
      )}

      <div style={{ marginBottom: '20px' }}>
        <label style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <input
            type="checkbox"
            checked={localData.training_required}
            onChange={(e) => handleInputChange('training_required', e.target.checked)}
            style={{ transform: 'scale(1.2)' }}
          />
          <span style={{ fontWeight: 'bold' }}>ต้องมีการอบรมก่อนเริ่มงานหรือไม่</span>
        </label>
      </div>

      <div style={{ marginBottom: '20px' }}>
        <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
          บริเวณสถานที่ทำงานมีที่กินอาหารหรือไม่
        </label>
        <textarea
          value={localData.food_location}
          onChange={(e) => handleInputChange('food_location', e.target.value)}
          style={{ ...inputStyle, height: '60px' }}
          placeholder="ระบุสถานที่กินอาหาร เช่น โรงอาหาร ร้านอาหารใกล้เคียง หรือไม่มี"
        />
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