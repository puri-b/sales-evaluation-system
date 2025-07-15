export default function ServiceSelector({ selectedService, onServiceChange }) {
  const services = [
    { id: 'scanning', name: 'บริการสแกนเอกสาร', icon: '📄' },
    { id: 'data_entry', name: 'บริการบันทึกข้อมูล', icon: '💻' }
  ];

  return (
    <div style={{ marginBottom: '30px' }}>
      <h3 style={{ marginBottom: '15px', color: '#333' }}>เลือกบริการที่ต้องการ</h3>
      <div style={{ display: 'flex', gap: '15px', flexWrap: 'wrap' }}>
        {services.map(service => (
          <div
            key={service.id}
            onClick={() => onServiceChange(service.id)}
            style={{
              flex: '1',
              minWidth: '200px',
              padding: '20px',
              border: selectedService === service.id ? '3px solid #007bff' : '2px solid #ddd',
              borderRadius: '12px',
              textAlign: 'center',
              cursor: 'pointer',
              backgroundColor: selectedService === service.id ? '#f0f8ff' : 'white',
              transition: 'all 0.3s ease',
              boxShadow: selectedService === service.id ? '0 4px 12px rgba(0,123,255,0.3)' : '0 2px 4px rgba(0,0,0,0.1)'
            }}
          >
            <div style={{ fontSize: '48px', marginBottom: '10px' }}>{service.icon}</div>
            <h4 style={{ color: selectedService === service.id ? '#007bff' : '#333' }}>
              {service.name}
            </h4>
          </div>
        ))}
      </div>
    </div>
  );
}