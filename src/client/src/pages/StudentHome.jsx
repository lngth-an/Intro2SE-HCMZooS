import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import { toast } from "react-toastify";
import Header from "../components/common/Header";
import SidebarStudent from "../components/common/SidebarStudent";
import Footer from "../components/common/Footer";
import { Award, GraduationCap } from "lucide-react";

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

  useEffect(() => {
    const fetchData = async () => {
      try {
        const studentResponse = await axios.get("/student/me");
        setStudentInfo(studentResponse.data);

        const activitiesResponse = await axios.get("/participation/open");
        const currentDate = new Date();

        // Log chi tiết về thời gian hiện tại
        console.log("Current date (ISO):", currentDate.toISOString());
        console.log("Current date (Local):", currentDate.toString());
        console.log("Current date (UTC):", currentDate.toUTCString());
        console.log("Timezone offset:", currentDate.getTimezoneOffset());

        // Log toàn bộ response từ API
        console.log("API Response:", activitiesResponse);
        console.log("Activities data:", activitiesResponse.data);

        if (
          !activitiesResponse.data.activities ||
          !Array.isArray(activitiesResponse.data.activities)
        ) {
          console.error(
            "Invalid activities data format:",
            activitiesResponse.data
          );
          setActivities([]);
          setError("Dữ liệu hoạt động không hợp lệ");
          return;
        }

        // Log số lượng hoạt động trước khi lọc
        console.log(
          "Total activities before filtering:",
          activitiesResponse.data.activities.length
        );

        // Lấy 3 hoạt động đầu tiên
        const topActivities = activitiesResponse.data.activities.slice(0, 3);

        // Log kết quả sau khi lọc
        console.log("Activities after filtering:", {
          total: activitiesResponse.data.activities.length,
          filtered: topActivities.length,
          filteredActivities: topActivities.map((act) => ({
            id: act.activityID,
            name: act.name,
            status: act.activityStatus,
          })),
        });

        setActivities(topActivities);
      } catch (error) {
        console.error("Lỗi khi fetch dữ liệu:", error);
        console.error("Error details:", {
          message: error.message,
          response: error.response?.data,
          status: error.response?.status,
        });

        // Kiểm tra cụ thể loại lỗi
        if (error.response) {
          // Lỗi từ server
          setError(
            error.response.data?.message || "Không thể tải thông tin từ server"
          );
        } else if (error.request) {
          // Không nhận được response
          setError("Không thể kết nối đến server");
        } else {
          // Lỗi khác
          setError("Có lỗi xảy ra khi tải dữ liệu");
        }
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
      const response = await axios.get("/student/stats");
      setStats(response.data);
    } catch (error) {
      console.error("Error fetching stats:", error);
    }
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
                <h2 className="text-xl font-semibold text-gray-900 mb-4">
                  Các hoạt động đã được đăng tải
                </h2>
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
                  <>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                      {activities.slice(0, 2).map((activity) => (
                        <div
                          key={activity.activityID}
                          className="bg-white border rounded-lg overflow-hidden hover:shadow-lg transition-shadow cursor-pointer"
                          onClick={() =>
                            navigate(
                              `/student/activities/${activity.activityID}`
                            )
                          }
                        >
                          <div className="p-4">
                            <h3 className="font-semibold text-lg mb-2 text-blue-600">
                              {activity.name}
                            </h3>
                            <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                              {activity.description}
                            </p>
                            <div className="space-y-2 mb-4">
                              <div className="flex items-center text-sm text-gray-500">
                                <svg
                                  className="w-4 h-4 mr-2"
                                  fill="none"
                                  stroke="currentColor"
                                  viewBox="0 0 24 24"
                                >
                                  <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth="2"
                                    d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                                  />
                                </svg>
                                {new Date(
                                  activity.eventStart
                                ).toLocaleDateString()}
                              </div>
                              <div className="flex items-center text-sm text-gray-500">
                                <svg
                                  className="w-4 h-4 mr-2"
                                  fill="none"
                                  stroke="currentColor"
                                  viewBox="0 0 24 24"
                                >
                                  <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth="2"
                                    d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                                  />
                                  <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth="2"
                                    d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                                  />
                                </svg>
                                {activity.location}
                              </div>
                              <div className="flex items-center text-sm text-gray-500">
                                <svg
                                  className="w-4 h-4 mr-2"
                                  fill="none"
                                  stroke="currentColor"
                                  viewBox="0 0 24 24"
                                >
                                  <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth="2"
                                    d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
                                  />
                                </svg>
                                {activity.capacity} người
                              </div>
                            </div>
                            <div className="flex justify-between items-center">
                              <span className="text-sm text-gray-500">
                                Đăng ký đến:{" "}
                                {new Date(
                                  activity.registrationEnd
                                ).toLocaleDateString()}
                              </span>
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  navigate(
                                    `/student/register?activity=${activity.activityID}&showForm=true`
                                  );
                                }}
                                className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
                              >
                                Xem chi tiết
                              </button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                    <div className="flex justify-center">
                      <button
                        onClick={() => navigate("/student/register")}
                        className="px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors flex items-center"
                      >
                        <span>Xem thêm hoạt động</span>
                        <svg
                          className="w-5 h-5 ml-2"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth="2"
                            d="M9 5l7 7-7 7"
                          />
                        </svg>
                      </button>
                    </div>
                  </>
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