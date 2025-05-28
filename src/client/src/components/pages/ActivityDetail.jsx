import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';

const API_URL = '/activity';

function ActivityDetail() {
  const { activityId } = useParams();
  const [activity, setActivity] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchDetail = async () => {
      try {
        const res = await fetch(`${API_URL}/${activityId}`);
        if (!res.ok) throw new Error('Failed to fetch activity');
        const data = await res.json();
        setActivity(data);
      } catch (e) {
        setError(e.message);
      } finally {
        setLoading(false);
      }
    };
    fetchDetail();
  }, [activityId]);

  if (loading) return <div>Loading...</div>;
  if (error) return <div style={{ color: 'red' }}>{error}</div>;
  if (!activity) return <div>Activity not found.</div>;

  return (
    <div style={{ maxWidth: 1000, margin: 'auto', fontFamily: 'Segoe UI, Arial, sans-serif' }}>
      <h2>Chi tiết hoạt động</h2>
      <div style={{ background: '#f5f5f5', borderRadius: 12, padding: 24, marginBottom: 24 }}>
        <p><b>Tiêu đề:</b> {activity.name}</p>
        <p><b>Mô tả:</b> {activity.description || 'Không có mô tả'}</p>
        <p><b>Thời gian:</b> {activity.eventStart ? new Date(activity.eventStart).toLocaleString() : ''}</p>
        <p><b>Địa điểm:</b> {activity.location}</p>
        <p><b>Trạng thái:</b> {activity.activityStatus}</p>
        <p><b>Đơn vị tổ chức (Organizer ID):</b> {activity.organizerID}</p>
      </div>
      <div style={{ marginTop: 20 }}>
        <Link to="/organizer/activities">Back to Activity Manager</Link>
      </div>
    </div>
  );
}

export default ActivityDetail;