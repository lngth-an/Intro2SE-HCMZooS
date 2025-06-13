import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

const DEFAULT_IMAGE = 'https://cylpzmvdcyhkvghdeelb.supabase.co/storage/v1/object/public/activities//dai-hoc-khoa-ho-ctu-nhien-tphcm.jpg';

export default function StudentHomeMain({ onViewScore }) {
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [point, setPoint] = useState(null);
  const [studentInfo, setStudentInfo] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    // Lấy tất cả hoạt động mà sinh viên đã đăng ký/tham gia với mọi trạng thái
    fetch('/student/activities?allStatus=true')
      .then(res => res.json())
      .then(data => {
        setActivities(data.activities || []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  useEffect(() => {
    fetch('/student/me')
      .then(res => res.json())
      .then(data => {
        setPoint(data.point);
        setStudentInfo(data);
      })
      .catch(() => {
        setPoint(null);
        setStudentInfo(null);
      });
  }, []);

  return (
    <main className="min-h-screen bg-gray-50 p-6" style={{ marginLeft: 240 }}>
      {/* Score and Registration Section */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        {/* Score Card */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold text-gray-800 mb-2">Điểm rèn luyện</h3>
              <div className="text-3xl font-bold text-blue-600">{point !== null ? point : '...'}</div>
            </div>
            <button
              onClick={onViewScore}
              className="w-10 h-10 flex items-center justify-center bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </div>
        </div>
        {/* Registration Card */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold text-gray-800 mb-2">Đăng ký hoạt động</h3>
              <p className="text-gray-600">Xem các hoạt động đang mở đăng ký</p>
            </div>
            <button
              onClick={() => navigate('/student/register')}
              className="w-10 h-10 flex items-center justify-center bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </div>
        </div>
      </div>

      {/* Personal Information Section */}
      <div className="bg-white rounded-lg shadow p-6 mb-8">
        <h2 className="text-xl font-semibold mb-4">Thông tin cá nhân</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <p className="text-gray-600">Mã số sinh viên</p>
            <p className="font-semibold">{studentInfo?.studentID}</p>
          </div>
          <div>
            <p className="text-gray-600">Email</p>
            <p className="font-semibold">{studentInfo?.email}</p>
          </div>
          <div>
            <p className="text-gray-600">Số điện thoại</p>
            <p className="font-semibold">{studentInfo?.phone || 'Chưa cập nhật'}</p>
          </div>
        </div>
      </div>

      {/* Activities Section */}
      <div>
        <h2 className="text-xl font-semibold text-gray-800 mb-6">Quản lý hoạt động của bạn</h2>
        {loading ? (
          <div>Đang tải hoạt động...</div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {activities.map((act) => (
              <div
                key={act.participationID || act.activityID}
                className="bg-white rounded-lg shadow-sm overflow-hidden border"
              >
                <img
                  src={act.image || DEFAULT_IMAGE}
                  alt={act.name}
                  className="w-full h-48 object-cover"
                  onError={(e) => {
                    e.target.onerror = null;
                    e.target.src = DEFAULT_IMAGE;
                  }}
                />
                <div className="p-4">
                  <h3 className="text-lg font-semibold text-gray-800 mb-2">{act.name}</h3>
                  <div className="mb-2">
                    <span className="inline-block px-2 py-1 text-xs rounded bg-gray-100 text-gray-700 font-medium">
                      {act.type}
                    </span>
                  </div>
                  <div className="mb-2">
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
                  </div>
                  <div className="space-y-2 text-sm text-gray-600">
                    <p>
                      <span className="font-medium">Điểm rèn luyện:</span> {act.trainingPoint || 0}
                    </p>
                    <p>
                      <span className="font-medium">Thời gian:</span>{' '}
                      {act.eventStart ? new Date(act.eventStart).toLocaleString() : ''}
                    </p>
                    <p>
                      <span className="font-medium">Địa điểm:</span> {act.location}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}
