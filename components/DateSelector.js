export default function DateSelector({ selectedDate, onDateChange }) {
  const today = new Date().toISOString().split('T')[0];
  
  return (
    <div style={{ marginBottom: '30px' }}>
      <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold', color: '#333' }}>
        วันที่เข้าประเมินหน้างาน
      </label>
      <input
        type="date"
        value={selectedDate}
        onChange={(e) => onDateChange(e.target.value)}
        min={today}
        style={{
          width: '100%',
          padding: '12px',
          border: '2px solid #ddd',
          borderRadius: '8px',
          fontSize: '16px',
          backgroundColor: 'white'
        }}
        required
      />
    </div>
  );
}