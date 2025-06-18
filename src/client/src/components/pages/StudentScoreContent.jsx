import React, { useEffect, useState } from 'react';
import TrainingPointComplaints from './TrainingPointComplaints';
import { FaStar, FaTrophy, FaCalendarAlt, FaMapMarkerAlt, FaExclamationCircle } from "react-icons/fa";

export default function StudentScoreContent() {
  const [semesters, setSemesters] = useState([]);
  const [selectedSemester, setSelectedSemester] = useState('');
  const [score, setScore] = useState(null);
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [scoreLoading, setScoreLoading] = useState(false);
  const [historyLoading, setHistoryLoading] = useState(false);
  const [error, setError] = useState(null);
  const [showComplaintModal, setShowComplaintModal] = useState(null);
  const [currentSemester, setCurrentSemester] = useState(null);

  // Fetch semesters on component mount
  useEffect(() => {
    setLoading(true);
    fetch('/semester/by-me')
      .then(res => {
        if (!res.ok) throw new Error('Failed to fetch semesters');
        return res.json();
      })
      .then(data => {
        const formattedSemesters = (data.semesters || []).map(sem => ({
          ...sem,
          semesterID: Number(sem.semesterID)
        }));
        setSemesters(formattedSemesters);
        if (formattedSemesters.length > 0) {
          setSelectedSemester(String(formattedSemesters[0].semesterID));
          setCurrentSemester(formattedSemesters[0]);
        }
      })
      .catch(err => {
        console.error("Error fetching semesters:", err);
        setError("Không thể tải danh sách học kỳ. Vui lòng thử lại sau.");
      })
      .finally(() => setLoading(false));
  }, []);

  // Fetch score and activities when selectedSemester changes
  useEffect(() => {
    if (!selectedSemester || semesters.length === 0) {
      setScore(0);
      setHistory([]);
      setCurrentSemester(null);
      return;
    }

    const selectedSemesterNum = parseInt(selectedSemester);
    const foundSemester = semesters.find(s => s.semesterID === selectedSemesterNum);
    setCurrentSemester(foundSemester);

    if (!foundSemester) {
      setScore(0);
      setHistory([]);
      return;
    }

    setScoreLoading(true);
    setHistoryLoading(true);
    setError(null);

    // Fetch score
    fetch(`/student/score?semesterID=${selectedSemester}`)
      .then(res => {
        if (!res.ok) throw new Error('Failed to fetch score');
        return res.json();
      })
      .then(data => {
        setScore(data.score || 0);
      })
      .catch(err => {
        console.error("Error fetching score:", err);
        setError("Không thể tải điểm rèn luyện. Vui lòng thử lại sau.");
        setScore(0);
      })
      .finally(() => setScoreLoading(false));

    // Fetch activities
    fetch(`/student/activities?semesterID=${selectedSemester}&allStatus=false`)
      .then(res => {
        if (!res.ok) throw new Error('Failed to fetch activities');
        return res.json();
      })
      .then(data => {
        setHistory(data.activities || []);
      })
      .catch(err => {
        console.error("Error fetching activities:", err);
        setError(prev => prev || "Không thể tải danh sách hoạt động. Vui lòng thử lại sau.");
        setHistory([]);
      })
      .finally(() => setHistoryLoading(false));
  }, [selectedSemester, semesters]);

  const getRank = (points) => {
    if (points >= 90) return "Xuất sắc";
    if (points >= 80) return "Tốt";
    if (points >= 65) return "Khá";
    if (points >= 50) return "Trung bình";
    if (points >= 35) return "Yếu";
    return "Kém";
  };

  return (
    <main className="flex-1 p-8">
      <div className="max-w-7xl mx-auto">
        {/* Page Header and Semester Selector */}
        <div className="flex justify-between items-start mb-10">
          <div className="w-72 order-2">
            <label htmlFor="semester" className="block text-sm font-semibold text-gray-700 mb-2">
              Chọn học kỳ
            </label>
            <select
              id="semester"
              value={selectedSemester || ""}
              onChange={(e) => setSelectedSemester(e.target.value)}
              className="block w-full pl-4 pr-10 py-3 text-base border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-lg shadow-sm transition duration-150 ease-in-out"
              disabled={loading}
            >
              <option value="">-- Chọn học kỳ --</option>
              {semesters.map((sem) => (
                <option key={sem.semesterID} value={sem.semesterID}>
                  {sem.name || sem.semesterName || `Học kỳ ${sem.semesterID}`}
                </option>
              ))}
            </select>
          </div>
          <div className="space-y-3 order-1">
            <h1 className="text-4xl font-extrabold text-gray-900 tracking-tight">
              ĐIỂM RÈN LUYỆN
            </h1>
            <p className="text-xl text-gray-700 font-medium">
              Kết quả chấp hành {currentSemester?.semesterName}
            </p>
            {currentSemester?.semesterEnd && (
              <p className="text-sm font-medium text-red-600">
                Thời gian khiếu nại đến hết ngày {new Date(currentSemester.semesterEnd).toLocaleDateString()}
              </p>
            )}
          </div>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
            <div className="flex items-center text-red-600">
              <FaExclamationCircle className="w-5 h-5 mr-2" />
              <span>{error}</span>
            </div>
          </div>
        )}
        
        {/* Summary Cards */}
        <div className="grid grid-cols-2 gap-8 mb-10">
          {/* Total Points Card */}
          <div className="bg-white rounded-xl shadow-lg p-2 border border-gray-100 transform transition duration-300">
            <div className="flex items-center">
              <div className="p-3 bg-gradient-to-br from-blue-100 to-blue-200 rounded-2xl mr-4">
                <FaStar className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <div className="text-3xl font-bold text-gray-900 mb-0.5">
                  {scoreLoading ? (
                    <div className="animate-pulse w-16 h-8 bg-gray-200 rounded"></div>
                  ) : (
                    score !== null ? score : 'N/A'
                  )}
                </div>
                <div className="text-sm text-gray-600 font-medium">Điểm rèn luyện</div>
              </div>
            </div>
          </div>

          {/* Rank Card */}
          <div className="bg-white rounded-xl shadow-lg p-2 border border-gray-100 transform transition duration-300">
            <div className="flex items-center">
              <div className="p-3 bg-gradient-to-br from-yellow-100 to-yellow-200 rounded-2xl mr-4">
                <FaTrophy className="w-6 h-6 text-yellow-600" />
              </div>
              <div>
                <div className="text-3xl font-bold text-gray-900 mb-0.5">
                  {scoreLoading ? (
                    <div className="animate-pulse w-24 h-8 bg-gray-200 rounded"></div>
                  ) : (
                    getRank(score)
                  )}
                </div>
                <div className="text-sm text-gray-600 font-medium">Xếp hạng</div>
              </div>
            </div>
          </div>
        </div>

        {/* Activities List */}
        <div className="bg-white rounded-xl shadow-lg overflow-hidden">
          <div className="px-8 py-6 border-b border-gray-200 bg-gradient-to-r from-gray-50 to-white">
            <h2 className="text-xl font-bold text-gray-900">
              Chi tiết hoạt động
            </h2>
          </div>
          <div className="px-8 py-6">
            {historyLoading ? (
              <div className="animate-pulse space-y-4">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="h-32 bg-gray-100 rounded-lg"></div>
                ))}
              </div>
            ) : history.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                Chưa có hoạt động nào trong học kỳ này
              </div>
            ) : (
              <div className="space-y-4">
                {history.map((activity) => (
                  <div key={activity.participationID || activity.activityID} className="p-4 hover:bg-gray-50 transition duration-150 border rounded-lg">
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <h3 className="text-xl font-semibold text-gray-900 mb-4">
                          {activity.name}
                        </h3>
                        <div className="grid grid-cols-2 gap-4 text-sm">
                          <div className="flex items-center space-x-3">
                            <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                              {activity.type}
                            </span>
                            <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                              {activity.trainingPoint} điểm
                            </span>
                          </div>
                          <div className="flex items-center space-x-3">
                            <FaMapMarkerAlt className="w-4 h-4 text-gray-400" />
                            <span className="text-gray-600">{activity.location}</span>
                          </div>
                          <div className="flex items-center space-x-3">
                            <FaCalendarAlt className="w-4 h-4 text-gray-400" />
                            <span className="text-gray-600">
                              {activity.eventStart ? new Date(activity.eventStart).toLocaleDateString() : ''} - {activity.eventEnd ? new Date(activity.eventEnd).toLocaleDateString() : ''}
                            </span>
                          </div>
                        </div>
                      </div>
                      <div className="ml-4">
                        <button
                          onClick={() => setShowComplaintModal(activity.participationID)}
                          className="inline-flex items-center px-4 py-2 border border-red-300 text-sm font-medium rounded-md text-red-700 bg-white hover:bg-red-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                        >
                          <FaExclamationCircle className="mr-2 h-4 w-4" />
                          Khiếu nại
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Complaint Modal */}
      {showComplaintModal && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-75 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-lg mx-auto">
            <TrainingPointComplaints
              participations={[{
                participationID: showComplaintModal,
                activityName: history.find(act => act.participationID === showComplaintModal)?.name || 'Unknown Activity',
                currentPoint: history.find(act => act.participationID === showComplaintModal)?.trainingPoint || 0
              }]}
              onClose={() => setShowComplaintModal(null)}
              mode="complaint"
            />
          </div>
        </div>
      )}
    </main>
  );
}