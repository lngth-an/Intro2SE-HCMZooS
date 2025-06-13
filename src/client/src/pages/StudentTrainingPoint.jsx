import React, { useEffect, useState } from 'react';
import TrainingPointComplaints from '../components/pages/TrainingPointComplaints';

export default function StudentTrainingPoint() {
  const [participations, setParticipations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    setLoading(true);
    fetch('/student/activities')
      .then(res => res.json())
      .then(data => {
        // Giả sử API trả về mảng activities/participations
        // Lọc các participation đã có điểm rèn luyện hoặc trạng thái approved
        const list = (data.activities || data.participations || []).filter(p =>
          p.trainingPoint > 0 || p.participationStatus === 'approved'
        ).map(p => ({
          participationID: p.participationID,
          activityName: p.name || p.activityName,
        }));
        setParticipations(list);
        setLoading(false);
      })
      .catch(() => {
        setError('Không thể tải danh sách hoạt động');
        setLoading(false);
      });
  }, []);

  return (
    <div className="max-w-2xl mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Gửi khiếu nại điểm rèn luyện</h1>
      {loading ? (
        <div>Đang tải dữ liệu...</div>
      ) : error ? (
        <div className="text-red-600">{error}</div>
      ) : (
        <TrainingPointComplaints participations={participations} />
      )}
    </div>
  );
} 