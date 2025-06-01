import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'react-toastify';
import Header from "../components/common/Header";
import SidebarStudent from "../components/common/SidebarStudent";
import Footer from "../components/common/Footer";
import { Card, Row, Col, Statistic, Button, Badge } from 'antd';
import { TrophyOutlined, CalendarOutlined, BellOutlined } from '@ant-design/icons';

const StudentHome = () => {
  const navigate = useNavigate();
  const [studentInfo, setStudentInfo] = useState(null);
  const [currentSemester, setCurrentSemester] = useState(null);
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalScore: 0,
    totalActivities: 0
  });
  const [unreadCount, setUnreadCount] = useState(0);

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
        // Lấy thông tin sinh viên
        const studentResponse = await axios.get('/student/me');
        setStudentInfo(studentResponse.data);

        // Lấy học kỳ hiện tại
        const semesterResponse = await axios.get('/semester/current');
        setCurrentSemester(semesterResponse.data);

        // Lấy danh sách hoạt động đã đăng ký
        const activitiesResponse = await axios.get('/participation/open');
        setActivities(activitiesResponse.data.activities || []);
      } catch (error) {
        toast.error('Không thể tải thông tin');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  useEffect(() => {
    fetchStats();
    fetchUnreadCount();
  }, []);

  const fetchStats = async () => {
    try {
      const response = await axios.get('/student/stats');
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
      <Header user={studentInfo} />

      {/* Main content with sidebar */}
      <div className="flex flex-1 pt-16">
        {/* Sidebar */}
        <SidebarStudent onLogout={handleLogout} />

        {/* Main content area + Footer */}
        <div className="flex-1 flex flex-col ml-64">
          <main className="flex-1 p-6">
            <div className="container mx-auto px-4 py-8">
              <h1 className="text-2xl font-bold mb-6">Chào mừng, {studentInfo?.name}</h1>
              
              {/* Thông tin sinh viên */}
              <div className="bg-white rounded-lg shadow p-6 mb-8">
                <h2 className="text-xl font-semibold mb-4">Thông tin cá nhân</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <p className="text-gray-600">Mã số sinh viên</p>
                    <p className="font-semibold">{studentInfo?.studentID}</p>
                  </div>
                  <div>
                    <p className="text-gray-600">Lớp</p>
                    <p className="font-semibold">{studentInfo?.class}</p>
                  </div>
                  <div>
                    <p className="text-gray-600">Email</p>
                    <p className="font-semibold">{studentInfo?.email}</p>
                  </div>
                  <div>
                    <p className="text-gray-600">Số điện thoại</p>
                    <p className="font-semibold">{studentInfo?.phone}</p>
                  </div>
                </div>
              </div>

              {/* Học kỳ hiện tại */}
              <div className="bg-white rounded-lg shadow p-6 mb-8">
                <h2 className="text-xl font-semibold mb-4">Học kỳ hiện tại</h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <p className="text-gray-600">Học kỳ</p>
                    <p className="font-semibold">{currentSemester?.semesterName}</p>
                  </div>
                  <div>
                    <p className="text-gray-600">Ngày bắt đầu</p>
                    <p className="font-semibold">
                      {new Date(currentSemester?.startDate).toLocaleDateString()}
                    </p>
                  </div>
                  <div>
                    <p className="text-gray-600">Ngày kết thúc</p>
                    <p className="font-semibold">
                      {new Date(currentSemester?.endDate).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              </div>

              {/* Hoạt động đã đăng ký */}
              <div className="bg-white rounded-lg shadow">
                <div className="p-6">
                  <h2 className="text-xl font-semibold mb-4">Hoạt động đã đăng ký</h2>
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
                              Ngày tham gia
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Điểm
                            </th>
                          </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                          {activities.map((activity) => (
                            <tr key={activity.participationID}>
                              <td className="px-6 py-4 whitespace-nowrap">
                                {activity.activityName}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full
                                  ${activity.status === 'registered' ? 'bg-blue-100 text-blue-800' : ''}
                                  ${activity.status === 'completed' ? 'bg-green-100 text-green-800' : ''}
                                  ${activity.status === 'cancelled' ? 'bg-red-100 text-red-800' : ''}
                                `}>
                                  {activity.status}
                                </span>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                {new Date(activity.registrationDate).toLocaleDateString()}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                {activity.score || 'Chưa có'}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  ) : (
                    <p className="text-gray-500">Bạn chưa đăng ký hoạt động nào</p>
                  )}
                </div>
              </div>

              {/* Liên kết nhanh */}
              <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-4">
                <Link
                  to="/student/activities"
                  className="bg-blue-500 text-white p-4 rounded-lg text-center hover:bg-blue-600 transition"
                >
                  Xem hoạt động
                </Link>
                <Link
                  to="/student/score"
                  className="bg-green-500 text-white p-4 rounded-lg text-center hover:bg-green-600 transition"
                >
                  Xem điểm
                </Link>
                <Link
                  to="/student/register"
                  className="bg-purple-500 text-white p-4 rounded-lg text-center hover:bg-purple-600 transition"
                >
                  Đăng ký hoạt động
                </Link>
              </div>

              <Row gutter={[24, 24]} className="mt-8">
                <Col xs={24} md={8}>
                  <Card>
                    <Statistic
                      title="Tổng điểm"
                      value={stats.totalScore}
                      prefix={<TrophyOutlined />}
                    />
                  </Card>
                </Col>
                <Col xs={24} md={8}>
                  <Card>
                    <Statistic
                      title="Hoạt động đã tham gia"
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
                      onClick={() => navigate('/student/notifications')}
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
            </div>
          </main>
          <Footer />
        </div>
      </div>
    </div>
  );
};

export default StudentHome;
