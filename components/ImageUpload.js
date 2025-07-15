import { useState } from 'react';

export default function ImageUpload({ images, onImagesChange, onNext, onBack }) {
  const [uploadedImages, setUploadedImages] = useState(images || []);
  const [uploading, setUploading] = useState(false);

  const handleFileChange = async (e) => {
    const files = Array.from(e.target.files);
    
    if (files.length === 0) return;

    setUploading(true);
    
    try {
      const formData = new FormData();
      files.forEach(file => {
        formData.append('files', file);
      });

      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });

      const result = await response.json();

      if (result.success) {
        const newImages = result.files.map(file => ({
          name: file.name,
          filename: file.filename,
          url: file.path,
          size: file.size
        }));

        const allImages = [...uploadedImages, ...newImages];
        setUploadedImages(allImages);
        onImagesChange(allImages);
      } else {
        alert('เกิดข้อผิดพลาดในการอัพโหลด: ' + result.message);
      }
    } catch (error) {
      console.error('Upload error:', error);
      alert('เกิดข้อผิดพลาดในการอัพโหลด');
    } finally {
      setUploading(false);
    }
  };

  const removeImage = (index) => {
    const newImages = uploadedImages.filter((_, i) => i !== index);
    setUploadedImages(newImages);
    onImagesChange(newImages);
  };

  const handleNext = () => {
    if (uploadedImages.length === 0) {
      alert('กรุณาแนบรูปภาพอย่างน้อย 1 รูป');
      return;
    }
    onNext();
  };

  return (
    <div style={{ maxWidth: '600px', margin: '0 auto' }}>
      <h3 style={{ marginBottom: '20px', color: '#333' }}>แนบรูปภาพประกอบ</h3>
      
      <div style={{ marginBottom: '20px' }}>
        <label style={{ display: 'block', marginBottom: '10px', fontWeight: 'bold' }}>
          เลือกรูปภาพ (สามารถเลือกได้หลายรูป)
        </label>
        <input
          type="file"
          accept="image/*"
          multiple
          onChange={handleFileChange}
          disabled={uploading}
          style={{
            width: '100%',
            padding: '10px',
            border: '2px dashed #ddd',
            borderRadius: '8px',
            fontSize: '16px',
            cursor: uploading ? 'not-allowed' : 'pointer',
            backgroundColor: uploading ? '#f5f5f5' : '#f9f9f9'
          }}
        />
        <p style={{ 
          fontSize: '14px', 
          color: '#666', 
          marginTop: '5px' 
        }}>
          รองรับไฟล์: JPG, PNG, GIF (ขนาดไฟล์ไม่เกิน 5MB ต่อรูป)
        </p>
        {uploading && (
          <p style={{ color: '#007bff', marginTop: '10px' }}>
            กำลังอัพโหลด...
          </p>
        )}
      </div>

      {uploadedImages.length > 0 && (
        <div style={{ marginBottom: '20px' }}>
          <h4 style={{ marginBottom: '10px', color: '#333' }}>
            รูปภาพที่แนบ ({uploadedImages.length} รูป)
          </h4>
          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))',
            gap: '15px'
          }}>
            {uploadedImages.map((image, index) => (
              <div 
                key={index}
                style={{
                  position: 'relative',
                  border: '2px solid #ddd',
                  borderRadius: '8px',
                  overflow: 'hidden',
                  backgroundColor: 'white'
                }}
              >
                <img
                  src={image.url}
                  alt={`รูปภาพที่ ${index + 1}`}
                  style={{
                    width: '100%',
                    height: '120px',
                    objectFit: 'cover'
                  }}
                />
                <div style={{
                  position: 'absolute',
                  top: '5px',
                  right: '5px',
                  backgroundColor: 'rgba(255,0,0,0.8)',
                  color: 'white',
                  border: 'none',
                  borderRadius: '50%',
                  width: '25px',
                  height: '25px',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '14px'
                }}
                onClick={() => removeImage(index)}
                >
                  ×
                </div>
                <div style={{
                  padding: '8px',
                  fontSize: '12px',
                  color: '#666',
                  textAlign: 'center',
                  wordBreak: 'break-all'
                }}>
                  {image.name}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <div style={{ 
        padding: '15px',
        backgroundColor: '#e3f2fd',
        borderRadius: '8px',
        marginBottom: '20px'
      }}>
        <h4 style={{ marginBottom: '10px', color: '#1976d2' }}>
          💡 คำแนะนำการถ่ายรูป
        </h4>
        <ul style={{ 
          margin: '0',
          paddingLeft: '20px',
          color: '#333'
        }}>
          <li>ถ่ายรูปให้ชัดเจน เห็นรายละเอียดได้ดี</li>
          <li>ถ่ายภาพรวมของพื้นที่ทำงาน</li>
          <li>ถ่ายตัวอย่างเอกสารที่ต้องการประมวลผล</li>
          <li>ถ่ายอุปกรณ์ที่เกี่ยวข้อง (ถ้ามี)</li>
        </ul>
      </div>

      <div style={{ display: 'flex', gap: '10px', marginTop: '30px' }}>
        <button
          onClick={onBack}
          disabled={uploading}
          style={{
            flex: '1',
            padding: '15px',
            backgroundColor: uploading ? '#ccc' : '#6c757d',
            color: 'white',
            border: 'none',
            borderRadius: '8px',
            fontSize: '16px',
            cursor: uploading ? 'not-allowed' : 'pointer'
          }}
        >
          ย้อนกลับ
        </button>
        <button
          onClick={handleNext}
          disabled={uploading}
          style={{
            flex: '1',
            padding: '15px',
            backgroundColor: uploading ? '#ccc' : '#007bff',
            color: 'white',
            border: 'none',
            borderRadius: '8px',
            fontSize: '16px',
            cursor: uploading ? 'not-allowed' : 'pointer'
          }}
        >
          ถัดไป
        </button>
      </div>
    </div>
  );
}