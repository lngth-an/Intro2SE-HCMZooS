import React, { useEffect, useState } from 'react';

const API_URL = '/activity';

const statusColors = {
  draft: '#bdbdbd',
  published: '#1976d2',
  completed: '#388e3c',
};

function ActivityManager() {
  const [activities, setActivities] = useState([]);
  const [form, setForm] = useState({ name: '', eventStart: '', location: '' });
  const [editingId, setEditingId] = useState(null);
  const [message, setMessage] = useState('');

  const fetchActivities = async () => {
    const res = await fetch(API_URL);
    const data = await res.json();
    setActivities(data.activities || []);
  };

  useEffect(() => {
    fetchActivities();
  }, []);

  const handleChange = e => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async e => {
    e.preventDefault();
    if (!form.name || !form.eventStart || !form.location) {
      setMessage('Please fill all required fields.');
      return;
    }
    if (editingId) {
      await fetch(`${API_URL}/${editingId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      setMessage('Activity updated!');
    } else {
      await fetch(API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      setMessage('Activity created!');
    }
    setForm({ name: '', eventStart: '', location: '' });
    setEditingId(null);
    fetchActivities();
  };

  const handleEdit = activity => {
    setForm({ name: activity.name, eventStart: activity.eventStart?.slice(0, 16), location: activity.location });
    setEditingId(activity.activityID);
  };

  const handleDelete = async id => {
    if (window.confirm('Delete this activity?')) {
      await fetch(`${API_URL}/${id}`, { method: 'DELETE' });
      setMessage('Activity deleted!');
      fetchActivities();
    }
  };

  const handlePublish = async id => {
    await fetch(`${API_URL}/${id}/publish`, { method: 'PATCH' });
    setMessage('Activity published!');
    fetchActivities();
  };

  return (
    <div style={{ maxWidth: 900, margin: '40px auto', fontFamily: 'Segoe UI, Arial, sans-serif' }}>
      <h2 style={{ textAlign: 'center', color: '#1976d2', marginBottom: 30 }}>Activity Manager</h2>
      <div style={{ background: '#f5f5f5', padding: 24, borderRadius: 12, marginBottom: 32, boxShadow: '0 2px 8px #e0e0e0' }}>
        <h3 style={{ marginTop: 0, color: '#333' }}>{editingId ? 'Edit Activity' : 'Create New Activity'}</h3>
        <form onSubmit={handleSubmit} style={{ display: 'flex', gap: 16, alignItems: 'center', flexWrap: 'wrap' }}>
          <input name="name" placeholder="Title" value={form.name} onChange={handleChange} required style={{ flex: 1, padding: 8, borderRadius: 6, border: '1px solid #bdbdbd' }} />
          <input name="eventStart" type="datetime-local" value={form.eventStart} onChange={handleChange} required style={{ flex: 1, padding: 8, borderRadius: 6, border: '1px solid #bdbdbd' }} />
          <input name="location" placeholder="Location" value={form.location} onChange={handleChange} required style={{ flex: 1, padding: 8, borderRadius: 6, border: '1px solid #bdbdbd' }} />
          <button type="submit" style={{ background: '#1976d2', color: '#fff', border: 'none', borderRadius: 6, padding: '8px 18px', cursor: 'pointer' }}>{editingId ? 'Update' : 'Create'}</button>
          {editingId && <button type="button" style={{ background: '#bdbdbd', color: '#fff', border: 'none', borderRadius: 6, padding: '8px 18px', cursor: 'pointer' }} onClick={() => { setEditingId(null); setForm({ name: '', eventStart: '', location: '' }); }}>Cancel</button>}
        </form>
        {message && <div style={{ color: '#388e3c', marginTop: 12 }}>{message}</div>}
      </div>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 24, justifyContent: activities.length > 1 ? 'flex-start' : 'center' }}>
        {activities.map(a => (
          <div key={a.activityID} style={{ background: '#fff', borderRadius: 12, boxShadow: '0 2px 8px #e0e0e0', padding: 24, minWidth: 320, maxWidth: 350, flex: '1 1 320px', marginBottom: 16, position: 'relative', transition: 'box-shadow 0.2s', display: 'flex', flexDirection: 'column', gap: 10 }}>
            <div style={{ display: 'flex', alignItems: 'center', marginBottom: 8 }}>
              <span style={{ fontWeight: 600, fontSize: 18, color: '#1976d2', flex: 1 }}>{a.name}</span>
              <span style={{ background: statusColors[a.activityStatus] || '#bdbdbd', color: '#fff', borderRadius: 8, padding: '2px 12px', fontSize: 13, marginLeft: 8 }}>{a.activityStatus}</span>
            </div>
            <div style={{ color: '#555', fontSize: 15, marginBottom: 4 }}><b>Date:</b> {a.eventStart ? new Date(a.eventStart).toLocaleString() : ''}</div>
            <div style={{ color: '#555', fontSize: 15, marginBottom: 4 }}><b>Location:</b> {a.location}</div>
            <div style={{ display: 'flex', gap: 8, marginTop: 10 }}>
              {a.activityStatus === 'draft' && <>
                <button onClick={() => handleEdit(a)} style={{ background: '#fffde7', color: '#1976d2', border: '1px solid #ffe082', borderRadius: 6, padding: '6px 12px', cursor: 'pointer', fontWeight: 500 }}>Edit</button>
                <button onClick={() => handleDelete(a.activityID)} style={{ background: '#ffebee', color: '#d32f2f', border: '1px solid #ffcdd2', borderRadius: 6, padding: '6px 12px', cursor: 'pointer', fontWeight: 500 }}>Delete</button>
                <button onClick={() => handlePublish(a.activityID)} style={{ background: '#e3f2fd', color: '#388e3c', border: '1px solid #90caf9', borderRadius: 6, padding: '6px 12px', cursor: 'pointer', fontWeight: 500 }}>Publish</button>
              </>}
              <a href={`/activity/${a.activityID}`} style={{ background: '#f5f5f5', color: '#1976d2', border: '1px solid #bdbdbd', borderRadius: 6, padding: '6px 12px', textDecoration: 'none', fontWeight: 500, marginLeft: 'auto' }}>View</a>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default ActivityManager; 