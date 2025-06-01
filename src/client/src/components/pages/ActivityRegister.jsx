import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import ActivityDetail from './ActivityDetail';

const DOMAINS = [
  { id: 'academic', label: 'Học thuật' },
  { id: 'volunteer', label: 'Tình nguyện' },
  { id: 'sports', label: 'Thể thao' },
  { id: 'skills', label: 'Kỹ năng' },
  { id: 'arts', label: 'Nghệ thuật' },
  { id: 'other', label: 'Khác' },
];

function ActivityRegister() {
  const navigate = useNavigate();
  const [activities, setActivities] = useState([]);
  const [domain, setDomain] = useState('');
  const [selected, setSelected] = useState(null);
  const [showDetail, setShowDetail] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ note: '' });
  const [error, setError] = useState('');
  const [confirm, setConfirm] = useState(false);
  const [success, setSuccess] = useState('');
  const [suggested, setSuggested] = useState([]);
  const [participationID, setParticipationID] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setLoading(true);
    fetch(`/participation/open${domain ? '?domain=' + domain : ''}`)
      .then(res => res.json())
      .then(data => { setActivities(data.activities || []); setLoading(false); });
  }, [domain]);

  const handleShowDetail = (activity) => {
    setSelected(activity);
    setShowDetail(true);
    setShowForm(false);
    setError('');
    setSuccess('');
    setConfirm(false);
    setSuggested([]);
  };

  const handleCloseDetail = () => {
    setShowDetail(false);
    setSelected(null);
    setShowForm(false);
    setError('');
    setSuccess('');
    setConfirm(false);
    setSuggested([]);
  };

  const handleRegister = (activity) => {
    fetch(`/participation/check-eligibility/${activity.activityID}`)
      .then(res => res.json())
      .then(data => {
        if (data.eligible) {
          setShowForm(true);
          setError('');
        } else {
          setError(data.reason || 'Bạn không đủ điều kiện đăng ký hoạt động này');
          // Gợi ý hoạt động cùng lĩnh vực
          fetch(`/participation/suggest?domain=${activity.type}`)
            .then(res => res.json())
            .then(data => setSuggested(data.activities || []));
        }
      });
  };

  const handleFormChange = e => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleFormSubmit = e => {
    e.preventDefault();
    setError('');
    fetch('/participation/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ activityID: selected.activityID, note: form.note }),
    })
      .then(res => res.json())
      .then(data => {
        if (data.error) setError(data.error);
        else {
          setParticipationID(data.participation.participationID);
          setConfirm(true);
        }
      });
  };

  const handleConfirm = () => {
    fetch('/participation/submit', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ participationID }),
    })
      .then(res => res.json())
      .then(data => {
        if (data.error) setError(data.error);
        else {
          setSuccess('Đăng ký thành công! Đơn đăng ký đã gửi tới đơn vị tổ chức.');
          setShowForm(false);
          setParticipationID(null);
        }
      });
  };

  return (
    <div style={{ maxWidth: 900, margin: '40px auto', fontFamily: 'Segoe UI, Arial, sans-serif' }}>
      <h2 style={{ textAlign: 'center', color: '#1976d2', marginBottom: 30 }}>Đăng ký hoạt động</h2>
      <div style={{ marginBottom: 24 }}>
        <span>Lọc theo lĩnh vực: </span>
        {DOMAINS.map(d => (
          <button key={d.id} style={{
            margin: 4, padding: '6px 14px', borderRadius: 16, border: '1px solid #1976d2',
            background: domain === d.id ? '#1976d2' : '#fff', color: domain === d.id ? '#fff' : '#1976d2', fontWeight: 500, cursor: 'pointer'
          }} onClick={() => setDomain(d.id)}>{d.label}</button>
        ))}
        <button style={{ margin: 4, padding: '6px 14px', borderRadius: 16, border: '1px solid #bdbdbd', background: !domain ? '#1976d2' : '#fff', color: !domain ? '#fff' : '#1976d2', fontWeight: 500, cursor: 'pointer' }} onClick={() => setDomain('')}>Tất cả</button>
      </div>
      {loading ? <div>Đang tải hoạt động...</div> : (
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 24 }}>
        {activities.map(a => (
          <div key={a.activityID} style={{ background: '#fff', borderRadius: 12, boxShadow: '0 2px 8px #e0e0e0', padding: 24, minWidth: 320, maxWidth: 350, flex: '1 1 320px', marginBottom: 16 }}>
            <div style={{ fontWeight: 600, fontSize: 18, color: '#1976d2' }}>{a.name}</div>
            <div style={{ color: '#555', fontSize: 15, marginBottom: 4 }}><b>Date:</b> {a.eventStart ? new Date(a.eventStart).toLocaleString() : ''}</div>
            <div style={{ color: '#555', fontSize: 15, marginBottom: 4 }}><b>Location:</b> {a.location}</div>
            <div style={{ color: '#555', fontSize: 15, marginBottom: 4 }}><b>Lĩnh vực:</b> {a.type}</div>
            <button style={{ background: '#1976d2', color: '#fff', border: 'none', borderRadius: 6, padding: '8px 18px', fontWeight: 600, marginTop: 8, cursor: 'pointer' }} onClick={() => handleShowDetail(a)}>Xem chi tiết</button>
          </div>
        ))}
      </div>
      )}
      {/* Chi tiết hoạt động */}
      {showDetail && selected && (
        <div style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', background: 'rgba(0,0,0,0.25)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div style={{ background: '#fff', borderRadius: 12, boxShadow: '0 2px 16px #bdbdbd', padding: 32, minWidth: 350, maxWidth: 800, position: 'relative', maxHeight: '90vh', overflowY: 'auto' }}>
            <button onClick={handleCloseDetail} style={{ position: 'absolute', top: 12, right: 12, background: '#bdbdbd', color: '#fff', border: 'none', borderRadius: '50%', width: 28, height: 28, fontWeight: 700, fontSize: 18, cursor: 'pointer', zIndex: 1 }}>×</button>
            <ActivityDetail
              activity={selected}
              isStudent={true}
              onRegister={handleRegister}
              showRegisterForm={showForm}
              registerNote={form.note}
              onRegisterNoteChange={handleFormChange}
              onRegisterSubmit={handleFormSubmit}
              onRegisterCancel={() => setShowForm(false)}
              registerError={error}
              registerSuccess={success}
              confirm={confirm}
              onConfirm={handleConfirm}
              onCancelConfirm={() => setConfirm(false)}
              suggested={suggested}
            />
          </div>
        </div>
      )}
    </div>
  );
}

export default ActivityRegister; 