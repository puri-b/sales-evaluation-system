import { useState } from 'react';
import { glassCard, glassFileInput, glassButton, buttonColors, hoverLift, hoverReset, glassTintInfo } from '../styles/glass';

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
          id: file.id,
          name: file.name,
          mimetype: file.mimetype,
          size: file.size,
          url: `/api/image/${file.id}` // URL สำหรับแสดงรูป
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
      <h3 style={{ marginBottom: '20px', color: '#1f2937' }}>แนบรูปภาพประกอบ</h3>

      <div style={glassCard}>
        <label style={{ display: 'block', marginBottom: '10px', fontWeight: 'bold', color: '#1f2937' }}>
          เลือกรูปภาพ (สามารถเลือกได้หลายรูป)
        </label>
        <input
          type="file"
          accept="image/*"
          multiple
          onChange={handleFileChange}
          disabled={uploading}
          style={{ ...glassFileInput, cursor: uploading ? 'not-allowed' : 'pointer', opacity: uploading ? 0.6 : 1 }}
        />
        <p style={{ fontSize: '14px', color: '#6b7280', marginTop: '8px', marginBottom: 0 }}>
          รองรับไฟล์: JPG, PNG, GIF (ขนาดไฟล์ไม่เกิน 5MB ต่อรูป)
        </p>
        {uploading && (
          <p style={{ color: '#4338ca', marginTop: '10px', marginBottom: 0 }}>
            กำลังอัพโหลด...
          </p>
        )}
      </div>

      {uploadedImages.length > 0 && (
        <div style={glassCard}>
          <h4 style={{ marginTop: 0, marginBottom: '12px', color: '#1f2937' }}>
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
                  border: '1px solid rgba(255,255,255,0.7)',
                  borderRadius: '14px',
                  overflow: 'hidden',
                  background: 'rgba(255,255,255,0.6)',
                  backdropFilter: 'blur(10px)',
                  WebkitBackdropFilter: 'blur(10px)',
                  boxShadow: '0 4px 14px rgba(31,38,135,0.08)',
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
                  top: '6px',
                  right: '6px',
                  background: 'linear-gradient(135deg, #f87171, #dc2626)',
                  color: 'white',
                  border: '1px solid rgba(255,255,255,0.5)',
                  borderRadius: '50%',
                  width: '26px',
                  height: '26px',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '14px',
                  boxShadow: '0 4px 10px rgba(0,0,0,0.2)',
                }}
                onClick={() => removeImage(index)}
                >
                  ×
                </div>
                <div style={{
                  padding: '8px',
                  fontSize: '12px',
                  color: '#6b7280',
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

      <div style={glassTintInfo}>
        <h4 style={{ marginTop: 0, marginBottom: '10px' }}>
          💡 คำแนะนำการถ่ายรูป
        </h4>
        <ul style={{ margin: 0, paddingLeft: '20px' }}>
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
          style={{ ...glassButton(...buttonColors.neutral), flex: '1', opacity: uploading ? 0.6 : 1, cursor: uploading ? 'not-allowed' : 'pointer' }}
          onMouseOver={uploading ? undefined : hoverLift}
          onMouseOut={uploading ? undefined : hoverReset}
        >
          ย้อนกลับ
        </button>
        <button
          onClick={handleNext}
          disabled={uploading}
          style={{ ...glassButton(...buttonColors.primary), flex: '1', opacity: uploading ? 0.6 : 1, cursor: uploading ? 'not-allowed' : 'pointer' }}
          onMouseOver={uploading ? undefined : hoverLift}
          onMouseOut={uploading ? undefined : hoverReset}
        >
          ถัดไป
        </button>
      </div>
    </div>
  );
}
