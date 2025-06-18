import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { FaArrowRight } from "react-icons/fa";
import { DOMAINS } from '../../constants/activityTypes';
import StudentActivityDetail from "./StudentActivityDetail";

const StudentHomeMain = () => {
  const [score, setScore] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentSemester, setCurrentSemester] = useState(null);
  const [activities, setActivities] = useState([]);
  const [activitiesLoading, setActivitiesLoading] = useState(true);
  const [selectedActivity, setSelectedActivity] = useState(null);
  const [showDetail, setShowDetail] = useState(false);

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

  useEffect(() => {
    const fetchActivities = async () => {
      try {
        setActivitiesLoading(true);
        const response = await fetch('/student/activities?status=Đã đăng tải');
        if (!response.ok) throw new Error('Failed to fetch activities');
        const data = await response.json();
        setActivities(data.activities || []);
      } catch (error) {
        console.error('Error fetching activities:', error);
      } finally {
        setActivitiesLoading(false);
      }
    };

    fetchActivities();
  }, []);

  const isRegistrationOpen = (activity) => {
    const now = new Date();
    return now >= new Date(activity.registrationStart) && now <= new Date(activity.registrationEnd);
  };

  const handleShowDetail = (activity) => {
    setSelectedActivity(activity);
    setShowDetail(true);
  };

  const handleCloseDetail = () => {
    setSelectedActivity(null);
    setShowDetail(false);
  };

  const renderActivityCard = (activity) => {
    const domain = DOMAINS.find(d => d.id === activity.type);
    const points = domain ? domain.defaultPoint : 3;

    return (
      <div key={activity.activityID} className="bg-white rounded-lg shadow-md overflow-hidden">
        <img
          src={activity.image || "/activity-placeholder.jpg"}
          alt={activity.name}
          className="w-full h-48 object-cover"
        />
        <div className="p-4">
          <div className="flex justify-between items-start mb-2">
            <h3 className="font-semibold text-lg text-gray-800">
              {activity.name}
            </h3>
            <div className="flex items-center space-x-2">
              <span className={`px-3 py-1 rounded-full text-sm font-medium ${domain?.color || 'bg-gray-100 text-gray-800'}`}>
                {activity.type}
              </span>
              <span className="px-3 py-1 rounded-full text-sm font-medium bg-yellow-100 text-yellow-800">
                {points} điểm
              </span>
            </div>
          </div>
          <p className="text-gray-600 mb-2">
            Thời gian: {new Date(activity.eventStart).toLocaleString()}
          </p>
          <p className="text-gray-600 mb-2">Địa điểm: {activity.location}</p>
          {activity.maxParticipants && (
            <p className="text-gray-600">Số lượng: {activity.maxParticipants} người</p>
          )}
          <div className="mt-4">
            <button
              className="text-blue-600 hover:text-blue-800 font-medium"
              onClick={() => handleShowDetail(activity)}
            >
              Xem chi tiết
            </button>
          </div>
        </div>
      </div>
    );
  };

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
          Các hoạt động đang mở đăng ký
        </h2>
        {activitiesLoading ? (
          <div>Loading...</div>
        ) : activities.filter(isRegistrationOpen).length === 0 ? (
          <div className="text-gray-600">Không có hoạt động nào đang mở đăng ký</div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {activities.filter(isRegistrationOpen).map(activity => renderActivityCard(activity))}
          </div>
        )}
      </div>
      {showDetail && selectedActivity && (
        <StudentActivityDetail
          activity={selectedActivity}
          onClose={handleCloseDetail}
          isManagementView={false}
        />
      )}
    </div>
  );
};

export default StudentHomeMain;
