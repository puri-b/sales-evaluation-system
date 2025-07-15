export default function SaveSuccess({ evaluationId, onNewEvaluation, onViewAll }) {
  return (
    <div style={{ maxWidth: '600px', margin: '0 auto', textAlign: 'center' }}>
      <div style={{
        backgroundColor: '#d4edda',
        color: '#155724',
        padding: '20px',
        borderRadius: '8px',
        border: '1px solid #c3e6cb',
        marginBottom: '20px'
      }}>
        <h3 style={{ margin: '0 0 10px 0' }}>✅ บันทึกข้อมูลสำเร็จ</h3>
        <p style={{ margin: '0' }}>
          รหัสการประเมิน: <strong>#{evaluationId}</strong>
        </p>
      </div>

      <div style={{
        backgroundColor: '#f8f9fa',
        padding: '20px',
        borderRadius: '8px',
        marginBottom: '20px'
      }}>
        <h4 style={{ marginBottom: '10px', color: '#333' }}>
          ข้อมูลของคุณได้รับการบันทึกแล้ว
        </h4>
        <p style={{ color: '#666', margin: '0' }}>
          คุณสามารถดูข้อมูลทั้งหมดหรือเริ่มการประเมินใหม่ได้
        </p>
      </div>

      <div style={{ display: 'flex', gap: '10px', justifyContent: 'center' }}>
        <button
          onClick={onNewEvaluation}
          style={{
            padding: '15px 30px',
            backgroundColor: '#007bff',
            color: 'white',
            border: 'none',
            borderRadius: '8px',
            fontSize: '16px',
            cursor: 'pointer'
          }}
        >
          ประเมินใหม่
        </button>
        <button
          onClick={onViewAll}
          style={{
            padding: '15px 30px',
            backgroundColor: '#28a745',
            color: 'white',
            border: 'none',
            borderRadius: '8px',
            fontSize: '16px',
            cursor: 'pointer'
          }}
        >
          ดูข้อมูลทั้งหมด
        </button>
      </div>
    </div>
  );
}