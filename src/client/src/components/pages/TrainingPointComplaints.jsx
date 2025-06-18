import React, { useState } from 'react';

export default function TrainingPointComplaints({ participations, onClose, mode = 'complaint', activityId, studentID, currentPoint }) {
  // Nếu chỉ có 1 participation, lấy luôn
  const single = participations && participations.length === 1;
  const [selectedParticipation, setSelectedParticipation] = useState(single ? participations[0].participationID : '');
  const [description, setDescription] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const [newPoint, setNewPoint] = useState(currentPoint ?? 0);
  const token = localStorage.getItem('accessToken');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    if (mode === 'update-point') {
      // Organizer cập nhật điểm
      if (isNaN(newPoint) || newPoint < 0 || newPoint > 100) {
        setError('Điểm phải từ 0 đến 100'); return;
      }
      if (!description.trim()) {
        setError('Vui lòng nhập lý do cập nhật'); return;
      }
      setLoading(true);
      try {
        const res = await fetch(`http://localhost:3001/activity/${activityId}/training-point`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ studentID, newPoint: Number(newPoint), reason: description })
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.message || 'Lỗi cập nhật điểm');
        setSuccess('Cập nhật điểm thành công!');
        setTimeout(() => { if (onClose) onClose(); }, 1200);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
      return;
    }
    // Student gửi khiếu nại
    if (!selectedParticipation || !description.trim()) {
      setError('Vui lòng nhập lý do/chi tiết khiếu nại.');
      return;
    }
    setLoading(true);
    try {
      const res = await fetch('http://localhost:3001/student/complaint', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          participationID: selectedParticipation,
          description: description.trim()
        })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Lỗi gửi khiếu nại');
      setSuccess('Gửi khiếu nại thành công!');
      setDescription('');
      setTimeout(() => { if (onClose) onClose(); }, 1200);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (mode === 'update-point') {
    return (
      <form className="bg-white p-4 rounded shadow max-w-xl mx-auto" onSubmit={handleSubmit}>
        <h2 className="text-lg font-semibold mb-4">Cập nhật điểm rèn luyện cho sinh viên</h2>
        <div className="mb-3">Mã số sinh viên: <b>{studentID}</b></div>
        <div className="mb-3">Điểm hiện tại: <b>{currentPoint ?? 'Chưa có'}</b></div>
        <div className="mb-3">
          <label className="block mb-1 font-medium">Điểm mới</label>
          <input type="number" min={0} max={100} className="w-32 border rounded px-2 py-1" value={newPoint} onChange={e=>setNewPoint(e.target.value)} />
        </div>
        <div className="mb-3">
          <label className="block mb-1 font-medium">Lý do cập nhật</label>
          <input type="text" className="w-full border rounded px-2 py-1" value={description} onChange={e=>setDescription(e.target.value)} />
        </div>
        {error && <div className="text-red-600 mb-2">{error}</div>}
        {success && <div className="text-green-600 mb-2">{success}</div>}
        <div className="flex items-center gap-3">
          <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded disabled:opacity-50" disabled={loading}>{loading ? 'Đang lưu...' : 'Xác nhận'}</button>
          {onClose && (
            <button type="button" className="text-gray-500 underline text-sm" onClick={onClose}>Đóng</button>
          )}
        </div>
      </form>
    );
  }

  // Mặc định: form gửi khiếu nại cho student
  return (
    <form className="bg-white p-4 rounded shadow max-w-xl mx-auto" onSubmit={handleSubmit}>
      <h2 className="text-lg font-semibold mb-4">Gửi khiếu nại điểm rèn luyện</h2>
      {single ? (
        <div className="mb-3">
          <div className="font-medium mb-1">Hoạt động:</div>
          <div className="mb-2 text-blue-700 font-semibold">{participations[0].activityName} (ID: {participations[0].participationID})</div>
        </div>
      ) : (
        <div className="mb-3">
          <label className="block mb-1 font-medium">Chọn hoạt động</label>
          <select
            className="w-full border rounded px-2 py-1"
            value={selectedParticipation}
            onChange={e => setSelectedParticipation(e.target.value)}
          >
            <option value="">-- Chọn hoạt động --</option>
            {participations.map(p => (
              <option key={p.participationID} value={p.participationID}>
                {p.activityName} (ID: {p.participationID})
              </option>
            ))}
          </select>
        </div>
      )}
      <div className="mb-3">
        <label className="block mb-1 font-medium">Lý do/Chi tiết khiếu nại</label>
        <textarea
          className="w-full border rounded px-2 py-1"
          rows={3}
          value={description}
          onChange={e => setDescription(e.target.value)}
        />
      </div>
      {error && <div className="text-red-600 mb-2">{error}</div>}
      {success && <div className="text-green-600 mb-2">{success}</div>}
      <div className="flex items-center gap-3">
        <button
          type="submit"
          className="bg-blue-600 text-white px-4 py-2 rounded disabled:opacity-50"
          disabled={loading}
        >
          {loading ? 'Đang gửi...' : 'Gửi khiếu nại'}
        </button>
        {onClose && (
          <button
            type="button"
            className="text-gray-500 underline text-sm"
            onClick={onClose}
          >
            Đóng
          </button>
        )}
      </div>
    </form>
  );
} 