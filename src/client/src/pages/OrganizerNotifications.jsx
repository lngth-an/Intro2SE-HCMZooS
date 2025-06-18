import React, { useState, useEffect, useCallback } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import { useAuth } from "../contexts/AuthContext";
import { useNavigate } from "react-router-dom";
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
import { SendOutlined, PlusOutlined, BellOutlined } from "@ant-design/icons";

const { Title, Text } = Typography;
const { TabPane } = Tabs;
const { Option } = Select;

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
    const navigate = useNavigate();

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
        }
    }, [user, fetchNotifications, fetchStudents, fetchSentNotifications, fetchActivities]);

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
            handleCloseDialog();
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

    const handleTabChange = (key) => {
        setActiveTab(key);
    };

    // Search students for specific send
    const handleSearchStudents = async (value) => {
        if (!value) return;
        try {
            const res = await axios.get(`/notifications/search?query=${value}`);
            setStudents(res.data.students || []);
        } catch (err) {
            toast.error("Lỗi khi tìm kiếm sinh viên");
        }
    };

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

    if (loading) {
        return (
            <div className="min-h-screen flex flex-col bg-gray-50">
                <Header user={user} />
                <div className="flex flex-1 pt-16">
                    <SidebarOrganizer onLogout={handleLogout} />
                    <div className="flex-1 flex justify-center items-center">
                        <Spin size="large" />
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen flex flex-col bg-gray-50">
            <Header user={user} />
            <div className="flex flex-1 pt-16">
                <SidebarOrganizer onLogout={handleLogout} />
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
                                        {notifications.filter((n) => n.notificationStatus === "unread").length}{" "}
                                        thông báo chưa đọc
                                    </span>
                                </div>

                                <Tabs activeKey={activeTab} onChange={handleTabChange}>
                                    <TabPane
                                        tab={
                                            <span>
                                                <BellOutlined />
                                                Thông báo nhận được
                                            </span>
                                        }
                                        key="received"
                                    >
                                        <div className="space-y-4">
                                            {notifications.length === 0 ? (
                                                <p className="text-gray-500">Không có thông báo nào</p>
                                            ) : (
                                                notifications.map((notification) => (
                                                    <Card
                                                        key={notification.notificationID}
                                                        className={`${
                                                            notification.notificationStatus === "unread"
                                                                ? "border-l-4 border-blue-500"
                                                                : ""
                                                        }`}
                                                    >
                                                        <div className="flex justify-between items-start">
                                                            <div>
                                                                <Title level={5}>{notification.notificationTitle}</Title>
                                                                <Text>{notification.notificationMessage}</Text>
                                                            </div>
                                                            {notification.notificationStatus === "unread" && (
                                                                <Badge status="processing" text="Mới" />
                                                            )}
                                                        </div>
                                                    </Card>
                                                ))
                                            )}
                                        </div>
                                    </TabPane>

                                    <TabPane
                                        tab={
                                            <span>
                                                <SendOutlined />
                                                Thông báo đã gửi
                                            </span>
                                        }
                                        key="sent"
                                    >
                                        <div className="space-y-4">
                                            {sentNotifications.length === 0 ? (
                                                <p className="text-gray-500">Chưa gửi thông báo nào</p>
                                            ) : (
                                                sentNotifications.map((notification) => (
                                                    <Card key={notification.notificationID}>
                                                        <div>
                                                            <Title level={5}>{notification.notificationTitle}</Title>
                                                            <Text>{notification.notificationMessage}</Text>
                                                        </div>
                                                    </Card>
                                                ))
                                            )}
                                        </div>
                                    </TabPane>
                                </Tabs>
                            </div>
                        </div>
                    </main>
                    <Footer />
                </div>
            </div>

            <Modal
                title={
                    <span className="text-xl font-semibold normal-case">
                        Gửi thông báo mới
                    </span>
                }
                open={openDialog}
                onCancel={handleCloseDialog}
                onOk={handleSendNotification}
                okText="Gửi"
                cancelText="Hủy"
                okButtonProps={{
                    className:
                        "bg-blue-600 hover:bg-blue-700 text-white normal-case font-semibold",
                }}
                cancelButtonProps={{
                    className: "normal-case font-semibold",
                }}
            >
                <div className="space-y-4 mt-2">
                    <Select
                        showSearch
                        placeholder="Chọn hoạt động (không bắt buộc)"
                        value={selectedActivity}
                        onChange={setSelectedActivity}
                        className="w-full"
                        optionFilterProp="children"
                        filterOption={(input, option) =>
                            option.children.toLowerCase().indexOf(input.toLowerCase()) >= 0
                        }
                    >
                        <Option value="">-- Chọn hoạt động --</Option>
                        {activities.map((act) => (
                            <Option key={act.activityID} value={act.activityID}>
                                {act.name}
                            </Option>
                        ))}
                    </Select>
                    <Select
                        value={sendTarget}
                        onChange={setSendTarget}
                        className="w-full"
                    >
                        <Option value="all">Tất cả sinh viên tham gia hoạt động</Option>
                        <Option value="specific">Một số sinh viên cụ thể</Option>
                    </Select>
                    {sendTarget === "specific" && (
                        <Select
                            mode="multiple"
                            showSearch
                            placeholder="Tìm kiếm sinh viên..."
                            value={selectedStudents.map((s) => s.userID)}
                            onSearch={handleSearchStudents}
                            onChange={(values) => {
                                const selected = students.filter((s) =>
                                    values.includes(s.userID)
                                );
                                setSelectedStudents(selected);
                            }}
                            className="w-full"
                            optionLabelProp="label"
                        >
                            {students.map((student) => (
                                <Option
                                    key={student.userID}
                                    value={student.userID}
                                    label={student.name || student.userID}
                                >
                                    {student.name || student.userID}
                                </Option>
                            ))}
                        </Select>
                    )}
                    <Input
                        placeholder="Tiêu đề thông báo"
                        value={newNotification.title}
                        onChange={(e) =>
                            setNewNotification({ ...newNotification, title: e.target.value })
                        }
                        className="normal-case"
                    />
                    <Input.TextArea
                        placeholder="Nội dung thông báo"
                        rows={4}
                        value={newNotification.message}
                        onChange={(e) =>
                            setNewNotification({
                                ...newNotification,
                                message: e.target.value,
                            })
                        }
                        className="normal-case"
                    />
                </div>
            </Modal>
        </div>
    );
};

export default OrganizerNotifications;
