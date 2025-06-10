import React, { useEffect, useState } from 'react';
import TrainingPointComplaints from './TrainingPointComplaints'; // Assuming this component is in the same directory
import Header from '../../components/common/Header';
import SidebarStudent from '../../components/common/SidebarStudent';
import Footer from '../../components/common/Footer';
import axios from 'axios';
import { message } from 'antd';
import { useNavigate } from 'react-router-dom';

export default function StudentScore() {
  const [semesters, setSemesters] = useState([]);
  const [selectedSemester, setSelectedSemester] = useState('');
  const [score, setScore] = useState(null);
  const [history, setHistory] = useState([]); // Renamed from activities in sample to match your code
  const [loading, setLoading] = useState(true); // Set to true initially for first loads
  const [showComplaintModal, setShowComplaintModal] = useState(null); // participationID for complaint modal
  const navigate = useNavigate();

  // Fetch semesters on component mount
  useEffect(() => {
    fetch('/semester/by-me')
      .then(res => res.json())
      .then(data => {
        setSemesters(data.semesters || []);
        // Automatically select the first semester if available
        if (data.semesters && data.semesters.length > 0) {
          setSelectedSemester(data.semesters[0].semesterID);
        }
      })
      .catch(err => {
        console.error("Error fetching semesters:", err);
        setLoading(false); // Stop loading if there's an error
      });
  }, []);

  // Fetch score and activities when selectedSemester changes
  useEffect(() => {
    if (!selectedSemester) {
      setLoading(false); // No semester selected, stop loading
      setScore(0); // Clear score
      setHistory([]); // Clear history
      return;
    }
    setLoading(true);
    Promise.all([
      fetch(`/student/score?semesterID=${selectedSemester}`).then(res => res.json()),
      fetch(`/student/activities?semesterID=${selectedSemester}`).then(res => res.json()),
    ])
      .then(([scoreData, historyData]) => {
        setScore(scoreData.score || 0);
        setHistory(historyData.activities || []); // Assuming activities from API
        setLoading(false);
      })
      .catch(err => {
        console.error("Error fetching data:", err);
        setLoading(false);
        setScore(0);
        setHistory([]);
      });
  }, [selectedSemester]);

  const handleLogout = async () => {
    try {
      await axios.post('/auth/logout');
      localStorage.removeItem('accessToken');
      localStorage.removeItem('role');
      localStorage.removeItem('userID');
      localStorage.removeItem('user');
      message.success('Đăng xuất thành công');
      navigate('/login');
    } catch (error) {
      message.error('Có lỗi xảy ra khi đăng xuất');
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      {/* Header */}
      <Header
        user={{ name: "Nguyễn Văn A", avatar: "https://upload.wikimedia.org/wikipedia/commons/thumb/a/ac/Default_pfp.jpg/120px-Default_pfp.jpg", role: "student" }} // Placeholder user data
        onLogout={handleLogout}
      />

      {/* Main content with sidebar */}
      <div className="flex flex-1 pt-16"> {/* pt-16 to account for fixed header height */}
        {/* Sidebar */}
        <SidebarStudent onLogout={handleLogout} />

        {/* Main content area */}
        <div className="flex-1 flex flex-col ml-64"> {/* ml-64 for sidebar width */}
          <main className="flex-1 p-6">
            <div className="max-w-7xl mx-auto">
              {/* Page Header */}
              <div className="mb-8">
                <h1 className="text-2xl font-bold text-gray-900">
                  Điểm rèn luyện
                </h1>
                <p className="mt-2 text-sm text-gray-600">
                  Xem chi tiết điểm rèn luyện theo từng học kỳ
                </p>
              </div>

              {/* Semester Selector */}
              <div className="mb-6">
                <label
                  htmlFor="semester"
                  className="block text-sm font-medium text-gray-700 mb-2"
                >
                  Chọn học kỳ
                </label>
                <select
                  id="semester"
                  value={selectedSemester}
                  onChange={(e) => setSelectedSemester(e.target.value)}
                  className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
                >
                  <option value="">-- Chọn học kỳ --</option>
                  {semesters.map((sem) => (
                    <option key={sem.semesterID} value={sem.semesterID}>
                      {sem.name || sem.semesterName || `Học kỳ ${sem.semesterID}`}
                    </option>
                  ))}
                </select>
              </div>

              {/* Total Points Card */}
              <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-800">
                      Tổng điểm rèn luyện
                    </h3>
                    <p className="text-sm text-gray-600">Học kỳ hiện tại</p>
                  </div>
                  <div className="text-3xl font-bold text-blue-600">
                    {loading ? "..." : (score !== null ? score : 'N/A')}
                  </div>
                </div>
              </div>

              {/* Activities List */}
              <div className="bg-white rounded-lg shadow-sm overflow-hidden">
                <div className="px-6 py-4 border-b border-gray-200">
                  <h2 className="text-lg font-semibold text-gray-800">
                    Chi tiết hoạt động
                  </h2>
                </div>
                {loading ? (
                  <div className="p-6 text-center text-gray-500">
                    Đang tải dữ liệu...
                  </div>
                ) : history.length === 0 ? (
                  <div className="p-6 text-center text-gray-500">
                    Không có hoạt động nào trong học kỳ này
                  </div>
                ) : (
                  <div className="divide-y divide-gray-200">
                    {history.map((activity) => (
                      <div key={activity.participationID || activity.activityID} className="p-6">
                        <div className="flex items-center justify-between">
                          <div className="flex-1">
                            <h3 className="text-lg font-medium text-gray-900">
                              {activity.name}
                            </h3>
                            <div className="mt-1 flex items-center space-x-4 text-sm text-gray-500">
                                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                                  {activity.type}
                                </span>
                                {/* Display date if available in your data */}
                                {activity.eventStart && (
                                  <span>
                                    {new Date(activity.eventStart).toLocaleDateString()}
                                  </span>
                                )}
                                {/* Display location if available in your data */}
                                {activity.location && (
                                  <span>
                                    {activity.location}
                                  </span>
                                )}
                            </div>
                          </div>
                          <div className="ml-4 flex-shrink-0 flex flex-col items-end">
                            <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800">
                              {activity.trainingPoint} điểm
                            </span>
                            {/* Complaint button for each activity */}
                            <button
                              className="mt-2 text-blue-600 hover:underline text-sm"
                              onClick={() => setShowComplaintModal(activity.participationID)}
                            >
                              Gửi khiếu nại
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </main>
          <Footer />
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
    </div>
  );
}