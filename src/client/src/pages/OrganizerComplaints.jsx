import React, { useEffect, useState } from 'react';

export default function OrganizerComplaints() {
  const [complaints, setComplaints] = useState([]);
  const [activities, setActivities] = useState([]);
  const [selectedActivity, setSelectedActivity] = useState('');
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
    if (selectedActivity) url += `activityID=${selectedActivity}&`;
    if (status) url += `status=${status}&`;
    fetch(url)
      .then(res => res.json())
      .then(data => {
        setComplaints(data.complaints || []);
        setLoading(false);
      });
  }, [selectedActivity, status, reloadFlag]);

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
    if (modalStatus === 'approved') {
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
      if (modalStatus === 'approved') {
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
    <div className="max-w-5xl mx-auto p-6">
      <h2 className="text-2xl font-bold mb-4">Quản lý khiếu nại điểm rèn luyện</h2>
      {/* Filter bar */}
      <div className="flex gap-4 mb-4">
        <select value={selectedActivity} onChange={e => setSelectedActivity(e.target.value)}>
          <option value="">-- Tất cả hoạt động --</option>
          {activities.map(act => (
            <option key={act.activityID} value={act.activityID}>{act.name}</option>
          ))}
        </select>
        <select value={status} onChange={e => setStatus(e.target.value)}>
          <option value="">-- Tất cả trạng thái --</option>
          <option value="pending">Chờ xử lý</option>
          <option value="approved">Đã duyệt</option>
          <option value="rejected">Đã từ chối</option>
        </select>
      </div>
      {/* Complaint list */}
      {loading ? (
        <div>Đang tải...</div>
      ) : complaints.length === 0 ? (
        <div className="text-gray-500">Không có khiếu nại nào</div>
      ) : (
        <table className="min-w-full border mb-6">
          <thead>
            <tr>
              <th className="border px-2 py-1">Sinh viên</th>
              <th className="border px-2 py-1">Mã số sinh viên</th>
              <th className="border px-2 py-1">Điểm hiện tại</th>
              <th className="border px-2 py-1">Hoạt động</th>
              <th className="border px-2 py-1">Trạng thái</th>
              <th className="border px-2 py-1">Ngày gửi</th>
              <th className="border px-2 py-1">Xem</th>
            </tr>
          </thead>
          <tbody>
            {complaints.map(c => (
              <tr key={c.complaintID}>
                <td className="border px-2 py-1">{c.studentName}</td>
                <td className="border px-2 py-1">{c.studentID}</td>
                <td className="border px-2 py-1">{c.currentPoint ?? 'Chưa có'}</td>
                <td className="border px-2 py-1">{c.activityName}</td>
                <td className="border px-2 py-1">{c.complaintStatus}</td>
                <td className="border px-2 py-1">{new Date(c.createdAt).toLocaleString()}</td>
                <td className="border px-2 py-1">
                  <button className="text-blue-600 underline" onClick={() => handleSelectComplaint(c.complaintID)}>
                    Xem
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
      {/* Complaint detail panel/modal */}
      {selectedComplaint && (
        <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded shadow max-w-xl w-full relative">
            <form onSubmit={handleOrganizerSubmit}>
              <h2 className="text-lg font-semibold mb-4">Xử lý khiếu nại điểm rèn luyện</h2>
              <div className="mb-2"><b>Sinh viên:</b> {selectedComplaint.studentName}</div>
              <div className="mb-2"><b>Mã số sinh viên:</b> {selectedComplaint.studentID}</div>
              <div className="mb-2"><b>Điểm hiện tại:</b> <b>{selectedComplaint.currentPoint ?? 'Chưa có'}</b></div>
              <div className="mb-2"><b>Hoạt động:</b> {selectedComplaint.activityName}</div>
              <div className="mb-2"><b>Lý do khiếu nại:</b> {selectedComplaint.description}</div>
              <div className="mb-2"><b>Trạng thái hiện tại:</b> {selectedComplaint.complaintStatus}</div>
              <div className="mb-3">
                <label className="block mb-1 font-medium">Trạng thái xử lý</label>
                <select className="w-full border rounded px-2 py-1" value={modalStatus} onChange={e=>setModalStatus(e.target.value)}>
                  <option value="pending">Chờ xử lý</option>
                  <option value="approved">Duyệt</option>
                  <option value="rejected">Từ chối</option>
                </select>
              </div>
              {modalStatus === 'approved' && (
                <div className="mb-3">
                  <label className="block mb-1 font-medium">Điểm mới</label>
                  <input type="number" min={0} max={100} className="w-32 border rounded px-2 py-1" value={modalPoint} onChange={e=>setModalPoint(e.target.value)} />
                </div>
              )}
              <div className="mb-3">
                <label className="block mb-1 font-medium">Lý do cập nhật (phản hồi)</label>
                <input type="text" className="w-full border rounded px-2 py-1" value={modalResponse} onChange={e=>setModalResponse(e.target.value)} />
              </div>
              {modalError && <div className="text-red-600 mb-2">{modalError}</div>}
              {modalSuccess && <div className="text-green-600 mb-2">{modalSuccess}</div>}
              <div className="flex items-center gap-3">
                <button type="submit" c
                lassName="bg-blue-600 text-white px-4 py-2 rounded disabled:opacity-50" disabled={modalLoading}>{modalLoading ? 'Đang lưu...' : 'Xác nhận'}</button>
                <button type="button" className="text-gray-500 underline text-sm" onClick={handleCloseModal}>Đóng</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
} 