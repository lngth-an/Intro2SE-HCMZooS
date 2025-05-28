import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

export default function OrganizerHomeMain() {
  const [activities, setActivities] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    fetch('/activity?status=published')
      .then(res => res.json())
      .then(data => setActivities(data.activities || []));
  }, []);

  return (
    <main style={{ marginLeft: 220, padding: '32px 24px 0 24px', minHeight: '80vh', background: '#fafbfc' }}>
      <div style={{ display: 'flex', gap: 24, marginBottom: 32 }}>
        <div style={{
          flex: 1, background: '#fff', borderRadius: 12, boxShadow: '0 2px 8px #e0e0e0', padding: 24,
          display: 'flex', alignItems: 'center', justifyContent: 'space-between'
        }}>
          <div>
            <div style={{ fontWeight: 600, fontSize: 18 }}>Xem các hoạt động</div>
          </div>
          <button onClick={() => navigate('/organizer/activities')} style={{
            background: '#1976d2', color: '#fff', border: 'none', borderRadius: 8, padding: '8px 18px', fontWeight: 500, cursor: 'pointer'
          }}>Xem thêm &rarr;</button>
        </div>
      </div>
      <div>
        <div style={{ fontWeight: 600, fontSize: 20, marginBottom: 16 }}>Các hoạt động đang diễn ra</div>
        <div style={{ display: 'flex', gap: 24, flexWrap: 'wrap' }}>
          {activities.map(act => (
            <div key={act.activityID} style={{
              background: '#fff', borderRadius: 12, boxShadow: '0 2px 8px #e0e0e0', padding: 16, width: 300
            }}>
              <img src={act.image || '/activity1.jpg'} alt={act.name} style={{ width: '100%', height: 140, objectFit: 'cover', borderRadius: 8 }} />
              <div style={{ fontWeight: 600, fontSize: 17, margin: '12px 0 4px 0' }}>{act.name}</div>
              <div style={{ color: '#1976d2', fontSize: 15 }}>{act.unit || act.organizerID}</div>
              <div style={{ fontSize: 14, margin: '4px 0' }}><b>Thời gian:</b> {act.eventStart ? new Date(act.eventStart).toLocaleString() : ''}</div>
              <div style={{ fontSize: 14 }}><b>Địa điểm:</b> {act.location}</div>
              <div style={{ fontSize: 14 }}><b>Tình nguyện viên:</b> {act.capacity}</div>
            </div>
          ))}
        </div>
      </div>
    </main>
  );
} 