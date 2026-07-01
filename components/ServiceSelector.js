import { glassSelectableCard } from '../styles/glass';

export default function ServiceSelector({ selectedService, onServiceChange }) {
  const services = [
    { id: 'scanning', name: 'บริการสแกนเอกสาร', icon: '📄' },
    { id: 'data_entry', name: 'บริการบันทึกข้อมูล', icon: '💻' }
  ];

  return (
    <div style={{ marginBottom: '26px' }}>
      <h3 style={{ marginBottom: '15px', color: '#1f2937' }}>เลือกบริการที่ต้องการ</h3>
      <div style={{ display: 'flex', gap: '15px', flexWrap: 'wrap' }}>
        {services.map(service => {
          const active = selectedService === service.id;
          return (
            <div
              key={service.id}
              onClick={() => onServiceChange(service.id)}
              style={{ ...glassSelectableCard(active), flex: '1', minWidth: '200px' }}
            >
              <div style={{ fontSize: '48px', marginBottom: '10px' }}>{service.icon}</div>
              <h4 style={{ color: active ? '#4338ca' : '#1f2937', margin: 0 }}>
                {service.name}
              </h4>
            </div>
          );
        })}
      </div>
    </div>
  );
}
