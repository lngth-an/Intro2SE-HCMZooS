import React, { useEffect, useState } from 'react';
import { useParams, useLocation, useNavigate, Link } from 'react-router-dom';

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
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-xl font-semibold text-gray-900">Cập nhật điểm rèn luyện</h3>
        </div>
        <form onSubmit={handleSubmit} className="p-6">
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">MSSV</label>
                <div className="text-gray-900 font-medium">{student.studentID}</div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Họ tên</label>
                <div className="text-gray-900 font-medium">{student.studentName}</div>
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Điểm hiện tại</label>
              <div className="text-gray-900 font-medium">{student.trainingPoint ?? 'Chưa có'}</div>
            </div>

            <div>
              <label htmlFor="newPoint" className="block text-sm font-medium text-gray-700 mb-1">
                Điểm mới
              </label>
              <input
                type="number"
                id="newPoint"
                min={0}
                max={100}
                value={newPoint}
                onChange={e => setNewPoint(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                placeholder="Nhập điểm"
              />
            </div>

            <div>
              <label htmlFor="reason" className="block text-sm font-medium text-gray-700 mb-1">
                Lý do cập nhật
              </label>
              <textarea
                id="reason"
                value={reason}
                onChange={e => setReason(e.target.value)}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                placeholder="Nhập lý do cập nhật điểm"
              />
            </div>

            {error && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-md">
                <p className="text-sm text-red-600">{error}</p>
              </div>
            )}

            {success && (
              <div className="p-3 bg-green-50 border border-green-200 rounded-md">
                <p className="text-sm text-green-600">{success}</p>
              </div>
            )}
          </div>

          <div className="mt-6 flex justify-end space-x-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              Hủy
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Đang lưu...' : 'Xác nhận'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function OrganizerActivityDetail() {
  const { activityId } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
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

  if (loading) return <div>Loading...</div>;
  if (!activity) return <div>Activity not found.</div>;

  return (
    <div className="max-w-7xl mx-auto p-6 bg-white rounded-lg shadow">
      <button
        className="mb-4 px-4 py-2 bg-gray-200 rounded hover:bg-gray-300 text-gray-800 font-medium"
        onClick={() => {
          if (location.state?.from === 'home') navigate('/');
          else if (location.state?.from === 'manager') navigate('/organizer/activities');
          else navigate(-1);
        }}
      >
        ← Quay lại
      </button>
      <div className="mb-4 flex gap-4 border-b">
        <button className={tab==='info' ? 'font-bold border-b-2 border-blue-600 px-4 py-2' : 'px-4 py-2'} onClick={()=>setTab('info')}>Thông tin</button>
        <button className={tab==='registrations' ? 'font-bold border-b-2 border-blue-600 px-4 py-2' : 'px-4 py-2'} onClick={()=>setTab('registrations')}>Danh sách đăng ký</button>
        <button className={tab==='attendance' ? 'font-bold border-b-2 border-blue-600 px-4 py-2' : 'px-4 py-2'} onClick={()=>setTab('attendance')}>Danh sách tham gia</button>
      </div>
      {message && <div className="mb-4 p-2 bg-green-100 text-green-800 rounded">{message}</div>}
      {/*Thông tin hoạt động*/}
      {tab === 'info' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Poster */}
          <div className="space-y-4">
            <div className="aspect-w-4 aspect-h-3 rounded-lg overflow-hidden bg-gray-100">
              {activity.image ? (
                <img
                  src={activity.image}
                  alt={activity.name}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-gray-200">
                  <span className="text-gray-400">Không có hình ảnh</span>
                </div>
              )}
            </div>
            <div className="bg-gray-50 p-4 rounded-lg">
              <h3 className="text-sm font-medium text-gray-500">Trạng thái hoạt động</h3>
              <p className="mt-1 text-sm font-medium">
                {activity.activityStatus === 'published' && <span className="inline-block px-3 py-1 rounded-full bg-green-100 text-green-500">Đã công khai</span>}
                {activity.activityStatus === 'draft' && <span className="inline-block px-3 py-1 rounded-full bg-blue-100 text-blue-500">Bản nháp</span>}
                {activity.activityStatus === 'completed' && <span className="inline-block px-3 py-1 rounded-full bg-purple-100 text-purple-500">Đã kết thúc</span>}
              </p>
            </div>
          </div>

          {/* Thông tin chi tiết */}
          <div className="space-y-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">{activity.name}</h1>
              <div className="flex flex-wrap gap-2 mb-4">
                <span className="px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800">
                  {activity.type}
                </span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="bg-gray-50 p-4 rounded-lg">
                <h3 className="text-sm font-medium text-gray-500">Thời gian bắt đầu</h3>
                <p className="mt-1 text-sm text-gray-900">
                  {activity.eventStart ? new Date(activity.eventStart).toLocaleString() : 'Chưa cập nhật'}
                </p>
              </div>
              <div className="bg-gray-50 p-4 rounded-lg">
                <h3 className="text-sm font-medium text-gray-500">Thời gian kết thúc</h3>
                <p className="mt-1 text-sm text-gray-900">
                  {activity.eventEnd ? new Date(activity.eventEnd).toLocaleString() : 'Chưa cập nhật'}
                </p>
              </div>
              <div className="bg-gray-50 p-4 rounded-lg">
                <h3 className="text-sm font-medium text-gray-500">Số lượng tham gia</h3>
                <p className="mt-1 text-sm text-gray-900">{activity.capacity || 'Chưa cập nhật'}</p>
              </div>
              <div className="bg-gray-50 p-4 rounded-lg">
                <h3 className="text-sm font-medium text-gray-500">Địa điểm</h3>
                <p className="mt-1 text-sm text-gray-900">{activity.location || 'Chưa cập nhật'}</p>
              </div>
            </div>

            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Mô tả chi tiết</h3>
              <div className="bg-gray-50 p-4 rounded-lg">
                <p className="text-gray-700 whitespace-pre-line">
                  {activity.description || 'Không có mô tả'}
                </p>
              </div>
            </div>
              
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Thời gian đăng ký</h3>
              <div className="bg-gray-50 p-4 rounded-lg">
                <p className="text-gray-700">
                  Từ: {activity.registrationStart ? new Date(activity.registrationStart).toLocaleString() : 'Chưa cập nhật'}    
                  <br/>        
                  Đến: {activity.registrationEnd ? new Date(activity.registrationEnd).toLocaleString() : 'Chưa cập nhật'}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
      {/*Danh sách đăng ký*/}
      {tab === 'registrations' && (
        <div>
          <div className="mb-4 flex justify-between items-center">
            <h2 className="text-xl font-semibold text-gray-800">Danh sách đăng ký</h2>
            <div className="flex gap-2">
              <button 
                disabled={selectedRegs.length===0 || loading} 
                onClick={()=>handleBulkApprove('approve')} 
                className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                Duyệt
              </button>
              <button 
                disabled={selectedRegs.length===0 || loading} 
                onClick={()=>handleBulkApprove('reject')} 
                className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                Từ chối
              </button>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow overflow-hidden">
            <table className="table-fixed w-full min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-2 py-3 text-left" style={{width: '5%'}}></th>
                  <th className="px-2 py-3 text-left" style={{width: '15%'}}>MSSV</th>
                  <th className="px-2 py-3 text-left" style={{width: '30%'}}>Họ tên</th>
                  <th className="px-2 py-3 text-left" style={{width: '15%'}}>Niên khóa</th>
                  <th className="px-2 py-3 text-left" style={{width: '20%'}}>Khoa</th>
                  <th className="px-2 py-3 text-left" style={{width: '15%'}}>Trạng thái</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {registrations.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-6 py-4 text-center text-sm text-gray-500">
                      Chưa có sinh viên đăng ký hoạt động này.
                    </td>
                  </tr>
                ) : registrations.map(r => (
                  <tr key={r.participationID} className="hover:bg-gray-50">
                    <td className="px-2 py-4 whitespace-nowrap" style={{width: '5%'}}>
                      <input 
                        type="checkbox" 
                        checked={selectedRegs.includes(r.participationID)}
                        onChange={e => setSelectedRegs(e.target.checked ? [...selectedRegs, r.participationID] : selectedRegs.filter(id => id !== r.participationID))}
                        className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      />
                    </td>
                    <td className="px-2 py-4 whitespace-nowrap text-sm font-medium text-gray-900" style={{width: '15%'}}>{r.studentID}</td>
                    <td className="px-2 py-4 whitespace-nowrap text-sm text-gray-900" style={{width: '30%'}}>{r.studentName}</td>
                    <td className="px-2 py-4 whitespace-nowrap text-sm text-gray-500" style={{width: '15%'}}>{r.academicYear}</td>
                    <td className="px-2 py-4 whitespace-nowrap text-sm text-gray-500" style={{width: '20%'}}>{r.faculty}</td>
                    <td className="px-2 py-4 whitespace-nowrap" style={{width: '15%'}}>
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium
                        ${r.status === 'approved' ? 'bg-green-100 text-green-800' : 
                          r.status === 'pending' ? 'bg-yellow-100 text-yellow-800' : 
                          'bg-red-100 text-red-800'}`}>
                        {r.status === 'approved' ? 'Đã duyệt' : 
                         r.status === 'pending' ? 'Chờ duyệt' : 
                         'Từ chối'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
      {/*Danh sách tham gia*/}
      {tab === 'attendance' && (
        <div>
          <div className="mb-4 flex justify-between items-center">
            <h2 className="text-xl font-semibold text-gray-800">Danh sách tham gia</h2>
            <div className="flex gap-2">
              <button 
                disabled={selectedAtts.length===0 || loading} 
                onClick={()=>handleBulkConfirm('present')} 
                className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                Xác nhận tham gia
              </button>
              <button 
                disabled={selectedAtts.length===0 || loading} 
                onClick={()=>handleBulkConfirm('absent')} 
                className="bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                Đánh dấu vắng
              </button>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow overflow-hidden">
            <table className="table-fixed w-full min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-2 py-3 text-left" style={{width: '5%'}}></th>
                  <th className="px-2 py-3 text-left" style={{width: '15%'}}>MSSV</th>
                  <th className="px-2 py-3 text-left" style={{width: '30%'}}>Họ tên</th>
                  <th className="px-2 py-3 text-left" style={{width: '15%'}}>Niên khóa</th>
                  <th className="px-2 py-3 text-left" style={{width: '20%'}}>Khoa</th>
                  <th className="px-2 py-3 text-left" style={{width: '15%'}}>Trạng thái</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {attendance.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-6 py-4 text-center text-sm text-gray-500">
                      Chưa có sinh viên tham gia hoạt động này.
                    </td>
                  </tr>
                ) : attendance.map(r => (
                  <tr key={r.participationID} className="hover:bg-gray-50">
                    <td className="px-2 py-4 whitespace-nowrap" style={{width: '5%'}}>
                      <input 
                        type="checkbox" 
                        checked={selectedAtts.includes(r.participationID)}
                        onChange={e => setSelectedAtts(e.target.checked ? [...selectedAtts, r.participationID] : selectedAtts.filter(id => id !== r.participationID))}
                        className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      />
                    </td>
                    <td className="px-2 py-4 whitespace-nowrap text-sm font-medium text-gray-900" style={{width: '15%'}}>{r.studentID}</td>
                    <td className="px-2 py-4 whitespace-nowrap text-sm text-gray-900" style={{width: '30%'}}>{r.studentName}</td>
                    <td className="px-2 py-4 whitespace-nowrap text-sm text-gray-500" style={{width: '15%'}}>{r.academicYear}</td>
                    <td className="px-2 py-4 whitespace-nowrap text-sm text-gray-500" style={{width: '20%'}}>{r.faculty}</td>
                    <td className="px-2 py-4 whitespace-nowrap" style={{width: '15%'}}>
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium
                        ${r.attendanceStatus === 'present' ? 'bg-green-100 text-green-800' : 
                          r.attendanceStatus === 'absent' ? 'bg-red-100 text-red-800' : 
                          'bg-gray-100 text-gray-800'}`}>
                        {r.attendanceStatus === 'present' ? 'Đã tham gia' : 
                         r.attendanceStatus === 'absent' ? 'Vắng mặt' : 
                         'Chưa điểm danh'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
} 