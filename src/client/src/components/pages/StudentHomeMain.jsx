import React from 'react';

export default function StudentHomeMain({ onViewScore, onViewRegistered }) {
  // Mock data for activities
  const activities = [
    {
      id: 1, name: 'Hiến máu nhân đạo', unit: 'Đoàn trường', time: '10/06/2024', location: 'Hội trường A', volunteers: 50, image: '/activity1.jpg'
    },
    {
      id: 2, name: 'Chạy vì môi trường', unit: 'CLB Xanh', time: '15/06/2024', location: 'Công viên Lê Văn Tám', volunteers: 30, image: '/activity2.jpg'
    },
    {
      id: 3, name: 'Tư vấn hướng nghiệp', unit: 'Phòng CTSV', time: '20/06/2024', location: 'Phòng A101', volunteers: 20, image: '/activity3.jpg'
    },
  ];
  return (
    <main style={{ marginLeft: 240, padding: '32px 24px 0 24px', minHeight: '80vh', background: '#fafbfc' }}>
      <div style={{ display: 'flex', gap: 24, marginBottom: 32 }}>
        <div style={{
          flex: 1, background: '#fff', borderRadius: 12, boxShadow: '0 2px 8px #e0e0e0', padding: 24,
          display: 'flex', alignItems: 'center', justifyContent: 'space-between'
        }}>
          <div>
            <div style={{ fontWeight: 600, fontSize: 18 }}>Điểm rèn luyện</div>
            <div style={{ fontSize: 32, color: '#1976d2', fontWeight: 700 }}>85</div>
          </div>
          <button onClick={onViewScore} style={{
            background: '#1976d2', color: '#fff', border: 'none', borderRadius: 8, padding: '8px 18px', fontWeight: 500, cursor: 'pointer'
          }}>Xem thêm &rarr;</button>
        </div>
        <div style={{
          flex: 1, background: '#fff', borderRadius: 12, boxShadow: '0 2px 8px #e0e0e0', padding: 24,
          display: 'flex', alignItems: 'center', justifyContent: 'space-between'
        }}>
          <div>
            <div style={{ fontWeight: 600, fontSize: 18 }}>Đăng ký hoạt động</div>
            <div style={{ fontSize: 16, color: '#1976d2' }}>Xem các hoạt động đã đăng ký</div>
          </div>
          <button onClick={onViewRegistered} style={{
            background: '#1976d2', color: '#fff', border: 'none', borderRadius: 8, padding: '8px 18px', fontWeight: 500, cursor: 'pointer'
          }}>Xem thêm &rarr;</button>
        </div>
      </div>
      <div>
        <div style={{ fontWeight: 600, fontSize: 20, marginBottom: 16 }}>Các hoạt động đang diễn ra</div>
        <div style={{ display: 'flex', gap: 24, flexWrap: 'wrap' }}>
          {activities.map(act => (
            <div key={act.id} style={{
              background: '#fff', borderRadius: 12, boxShadow: '0 2px 8px #e0e0e0', padding: 16, width: 300
            }}>
              <img src={act.image} alt={act.name} style={{ width: '100%', height: 140, objectFit: 'cover', borderRadius: 8 }} />
              <div style={{ fontWeight: 600, fontSize: 17, margin: '12px 0 4px 0' }}>{act.name}</div>
              <div style={{ color: '#1976d2', fontSize: 15 }}>{act.unit}</div>
              <div style={{ fontSize: 14, margin: '4px 0' }}><b>Thời gian:</b> {act.time}</div>
              <div style={{ fontSize: 14 }}><b>Địa điểm:</b> {act.location}</div>
              <div style={{ fontSize: 14 }}><b>Tình nguyện viên:</b> {act.volunteers}</div>
            </div>
          ))}
        </div>
      </div>
    </main>
  );
} 