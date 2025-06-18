import React, { useEffect, useState } from 'react';
import TrainingPointComplaints from './TrainingPointComplaints';
import { FaStar, FaTrophy, FaCalendarAlt, FaMapMarkerAlt, FaExclamationCircle, FaReply } from "react-icons/fa";

export default function StudentScoreContent() {
  const [semesters, setSemesters] = useState([]);
  const [selectedSemester, setSelectedSemester] = useState('');
  const [score, setScore] = useState(null);
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showComplaintModal, setShowComplaintModal] = useState(null);
  const [currentSemester, setCurrentSemester] = useState(null);
  const [complaints, setComplaints] = useState({});
  const [showResponseModal, setShowResponseModal] = useState(null);

  // Fetch semesters on component mount
  useEffect(() => {
    fetch('/semester/by-me')
      .then(res => res.json())
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
        setLoading(false);
      });
  }, []);

  // Fetch score, activities and complaints when selectedSemester changes
  useEffect(() => {
    if (!selectedSemester || semesters.length === 0) {
      setLoading(false);
      setScore(0);
      setHistory([]);
      setCurrentSemester(null);
      return;
    }

    const selectedSemesterNum = parseInt(selectedSemester);
    const foundSemester = semesters.find(s => s.semesterID === selectedSemesterNum);
    setCurrentSemester(foundSemester);

    if (!foundSemester) {
        setLoading(false);
        setScore(0);
        setHistory([]);
        return;
    }

    setLoading(true);
    Promise.all([
      fetch(`/student/score?semesterID=${selectedSemester}`).then(res => res.json()),
      fetch(`/student/activities?semesterID=${selectedSemester}`).then(res => res.json()),
      fetch(`/student/complaints?semesterID=${selectedSemester}`).then(res => res.json())
    ])
      .then(([scoreData, historyData, complaintsData]) => {
        setScore(scoreData.score || 0);
        setHistory(historyData.activities || []);
        // Convert complaints array to object with participationID as key
        const complaintsMap = (complaintsData.complaints || []).reduce((acc, complaint) => {
          acc[complaint.participationID] = complaint;
          return acc;
        }, {});
        setComplaints(complaintsMap);
        setLoading(false);
      })
      .catch(err => {
        console.error("Error fetching data:", err);
        setLoading(false);
        setScore(0);
        setHistory([]);
        setComplaints({});
      });
  }, [selectedSemester, semesters]);

  const getRank = (points) => {
    if (points >= 90) return "Xuất sắc";
    if (points >= 80) return "Tốt";
    if (points >= 65) return "Khá";
    if (points >= 50) return "Trung bình";
    if (points >= 35) return "Yếu";
    return "Kém";
  };

  const getComplaintStatusColor = (status) => {
    switch (status) {
      case 'Đã duyệt':
        return 'bg-green-100 text-green-800';
      case 'Từ chối':
        return 'bg-red-100 text-red-800';
      case 'Chờ duyệt':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
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
            <p className="text-sm font-medium text-red-600">
              Thời gian khiếu nại đến hết ngày {
                currentSemester && 
                currentSemester.semesterEnd &&
                !isNaN(new Date(currentSemester.semesterEnd).getTime()) ?
                new Date(currentSemester.semesterEnd).toLocaleDateString() : 'N/A'
              }
            </p>
          </div>
        </div>
        
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
                  {loading ? "..." : (score !== null ? score : 'N/A')}
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
                  {loading ? "..." : getRank(score)}
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
          {loading ? (
            <div className="p-8 text-center text-gray-500">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
              Đang tải dữ liệu...
            </div>
          ) : history.length === 0 ? (
            <div className="p-8 text-center text-gray-500">
              Không có hoạt động nào trong học kỳ này
            </div>
          ) : (
            <div className="divide-y divide-gray-100">
              {history.map((activity) => {
                const complaint = complaints[activity.participationID];
                return (
                  <div key={activity.participationID || activity.activityID} className="p-4 hover:bg-gray-50 transition duration-150">
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
                      <div className="flex flex-col items-end gap-3">
                        <span className="inline-flex items-center px-4 py-2 rounded-full text-sm font-semibold bg-green-100 text-green-800">
                          {activity.trainingPoint} điểm
                        </span>
                        {complaint ? (
                          <button
                            onClick={() => setShowResponseModal(complaint)}
                            className="inline-flex items-center px-4 py-2 text-sm font-medium text-blue-600 hover:text-blue-700 hover:bg-blue-50 rounded-lg transition duration-150"
                          >
                            <FaReply className="w-4 h-4 mr-2" />
                            Xem phản hồi
                          </button>
                        ) : (
                          <button
                            className="px-4 py-2 text-sm font-medium text-red-600 hover:text-red-700 hover:bg-red-50 rounded-lg transition duration-150"
                            onClick={() => setShowComplaintModal(activity.participationID)}
                          >
                            Khiếu nại
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Complaint Modal */}
      {showComplaintModal && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-75 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-lg mx-auto">
            <h3 className="text-xl font-bold mb-4">Gửi khiếu nại điểm rèn luyện</h3>
            <TrainingPointComplaints
              participations={[{
                participationID: showComplaintModal,
                activityName: history.find(act => act.participationID === showComplaintModal)?.name || 'Unknown Activity',
              }]}
              onClose={() => setShowComplaintModal(null)}
            />
            <div className="text-right mt-4">
              <button
                className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-gray-700 bg-gray-200 hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
                onClick={() => setShowComplaintModal(null)}
              >
                Đóng
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Response Modal */}
      {showResponseModal && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-75 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-lg mx-auto">
            <div className="flex justify-between items-start mb-4">
              <h3 className="text-xl font-bold">Phản hồi khiếu nại</h3>
              <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${getComplaintStatusColor(showResponseModal.complaintStatus)}`}>
                {showResponseModal.complaintStatus}
              </span>
            </div>
            <div className="space-y-4">
              <div>
                <h4 className="text-sm font-medium text-gray-700 mb-1">Nội dung khiếu nại:</h4>
                <p className="text-gray-600 bg-gray-50 p-3 rounded-lg">{showResponseModal.description}</p>
              </div>
              <div>
                <h4 className="text-sm font-medium text-gray-700 mb-1">Phản hồi từ đơn vị tổ chức:</h4>
                <p className="text-gray-600 bg-gray-50 p-3 rounded-lg">{showResponseModal.response || 'Chưa có phản hồi'}</p>
              </div>
            </div>
            <div className="text-right mt-6">
              <button
                className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-gray-700 bg-gray-200 hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
                onClick={() => setShowResponseModal(null)}
              >
                Đóng
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}