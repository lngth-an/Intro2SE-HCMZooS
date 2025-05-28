import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';

const API_URL = '/activity';

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
    <div style={{ maxWidth: 600, margin: 'auto' }}>
      <h2>Activity Manager</h2>
      <form onSubmit={handleSubmit} style={{ marginBottom: 20 }}>
        <input name="name" placeholder="Title" value={form.name} onChange={handleChange} required />{' '}
        <input name="eventStart" type="datetime-local" value={form.eventStart} onChange={handleChange} required />{' '}
        <input name="location" placeholder="Location" value={form.location} onChange={handleChange} required />{' '}
        <button type="submit">{editingId ? 'Update' : 'Create'}</button>
        {editingId && <button type="button" onClick={() => { setEditingId(null); setForm({ name: '', eventStart: '', location: '' }); }}>Cancel</button>}
      </form>
      {message && <div style={{ color: 'green', marginBottom: 10 }}>{message}</div>}
      <table border="1" cellPadding="6" style={{ width: '100%' }}>
        <thead>
          <tr>
            <th>Title</th>
            <th>Date</th>
            <th>Location</th>
            <th>Status</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {activities.map(a => (
            <tr key={a.activityID}>
              <td>{a.name}</td>
              <td>{a.eventStart ? new Date(a.eventStart).toLocaleString() : ''}</td>
              <td>{a.location}</td>
              <td>{a.activityStatus}</td>
              <td>
                {a.activityStatus === 'draft' && <>
                  <button onClick={() => handleEdit(a)}>Edit</button>{' '}
                  <button onClick={() => handleDelete(a.activityID)}>Delete</button>{' '}
                  <button onClick={() => handlePublish(a.activityID)}>Publish</button>
                </>}
                <Link to={`/activity/${a.activityID}`}>View</Link>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default ActivityManager; 