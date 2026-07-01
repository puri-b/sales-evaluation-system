import { glassInput } from '../styles/glass';

export default function DateSelector({ selectedDate, onDateChange }) {
  const today = new Date().toISOString().split('T')[0];

  return (
    <div style={{ marginBottom: '26px' }}>
      <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold', color: '#1f2937' }}>
        วันที่เข้าประเมินหน้างาน
      </label>
      <input
        type="date"
        value={selectedDate}
        onChange={(e) => onDateChange(e.target.value)}
        min={today}
        style={{ ...glassInput, padding: '13px 14px', fontSize: '16px' }}
        required
      />
    </div>
  );
}
