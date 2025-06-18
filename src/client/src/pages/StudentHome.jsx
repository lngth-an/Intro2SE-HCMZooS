import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import { toast } from "react-toastify";
import Header from "../components/common/Header";
import SidebarStudent from "../components/common/SidebarStudent";
import Footer from "../components/common/Footer";
import { Award, GraduationCap } from "lucide-react";
import StudentActivityDetail from "../components/pages/StudentActivityDetail";
import { DOMAINS } from "../constants/activityTypes";

const StudentHome = () => {
  const navigate = useNavigate();
  const [studentInfo, setStudentInfo] = useState(null);
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [stats, setStats] = useState({
    totalScore: 0,
    totalActivities: 0,
  });
  const [selectedActivity, setSelectedActivity] = useState(null);
  const [showDetailModal, setShowDetailModal] = useState(false);

  const handleLogout = async () => {
    try {
      await axios.post("/auth/logout");
      localStorage.removeItem("accessToken");
      localStorage.removeItem("role");
      toast.success("Đăng xuất thành công");
      navigate("/login");
    } catch (error) {
      toast.error("Có lỗi xảy ra khi đăng xuất");
    }
  };

  // Fetch student information
  useEffect(() => {
    const fetchStudentInfo = async () => {
      try {
        const response = await axios.get("/student/me");
        setStudentInfo(response.data);
      } catch (error) {
        console.error("Error fetching student info:", error);
        setError("Không thể tải thông tin sinh viên");
      }
    };
    fetchStudentInfo();
  }, []);

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Lấy danh sách hoạt động đang mở đăng ký
        const response = await axios.get("/student/activities/search");
        const allActivities = response.data.activities || [];

        // Lọc các hoạt động đang mở đăng ký (thời gian hiện tại nằm trong khoảng registrationStart và registrationEnd)
        const now = new Date();
        const openActivities = allActivities.filter((activity) => {
          const regStart = new Date(activity.registrationStart);
          const regEnd = new Date(activity.registrationEnd);
          return now >= regStart && now <= regEnd;
        });

        // Sắp xếp theo thời gian bắt đầu sự kiện
        openActivities.sort(
          (a, b) => new Date(a.eventStart) - new Date(b.eventStart)
        );

        // Chỉ lấy 2 hoạt động đầu tiên
        setActivities(openActivities.slice(0, 2));
      } catch (error) {
        setError("Không thể tải danh sách hoạt động đang mở đăng ký");
        setActivities([]);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      // Lấy học kỳ hiện tại
      const semesterRes = await axios.get("/semester/current");
      if (!semesterRes.data) {
        setStats({ totalScore: 0, totalActivities: 0 });
        return;
      }

      // Lấy điểm của học kỳ hiện tại
      const scoreRes = await axios.get(
        `/student/score?semesterID=${semesterRes.data.semesterID}`
      );
      setStats({
        totalScore: scoreRes.data.score || 0,
        totalActivities: 0, // Giữ nguyên giá trị này vì không cần thay đổi
      });
    } catch (error) {
      console.error("Error fetching stats:", error);
      setStats({ totalScore: 0, totalActivities: 0 });
    }
  };

  const isRegistrationOpen = (activity) => {
    const now = new Date();
    return (
      now >= new Date(activity.registrationStart) &&
      now <= new Date(activity.registrationEnd)
    );
  };

  const handleShowDetail = (activity) => {
    setSelectedActivity(activity);
    setShowDetailModal(true);
  };

  const handleCloseDetailModal = () => {
    setSelectedActivity(null);
    setShowDetailModal(false);
  };

  const renderActivityCard = (activity) => {
    const domain = DOMAINS.find((d) => d.id === activity.type);
    const points = domain ? domain.defaultPoint : 3;
    return (
      <div
        key={activity.activityID}
        className="bg-white rounded-lg shadow-md overflow-hidden"
      >
        <div className="w-full h-48 bg-gray-200">
          <img
            src={activity.image || "https://via.placeholder.com/300x200"}
            alt={activity.name}
            className="w-full h-48 object-cover"
          />
        </div>
        <div className="p-4">
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            {activity.name || "Chưa cập nhật"}
          </h3>
          <div className="flex items-center space-x-2 mb-3">
            <span
              className={`px-3 py-1 rounded-full text-sm font-medium ${
                domain?.color || "bg-gray-100 text-gray-800"
              }`}
            >
              {activity.type || "Khác"}
            </span>
            <span className="px-3 py-1 rounded-full text-sm font-medium bg-yellow-100 text-yellow-800">
              {activity.trainingPoint || points} điểm
            </span>
          </div>
          <div className="text-sm text-gray-600 mb-2">
            <p>
              Thời gian:{" "}
              {activity.eventStart
                ? new Date(activity.eventStart).toLocaleString()
                : "Chưa cập nhật"}
            </p>
            <p>Địa điểm: {activity.location || "Chưa cập nhật"}</p>
            <p>
              Đăng ký đến:{" "}
              {activity.registrationEnd
                ? new Date(activity.registrationEnd).toLocaleString()
                : "Chưa cập nhật"}
            </p>
          </div>
          <div className="mt-4 flex justify-between items-center">
            <button
              className="bg-blue-500 hover:bg-blue-600 text-white text-sm font-semibold py-2 px-4 rounded-md"
              onClick={() => handleShowDetail(activity)}
            >
              Xem chi tiết
            </button>
          </div>
        </div>
      </div>
    );
  };

  if (loading) {
    return <div>Đang tải...</div>;
  }

  const statCards = [
    {
      title: "Điểm rèn luyện",
      value: stats.totalScore.toString(),
      icon: Award,
      color: "bg-green-500",
      onClick: () => navigate("/student/score"),
    },
    {
      title: "Đăng ký hoạt động",
      value: "Xem các hoạt động đang mở đăng ký",
      icon: GraduationCap,
      color: "bg-purple-500",
      onClick: () => navigate("/student/register"),
    },
  ];

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      {/* Header */}
      <Header user={studentInfo} />

      {/* Main content with sidebar */}
      <div className="flex flex-1 pt-16">
        {/* Sidebar */}
        <SidebarStudent onLogout={handleLogout} />

        {/* Main content area + Footer */}
        <div className="flex-1 flex flex-col ml-64">
          <main className="flex-1 p-6">
            <div className="container mx-auto px-4 py-8">
              <h1 className="text-2xl font-bold mb-6">
                Chào mừng, {studentInfo?.name}
              </h1>

              {/* Stats Cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                {statCards.map((stat, index) => (
                  <div
                    key={index}
                    className="bg-white rounded-lg shadow-md p-6 cursor-pointer hover:shadow-lg transition-shadow"
                    onClick={stat.onClick}
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <h2 className="text-xl font-semibold mb-2 text-gray-800">
                          {stat.title}
                        </h2>
                        <p className="text-gray-600">{stat.value}</p>
                      </div>
                      <div
                        className={`p-3 rounded-full ${stat.color} text-white`}
                      >
                        <stat.icon className="w-6 h-6" />
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Ongoing Activities Section */}
              <div className="bg-white rounded-lg shadow-md p-6">
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-xl font-semibold text-gray-900">
                    Các hoạt động đang mở đăng ký
                  </h2>
                  <button
                    className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
                    onClick={() => navigate("/student/register")}
                  >
                    Xem thêm
                  </button>
                </div>
                {loading ? (
                  <div className="flex justify-center items-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
                  </div>
                ) : error ? (
                  <div className="text-center py-8">
                    <p className="text-red-500">{error}</p>
                    <button
                      onClick={() => window.location.reload()}
                      className="mt-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
                    >
                      Thử lại
                    </button>
                  </div>
                ) : activities.length === 0 ? (
                  <p className="text-gray-500 text-center py-8">
                    Hiện không có hoạt động nào đang mở đăng ký
                  </p>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                    {activities.map((activity) => renderActivityCard(activity))}
                  </div>
                )}
                {showDetailModal && selectedActivity && (
                  <StudentActivityDetail
                    activity={selectedActivity}
                    onClose={handleCloseDetailModal}
                    isManagementView={true}
                  />
                )}
              </div>
            </div>
          </main>
          <Footer />
        </div>
      </div>
    </div>
  );
};

export default StudentHome;
