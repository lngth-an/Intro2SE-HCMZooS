import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'react-toastify';
import Header from "../components/common/Header";
import SidebarOrganizer from "../components/common/SidebarOrganizer";
import Footer from "../components/common/Footer";
import { Card, Row, Col, Statistic, Button, Badge } from 'antd';
import { UserOutlined, CalendarOutlined, BellOutlined } from '@ant-design/icons';

// Cấu hình axios để tự động thêm token vào header
axios.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('accessToken');
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
    totalActivities: 0
  });
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);

  const handleLogout = async () => {
    try {
      // Gọi API đăng xuất
      await axios.post('/auth/logout');
      
      // Xóa token và role khỏi localStorage
      localStorage.removeItem('accessToken');
      localStorage.removeItem('role');
      
      // Hiển thị thông báo thành công
      toast.success('Đăng xuất thành công');
      
      // Chuyển hướng về trang đăng nhập
      navigate('/login');
    } catch (error) {
      toast.error('Có lỗi xảy ra khi đăng xuất');
    }
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Lấy thông tin người dùng
        const userResponse = await axios.get('/auth/me');
        setUser(userResponse.data);

        // Lấy danh sách hoạt động của organizer
        const response = await axios.get('/activity/organizer');
        setActivities(response.data.activities);

        // Tính toán thống kê
        const stats = response.data.activities.reduce((acc, activity) => {
          acc[activity.activityStatus] = (acc[activity.activityStatus] || 0) + 1;
          return acc;
        }, {});
        setStats(stats);

        fetchStats();
        fetchUnreadCount();
      } catch (error) {
        console.error('Error fetching data:', error);
        toast.error('Không thể tải thông tin hoạt động');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const fetchStats = async () => {
    try {
      const response = await axios.get('/organizer/stats');
      setStats(response.data);
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  };

  const fetchUnreadCount = async () => {
    try {
      const response = await axios.get('/notifications/unread/count');
      setUnreadCount(response.data.unreadCount);
    } catch (error) {
      console.error('Error fetching unread count:', error);
    }
  };

  if (loading) {
    return <div>Đang tải...</div>;
  }

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      {/* Header */}
      <Header user={user} />

      {/* Main content with sidebar */}
      <div className="flex flex-1 pt-16">
        {/* Sidebar */}
        <SidebarOrganizer onLogout={handleLogout} />

        {/* Main content area + Footer */}
        <div className="flex-1 flex flex-col ml-64">
          <main className="flex-1 p-6">
            <div className="container mx-auto px-4 py-8">
              <div className="flex justify-between items-center mb-8">
                <h1 className="text-2xl font-bold">Quản lý hoạt động</h1>
                <Link
                  to="/organizer/activities/new"
                  className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 transition"
                >
                  Tạo hoạt động mới
                </Link>
              </div>

              <Row gutter={[24, 24]}>
                <Col xs={24} md={8}>
                  <Card>
                    <Statistic
                      title="Tổng số sinh viên"
                      value={stats.totalStudents}
                      prefix={<UserOutlined />}
                    />
                  </Card>
                </Col>
                <Col xs={24} md={8}>
                  <Card>
                    <Statistic
                      title="Tổng số hoạt động"
                      value={stats.totalActivities}
                      prefix={<CalendarOutlined />}
                    />
                  </Card>
                </Col>
                <Col xs={24} md={8}>
                  <Card>
                    <Button 
                      type="primary" 
                      icon={<BellOutlined />}
                      onClick={() => navigate('/organizer/notifications')}
                      style={{ width: '100%' }}
                    >
                      Thông báo
                      {unreadCount > 0 && (
                        <Badge count={unreadCount} style={{ marginLeft: 8 }} />
                      )}
                    </Button>
                  </Card>
                </Col>
              </Row>

              {/* Thống kê */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <div className="bg-white p-6 rounded-lg shadow">
                  <h3 className="text-lg font-semibold text-gray-600">Nháp</h3>
                  <p className="text-3xl font-bold text-blue-500">{stats.draft || 0}</p>
                </div>
                <div className="bg-white p-6 rounded-lg shadow">
                  <h3 className="text-lg font-semibold text-gray-600">Đã xuất bản</h3>
                  <p className="text-3xl font-bold text-green-500">{stats.published || 0}</p>
                </div>
                <div className="bg-white p-6 rounded-lg shadow">
                  <h3 className="text-lg font-semibold text-gray-600">Đã hoàn thành</h3>
                  <p className="text-3xl font-bold text-purple-500">{stats.completed || 0}</p>
                </div>
              </div>

              {/* Danh sách hoạt động gần đây */}
              <div className="bg-white rounded-lg shadow">
                <div className="p-6">
                  <h2 className="text-xl font-semibold mb-4">Hoạt động gần đây</h2>
                  {activities.length > 0 ? (
                    <div className="overflow-x-auto">
                      <table className="min-w-full">
                        <thead>
                          <tr className="bg-gray-50">
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Tên hoạt động
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Trạng thái
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Ngày bắt đầu
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Thao tác
                            </th>
                          </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                          {activities.slice(0, 5).map((activity) => (
                            <tr key={activity.activityID}>
                              <td className="px-6 py-4 whitespace-nowrap">
                                {activity.name}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full
                                  ${activity.activityStatus === 'draft' ? 'bg-gray-100 text-gray-800' : ''}
                                  ${activity.activityStatus === 'published' ? 'bg-green-100 text-green-800' : ''}
                                  ${activity.activityStatus === 'completed' ? 'bg-purple-100 text-purple-800' : ''}
                                `}>
                                  {activity.activityStatus}
                                </span>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                {new Date(activity.eventStart).toLocaleDateString()}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                <Link
                                  to={`/organizer/activities/${activity.activityID}`}
                                  className="text-indigo-600 hover:text-indigo-900"
                                >
                                  Chi tiết
                                </Link>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  ) : (
                    <p className="text-gray-500">Chưa có hoạt động nào</p>
                  )}
                </div>
              </div>

              {/* Liên kết nhanh */}
              <div className="mt-8">
                <Link
                  to="/organizer/activities"
                  className="text-blue-500 hover:text-blue-700"
                >
                  Xem tất cả hoạt động →
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
