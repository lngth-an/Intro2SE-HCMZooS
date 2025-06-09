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

        const activitiesResponse = await axios.get("/activities");
        const currentDate = new Date();

        const openActivities = activitiesResponse.data.activities.filter(
          (activity) => {
            const registrationStart = new Date(activity.registrationStart);
            const registrationEnd = new Date(activity.registrationEnd);
            return (
              currentDate >= registrationStart && currentDate <= registrationEnd
            );
          }
        );

        setActivities(openActivities);
      } catch (error) {
        toast.error("Không thể tải thông tin");
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

              {/* Activities Section */}
              <div>
                <h2 className="text-xl font-semibold text-gray-800 mb-6">
                  Các hoạt động đang mở đăng ký
                </h2>
                {activities.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {activities.map((act) => (
                      <div
                        key={act.activityID}
                        className="bg-white rounded-lg shadow-sm overflow-hidden hover:shadow-md transition-shadow"
                      >
                        <img
                          src={act.image || "/activity-placeholder.jpg"}
                          alt={act.name}
                          className="w-full h-48 object-cover"
                          onError={(e) => {
                            e.target.onerror = null;
                            e.target.src = "/activity-placeholder.jpg";
                          }}
                        />
                        <div className="p-4">
                          <h3 className="text-lg font-semibold text-gray-800 mb-2">
                            {act.name}
                          </h3>
                          <p className="text-blue-600 font-medium mb-3">
                            {act.organizerName}
                          </p>
                          <div className="space-y-2 text-sm text-gray-600">
                            <p>
                              <span className="font-medium">
                                Thời gian đăng ký:
                              </span>{" "}
                              {new Date(
                                act.registrationStart
                              ).toLocaleDateString()}{" "}
                              -{" "}
                              {new Date(
                                act.registrationEnd
                              ).toLocaleDateString()}
                            </p>
                            <p>
                              <span className="font-medium">
                                Thời gian diễn ra:
                              </span>{" "}
                              {new Date(act.startDate).toLocaleDateString()} -{" "}
                              {new Date(act.endDate).toLocaleDateString()}
                            </p>
                            <p>
                              <span className="font-medium">Địa điểm:</span>{" "}
                              {act.location}
                            </p>
                            <p>
                              <span className="font-medium">
                                Tình nguyện viên:
                              </span>{" "}
                              {act.currentVolunteers}/{act.maxVolunteers}
                            </p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-500 text-center py-4">
                    Hiện không có hoạt động nào đang mở đăng ký
                  </p>
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
