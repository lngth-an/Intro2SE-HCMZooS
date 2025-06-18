import React, { useState, useEffect, useCallback } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import { useAuth } from "../contexts/AuthContext";
import Header from "../components/common/Header";
import SidebarOrganizer from "../components/common/SidebarOrganizer";
import Footer from "../components/common/Footer";
import {
  Button,
  Tabs,
  Modal,
  Input,
  Select,
  Typography,
  Badge,
  Spin,
  Row,
  Col,
  Card,
} from "antd";
import { SendOutlined, PlusOutlined, BellOutlined, DeleteOutlined } from "@ant-design/icons";
import io from "socket.io-client";

const { Title, Text } = Typography;
const { TabPane } = Tabs;
const { Option } = Select;

// Khởi tạo socket connection
const socket = io(process.env.REACT_APP_API_URL || "http://localhost:5000", {
  transports: ["websocket"],
});

const OrganizerNotifications = () => {
    const [notifications, setNotifications] = useState([]);
    const [sentNotifications, setSentNotifications] = useState([]);
    const [loading, setLoading] = useState(true);
    const [openDialog, setOpenDialog] = useState(false);
    const [students, setStudents] = useState([]);
    const [selectedStudents, setSelectedStudents] = useState([]);
    const [newNotification, setNewNotification] = useState({
        title: '',
        message: '',
        targetType: 'all_students'
    });
    const [activeTab, setActiveTab] = useState(0);
    const [sentNotificationsPage, setSentNotificationsPage] = useState(1);
    const [sentNotificationsTotalPages, setSentNotificationsTotalPages] = useState(1);
    const { user, token } = useAuth();
    const [activities, setActivities] = useState([]);
    const [selectedActivity, setSelectedActivity] = useState('');
    const [activityStudents, setActivityStudents] = useState([]);
    const [sendTarget, setSendTarget] = useState('all'); // 'all' hoặc 'specific'

    const fetchNotifications = useCallback(async () => {
        try {
            const response = await axios.get(`/notifications?userID=${user.userID}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setNotifications(response.data.notifications);
        } catch (error) {
            console.error('Error fetching notifications:', error);
            toast.error('Lỗi khi tải thông báo');
        } finally {
            setLoading(false);
        }
    }, [user, token]);

    const fetchStudents = useCallback(async (query) => {
        try {
            const response = await axios.get(`/notifications/search?query=${query}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setStudents(response.data.students);
        } catch (error) {
            console.error('Error fetching students:', error);
            toast.error('Lỗi khi tìm kiếm sinh viên');
        }
    }, [token]);

    const fetchSentNotifications = useCallback(async (page = 1) => {
        try {
            const response = await axios.get(`/notifications/sent?page=${page}&limit=10`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setSentNotifications(response.data.notifications);
            setSentNotificationsTotalPages(response.data.pagination.totalPages);
        } catch (error) {
            console.error('Error fetching sent notifications:', error);
            toast.error('Lỗi khi tải thông báo đã gửi');
        }
    }, [token]);

    const fetchActivities = useCallback(async () => {
        try {
            const response = await axios.get('/activity/organizer', {
                headers: { Authorization: `Bearer ${token}` }
            });
            setActivities(response.data.activities || []);
        } catch (error) {
            console.error('Error fetching activities:', error);
        }
    }, [token]);

    useEffect(() => {
        if (user) {
            fetchNotifications();
            fetchStudents('');
            fetchSentNotifications(1);
            fetchActivities();

            // Subscribe to realtime notifications
            socket.on('new_notification', (data) => {
                if (data.notifications.some(n => n.fromUserID === user.userID)) {
                    fetchNotifications();
                    fetchSentNotifications(sentNotificationsPage);
                }
            });

            return () => {
                socket.off('new_notification');
            };
        }
    }, [user, fetchNotifications, fetchStudents, fetchSentNotifications, sentNotificationsPage, fetchActivities]);

    useEffect(() => {
        if (selectedActivity) {
            axios.get(`/activity/${selectedActivity}/registrations`, {
                headers: { Authorization: `Bearer ${token}` }
            }).then(res => {
                setActivityStudents(res.data.registrations.map(r => ({
                    userID: r.studentID,
                    name: r.studentName || '',
                    academicYear: r.academicYear,
                    faculty: r.faculty
                })));
            }).catch(() => setActivityStudents([]));
            setSendTarget('all');
            setSelectedStudents([]);
        } else {
            setActivityStudents([]);
            setSendTarget('all');
            setSelectedStudents([]);
        }
    }, [selectedActivity, token]);

    const handleNotificationClick = async (notification) => {
        if (notification.notificationStatus === 'unread') {
            try {
                await axios.patch(`/notifications/${notification.notificationID}/read`, {}, {
                    headers: { Authorization: `Bearer ${token}` }
                });
                setNotifications(notifications.map(n =>
                    n.notificationID === notification.notificationID
                        ? { ...n, notificationStatus: 'read' }
                        : n
                ));
            } catch (error) {
                console.error('Error marking notification as read:', error);
                toast.error('Lỗi khi đánh dấu thông báo đã đọc');
            }
        }
    };

    const handleDeleteNotification = async (notificationId) => {
        try {
            await axios.delete(`/notifications/${notificationId}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setNotifications(notifications.filter(n => n.notificationID !== notificationId));
            toast.success('Xóa thông báo thành công');
        } catch (error) {
            console.error('Error deleting notification:', error);
            toast.error('Lỗi khi xóa thông báo');
        }
    };

    const handleSendNotification = async () => {
        try {
            let toUserIDs = undefined;
            let activityID = undefined;
            if (selectedActivity) {
                activityID = selectedActivity;
                if (sendTarget === 'specific') {
                    toUserIDs = selectedStudents.map(student => student.userID);
                }
            }
            await axios.post('/notifications/send', {
                fromUserID: user.userID,
                toUserIDs,
                notificationTitle: newNotification.title,
                notificationMessage: newNotification.message,
                activityID
            }, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setOpenDialog(false);
            fetchNotifications();
            toast.success('Gửi thông báo thành công');
        } catch (error) {
            console.error('Error sending notification:', error);
            toast.error('Lỗi khi gửi thông báo');
        }
    };

    const handleOpenDialog = () => {
        setOpenDialog(true);
        setNewNotification({
            title: '',
            message: '',
            targetType: 'all_students'
        });
        setSelectedStudents([]);
        setSelectedActivity('');
        setSendTarget('all');
        setActivityStudents([]);
    };

    const handleCloseDialog = () => {
      setOpenDialog(false);
  };

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Header user={user} />
      <div className="flex flex-1 pt-16">
                <SidebarOrganizer />
        <div className="flex-1 flex flex-col ml-64">
          <main className="flex-1 p-6">
            <div className="container mx-auto px-4 py-8">
              <div className="bg-white shadow rounded-lg p-6">
                <div className="flex justify-between items-center mb-2">
                  <h1 className="text-4xl font-extrabold text-gray-900 tracking-tight mb-0">
                    THÔNG BÁO
                  </h1>
                  <Button
                    type="primary"
                    icon={<SendOutlined />}
                    onClick={handleOpenDialog}
                    className="h-12 px-6 text-base font-semibold bg-blue-600 hover:bg-blue-700 text-white normal-case"
                  >
                    Gửi thông báo mới
                  </Button>
                </div>
                <div className="mb-6">
                  <span className="text-lg text-gray-600 font-medium">
                                        {notifications.filter(n => n.notificationStatus === 'unread').length} thông báo chưa đọc
                                    </span>
                                </div>

                                <Tabs activeKey={String(activeTab)} onChange={key => setActiveTab(Number(key))}>
                                    <TabPane tab="Thông báo nhận được" key="0">
                                        {loading ? (
                                            <div className="text-center py-4">
                                                <Spin size="large" />
                            </div>
                                        ) : notifications.length === 0 ? (
                                            <div className="text-center py-4 text-gray-500">
                                                Không có thông báo nào
                                        </div>
                                    ) : (
                                            <div className="space-y-4">
                                                {notifications.map(notification => (
                                                    <Card
                                                    key={notification.notificationID}
                                                        className={`${notification.notificationStatus === 'unread' ? 'bg-blue-50' : ''} hover:shadow-md transition-shadow`}
                                                        onClick={() => handleNotificationClick(notification)}
                                                    >
                                                        <div className="flex justify-between">
                                                            <div>
                                                                <Title level={5}>{notification.notificationTitle}</Title>
                                                                <Text>{notification.notificationMessage}</Text>
                                                                <div className="mt-2">
                                                                    <Text type="secondary">
                                                                {new Date(notification.createdAt).toLocaleString()}
                                                                    </Text>
                                                    </div>
                                                </div>
                                                            <Button
                                                                type="text"
                                                                icon={<DeleteOutlined />}
                                                                onClick={(e) => {
                                                                    e.stopPropagation();
                                                                    handleDeleteNotification(notification.notificationID);
                                                                }}
                                                                className="text-red-500 hover:text-red-700"
                                            />
                                        </div>
                                                    </Card>
                                                ))}
                                            </div>
                                        )}
                                    </TabPane>
                                    <TabPane tab="Thông báo đã gửi" key="1">
                                        {loading ? (
                                            <div className="text-center py-4">
                                                <Spin size="large" />
                                            </div>
                                        ) : sentNotifications.length === 0 ? (
                                            <div className="text-center py-4 text-gray-500">
                                                Chưa gửi thông báo nào
                                            </div>
                                        ) : (
                                            <div className="space-y-4">
                                                {sentNotifications.map(notification => (
                                                    <Card key={notification.notificationID}>
                                                        <Title level={5}>{notification.notificationTitle}</Title>
                                                        <Text>{notification.notificationMessage}</Text>
                                                        <div className="mt-2">
                                                            <Text type="secondary">
                                                                {new Date(notification.createdAt).toLocaleString()}
                                                            </Text>
                                                        </div>
                                                    </Card>
                                                ))}
                                            </div>
                                        )}
                                    </TabPane>
                                </Tabs>
                                    </div>
                        </div>
                    </main>
                </div>
            </div>

      <Modal
                title="Gửi thông báo mới"
        open={openDialog}
        onCancel={handleCloseDialog}
                footer={[
                    <Button key="cancel" onClick={handleCloseDialog}>
                        Hủy
                    </Button>,
                    <Button
                        key="submit"
                        type="primary"
                        onClick={handleSendNotification}
                        disabled={!newNotification.title || !newNotification.message}
                    >
                        Gửi
                    </Button>
                ]}
            >
                <div className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Tiêu đề
                        </label>
                        <Input
                            value={newNotification.title}
                            onChange={e => setNewNotification({ ...newNotification, title: e.target.value })}
                            placeholder="Nhập tiêu đề thông báo"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Nội dung
                        </label>
                        <Input.TextArea
                            value={newNotification.message}
                            onChange={e => setNewNotification({ ...newNotification, message: e.target.value })}
                            placeholder="Nhập nội dung thông báo"
                            rows={4}
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Hoạt động liên quan (không bắt buộc)
                        </label>
          <Select
            value={selectedActivity}
            onChange={setSelectedActivity}
                            style={{ width: '100%' }}
                            allowClear
                            placeholder="Chọn hoạt động"
                        >
                            {activities.map(activity => (
                                <Option key={activity.activityID} value={activity.activityID}>
                                    {activity.name}
              </Option>
            ))}
          </Select>
                    </div>
                    {selectedActivity && (
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Gửi cho
                            </label>
          <Select
            value={sendTarget}
            onChange={setSendTarget}
                                style={{ width: '100%' }}
          >
                                <Option value="all">Tất cả sinh viên đã đăng ký</Option>
                                <Option value="specific">Chọn sinh viên cụ thể</Option>
          </Select>
                        </div>
                    )}
                    {selectedActivity && sendTarget === 'specific' && (
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Chọn sinh viên
                            </label>
            <Select
              mode="multiple"
                                value={selectedStudents.map(s => s.userID)}
                                onChange={values => {
                                    setSelectedStudents(
                                        activityStudents.filter(s => values.includes(s.userID))
                                    );
                                }}
                                style={{ width: '100%' }}
                                placeholder="Chọn sinh viên"
                            >
                                {activityStudents.map(student => (
                                    <Option key={student.userID} value={student.userID}>
                                        {student.name} - {student.academicYear}
                </Option>
              ))}
            </Select>
                        </div>
                    )}
        </div>
      </Modal>
    </div>
  );
};

export default OrganizerNotifications;
