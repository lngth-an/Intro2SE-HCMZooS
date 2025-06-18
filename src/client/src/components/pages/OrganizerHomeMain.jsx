import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import { toast } from "react-toastify";
import { Card, Row, Col, Button, Badge, Typography } from "antd";
import {
  UserOutlined,
  CalendarOutlined,
  BellOutlined,
  PlusOutlined,
  CheckCircleOutlined,
  ExclamationCircleOutlined,
  EnvironmentOutlined,
  RightOutlined,
} from "@ant-design/icons";
import { DOMAINS } from '../../constants/activityTypes';

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

const OrganizerHome = (props) => {
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
  const [complaints, setComplaints] = useState([]);

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

        // Lọc các hoạt động đã đăng tải nhưng chưa hoàn thành, chỉ lấy tối đa 2
        const published = activities
          .filter(
            (activity) =>
              activity.activityStatus === "Đã đăng tải" &&
              activity.activityStatus !== "Đã hoàn thành"
          )
          .slice(0, 2);
        setPublishedActivities(published);

        // Lấy danh sách khiếu nại
        const complaintsRes = await axios.get("/complaint/organizer");
        setComplaints(complaintsRes.data.complaints || []);

        // Lọc các hoạt động đã hoàn thành của organizer hiện tại
        const completedActivities = activities.filter(
          (a) =>
            a.organizerID === userResponse.data.organizerID &&
            a.activityStatus === "Đã hoàn thành"
        ).length;

        // Cập nhật stats
        setStats((prev) => ({
          ...prev,
          completedActivities,
        }));

        // Lấy số lượng khiếu nại chưa xử lý
        const organizerActivityIDs = activities
          .filter((a) => a.organizerID === userResponse.data.organizerID)
          .map((a) => a.activityID);

        const pendingComplaints = complaints.filter(
          (c) =>
            organizerActivityIDs.includes(c.activityID) &&
            c.complaintStatus === "Chờ duyệt"
        ).length;

        setStats((prev) => ({
          ...prev,
          pendingComplaints,
        }));

        fetchStats();
        fetchUnreadCount();
      } catch (error) {
        console.error("Error fetching data:", error);
        //toast.error("Không thể tải thông tin hoạt động");
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

  const renderActivityCard = (activity) => {
    const domain = DOMAINS.find(d => d.id === activity.type);
    const points = domain ? domain.defaultPoint : 3;

    return (
      <Card
        key={activity.activityID}
        className="mb-4 hover:shadow-lg transition-shadow"
        hoverable
      >
        <div className="flex items-start space-x-4">
          <div className="w-24 h-24 flex-shrink-0">
            <img
              src={activity.image || "https://via.placeholder.com/96"}
              alt={activity.name}
              className="w-full h-full object-cover rounded-lg"
            />
          </div>
          <div className="flex-grow">
            <div className="flex flex-col space-y-2">
              <div className="flex justify-between items-start">
                <Title level={4} className="m-0 text-lg font-semibold">
                  {activity.name}
                </Title>
                <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                  activity.activityStatus === 'Bản nháp' ? 'bg-gray-200 text-gray-800' :
                  activity.activityStatus === 'Đã đăng tải' ? 'bg-blue-100 text-blue-800' :
                  activity.activityStatus === 'Đã hoàn thành' ? 'bg-green-100 text-green-800' :
                  'bg-gray-100 text-gray-800'
                }`}>
                  {activity.activityStatus}
                </span>
              </div>
              <div className="flex items-center space-x-2">
                <span className={`px-3 py-1 rounded-full text-sm font-medium ${domain?.color || 'bg-gray-100 text-gray-800'}`}>
                  {activity.type}
                </span>
                <span className="px-3 py-1 rounded-full text-sm font-medium bg-yellow-100 text-yellow-800">
                  {points} điểm
                </span>
              </div>
              <div className="text-gray-600 text-sm space-y-1">
                <div className="flex items-center">
                  <CalendarOutlined className="mr-2" />
                  <span>{new Date(activity.eventStart).toLocaleString()}</span>
                </div>
                <div className="flex items-center">
                  <EnvironmentOutlined className="mr-2" />
                  <span>{activity.location}</span>
                </div>
              </div>
            </div>
            <div className="flex justify-end mt-4">
              <Link
                to={`/organizer/activities/${activity.activityID}`}
                className="text-blue-600 hover:text-blue-800 flex items-center"
              >
                Chi tiết
                <RightOutlined className="ml-1" />
              </Link>
            </div>
          </div>
        </div>
      </Card>
    );
  };

  if (loading) {
    return <div>Đang tải...</div>;
  }

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      {props.Header ? <props.Header user={user} /> : null}
      <div className="flex flex-1 pt-16">
        {props.SidebarOrganizer ? (
          <props.SidebarOrganizer onLogout={props.onLogout} />
        ) : null}
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
                          Xem các hoạt động của bạn...
                        </Text>
                      </div>
                    </Card>
                  </Link>
                </Col>
                <Col xs={24} md={12}>
                  <Link to="/complaint/organizer" className="block">
                    <Card hoverable className="h-full">
                      <div className="flex items-center mb-4">
                        <ExclamationCircleOutlined className="text-2xl text-orange-500 mr-3" />
                        <Title level={4} className="m-0">
                          Quản lý khiếu nại
                        </Title>
                      </div>
                      <div className="bg-orange-50 p-4 rounded-lg">
                        <Text className="text-gray-600 block mb-1">
                          Xem các đơn khiếu nại...
                        </Text>
                      </div>
                    </Card>
                  </Link>
                </Col>
              </Row>

              {/* Hoạt động đang diễn ra */}
              <div className="mb-8">
                <div className="flex justify-between items-center mb-4">
                  <Title level={4} className="m-0">
                    Hoạt động đang diễn ra
                  </Title>
                  <Link
                    to="/organizer/activities"
                    className="text-blue-600 hover:text-blue-800 flex items-center"
                  >
                    Xem tất cả
                    <RightOutlined className="ml-1" />
                  </Link>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  {publishedActivities.length > 0 ? (
                    publishedActivities.map((activity) => renderActivityCard(activity))
                  ) : (
                    <div className="col-span-2 text-center py-8 bg-gray-50 rounded-lg">
                      <Text type="secondary">Không có hoạt động nào đang diễn ra</Text>
                    </div>
                  )}
                </div>
              </div>

              {/* Create Activity Button */}
              <div className="flex justify-center items-center mb-8">
                <Button
                  type="primary"
                  icon={<PlusOutlined />}
                  onClick={() => navigate("/organizer/activity-create")}
                  className="h-12 px-6 text-base font-semibold"
                >
                  Tạo hoạt động mới
                </Button>
              </div>
            </div>
          </main>
          {props.Footer ? <props.Footer /> : null}
        </div>
      </div>
    </div>
  );
};

export default OrganizerHome;
