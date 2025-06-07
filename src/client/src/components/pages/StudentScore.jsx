import React, { useEffect, useState } from 'react';
import TrainingPointComplaints from './TrainingPointComplaints';

export default function StudentScore() {
  const [semesters, setSemesters] = useState([]);
  const [selectedSemester, setSelectedSemester] = useState('');
  const [score, setScore] = useState(null);
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showComplaint, setShowComplaint] = useState(null); // participationID đang gửi khiếu nại

  // Lấy danh sách học kỳ theo student hiện tại
  useEffect(() => {
    fetch('/semester/by-me')
      .then(res => res.json())
      .then(data => setSemesters(data.semesters || []));
  }, []);

  // Lấy điểm và lịch sử khi chọn học kỳ
  useEffect(() => {
    if (!selectedSemester) return;
    setLoading(true);
    Promise.all([
      fetch(`/student/score?semesterID=${selectedSemester}`).then(res => res.json()),
      fetch(`/student/activities?semesterID=${selectedSemester}`).then(res => res.json()),
    ]).then(([scoreData, historyData]) => {
      setScore(scoreData.score || 0);
      setHistory(historyData.activities || []);
      setLoading(false);
    });
  }, [selectedSemester]);

  return (
    <div className="max-w-3xl mx-auto p-6 bg-white rounded-lg shadow">
      <h2 className="text-2xl font-bold mb-4">Điểm rèn luyện</h2>
      <div className="mb-4 flex items-center gap-4">
        <label htmlFor="semester" className="font-medium">Chọn học kỳ:</label>
        <select
          id="semester"
          className="border rounded px-3 py-2"
          value={selectedSemester}
          onChange={e => setSelectedSemester(e.target.value)}
        >
          <option value="">-- Chọn học kỳ --</option>
          {semesters.map(sem => (
            <option key={sem.semesterID} value={sem.semesterID}>
              {sem.name || sem.semesterName || `Học kỳ ${sem.semesterID}`}
            </option>
          ))}
        </select>
      </div>
      {selectedSemester && (
        <div className="mb-6">
          <div className="text-lg font-semibold text-blue-700 mb-2">
            Điểm rèn luyện học kỳ này: <span className="font-bold">{loading ? '...' : score}</span>
          </div>
        </div>
      )}
      {selectedSemester && (
        <div>
          <h3 className="text-lg font-semibold mb-2">Lịch sử hoạt động đã tham gia</h3>
          <div className="overflow-x-auto">
            <table className="min-w-full border rounded">
              <thead className="bg-gray-100">
                <tr>
                  <th className="px-4 py-2 border">Tên hoạt động</th>
                  <th className="px-4 py-2 border">Loại hoạt động</th>
                  <th className="px-4 py-2 border">Điểm rèn luyện</th>
                  <th className="px-4 py-2 border">Khiếu nại</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr><td colSpan={4} className="text-center py-4">Đang tải...</td></tr>
                ) : history.length === 0 ? (
                  <tr><td colSpan={4} className="text-center py-4">Chưa có hoạt động nào</td></tr>
                ) : history.map(act => (
                  <React.Fragment key={act.participationID || act.activityID}>
                    <tr>
                      <td className="px-4 py-2 border">{act.name}</td>
                      <td className="px-4 py-2 border">{act.type}</td>
                      <td className="px-4 py-2 border text-center">{act.trainingPoint}</td>
                      <td className="px-4 py-2 border text-center">
                        <button
                          className="text-blue-600 underline"
                          onClick={() => setShowComplaint(act.participationID)}
                        >
                          Gửi khiếu nại
                        </button>
                      </td>
                    </tr>
                    {showComplaint === act.participationID && (
                      <tr>
                        <td colSpan={4} className="bg-gray-50">
                          <TrainingPointComplaints
                            participations={[{
                              participationID: act.participationID,
                              activityName: act.name,
                            }]}
                            onClose={() => setShowComplaint(null)}
                          />
                          <div className="text-right mt-2">
                            <button
                              className="text-sm text-gray-500 underline"
                              onClick={() => setShowComplaint(null)}
                            >
                              Đóng
                            </button>
                          </div>
                        </td>
                      </tr>
                    )}
                  </React.Fragment>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
} 