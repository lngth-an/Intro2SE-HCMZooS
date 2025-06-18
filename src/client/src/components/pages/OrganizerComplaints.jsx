import React, { useEffect, useState } from 'react';
import { FileWarning, Eye, CheckCircle, XCircle, Clock, Filter } from 'lucide-react';

export default function OrganizerComplaints() {
  const [complaints, setComplaints] = useState([]);
  const [activities, setActivities] = useState([]);
  const [status, setStatus] = useState('');
  const [selectedComplaint, setSelectedComplaint] = useState(null);
  const [loading, setLoading] = useState(false);
  const [reloadFlag, setReloadFlag] = useState(0);

  // Modal state for organizer
  const [modalStatus, setModalStatus] = useState('pending');
  const [modalResponse, setModalResponse] = useState('');
  const [modalPoint, setModalPoint] = useState(0);
  const [modalError, setModalError] = useState('');
  const [modalSuccess, setModalSuccess] = useState('');
  const [modalLoading, setModalLoading] = useState(false);

  // Status colors mapping
  const statusColors = {
    'Chờ duyệt': 'bg-yellow-100 text-yellow-800',
    'Đã duyệt': 'bg-green-100 text-green-800',
    'Từ chối': 'bg-red-100 text-red-800'
  };

  // Status icons mapping
  const statusIcons = {
    'Chờ duyệt': Clock,
    'Đã duyệt': CheckCircle,
    'Từ chối': XCircle
  };

  // Fetch activities for filter
  useEffect(() => {
    fetch('/activity/organizer')
      .then(res => res.json())
      .then(data => setActivities(data.activities || []));
  }, []);

  // Fetch complaints with filters
  useEffect(() => {
    setLoading(true);
    let url = `/activity/complaint/organizer?`;
    if (status) url += `status=${status}&`;
    fetch(url)
      .then(res => res.json())
      .then(data => {
        setComplaints(data.complaints || []);
        setLoading(false);
      });
  }, [status, reloadFlag]);

  // Fetch complaint details when selected
  const handleSelectComplaint = (complaintID) => {
    fetch(`/activity/complaint/${complaintID}`)
      .then(res => res.json())
      .then(data => {
        setSelectedComplaint(data.complaint);
        setModalStatus(data.complaint.complaintStatus || 'pending');
        setModalResponse(data.complaint.response || '');
        setModalPoint(data.complaint.currentPoint ?? 0);
        setModalError('');
        setModalSuccess('');
      });
  };

  // Đóng modal và reload danh sách khiếu nại
  const handleCloseModal = () => {
    setSelectedComplaint(null);
    setReloadFlag(f => f + 1);
  };

  // Xử lý khi organizer xác nhận xử lý khiếu nại
  const handleOrganizerSubmit = async (e) => {
    e.preventDefault();
    setModalError(''); setModalSuccess('');
    if (!modalStatus) { setModalError('Vui lòng chọn trạng thái khiếu nại'); return; }
    if (!modalResponse.trim()) { setModalError('Vui lòng nhập lý do cập nhật (phản hồi)'); return; }
    if (modalStatus === 'Đã duyệt') {
      if (isNaN(modalPoint) || modalPoint < 0 || modalPoint > 100) {
        setModalError('Điểm phải từ 0 đến 100'); return;
      }
    }
    setModalLoading(true);
    try {
      // Cập nhật trạng thái và response
      const res1 = await fetch(`/activity/complaint/${selectedComplaint.complaintID}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: modalStatus, response: modalResponse })
      });
      const data1 = await res1.json();
      if (!res1.ok) throw new Error(data1.message || 'Lỗi cập nhật khiếu nại');
      // Nếu duyệt, cập nhật điểm
      if (modalStatus === 'Đã duyệt') {
        const res2 = await fetch(`/activity/${selectedComplaint.activityID}/training-point`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            participationID: selectedComplaint.participationID,
            newPoint: Number(modalPoint),
            reason: modalResponse
          })
        });
        const data2 = await res2.json();
        if (!res2.ok) throw new Error(data2.message || 'Lỗi cập nhật điểm');
      }
      setModalSuccess('Cập nhật thành công!');
      setTimeout(() => { handleCloseModal(); }, 1200);
    } catch (err) {
      setModalError(err.message);
    } finally {
      setModalLoading(false);
    }
  };

  console.log('selectedComplaint:', selectedComplaint);

  return (
    <div className="space-y-6">
      {/* Header Section */}
      <div className="flex items-center justify-between px-4 py-6">
        <div>
          <h2 className="text-2xl font-bold uppercase">QUẢN LÝ KHIẾU NẠI</h2>
          <p className="text-gray-600">Xử lý các đơn khiếu nại từ sinh viên</p>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-sm font-medium text-gray-700">Lọc theo:</span>
          <select 
            value={status} 
            onChange={e => setStatus(e.target.value)}
            className="px-3 py-1.5 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
          >
            <option value="">Tất cả trạng thái</option>
            <option value="Chờ duyệt">Chờ xử lý</option>
            <option value="Đã duyệt">Đã duyệt</option>
            <option value="Từ chối">Đã từ chối</option>
          </select>
        </div>
      </div>

      {/* Complaints List */}
      <div className="bg-white rounded-lg shadow-sm p-6">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold text-gray-800">Danh sách khiếu nại</h3>
          <span className="text-sm text-gray-500">{complaints.length} khiếu nại</span>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            <span className="ml-2 text-gray-600">Đang tải...</span>
          </div>
        ) : complaints.length === 0 ? (
          <div className="text-center py-12">
            <FileWarning className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500 text-lg">Không có khiếu nại nào</p>
            <p className="text-gray-400">Tất cả khiếu nại đã được xử lý hoặc chưa có khiếu nại mới</p>
          </div>
        ) : (
          <div className="grid gap-4">
            {complaints.map(c => {
              const StatusIcon = statusIcons[c.complaintStatus] || Clock;
              return (
                <div key={c.complaintID} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-3">
                        <h4 className="text-lg font-semibold text-gray-800">{c.activityName}</h4>
                        <span className={`px-3 py-1 rounded-full text-sm font-medium flex items-center gap-1 ${statusColors[c.complaintStatus] || 'bg-gray-100 text-gray-800'}`}>
                          <StatusIcon className="w-4 h-4" />
                          {c.complaintStatus}
                        </span>
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 text-sm">
                        <div>
                          <span className="font-medium text-gray-700">Sinh viên:</span>
                          <p className="text-gray-600">{c.studentName}</p>
                        </div>
                        <div>
                          <span className="font-medium text-gray-700">Mã số:</span>
                          <p className="text-gray-600">{c.studentID}</p>
                        </div>
                        <div>
                          <span className="font-medium text-gray-700">Điểm hiện tại:</span>
                          <p className="text-gray-600">{c.currentPoint ?? 'Chưa có'}</p>
                        </div>
                        <div>
                          <span className="font-medium text-gray-700">Ngày gửi:</span>
                          <p className="text-gray-600">{new Date(c.createdAt).toLocaleDateString('vi-VN')}</p>
                        </div>
                      </div>

                      <div className="mt-3">
                        <span className="font-medium text-gray-700">Lý do khiếu nại:</span>
                        <p className="text-gray-600 mt-1">{c.description}</p>
                      </div>
                    </div>
                    
                    <div className="ml-4">
                      <button 
                        onClick={() => handleSelectComplaint(c.complaintID)}
                        className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
                      >
                        <Eye className="w-4 h-4" />
                        <span>Xem chi tiết</span>
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Complaint detail modal */}
      {selectedComplaint && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold text-gray-800">Xử lý khiếu nại điểm rèn luyện</h2>
                <button 
                  onClick={handleCloseModal}
                  className="text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <XCircle className="w-6 h-6" />
                </button>
              </div>

              <form onSubmit={handleOrganizerSubmit} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Sinh viên</label>
                    <p className="text-gray-900">{selectedComplaint.studentName}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Mã số sinh viên</label>
                    <p className="text-gray-900">{selectedComplaint.studentID}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Điểm hiện tại</label>
                    <p className="text-gray-900 font-semibold">{selectedComplaint.currentPoint ?? 'Chưa có'}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Hoạt động</label>
                    <p className="text-gray-900">{selectedComplaint.activityName}</p>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Lý do khiếu nại</label>
                  <p className="text-gray-900 bg-gray-50 p-3 rounded-md">{selectedComplaint.description}</p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Trạng thái hiện tại</label>
                  <span className={`px-3 py-1 rounded-full text-sm font-medium ${statusColors[selectedComplaint.complaintStatus] || 'bg-gray-100 text-gray-800'}`}>
                    {selectedComplaint.complaintStatus}
                  </span>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Trạng thái xử lý</label>
                  <select 
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    value={modalStatus} 
                    onChange={e => setModalStatus(e.target.value)}
                  >
                    <option value="Chờ duyệt">Chờ xử lý</option>
                    <option value="Đã duyệt">Duyệt</option>
                    <option value="Từ chối">Từ chối</option>
                  </select>
                </div>

                {modalStatus === 'Đã duyệt' && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Điểm mới</label>
                    <input 
                      type="number" 
                      min={0} 
                      max={100} 
                      className="w-32 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      value={modalPoint} 
                      onChange={e => setModalPoint(e.target.value)} 
                    />
                  </div>
                )}

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Lý do cập nhật (phản hồi)</label>
                  <textarea 
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    rows="3"
                    value={modalResponse} 
                    onChange={e => setModalResponse(e.target.value)}
                    placeholder="Nhập lý do cập nhật..."
                  />
                </div>

                {modalError && (
                  <div className="bg-red-50 border border-red-200 rounded-md p-3">
                    <p className="text-red-600">{modalError}</p>
                  </div>
                )}

                {modalSuccess && (
                  <div className="bg-green-50 border border-green-200 rounded-md p-3">
                    <p className="text-green-600">{modalSuccess}</p>
                  </div>
                )}

                <div className="flex items-center gap-3 pt-4">
                  <button 
                    type="submit" 
                    disabled={modalLoading}
                    className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {modalLoading ? 'Đang lưu...' : 'Xác nhận'}
                  </button>
                  <button 
                    type="button" 
                    onClick={handleCloseModal}
                    className="px-4 py-2 text-gray-600 border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
                  >
                    Đóng
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}