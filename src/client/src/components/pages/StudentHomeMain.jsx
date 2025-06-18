import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { FaArrowRight } from "react-icons/fa";

const StudentHomeMain = () => {
  const [score, setScore] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentSemester, setCurrentSemester] = useState(null);

  useEffect(() => {
    const fetchCurrentSemesterScore = async () => {
      try {
        setLoading(true);
        setError(null);

        // Lấy học kỳ hiện tại
        const semesterRes = await fetch('/semester/current');
        if (!semesterRes.ok) throw new Error('Failed to fetch current semester');
        const semesterData = await semesterRes.json();
        
        console.log('Current semester:', semesterData);
        if (!semesterData) {
          console.log('No current semester found');
          setScore(0);
          return;
        }
        
        setCurrentSemester(semesterData);

        // Lấy điểm của học kỳ hiện tại
        const scoreRes = await fetch(`/student/score?semesterID=${semesterData.semesterID}`);
        if (!scoreRes.ok) throw new Error('Failed to fetch score');
        const scoreData = await scoreRes.json();
        
        console.log('Score response:', scoreData);
        setScore(scoreData.score || 0);
      } catch (error) {
        console.error('Error fetching score:', error);
        setError(error.message);
        setScore(0);
      } finally {
        setLoading(false);
      }
    };

    fetchCurrentSemesterScore();
  }, []);

  return (
    <div className="space-y-6">
      {/* Top Section */}
      <div className="grid grid-cols-2 gap-6">
        {/* Points Card */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold mb-4 text-gray-800">
            Điểm rèn luyện
          </h2>
          <div className="flex justify-between items-center">
            {loading ? (
              <div className="text-3xl font-bold text-gray-400">...</div>
            ) : error ? (
              <div className="text-sm text-red-500">{error}</div>
            ) : (
              <span className="text-3xl font-bold text-blue-600">{score}</span>
            )}
            <Link
              to="/student/score"
              className="text-blue-600 hover:text-blue-800"
            >
              <FaArrowRight />
            </Link>
          </div>
          {!loading && !error && currentSemester && (
            <div className="mt-2 text-sm text-gray-500">
              {currentSemester.semesterName}
            </div>
          )}
        </div>

        {/* Activities Card */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold mb-4 text-gray-800">
            Đăng ký hoạt động
          </h2>
          <div className="flex justify-between items-center">
            <span className="text-gray-600">Xem các hoạt động đã đăng ký</span>
            <Link
              to="/student/register"
              className="text-blue-600 hover:text-blue-800"
            >
              <FaArrowRight />
            </Link>
          </div>
        </div>
      </div>

      {/* Ongoing Activities Section */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-xl font-semibold mb-6 text-gray-800">
          Các hoạt động đang diễn ra
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Activity Card Example */}
          <div className="bg-white rounded-lg shadow-md overflow-hidden">
            <img
              src="/activity-placeholder.jpg"
              alt="Activity"
              className="w-full h-48 object-cover"
            />
            <div className="p-4">
              <h3 className="font-semibold text-lg mb-2 text-gray-800">
                Tên hoạt động
              </h3>
              <p className="text-gray-600 mb-2">Tên đơn vị</p>
              <p className="text-gray-600 mb-2">
                Thời gian: 01/01/2024 - 02/01/2024
              </p>
              <p className="text-gray-600 mb-2">Địa điểm: Hội trường A</p>
              <p className="text-gray-600">Số lượng: 20 tình nguyện viên</p>
            </div>
          </div>
          {/* Add more activity cards as needed */}
        </div>
      </div>
    </div>
  );
};

export default StudentHomeMain;
