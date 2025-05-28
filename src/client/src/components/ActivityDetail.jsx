import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';

const API_URL = '/activity';

function ActivityDetail() {
  const { activityId } = useParams();
  const [activity, setActivity] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [tab, setTab] = useState('overview');
  const [registrations, setRegistrations] = useState([]);
  const [regLoading, setRegLoading] = useState(false);
  const [regError, setRegError] = useState('');
  const [message, setMessage] = useState('');
  // Filters and selection
  const [regFilter, setRegFilter] = useState({ status: '', name: '', studentId: '' });
  const [regSelected, setRegSelected] = useState([]);
  const [attSelected, setAttSelected] = useState([]);
  const [attFilter, setAttFilter] = useState({ name: '', studentId: '' });

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

  // Fetch registrations when tab is Registrations or Confirm Participation
  useEffect(() => {
    if (tab === 'registrations' || tab === 'attendance') {
      setRegLoading(true);
      setRegError('');
      const params = [];
      if (tab === 'registrations') {
        if (regFilter.status) params.push(`status=${regFilter.status}`);
        if (regFilter.name) params.push(`name=${encodeURIComponent(regFilter.name)}`);
        if (regFilter.studentId) params.push(`studentId=${encodeURIComponent(regFilter.studentId)}`);
      } else if (tab === 'attendance') {
        if (attFilter.name) params.push(`name=${encodeURIComponent(attFilter.name)}`);
        if (attFilter.studentId) params.push(`studentId=${encodeURIComponent(attFilter.studentId)}`);
      }
      const url = `${API_URL}/${activityId}/registrations${params.length ? '?' + params.join('&') : ''}`;
      fetch(url)
        .then(res => res.json())
        .then(data => setRegistrations(data))
        .catch(e => setRegError('Failed to load registrations'))
        .finally(() => setRegLoading(false));
    }
  }, [tab, activityId, regFilter, attFilter]);

  // Helper: check if activity is published or completed
  const isPublished = activity && activity.activityStatus === 'published';
  const isCompleted = activity && activity.activityStatus === 'completed';

  // Approve/Reject registration (single or bulk)
  const handleRegAction = async (ids, status) => {
    setMessage('');
    const body = Array.isArray(ids) ? { ids, status } : { id: ids, status };
    const res = await fetch(`${API_URL}/${activityId}/registrations/approve`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });
    const data = await res.json();
    setMessage(data.message);
    setRegSelected([]);
    setTab(''); setTimeout(() => setTab('registrations'), 0);
  };

  // Mark attendance (single or bulk)
  const handleAttendance = async (ids, status) => {
    setMessage('');
    const body = Array.isArray(ids) ? { ids, status } : { id: ids, status };
    const res = await fetch(`${API_URL}/${activityId}/attendance/confirm`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });
    const data = await res.json();
    setMessage(data.message);
    setAttSelected([]);
    setTab(''); setTimeout(() => setTab('attendance'), 0);
  };

  // Complete activity
  const handleComplete = async () => {
    setMessage('');
    const res = await fetch(`${API_URL}/${activityId}/complete`, { method: 'PATCH' });
    const data = await res.json();
    setMessage(data.message || 'Activity completed!');
    setActivity(data);
    setTab('attendance');
  };

  // Uncomplete activity
  const handleUncomplete = async () => {
    setMessage('');
    const res = await fetch(`${API_URL}/${activityId}/uncomplete`, { method: 'PATCH' });
    const data = await res.json();
    setMessage(data.message || 'Activity set to published!');
    setActivity(data);
    setTab('overview');
  };

  // Filtering helpers
  const filteredRegistrations = tab === 'registrations'
    ? registrations.filter(r =>
        (!regFilter.status || r.registrationStatus === regFilter.status) &&
        (!regFilter.name || (r.studentName || '').toLowerCase().includes(regFilter.name.toLowerCase())) &&
        (!regFilter.studentId || (r.studentID || '').toLowerCase().includes(regFilter.studentId.toLowerCase()))
      )
    : registrations.filter(r =>
        r.registrationStatus === 'approved' &&
        (!attFilter.name || (r.studentName || '').toLowerCase().includes(attFilter.name.toLowerCase())) &&
        (!attFilter.studentId || (r.studentID || '').toLowerCase().includes(attFilter.studentId.toLowerCase()))
      );

  // Checkbox helpers
  const allRegIds = filteredRegistrations.filter(r => r.registrationStatus === 'pending').map(r => r.participationID);
  const allAttIds = filteredRegistrations.map(r => r.participationID);
  const regAllSelected = allRegIds.length > 0 && regSelected.length === allRegIds.length;
  const attAllSelected = allAttIds.length > 0 && attSelected.length === allAttIds.length;

  if (loading) return <div>Loading...</div>;
  if (error) return <div style={{ color: 'red' }}>{error}</div>;
  if (!activity) return <div>Activity not found.</div>;

  return (
    <div style={{ maxWidth: 1000, margin: 'auto' }}>
      <h2>Activity Detail</h2>
      <div style={{ marginBottom: 20 }}>
        <button onClick={() => setTab('overview')} disabled={tab === 'overview'}>Overview</button>{' '}
        <button onClick={() => setTab('registrations')} disabled={tab === 'registrations'}>Registrations</button>{' '}
        {isCompleted && <button onClick={() => setTab('attendance')} disabled={tab === 'attendance'}>Confirm Participation</button>}
      </div>
      {message && <div style={{ color: 'green', marginBottom: 10 }}>{message}</div>}
      {tab === 'overview' && (
        <div>
          <p><b>Title:</b> {activity.name}</p>
          <p><b>Description:</b> {activity.description || 'No description'}</p>
          <p><b>Time:</b> {activity.eventStart ? new Date(activity.eventStart).toLocaleString() : ''}</p>
          <p><b>Location:</b> {activity.location}</p>
          <p><b>Status:</b> {activity.activityStatus}</p>
          <p><b>Person in charge (Organizer ID):</b> {activity.organizerID}</p>
          {isPublished && <button onClick={handleComplete}>Complete Activity</button>}
          {isCompleted && <button onClick={handleUncomplete}>Uncomplete Activity</button>}
        </div>
      )}
      {tab === 'registrations' && (
        <div>
          <h3>Registrations</h3>
          <div style={{ marginBottom: 10 }}>
            <label>Status: <select value={regFilter.status} onChange={e => setRegFilter(f => ({ ...f, status: e.target.value }))}>
              <option value="">All</option>
              <option value="pending">Pending</option>
              <option value="approved">Approved</option>
              <option value="rejected">Rejected</option>
            </select></label>{' '}
            <label>Name: <input value={regFilter.name} onChange={e => setRegFilter(f => ({ ...f, name: e.target.value }))} placeholder="Student name" /></label>{' '}
            <label>Student ID: <input value={regFilter.studentId} onChange={e => setRegFilter(f => ({ ...f, studentId: e.target.value }))} placeholder="Student ID" /></label>{' '}
            <button onClick={() => setRegFilter({ status: '', name: '', studentId: '' })}>Clear</button>
          </div>
          {regLoading ? <div>Loading...</div> : regError ? <div style={{ color: 'red' }}>{regError}</div> : (
            filteredRegistrations.length === 0 ? <div>No registration requests yet.</div> : (
              <>
                <div style={{ marginBottom: 10 }}>
                  <button disabled={regSelected.length === 0} onClick={() => handleRegAction(regSelected, 'approved')}>Bulk Approve</button>{' '}
                  <button disabled={regSelected.length === 0} onClick={() => handleRegAction(regSelected, 'rejected')}>Bulk Reject</button>
                </div>
                <table border="1" cellPadding="6" style={{ width: '100%' }}>
                  <thead>
                    <tr>
                      <th><input type="checkbox" checked={regAllSelected} onChange={e => setRegSelected(e.target.checked ? allRegIds : [])} /></th>
                      <th>Student Name</th>
                      <th>Student ID</th>
                      <th>Sex</th>
                      <th>Academic Year</th>
                      <th>Faculty</th>
                      <th>Email</th>
                      <th>Phone</th>
                      <th>Status</th>
                      <th>Registration Time</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredRegistrations.map(r => (
                      <tr key={r.participationID}>
                        <td>
                          {r.registrationStatus === 'pending' && (
                            <input
                              type="checkbox"
                              checked={regSelected.includes(r.participationID)}
                              onChange={e => setRegSelected(sel => e.target.checked ? [...sel, r.participationID] : sel.filter(id => id !== r.participationID))}
                            />
                          )}
                        </td>
                        <td>{r.studentName}</td>
                        <td>{r.studentID}</td>
                        <td>{r.sex}</td>
                        <td>{r.academicYear}</td>
                        <td>{r.faculty}</td>
                        <td>{r.email}</td>
                        <td>{r.phone}</td>
                        <td>{r.registrationStatus}</td>
                        <td>{r.registrationTime ? new Date(r.registrationTime).toLocaleString() : ''}</td>
                        <td>
                          {r.registrationStatus === 'pending' && <>
                            <button onClick={() => handleRegAction(r.participationID, 'approved')}>Approve</button>{' '}
                            <button onClick={() => handleRegAction(r.participationID, 'rejected')}>Reject</button>
                          </>}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </>
            )
          )}
        </div>
      )}
      {tab === 'attendance' && isCompleted && (
        <div>
          <h3>Confirm Participation</h3>
          <div style={{ marginBottom: 10 }}>
            <label>Name: <input value={attFilter.name} onChange={e => setAttFilter(f => ({ ...f, name: e.target.value }))} placeholder="Student name" /></label>{' '}
            <label>Student ID: <input value={attFilter.studentId} onChange={e => setAttFilter(f => ({ ...f, studentId: e.target.value }))} placeholder="Student ID" /></label>{' '}
            <button onClick={() => setAttFilter({ name: '', studentId: '' })}>Clear</button>
          </div>
          {regLoading ? <div>Loading...</div> : regError ? <div style={{ color: 'red' }}>{regError}</div> : (
            filteredRegistrations.length === 0 ? <div>No approved students to confirm.</div> : (
              <>
                <div style={{ marginBottom: 10 }}>
                  <input type="checkbox" checked={attAllSelected} onChange={e => setAttSelected(e.target.checked ? allAttIds : [])} /> Select All
                  <button disabled={attSelected.length === 0} onClick={() => handleAttendance(attSelected, 'present')}>Mark Present</button>{' '}
                  <button disabled={attSelected.length === 0} onClick={() => handleAttendance(attSelected, 'absent')}>Mark Absent</button>
                </div>
                <table border="1" cellPadding="6" style={{ width: '100%' }}>
                  <thead>
                    <tr>
                      <th></th>
                      <th>Student Name</th>
                      <th>Student ID</th>
                      <th>Academic Year</th>
                      <th>Faculty</th>
                      <th>Status</th>
                      <th>Attendance</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredRegistrations.map(r => (
                      <tr key={r.participationID}>
                        <td><input type="checkbox" checked={attSelected.includes(r.participationID)} onChange={e => setAttSelected(sel => e.target.checked ? [...sel, r.participationID] : sel.filter(id => id !== r.participationID))} /></td>
                        <td>{r.studentName}</td>
                        <td>{r.studentID}</td>
                        <td>{r.academicYear}</td>
                        <td>{r.faculty}</td>
                        <td>{r.registrationStatus}</td>
                        <td>
                          <button onClick={() => handleAttendance(r.participationID, 'present')}>Present</button>{' '}
                          <button onClick={() => handleAttendance(r.participationID, 'absent')}>Absent</button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </>
            )
          )}
        </div>
      )}
      <div style={{ marginTop: 20 }}>
        <Link to="/">Back to Activity Manager</Link>
      </div>
    </div>
  );
}

export default ActivityDetail; 