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
  const [filteredRegistrations, setFilteredRegistrations] = useState([]);
  const [statusFilter, setStatusFilter] = useState('all');
  const [attendanceFilter, setAttendanceFilter] = useState('all');
  const [attendance, setAttendance] = useState([]);
  const [filteredAttendance, setFilteredAttendance] = useState([]);
  const [selectedRegs, setSelectedRegs] = useState([]);
  const [selectedAtts, setSelectedAtts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('');
  const [reloadFlag, setReloadFlag] = useState(0);
  const [showUpdate, setShowUpdate] = useState(null);

  const [searchRegStudentCode, setSearchRegStudentCode] = useState('');
  const [searchRegResult, setSearchRegResult] = useState(null);
  const [searchRegLoading, setSearchRegLoading] = useState(false);
  const [searchRegError, setSearchRegError] = useState('');

  const [searchAttStudentCode, setSearchAttStudentCode] = useState('');
  const [searchAttResult, setSearchAttResult] = useState(null);
  const [searchAttLoading, setSearchAttLoading] = useState(false);
  const [searchAttError, setSearchAttError] = useState('');

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
        .then(data => {
          const filteredData = (data.registrations || []).filter(reg => 
            ['Chờ duyệt', 'Từ chối'].includes(reg.status)
          );
          setRegistrations(filteredData);
        });
    }
    if (tab === 'attendance') {

      fetch(`${API_URL}/${activityId}/registrations?status=Đã duyệt&status=Đã tham gia&status=Vắng`)
        .then(res => res.json())
        .then(data => {
          const attendanceData = (data.registrations || []).map(reg => ({
            ...reg,
            displayStatus: reg.status === 'Đã duyệt' ? 'Chưa điểm danh' : reg.status
          }));
          setAttendance(attendanceData);
        });
    }
  }, [tab, activityId, reloadFlag]);

  useEffect(() => {
    if (registrations.length > 0) {
      if (statusFilter === 'all') {
        setFilteredRegistrations(registrations);
      } else {
        setFilteredRegistrations(registrations.filter(reg => reg.status === statusFilter));
      }
    } else {
      setFilteredRegistrations([]);
    }
  }, [statusFilter, registrations]);

  useEffect(() => {
    if (attendance.length > 0) {
      if (attendanceFilter === 'all') {
        setFilteredAttendance(attendance);
      } else if (attendanceFilter === 'Chưa điểm danh') {
        setFilteredAttendance(attendance.filter(att => att.status === 'Đã duyệt'));
      } else {
        setFilteredAttendance(attendance.filter(att => att.status === attendanceFilter));
      }
    } else {
      setFilteredAttendance([]);
    }
  }, [attendanceFilter, attendance]);

  const handleBulkApprove = async (action) => {
    setLoading(true);
    let ids = [];
    if (action === 'Đã duyệt') {
      ids = registrations.filter(r => selectedRegs.includes(r.participationID) && r.status !== 'Đã duyệt').map(r => r.participationID);
    } else if (action === 'Từ chối') {
      ids = registrations.filter(r => selectedRegs.includes(r.participationID) && r.status === 'Chờ duyệt').map(r => r.participationID);
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
    if (selectedAtts.length === 0) {
      setMessage('Vui lòng chọn ít nhất một sinh viên');
      return;
    }
    try {
      const res = await fetch(`${API_URL}/${activityId}/attendance/confirm`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          participationIDs: selectedAtts,
          status: status
        })
      });
      if (!res.ok) throw new Error('Lỗi cập nhật trạng thái tham gia');
      setMessage('Đã cập nhật trạng thái tham gia thành công!');
      setSelectedAtts([]);
      setReloadFlag(prev => prev + 1);
    } catch (error) {
      setMessage('Lỗi khi cập nhật trạng thái tham gia');
    }
  };

  const handleSearchRegStudent = async (e) => {
    e.preventDefault();
    if (!searchRegStudentCode.trim()) {
      setSearchRegError('Vui lòng nhập mã số sinh viên');
      return;
    }
    setSearchRegLoading(true);
    setSearchRegError('');
    try {
      const res = await fetch(`${API_URL}/${activityId}/search-student?studentID=${searchRegStudentCode}`);
      const data = await res.json();
      if (!res.ok) {
        setSearchRegError(data.message || 'Không tìm thấy sinh viên trong danh sách đăng ký');
        setSearchRegResult(null);
      } else {
        setSearchRegResult(data);
      }
    } catch (err) {
      setSearchRegError('Lỗi khi tìm kiếm sinh viên đăng ký');
      setSearchRegResult(null);
    } finally {
      setSearchRegLoading(false);
    }
  };

  const handleSearchAttStudent = async (e) => {
    e.preventDefault();
    if (!searchAttStudentCode.trim()) {
      setSearchAttError('Vui lòng nhập mã số sinh viên');
      return;
    }
    setSearchAttLoading(true);
    setSearchAttError('');
    try {
      const res = await fetch(`${API_URL}/${activityId}/search-student?studentID=${searchAttStudentCode}`);
      const data = await res.json();
      if (!res.ok) {
        setSearchAttError(data.message || 'Không tìm thấy sinh viên trong danh sách tham gia');
        setSearchAttResult(null);
      } else {
        setSearchAttResult(data);
      }
    } catch (err) {
      setSearchAttError('Lỗi khi tìm kiếm sinh viên tham gia');
      setSearchAttResult(null);
    } finally {
      setSearchAttLoading(false);
    }
  };

  const handleSelectAllRegistrations = (checked) => {
    if (checked) {
      const validIds = filteredRegistrations
        .filter(reg => !['Đã tham gia', 'Vắng'].includes(reg.status))
        .map(reg => reg.participationID);
      setSelectedRegs(validIds);
    } else {
      setSelectedRegs([]);
    }
  };

  const handleSelectAllAttendance = (checked) => {
    if (checked) {
      // Chỉ chọn những sinh viên có thể điểm danh (status = 'Đã duyệt')
      const validIds = filteredAttendance
        .filter(att => att.status === 'Đã duyệt')
        .map(att => att.participationID);
      setSelectedAtts(validIds);
    } else {
      setSelectedAtts([]);
    }
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
                <span className="inline-block px-3 py-1 rounded-full bg-blue-100 text-blue-800">
                  {activity.activityStatus}
                </span>
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
          <div className="mb-4">
            <form onSubmit={handleSearchRegStudent} className="flex gap-2 items-center">
              <input
                type="text"
                placeholder="Tìm kiếm sinh viên theo MSSV..."
                className="border rounded px-3 py-1"
                value={searchRegStudentCode}
                onChange={(e) => setSearchRegStudentCode(e.target.value)}
              />
              <button type="submit" className="bg-blue-600 text-white px-3 py-1 rounded" disabled={searchRegLoading}>
                {searchRegLoading ? 'Đang tìm...' : 'Tìm kiếm'}
              </button>
            </form>
            {searchRegError && <div className="text-red-600 mt-2">{searchRegError}</div>}
            {searchRegResult && (
              <div className="mt-2 p-3 bg-blue-50 rounded">
                <h4 className="font-bold">Kết quả tìm kiếm:</h4>
                <p>MSSV: {searchRegResult.student.studentID}</p>
                <p>Họ tên: {searchRegResult.student.name}</p>
                <p>Email: {searchRegResult.student.email}</p>
                <p>Trạng thái: {searchRegResult.student.participationStatusText}</p>
                {searchRegResult.student.participation?.trainingPoint !== null && (
                  <p>Điểm rèn luyện: {searchRegResult.student.participation?.trainingPoint}</p>
                )}
              </div>
            )}
          </div>
          <div className="mb-4 flex justify-between items-center">
            <div className="flex items-center gap-4">
              <h2 className="text-xl font-semibold text-gray-800">
                Danh sách đăng ký
                {filteredRegistrations.length > 0 && (
                  <span className="ml-2 text-sm font-normal text-gray-500">
                    (Đã chọn: {selectedRegs.length}/{filteredRegistrations.filter(reg => !['Đã tham gia', 'Vắng'].includes(reg.status)).length} sinh viên có thể chọn)
                  </span>
                )}
              </h2>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="border border-gray-300 rounded-md px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">Tất cả trạng thái</option>
                <option value="Chờ duyệt">Chờ duyệt</option>
                <option value="Từ chối">Từ chối</option>
              </select>
            </div>
            <div className="flex gap-2">
              <button 
                disabled={selectedRegs.length===0 || loading} 
                onClick={()=>handleBulkApprove('Đã duyệt')} 
                className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                Duyệt ({selectedRegs.length})
              </button>
              <button 
                disabled={selectedRegs.length===0 || loading} 
                onClick={()=>handleBulkApprove('Từ chối')} 
                className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                Từ chối ({selectedRegs.length})
              </button>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow overflow-hidden">
            <table className="table-fixed w-full min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-2 py-3 text-left" style={{width: '5%'}}>
                    <input 
                      type="checkbox" 
                      checked={
                        selectedRegs.length > 0 && 
                        selectedRegs.length === filteredRegistrations.filter(reg => !['Đã tham gia', 'Vắng'].includes(reg.status)).length
                      }
                      onChange={(e) => handleSelectAllRegistrations(e.target.checked)}
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                  </th>
                  <th className="px-2 py-3 text-left" style={{width: '15%'}}>MSSV</th>
                  <th className="px-2 py-3 text-left" style={{width: '30%'}}>Họ tên</th>
                  <th className="px-2 py-3 text-left" style={{width: '15%'}}>Niên khóa</th>
                  <th className="px-2 py-3 text-left" style={{width: '20%'}}>Khoa</th>
                  <th className="px-2 py-3 text-left" style={{width: '15%'}}>Trạng thái</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredRegistrations.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-6 py-4 text-center text-sm text-gray-500">
                      {statusFilter === 'all' 
                        ? 'Không có đăng ký nào cần xử lý.'
                        : `Không có đăng ký nào có trạng thái "${statusFilter}".`
                      }
                    </td>
                  </tr>
                ) : filteredRegistrations.map(r => (
                  <tr key={r.participationID} className="hover:bg-gray-50">
                    <td className="px-2 py-4 whitespace-nowrap" style={{width: '5%'}}>
                      <input 
                        type="checkbox" 
                        checked={selectedRegs.includes(r.participationID)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            if (!['Đã tham gia', 'Vắng'].includes(r.status)) {
                              setSelectedRegs([...selectedRegs, r.participationID]);
                            }
                          } else {
                            setSelectedRegs(selectedRegs.filter(id => id !== r.participationID));
                          }
                        }}
                        disabled={['Đã tham gia', 'Vắng'].includes(r.status)}
                        className="rounded border-gray-300 text-blue-600 focus:ring-blue-500 disabled:opacity-50"
                      />
                    </td>
                    <td className="px-2 py-4 whitespace-nowrap text-sm font-medium text-gray-900" style={{width: '15%'}}>{r.studentID}</td>
                    <td className="px-2 py-4 whitespace-nowrap text-sm text-gray-900" style={{width: '30%'}}>{r.studentName}</td>
                    <td className="px-2 py-4 whitespace-nowrap text-sm text-gray-500" style={{width: '15%'}}>{r.academicYear}</td>
                    <td className="px-2 py-4 whitespace-nowrap text-sm text-gray-500" style={{width: '20%'}}>{r.faculty}</td>
                    <td className="px-2 py-4 whitespace-nowrap" style={{width: '15%'}}>
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium
                        ${r.status === 'Đã duyệt' ? 'bg-green-100 text-green-800' : 
                          r.status === 'Chờ duyệt' ? 'bg-yellow-100 text-yellow-800' : 
                          'bg-red-100 text-red-800'}`}>
                        {r.status === 'Đã duyệt' ? 'Đã duyệt' : 
                         r.status === 'Chờ duyệt' ? 'Chờ duyệt' : 
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
          <div className="mb-4">
            <form onSubmit={handleSearchAttStudent} className="flex gap-2 items-center">
              <input
                type="text"
                placeholder="Tìm kiếm sinh viên theo MSSV..."
                className="border rounded px-3 py-1"
                value={searchAttStudentCode}
                onChange={(e) => setSearchAttStudentCode(e.target.value)}
              />
              <button type="submit" className="bg-blue-600 text-white px-3 py-1 rounded" disabled={searchAttLoading}>
                {searchAttLoading ? 'Đang tìm...' : 'Tìm kiếm'}
              </button>
            </form>
            {searchAttError && <div className="text-red-600 mt-2">{searchAttError}</div>}
            {searchAttResult && (
              <div className="mt-2 p-3 bg-blue-50 rounded">
                <h4 className="font-bold">Kết quả tìm kiếm:</h4>
                <p>MSSV: {searchAttResult.student.studentID}</p>
                <p>Họ tên: {searchAttResult.student.name}</p>
                <p>Email: {searchAttResult.student.email}</p>
                <p>Trạng thái: {searchAttResult.student.participationStatusText}</p>
                {searchAttResult.student.participation?.trainingPoint !== null && (
                  <p>Điểm rèn luyện: {searchAttResult.student.participation?.trainingPoint}</p>
                )}
              </div>
            )}
          </div>
          <div className="mb-4 flex justify-between items-center">
            <div className="flex items-center gap-4">
              <h2 className="text-xl font-semibold text-gray-800">
                Danh sách tham gia
                {filteredAttendance.length > 0 && (
                  <span className="ml-2 text-sm font-normal text-gray-500">
                    (Đã chọn: {selectedAtts.length}/{filteredAttendance.filter(att => att.status === 'Đã duyệt').length} sinh viên chưa điểm danh)
                  </span>
                )}
              </h2>
              <select
                value={attendanceFilter}
                onChange={(e) => setAttendanceFilter(e.target.value)}
                className="border border-gray-300 rounded-md px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">Tất cả trạng thái</option>
                <option value="Chưa điểm danh">Chưa điểm danh</option>
                <option value="Đã tham gia">Đã tham gia</option>
                <option value="Vắng">Vắng</option>
              </select>
            </div>
            <div className="flex gap-2">
              <button 
                disabled={selectedAtts.length===0} 
                onClick={()=>handleBulkConfirm('Đã tham gia')} 
                className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                Xác nhận tham gia ({selectedAtts.length})
              </button>
              <button 
                disabled={selectedAtts.length===0 || loading} 
                onClick={()=>handleBulkConfirm('Vắng')} 
                className="bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                Đánh dấu vắng ({selectedAtts.length})
              </button>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow overflow-hidden">
            <table className="table-fixed w-full min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-2 py-3 text-left" style={{width: '5%'}}>
                    <input 
                      type="checkbox" 
                      checked={
                        selectedAtts.length > 0 && 
                        selectedAtts.length === filteredAttendance.filter(att => att.status === 'Đã duyệt').length
                      }
                      onChange={(e) => handleSelectAllAttendance(e.target.checked)}
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                  </th>
                  <th className="px-2 py-3 text-left" style={{width: '15%'}}>MSSV</th>
                  <th className="px-2 py-3 text-left" style={{width: '30%'}}>Họ tên</th>
                  <th className="px-2 py-3 text-left" style={{width: '15%'}}>Niên khóa</th>
                  <th className="px-2 py-3 text-left" style={{width: '20%'}}>Khoa</th>
                  <th className="px-2 py-3 text-left" style={{width: '15%'}}>Trạng thái</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredAttendance.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-6 py-4 text-center text-sm text-gray-500">
                      {attendanceFilter === 'all' 
                        ? 'Chưa có sinh viên nào được duyệt tham gia.'
                        : `Không có sinh viên nào có trạng thái "${attendanceFilter}".`
                      }
                    </td>
                  </tr>
                ) : filteredAttendance.map(att => (
                  <tr key={att.participationID} className="hover:bg-gray-50">
                    <td className="px-2 py-4 whitespace-nowrap" style={{width: '5%'}}>
                      <input 
                        type="checkbox" 
                        checked={selectedAtts.includes(att.participationID)}
                        onChange={e => setSelectedAtts(e.target.checked ? [...selectedAtts, att.participationID] : selectedAtts.filter(id => id !== att.participationID))}
                        className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                        disabled={att.status !== 'Đã duyệt'}
                      />
                    </td>
                    <td className="px-2 py-4 whitespace-nowrap text-sm font-medium text-gray-900" style={{width: '15%'}}>{att.studentID}</td>
                    <td className="px-2 py-4 whitespace-nowrap text-sm text-gray-900" style={{width: '30%'}}>{att.studentName}</td>
                    <td className="px-2 py-4 whitespace-nowrap text-sm text-gray-500" style={{width: '15%'}}>{att.academicYear}</td>
                    <td className="px-2 py-4 whitespace-nowrap text-sm text-gray-500" style={{width: '20%'}}>{att.faculty}</td>
                    <td className="px-2 py-4 whitespace-nowrap" style={{width: '15%'}}>
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium
                        ${att.status === 'Đã tham gia' ? 'bg-green-100 text-green-800' : 
                          att.status === 'Vắng' ? 'bg-red-100 text-red-800' : 
                          'bg-gray-100 text-gray-800'}`}>
                        {att.status === 'Đã tham gia' ? 'Đã tham gia' : 
                         att.status === 'Vắng' ? 'Vắng' : 
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