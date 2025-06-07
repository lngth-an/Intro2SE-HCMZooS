import React, { useEffect, useState } from 'react';

export default function StudentActivities() {
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/student/activities?allStatus=true')
      .then(res => res.json())
      .then(data => {
        setActivities(data.activities || []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  return (
    <main className="min-h-screen bg-gray-50 p-6">
      <h2 className="text-2xl font-bold mb-6 text-gray-800">Quản lý hoạt động của bạn</h2>
      {loading ? (
        <div>Đang tải hoạt động...</div>
      ) : activities.length === 0 ? (
        <div>Chưa có hoạt động nào.</div>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full border rounded">
            <thead className="bg-gray-100">
              <tr>
                <th className="px-4 py-2 border">Tên hoạt động</th>
                <th className="px-4 py-2 border">Loại</th>
                <th className="px-4 py-2 border">Điểm rèn luyện</th>
                <th className="px-4 py-2 border">Thời gian</th>
                <th className="px-4 py-2 border">Địa điểm</th>
                <th className="px-4 py-2 border">Trạng thái</th>
              </tr>
            </thead>
            <tbody>
              {activities.map(act => (
                <tr key={act.participationID || act.activityID}>
                  <td className="px-4 py-2 border font-medium">{act.name}</td>
                  <td className="px-4 py-2 border">{act.type}</td>
                  <td className="px-4 py-2 border text-center">{act.trainingPoint || 0}</td>
                  <td className="px-4 py-2 border">{act.eventStart ? new Date(act.eventStart).toLocaleString() : ''}</td>
                  <td className="px-4 py-2 border">{act.location}</td>
                  <td className="px-4 py-2 border text-center">
                    <span className={`inline-block px-2 py-1 text-xs rounded font-semibold ${
                      act.participationStatus === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                      act.participationStatus === 'approved' ? 'bg-blue-100 text-blue-800' :
                      act.participationStatus === 'present' ? 'bg-green-100 text-green-800' :
                      act.participationStatus === 'rejected' ? 'bg-red-100 text-red-800' :
                      'bg-gray-100 text-gray-700'
                    }`}>
                      {act.participationStatus === 'pending' ? 'Chờ duyệt' :
                        act.participationStatus === 'approved' ? 'Đã duyệt' :
                        act.participationStatus === 'present' ? 'Đã tham gia' :
                        act.participationStatus === 'rejected' ? 'Bị từ chối' :
                        act.participationStatus}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </main>
  );
} 