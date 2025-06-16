import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import { toast } from "react-toastify";
import Header from "../components/common/Header";
import SidebarOrganizer from "../components/common/SidebarOrganizer";
import Footer from "../components/common/Footer";
import { Card, Row, Col, Button, Badge, Typography } from "antd";
import {
  UserOutlined,
  CalendarOutlined,
  BellOutlined,
  PlusOutlined,
  CheckCircleOutlined,
  ExclamationCircleOutlined,
  EnvironmentOutlined,
} from "@ant-design/icons";

const { Title, Text } = Typography;

// Cấu hình axios để tự động thêm token vào header
axios.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("accessToken");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

const OrganizerHome = () => {
  const navigate = useNavigate();
  const [activities, setActivities] = useState([]);
  const [stats, setStats] = useState({
    totalStudents: 0,
    totalActivities: 0,
    completedActivities: 0,
    pendingComplaints: 0,
  });
  const [publishedActivities, setPublishedActivities] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);

  const handleLogout = async () => {
    try {
      // Gọi API đăng xuất
      await axios.post("/auth/logout");

      // Xóa token và role khỏi localStorage
      localStorage.removeItem("accessToken");
      localStorage.removeItem("role");

      // Hiển thị thông báo thành công
      toast.success("Đăng xuất thành công");

      // Chuyển hướng về trang đăng nhập
      navigate("/login");
    } catch (error) {
      toast.error("Có lỗi xảy ra khi đăng xuất");
    }
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Lấy thông tin người dùng
        const userResponse = await axios.get("/auth/me");
        console.log("User data:", userResponse.data); // Debug log
        setUser(userResponse.data);

        // Lấy danh sách hoạt động của organizer
        const response = await axios.get("/activity/organizer");
        const activities = response.data.activities;
        setActivities(activities);

        // Lọc các hoạt động đã hoàn thành
        const completedActivities = activities.filter(
          (activity) => activity.activityStatus === "Đã hoàn thành"
        ).length;

        // Lọc các hoạt động đã đăng tải
        const published = activities
          .filter((activity) => activity.activityStatus === "Đã đăng tải")
          .slice(0, 2);
        setPublishedActivities(published);

        // Cập nhật stats
        setStats((prev) => ({
          ...prev,
          completedActivities,
        }));

        // Lấy số lượng khiếu nại chưa xử lý
        const complaintsResponse = await axios.get(
          "/complaints/organizer/pending"
        );
        setStats((prev) => ({
          ...prev,
          pendingComplaints: complaintsResponse.data.count,
        }));

        fetchStats();
        fetchUnreadCount();
      } catch (error) {
        console.error("Error fetching data:", error);
        toast.error("Không thể tải thông tin hoạt động");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const fetchStats = async () => {
    try {
      const response = await axios.get("/organizer/stats");
      setStats(response.data);
    } catch (error) {
      console.error("Error fetching stats:", error);
    }
  };

  const fetchUnreadCount = async () => {
    try {
      const response = await axios.get("/notifications/unread/count");
      setUnreadCount(response.data.unreadCount);
    } catch (error) {
      console.error("Error fetching unread count:", error);
    }
  };

  if (loading) {
    return <div>Đang tải...</div>;
  }

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Header user={user} />
      <div className="flex flex-1 pt-16">
        <SidebarOrganizer onLogout={handleLogout} />
        <div className="flex-1 flex flex-col ml-64">
          <main className="flex-1 p-6">
            <div className="container mx-auto px-4 py-8">
              <div className="flex justify-between items-center mb-8">
                <h1 className="text-3xl font-bold text-gray-800">
                  XIN CHÀO, {user?.name || "Organizer"}
                </h1>
              </div>

              {/* Management Cards */}
              <Row gutter={[24, 24]} className="mb-8">
                <Col xs={24} md={12}>
                  <Link to="/organizer/activities" className="block">
                    <Card hoverable className="h-full">
                      <div className="flex items-center mb-4">
                        <CheckCircleOutlined className="text-2xl text-blue-500 mr-3" />
                        <Title level={4} className="m-0">
                          Quản lý hoạt động
                        </Title>
                      </div>
                      <div className="bg-blue-50 p-4 rounded-lg">
                        <Text className="text-gray-600 block mb-1">
                          Các hoạt động đã hoàn thành:
                        </Text>
                        <Text className="text-2xl font-bold text-blue-600">
                          {stats.completedActivities}
                        </Text>
                      </div>
                    </Card>
                  </Link>
                </Col>
                <Col xs={24} md={12}>
                  <Link to="/organizer/complaints" className="block">
                    <Card hoverable className="h-full">
                      <div className="flex items-center mb-4">
                        <ExclamationCircleOutlined className="text-2xl text-orange-500 mr-3" />
                        <Title level={4} className="m-0">
                          Quản lý khiếu nại
                        </Title>
                      </div>
                      <div className="bg-orange-50 p-4 rounded-lg">
                        <Text className="text-gray-600 block mb-1">
                          Số lượng khiếu nại chưa xử lý:
                        </Text>
                        <Text className="text-2xl font-bold text-orange-600">
                          {stats.pendingComplaints}
                        </Text>
                      </div>
                    </Card>
                  </Link>
                </Col>
              </Row>

              {/* Published Activities */}
              <div className="mb-8">
                <Title level={3} className="mb-6">
                  Các hoạt động đã đăng tải
                </Title>
                <Row gutter={[24, 24]}>
                  {publishedActivities.map((activity) => (
                    <Col xs={24} md={12} key={activity.activityID}>
                      <Card
                        hoverable
                        className="h-full"
                        cover={
                          <div className="h-48 overflow-hidden">
                            <img
                              alt={activity.name}
                              src={
                                activity.image ||
                                "https://via.placeholder.com/400x200?text=Activity+Image"
                              }
                              className="w-full h-full object-cover"
                            />
                          </div>
                        }
                      >
                        <div className="flex items-center mb-4">
                          <CalendarOutlined className="text-2xl text-green-500 mr-3" />
                          <Title level={4} className="m-0">
                            {activity.name}
                          </Title>
                        </div>
                        <div className="space-y-2">
                          <div className="flex items-center">
                            <CalendarOutlined className="text-gray-400 mr-2" />
                            <Text className="text-gray-600">
                              Ngày mở đơn:{" "}
                              {new Date(
                                activity.registrationStart
                              ).toLocaleDateString()}
                            </Text>
                          </div>
                          <div className="flex items-center">
                            <EnvironmentOutlined className="text-gray-400 mr-2" />
                            <Text className="text-gray-600">
                              Địa điểm: {activity.location}
                            </Text>
                          </div>
                        </div>
                      </Card>
                    </Col>
                  ))}
                </Row>
              </div>

              {/* Create Activity Button */}
              <div className="flex justify-center items-center mb-8">
                <Link to="/organizer/activity-create">
                  <Button
                    type="primary"
                    size="large"
                    icon={<PlusOutlined />}
                    className="h-12 px-8 text-base flex items-center shadow-md hover:shadow-lg transition-all duration-300"
                    style={{
                      background: "linear-gradient(45deg, #1890ff, #096dd9)",
                      border: "none",
                      minWidth: "180px",
                    }}
                  >
                    <span className="ml-2 font-semibold">
                      Tạo hoạt động mới
                    </span>
                  </Button>
                </Link>
              </div>
            </div>
          </main>
          <Footer />
        </div>
      </div>
    </div>
  );
};

export default OrganizerHome;
