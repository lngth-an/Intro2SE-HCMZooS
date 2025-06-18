import React, { useEffect, useState } from 'react';
import { useParams, useLocation, useNavigate, Link } from 'react-router-dom';
import { DOMAINS } from '../../constants/activityTypes';

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
        })
        .catch(err => console.error('Error fetching registrations:', err));
    }
    if (tab === 'attendance') {
      fetch(`${API_URL}/${activityId}/registrations?status=Đã duyệt&status=Đã tham gia&status=Vắng`)
        .then(res => res.json())
        .then(data => {
          console.log('Fetched attendance data:', data); // Debug log
          const attendanceData = (data.registrations || [])
            .map(reg => ({
              ...reg,
              displayStatus: reg.status === 'Đã duyệt' ? 'Chưa điểm danh' : reg.status,
              trainingPoint: reg.trainingPoint || 0 // Đảm bảo luôn có giá trị điểm
            }))
            .sort((a, b) => {
              // Sắp xếp theo trạng thái
              const statusOrder = {
                'Đã duyệt': 1,
                'Đã tham gia': 2,
                'Vắng': 3
              };
              if (statusOrder[a.status] !== statusOrder[b.status]) {
                return statusOrder[a.status] - statusOrder[b.status];
              }
              // Nếu cùng trạng thái, sắp xếp theo MSSV
              return a.studentID.localeCompare(b.studentID);
            });
          setAttendance(attendanceData);
        })
        .catch(err => console.error('Error fetching attendance:', err));
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
      // Chỉ chọn những participation có trạng thái "Đã duyệt"
      const approvedParticipations = filteredAttendance
        .filter(att => att.status === 'Đã duyệt')
        .map(att => att.participationID);
      setSelectedAtts(approvedParticipations);
    } else {
      setSelectedAtts([]);
    }
  };

  const renderActivityInfo = () => {
    if (!activity) return null;

    const domain = DOMAINS.find(d => d.id === activity.type);
    const points = domain ? domain.defaultPoint : 3;

  return (
      <div className="bg-white rounded-lg shadow-md p-6">
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
          </div>

          {/* Nội dung bên phải */}
          <div className="space-y-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">{activity.name}</h1>
              <div className="flex flex-wrap gap-2 mb-4">
                <span className={`px-3 py-1 rounded-full text-sm font-medium ${domain?.color || 'bg-gray-100 text-gray-800'}`}>
                  {activity.type}
                </span>
                <span className="px-3 py-1 rounded-full text-sm font-medium bg-yellow-100 text-yellow-800">
                  {points} điểm
                </span>
                <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                  activity.activityStatus === 'Đã đăng tải' ? 'bg-green-100 text-green-800' :
                  activity.activityStatus === 'Chờ duyệt' ? 'bg-yellow-100 text-yellow-800' :
                  activity.activityStatus === 'Đã hoàn thành' ? 'bg-blue-100 text-blue-800' :
                  'bg-gray-100 text-gray-800'
                }`}>
                  {activity.activityStatus}
                </span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="bg-gray-50 p-4 rounded-lg">
                <h3 className="text-sm font-medium text-gray-500">Thời gian diễn ra</h3>
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
                <p className="mt-1 text-sm text-gray-900">{activity.maxParticipants || 'Không giới hạn'}</p>
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

            <div className="flex justify-end space-x-4">
              <Link
                to={`/organizer/activities/${activityId}/edit`}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
              >
                Chỉnh sửa
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  };

  if (loading) return <div>Loading...</div>;
  if (!activity) return <div>Activity not found.</div>;

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-6">
        <button
          onClick={() => navigate(-1)}
          className="text-blue-600 hover:text-blue-800 flex items-center"
        >
          ← Quay lại
        </button>
      </div>

      <div className="mb-6">
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex space-x-8">
            <button
              onClick={() => setTab('info')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                tab === 'info'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Thông tin
            </button>
            <button
              onClick={() => setTab('registrations')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                tab === 'registrations'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Đăng ký
            </button>
            <button
              onClick={() => setTab('attendance')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                tab === 'attendance'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Điểm danh
            </button>
          </nav>
        </div>
      </div>

      {loading ? (
        <div>Loading...</div>
      ) : (
        <div>
          {tab === 'info' && renderActivityInfo()}
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

      {tab === 'attendance' && (
            <div className="bg-white shadow rounded-lg overflow-hidden">
              <div className="p-6 border-b border-gray-200">
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-xl font-semibold text-gray-900">
                    Danh sách tham gia
                    {filteredAttendance.length > 0 && (
                      <span className="ml-2 text-sm font-normal text-gray-500">
                        (Đã chọn: {selectedAtts.length}/{filteredAttendance.filter(att => att.status === 'Đã duyệt').length} sinh viên chưa điểm danh)
                      </span>
                    )}
                  </h2>
                  {activity.activityStatus === 'Đã hoàn thành' && (
                    <div className="flex space-x-2">
              <button 
                        onClick={() => handleBulkConfirm('Đã tham gia')}
                        disabled={selectedAtts.length === 0}
                        className="px-4 py-2 bg-green-600 text-white text-sm font-medium rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50"
              >
                Xác nhận tham gia
              </button>
              <button 
                        onClick={() => handleBulkConfirm('Vắng')}
                        disabled={selectedAtts.length === 0}
                        className="px-4 py-2 bg-red-600 text-white text-sm font-medium rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 disabled:opacity-50"
              >
                Đánh dấu vắng
                      </button>
                    </div>
                  )}
                </div>

                <div className="flex justify-between items-center mb-4">
                  <div className="flex items-center space-x-4">
                    <select
                      value={attendanceFilter}
                      onChange={(e) => setAttendanceFilter(e.target.value)}
                      className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
                    >
                      <option value="all">Tất cả</option>
                      <option value="Chưa điểm danh">Chưa điểm danh</option>
                      <option value="Đã tham gia">Đã tham gia</option>
                      <option value="Vắng">Vắng</option>
                    </select>
                  </div>

                  <div className="flex items-center space-x-2">
                    <input
                      type="text"
                      value={searchAttStudentCode}
                      onChange={(e) => setSearchAttStudentCode(e.target.value)}
                      placeholder="Nhập MSSV..."
                      className="block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
                    />
                    <button
                      onClick={handleSearchAttStudent}
                      className="px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                    >
                      Tìm kiếm
              </button>
            </div>
          </div>

                {searchAttError && (
                  <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-md">
                    <p className="text-sm text-red-600">{searchAttError}</p>
                  </div>
                )}

                <div className="mt-4 flex flex-col">
                  <div className="-my-2 overflow-x-auto sm:-mx-6 lg:-mx-8">
                    <div className="py-2 align-middle inline-block min-w-full sm:px-6 lg:px-8">
                      <div className="shadow overflow-hidden border-b border-gray-200 sm:rounded-lg">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                              {activity.activityStatus === 'Đã hoàn thành' && (
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    <input 
                      type="checkbox" 
                                    checked={
                                      selectedAtts.length > 0 && 
                                      selectedAtts.length === filteredAttendance.filter(att => att.status === 'Đã duyệt').length
                                    }
                                    onChange={(e) => handleSelectAllAttendance(e.target.checked)}
                                    className="focus:ring-blue-500 h-4 w-4 text-blue-600 border-gray-300 rounded"
                    />
                  </th>
                              )}
                              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                MSSV
                              </th>
                              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Họ tên
                              </th>
                              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Trạng thái
                              </th>
                              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Điểm rèn luyện
                              </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                            {filteredAttendance.map((att) => (
                              <tr key={att.participationID}>
                                {activity.activityStatus === 'Đã hoàn thành' && (
                    <td className="px-6 py-4 whitespace-nowrap">
                                    {att.status === 'Đã duyệt' && (
                      <input 
                        type="checkbox" 
                                        checked={selectedAtts.includes(att.participationID)}
                                        onChange={(e) => {
                                          if (e.target.checked) {
                                            setSelectedAtts([...selectedAtts, att.participationID]);
                                          } else {
                                            setSelectedAtts(selectedAtts.filter(id => id !== att.participationID));
                                          }
                                        }}
                                        className="focus:ring-blue-500 h-4 w-4 text-blue-600 border-gray-300 rounded"
                                      />
                                    )}
                                  </td>
                                )}
                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                  {att.studentID}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                  {att.studentName}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                                  <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                                    att.status === 'Đã tham gia'
                                      ? 'bg-green-100 text-green-800'
                                      : att.status === 'Vắng'
                                      ? 'bg-red-100 text-red-800'
                                      : 'bg-yellow-100 text-yellow-800'
                                  }`}>
                                    {att.status === 'Đã duyệt' ? 'Chưa điểm danh' : att.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                  {att.trainingPoint}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {showUpdate && (
        <UpdatePointModal
          open={!!showUpdate}
          onClose={() => setShowUpdate(null)}
          student={showUpdate}
          activityId={activityId}
          reload={() => setReloadFlag(prev => prev + 1)}
        />
      )}
    </div>
  );
} 