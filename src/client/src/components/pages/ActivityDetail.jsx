import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';

const API_URL = '/activity';

function UpdatePointModal({ open, onClose, student, activityId, reload }) {
  const [newPoint, setNewPoint] = useState(student?.trainingPoint || 0);
  const [reason, setReason] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState('');
  if (!open) return null;
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(''); setSuccess('');
    if (isNaN(newPoint) || newPoint < 0 || newPoint > 100) {
      setError('Điểm phải từ 0 đến 100'); return;
    }
    if (!reason.trim()) {
      setError('Vui lòng nhập lý do cập nhật'); return;
    }
    setLoading(true);
    const res = await fetch(`${API_URL}/${activityId}/training-point`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ studentID: student.studentID, newPoint: Number(newPoint), reason })
    });
    const data = await res.json();
    if (!res.ok) setError(data.message || 'Lỗi cập nhật');
    else {
      setSuccess('Cập nhật thành công!');
      setTimeout(() => { onClose(); reload(); }, 1000);
    }
    setLoading(false);
  };
  return (
    <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50">
      <form className="bg-white p-6 rounded shadow max-w-sm w-full" onSubmit={handleSubmit}>
        <h3 className="text-lg font-bold mb-2">Cập nhật điểm rèn luyện</h3>
        <div className="mb-2">MSSV: <b>{student.studentID}</b></div>
        <div className="mb-2">Họ tên: <b>{student.studentName}</b></div>
        <div className="mb-2">Điểm hiện tại: <b>{student.trainingPoint ?? 'Chưa có'}</b></div>
        <div className="mb-2">
          <label>Điểm mới:</label>
          <input type="number" min={0} max={100} className="border rounded px-2 py-1 ml-2 w-24" value={newPoint} onChange={e=>setNewPoint(e.target.value)} />
        </div>
        <div className="mb-2">
          <label>Lý do cập nhật:</label>
          <input type="text" className="border rounded px-2 py-1 ml-2 w-full" value={reason} onChange={e=>setReason(e.target.value)} />
        </div>
        {error && <div className="text-red-600 mb-2">{error}</div>}
        {success && <div className="text-green-600 mb-2">{success}</div>}
        <div className="flex gap-2 mt-2">
          <button type="submit" className="bg-blue-600 text-white px-4 py-1 rounded" disabled={loading}>{loading ? 'Đang lưu...' : 'Xác nhận'}</button>
          <button type="button" className="bg-gray-300 px-4 py-1 rounded" onClick={onClose}>Hủy</button>
        </div>
      </form>
    </div>
  );
}

export default function ActivityDetail() {
  const { activityId } = useParams();
  const [tab, setTab] = useState('info');
  const [activity, setActivity] = useState(null);
  const [registrations, setRegistrations] = useState([]);
  const [attendance, setAttendance] = useState([]);
  const [selectedRegs, setSelectedRegs] = useState([]);
  const [selectedAtts, setSelectedAtts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('');
  const [reloadFlag, setReloadFlag] = useState(0);
  const [showUpdate, setShowUpdate] = useState(null);
  const [searchStudentCode, setSearchStudentCode] = useState('');
  const [searchResult, setSearchResult] = useState(null);
  const [searchLoading, setSearchLoading] = useState(false);
  const [searchError, setSearchError] = useState('');

  useEffect(() => {
    const fetchDetail = async () => {
      try {
        const res = await fetch(`${API_URL}/${activityId}`);
        if (!res.ok) throw new Error('Failed to fetch activity');
        const data = await res.json();
        setActivity(data);
      } catch (e) {
        console.error('Error fetching activity:', e.message);
      } finally {
        setLoading(false);
      }
    };
    fetchDetail();
  }, [activityId]);

  useEffect(() => {
    if (tab === 'registrations') {
      fetch(`${API_URL}/${activityId}/registrations`)
        .then(res => res.json())
        .then(data => setRegistrations(data.registrations || []));
    }
    if (tab === 'attendance') {
      fetch(`${API_URL}/${activityId}/registrations?status=approved`)
        .then(res => res.json())
        .then(data => setAttendance(data.registrations || []));
    }
  }, [tab, activityId, reloadFlag]);

  const handleBulkApprove = async (action) => {
    setLoading(true);
    let ids = [];
    if (action === 'approve') {
      ids = registrations.filter(r => selectedRegs.includes(r.participationID) && r.status !== 'approved').map(r => r.participationID);
    } else if (action === 'pending') {
      ids = registrations.filter(r => selectedRegs.includes(r.participationID) && r.status === 'approved').map(r => r.participationID);
    } else {
      ids = selectedRegs;
    }
    if (ids.length === 0) {
      setLoading(false);
      setMessage('Không có đăng ký hợp lệ để cập nhật.');
      return;
    }
    await fetch(`${API_URL}/${activityId}/registrations/approve`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ participationIDs: ids, action })
    });
    setMessage('Đã cập nhật thành công!');
    setSelectedRegs([]);
    setLoading(false);
    setReloadFlag(f => f + 1);
  };

  const handleBulkConfirm = async (status) => {
    setLoading(true);
    await fetch(`${API_URL}/${activityId}/attendance/confirm`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ participationIDs: selectedAtts, status })
    });
    setMessage('Xác nhận tham gia thành công!');
    setSelectedAtts([]);
    setLoading(false);
    setReloadFlag(f => f + 1);
  };

  const handleSearchStudent = async (e) => {
    e.preventDefault();
    if (!searchStudentCode.trim()) {
      setSearchError('Vui lòng nhập mã số sinh viên');
      return;
    }
    setSearchLoading(true);
    setSearchError('');
    try {
      const res = await fetch(`${API_URL}/${activityId}/search-student?studentID=${searchStudentCode}`);
      const data = await res.json();
      if (!res.ok) {
        setSearchError(data.message || 'Không tìm thấy sinh viên');
        setSearchResult(null);
      } else {
        setSearchResult(data);
      }
    } catch (err) {
      setSearchError('Lỗi khi tìm kiếm sinh viên');
      setSearchResult(null);
    } finally {
      setSearchLoading(false);
    }
  };

  if (loading) return <div>Loading...</div>;
  if (!activity) return <div>Activity not found.</div>;

  return (
    <div className="max-w-5xl mx-auto p-6 bg-white rounded-lg shadow">
      <div className="mb-4 flex gap-4 border-b">
        <button className={tab==='info' ? 'font-bold border-b-2 border-blue-600 px-4 py-2' : 'px-4 py-2'} onClick={()=>setTab('info')}>Thông tin</button>
        <button className={tab==='registrations' ? 'font-bold border-b-2 border-blue-600 px-4 py-2' : 'px-4 py-2'} onClick={()=>setTab('registrations')}>Danh sách đăng ký</button>
        <button className={tab==='attendance' ? 'font-bold border-b-2 border-blue-600 px-4 py-2' : 'px-4 py-2'} onClick={()=>setTab('attendance')}>Danh sách tham gia</button>
      </div>
      {message && <div className="mb-4 p-2 bg-green-100 text-green-800 rounded">{message}</div>}
      {tab === 'info' && (
        <div>
          <h2 className="text-2xl font-bold mb-2">{activity.name}</h2>
          <div className="mb-2">Thời gian: {activity.eventStart ? new Date(activity.eventStart).toLocaleString() : ''}</div>
          <div className="mb-2">Địa điểm: {activity.location}</div>
          <div className="mb-2">Mô tả: {activity.description}</div>
          {/* Thêm các trường khác nếu cần */}
        </div>
      )}
      {tab === 'registrations' && (
        <div>
          <div className="mb-4">
            <form onSubmit={handleSearchStudent} className="flex gap-2 items-center">
              <input
                type="text"
                placeholder="Nhập mã số sinh viên..."
                className="border rounded px-3 py-1"
                value={searchStudentCode}
                onChange={(e) => setSearchStudentCode(e.target.value)}
              />
              <button type="submit" className="bg-blue-600 text-white px-3 py-1 rounded" disabled={searchLoading}>
                {searchLoading ? 'Đang tìm...' : 'Tìm kiếm'}
              </button>
            </form>
            {searchError && <div className="text-red-600 mt-2">{searchError}</div>}
            {searchResult && (
              <div className="mt-2 p-3 bg-blue-50 rounded">
                <h4 className="font-bold">Kết quả tìm kiếm:</h4>
                <p>MSSV: {searchResult.student.studentID}</p>
                <p>Họ tên: {searchResult.student.name}</p>
                <p>Email: {searchResult.student.email}</p>
                <p>Trạng thái: {searchResult.student.participationStatusText}</p>
                {searchResult.student.participation.trainingPoint !== null && (
                  <p>Điểm rèn luyện: {searchResult.student.participation.trainingPoint}</p>
                )}
              </div>
            )}
          </div>
          <div className="mb-2 flex gap-2">
            <button disabled={selectedRegs.length===0 || loading} onClick={()=>handleBulkApprove('approve')} className="bg-blue-600 text-white px-3 py-1 rounded">Duyệt</button>
            <button disabled={selectedRegs.length===0 || loading} onClick={()=>handleBulkApprove('pending')} className="bg-yellow-500 text-white px-3 py-1 rounded">Chuyển về chờ duyệt</button>
            <button disabled={selectedRegs.length===0 || loading} onClick={()=>handleBulkApprove('reject')} className="bg-red-600 text-white px-3 py-1 rounded">Từ chối</button>
          </div>
          <table className="min-w-full border rounded">
            <thead className="bg-gray-100">
              <tr>
                <th></th>
                <th>MSSV</th>
                <th>Họ tên</th>
                <th>Niên khóa</th>
                <th>Khoa</th>
                <th>Trạng thái</th>
                <th>Thời gian đăng ký</th>
                <th>Điểm rèn luyện</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {registrations.length === 0 ? (
                <tr><td colSpan={9} className="text-center py-4">Chưa có sinh viên đăng ký hoạt động này.</td></tr>
              ) : registrations.map(r => (
                <tr key={r.participationID}>
                  <td><input type="checkbox" checked={selectedRegs.includes(r.participationID)} onChange={e=>setSelectedRegs(e.target.checked?[...selectedRegs, r.participationID]:selectedRegs.filter(id=>id!==r.participationID))} /></td>
                  <td>{r.studentID}</td>
                  <td>{r.studentName}</td>
                  <td>{r.academicYear}</td>
                  <td>{r.faculty}</td>
                  <td>{r.status}</td>
                  <td>{r.registrationTime ? new Date(r.registrationTime).toLocaleString() : ''}</td>
                  <td>{r.trainingPoint ?? 'Chưa có'}</td>
                  <td>
                    <button className="text-blue-600 underline" onClick={()=>setShowUpdate(r)}>
                      Cập nhật điểm
                    </button>
                    {showUpdate && showUpdate.participationID === r.participationID && (
                      <UpdatePointModal
                        open={true}
                        onClose={()=>setShowUpdate(null)}
                        student={r}
                        activityId={activityId}
                        reload={()=>setReloadFlag(f=>f+1)}
                      />
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      {tab === 'attendance' && (
        <div>
          <div className="mb-4">
            <form onSubmit={handleSearchStudent} className="flex gap-2 items-center">
              <input
                type="text"
                placeholder="Nhập mã số sinh viên..."
                className="border rounded px-3 py-1"
                value={searchStudentCode}
                onChange={(e) => setSearchStudentCode(e.target.value)}
              />
              <button type="submit" className="bg-blue-600 text-white px-3 py-1 rounded" disabled={searchLoading}>
                {searchLoading ? 'Đang tìm...' : 'Tìm kiếm'}
              </button>
            </form>
            {searchError && <div className="text-red-600 mt-2">{searchError}</div>}
            {searchResult && (
              <div className="mt-2 p-3 bg-blue-50 rounded">
                <h4 className="font-bold">Kết quả tìm kiếm:</h4>
                <p>MSSV: {searchResult.student.studentCode}</p>
                <p>Họ tên: {searchResult.student.name}</p>
                <p>Email: {searchResult.student.email}</p>
                <p>Trạng thái: {searchResult.student.participation?.participationStatus || 'Chưa đăng ký'}</p>
              </div>
            )}
          </div>
          <div className="mb-2 flex gap-2">
            <button disabled={selectedAtts.length===0 || loading} onClick={()=>handleBulkConfirm('present')} className="bg-green-600 text-white px-3 py-1 rounded">Xác nhận tham gia</button>
            <button disabled={selectedAtts.length===0 || loading} onClick={()=>handleBulkConfirm('absent')} className="bg-gray-600 text-white px-3 py-1 rounded">Đánh dấu vắng</button>
          </div>
          <table className="min-w-full border rounded">
            <thead className="bg-gray-100">
              <tr>
                <th><input type="checkbox" checked={selectedAtts.length===attendance.length && attendance.length>0} onChange={e=>setSelectedAtts(e.target.checked?attendance.map(r=>r.participationID):[])} /></th>
                <th>MSSV</th>
                <th>Họ tên</th>
                <th>Niên khóa</th>
                <th>Khoa</th>
                <th>Trạng thái</th>
                <th>Thời gian đăng ký</th>
              </tr>
            </thead>
            <tbody>
              {attendance.length === 0 ? (
                <tr><td colSpan={7} className="text-center py-4">Chưa có sinh viên tham gia hoạt động này.</td></tr>
              ) : attendance.map(r => (
                <tr key={r.participationID}>
                  <td><input type="checkbox" checked={selectedAtts.includes(r.participationID)} onChange={e=>setSelectedAtts(e.target.checked?[...selectedAtts, r.participationID]:selectedAtts.filter(id=>id!==r.participationID))} /></td>
                  <td>{r.studentID}</td>
                  <td>{r.studentName}</td>
                  <td>{r.academicYear}</td>
                  <td>{r.faculty}</td>
                  <td>{r.status}</td>
                  <td>{r.registrationTime ? new Date(r.registrationTime).toLocaleString() : ''}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      <div style={{ marginTop: 20 }}>
        <Link to="/organizer/activities">Back to Activity Manager</Link>
      </div>
    </div>
  );
}
