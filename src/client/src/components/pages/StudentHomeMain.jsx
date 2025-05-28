import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

export default function StudentHomeMain({ onViewScore, onViewRegistered }) {
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [point, setPoint] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    // Lấy các hoạt động đang mở đăng ký hoặc đang diễn ra
    fetch('/activity')
      .then(res => res.json())
      .then(data => {
        // Nếu API trả về { activities: [...] }
        setActivities(data.activities || []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  useEffect(() => {
    // Lấy điểm rèn luyện thật
    fetch('/student/me')
      .then(res => res.json())
      .then(data => setPoint(data.point))
      .catch(() => setPoint(null));
  }, []);

  return (
    <main style={{ marginLeft: 240, padding: '32px 24px 0 24px', minHeight: '80vh', background: '#fafbfc' }}>
      <div style={{ display: 'flex', gap: 24, marginBottom: 32 }}>
        <div style={{
          flex: 1, background: '#fff', borderRadius: 12, boxShadow: '0 2px 8px #e0e0e0', padding: 24,
          display: 'flex', alignItems: 'center', justifyContent: 'space-between'
        }}>
          <div>
            <div style={{ fontWeight: 600, fontSize: 18 }}>Điểm rèn luyện</div>
            <div style={{ fontSize: 32, color: '#1976d2', fontWeight: 700 }}>{point !== null ? point : '...'}</div>
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
          <button onClick={() => navigate('/student/register')} style={{
            background: '#1976d2', color: '#fff', border: 'none', borderRadius: 8, padding: '8px 18px', fontWeight: 500, cursor: 'pointer'
          }}>Xem thêm &rarr;</button>
        </div>
      </div>
      <div>
        <div style={{ fontWeight: 600, fontSize: 20, marginBottom: 16 }}>Các hoạt động đang diễn ra</div>
        {loading ? <div>Đang tải hoạt động...</div> : (
        <div style={{ display: 'flex', gap: 24, flexWrap: 'wrap' }}>
          {activities.map(act => (
            <div key={act.activityID} style={{
              background: '#fff', borderRadius: 12, boxShadow: '0 2px 8px #e0e0e0', padding: 16, width: 300
            }}>
              {act.image && <img src={act.image} alt={act.name} style={{ width: '100%', height: 140, objectFit: 'cover', borderRadius: 8 }} />}
              <div style={{ fontWeight: 600, fontSize: 17, margin: '12px 0 4px 0' }}>{act.name}</div>
              <div style={{ color: '#1976d2', fontSize: 15 }}>{act.organizerName || act.unit || ''}</div>
              <div style={{ fontSize: 14, margin: '4px 0' }}><b>Thời gian:</b> {act.eventStart ? new Date(act.eventStart).toLocaleString() : ''}</div>
              <div style={{ fontSize: 14 }}><b>Địa điểm:</b> {act.location}</div>
              <div style={{ fontSize: 14 }}><b>Số lượng:</b> {act.capacity || ''}</div>
            </div>
          ))}
        </div>
        )}
      </div>
    </main>
  );
} 