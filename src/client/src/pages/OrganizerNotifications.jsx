import React, { useState, useEffect, useCallback } from 'react';
import {
    Container,
    Typography,
    List,
    ListItem,
    ListItemText,
    Paper,
    Divider,
    Box,
    CircularProgress,
    Button,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    TextField,
    FormControl,
    InputLabel,
    Select,
    MenuItem,
    Grid,
    Chip,
    IconButton,
    Tooltip,
    Badge,
    Autocomplete,
    Tabs,
    Tab,
    Pagination
} from '@mui/material';
import { useAuth } from '../contexts/AuthContext';
import axios from 'axios';
import io from 'socket.io-client';
import { NotificationsActive, NotificationsOff, Delete, Send } from '@mui/icons-material';
import { toast } from 'react-hot-toast';
import Header from "../components/common/Header";
import SidebarOrganizer from "../components/common/SidebarOrganizer";
import Footer from "../components/common/Footer";

// Cấu hình axios
const API_URL = 'http://localhost:3001';
axios.defaults.baseURL = API_URL;
axios.defaults.headers.common['Content-Type'] = 'application/json';

// Cấu hình Socket.IO
const socket = io(API_URL, {
    withCredentials: true
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

    useEffect(() => {
        if (user) {
            fetchNotifications();
            fetchStudents('');
            fetchSentNotifications(1);

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
    }, [user, fetchNotifications, fetchStudents, fetchSentNotifications, sentNotificationsPage]);

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
            const toUserIDs = newNotification.targetType === 'all_students' 
                ? 'all_students'
                : selectedStudents.map(student => student.userID);

            await axios.post('/notifications/send', {
                fromUserID: user.userID,
                toUserIDs,
                notificationTitle: newNotification.title,
                notificationMessage: newNotification.message
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
    };

    const handleCloseDialog = () => {
        setOpenDialog(false);
        setNewNotification({
            title: '',
            message: '',
            targetType: 'all_students'
        });
        setSelectedStudents([]);
    };

    const handleTabChange = (event, newValue) => {
        setActiveTab(newValue);
    };

    const handleSentNotificationsPageChange = (event, value) => {
        setSentNotificationsPage(value);
        fetchSentNotifications(value);
    };

    if (loading) {
        return (
            <div className="flex flex-col min-h-screen">
                <Header />
                <div className="flex flex-1">
                    <SidebarOrganizer />
                    <Box display="flex" justifyContent="center" alignItems="center" flex={1}>
                        <CircularProgress />
                    </Box>
                </div>
                <div className="ml-64">
                    <Footer />
                </div>
            </div>
        );
    }

    return (
        <div className="flex flex-col min-h-screen">
            <Header />
            <div className="flex flex-1">
                <SidebarOrganizer />
                <div className="flex-1">
                    <div className="p-6 ml-64 mt-16">
                        <div className="max-w-4xl mx-auto">
                            <div className="flex items-center justify-between mb-6">
                                <div>
                                    <h1 className="text-2xl font-bold text-gray-900">Thông báo</h1>
                                    <p className="text-sm text-gray-500 mt-1">
                                        {notifications.filter(n => n.notificationStatus === 'unread').length} thông báo chưa đọc
                                    </p>
                                </div>
                                <Button
                                    variant="contained"
                                    color="primary"
                                    startIcon={<Send />}
                                    onClick={handleOpenDialog}
                                    className="bg-blue-600 hover:bg-blue-700"
                                >
                                    Gửi thông báo mới
                                </Button>
                            </div>

                            <Paper elevation={3} className="rounded-lg overflow-hidden">
                                <Tabs value={activeTab} onChange={handleTabChange} className="border-b border-gray-200">
                                    <Tab label="Thông báo nhận được" />
                                    <Tab label="Thông báo đã gửi" />
                                </Tabs>

                                {activeTab === 0 ? (
                                    notifications.length === 0 ? (
                                        <div className="p-8 text-center">
                                            <NotificationsOff className="text-gray-400 text-6xl mb-4" />
                                            <Typography color="textSecondary" variant="h6">
                                                Không có thông báo nào
                                            </Typography>
                                        </div>
                                    ) : (
                                        <div className="divide-y divide-gray-200">
                                            {notifications.map((notification) => (
                                                <div 
                                                    key={notification.notificationID}
                                                    className={`p-4 hover:bg-gray-50 transition-colors ${
                                                        notification.notificationStatus === 'unread' ? 'bg-blue-50' : ''
                                                    }`}
                                                >
                                                    <div className="flex justify-between items-start">
                                                        <div className="flex-1">
                                                            <Typography variant="subtitle1" className="font-medium text-gray-900">
                                                                {notification.notificationTitle}
                                                            </Typography>
                                                            <Typography variant="body2" className="text-gray-600 mt-1">
                                                                {notification.notificationMessage}
                                                            </Typography>
                                                            <Typography variant="caption" className="text-gray-500 block mt-2">
                                                                {new Date(notification.createdAt).toLocaleString()}
                                                            </Typography>
                                                        </div>
                                                        <Tooltip title="Xóa">
                                                            <IconButton
                                                                size="small"
                                                                onClick={() => handleDeleteNotification(notification.notificationID)}
                                                                className="text-gray-500 hover:text-red-500"
                                                            >
                                                                <Delete />
                                                            </IconButton>
                                                        </Tooltip>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    )
                                ) : (
                                    <>
                                        <div className="divide-y divide-gray-200">
                                            {sentNotifications.map((notification) => (
                                                <div key={notification.notificationID} className="p-4 hover:bg-gray-50 transition-colors">
                                                    <Typography variant="subtitle1" className="font-medium text-gray-900">
                                                        {notification.notificationTitle}
                                                    </Typography>
                                                    <Typography variant="body2" className="text-gray-600 mt-1">
                                                        {notification.notificationMessage}
                                                    </Typography>
                                                    <div className="mt-2 space-y-1">
                                                        <Typography variant="caption" className="text-gray-500 block">
                                                            Gửi đến: {notification.toUserID === 'all_students' ? 'Tất cả sinh viên' : notification.toUserName}
                                                        </Typography>
                                                        <Typography variant="caption" className="text-gray-500 block">
                                                            {new Date(notification.createdAt).toLocaleString()}
                                                        </Typography>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                        <div className="flex justify-center p-4 border-t border-gray-200">
                                            <Pagination
                                                count={sentNotificationsTotalPages}
                                                page={sentNotificationsPage}
                                                onChange={handleSentNotificationsPageChange}
                                                color="primary"
                                                className="mt-4"
                                            />
                                        </div>
                                    </>
                                )}
                            </Paper>

                            <Dialog 
                                open={openDialog} 
                                onClose={handleCloseDialog} 
                                maxWidth="sm" 
                                fullWidth
                                PaperProps={{
                                    className: "rounded-lg"
                                }}
                            >
                                <DialogTitle className="text-xl font-semibold pb-2">
                                    Gửi thông báo mới
                                </DialogTitle>
                                <DialogContent>
                                    <div className="space-y-4 mt-2">
                                        <TextField
                                            fullWidth
                                            label="Tiêu đề"
                                            value={newNotification.title}
                                            onChange={(e) => setNewNotification({ ...newNotification, title: e.target.value })}
                                            variant="outlined"
                                            className="mb-4"
                                        />
                                        <TextField
                                            fullWidth
                                            label="Nội dung"
                                            multiline
                                            rows={4}
                                            value={newNotification.message}
                                            onChange={(e) => setNewNotification({ ...newNotification, message: e.target.value })}
                                            variant="outlined"
                                            className="mb-4"
                                        />
                                        <FormControl fullWidth variant="outlined" className="mb-4">
                                            <InputLabel>Gửi đến</InputLabel>
                                            <Select
                                                value={newNotification.targetType}
                                                onChange={(e) => setNewNotification({ ...newNotification, targetType: e.target.value })}
                                                label="Gửi đến"
                                            >
                                                <MenuItem value="all_students">Tất cả sinh viên</MenuItem>
                                                <MenuItem value="specific_students">Sinh viên cụ thể</MenuItem>
                                            </Select>
                                        </FormControl>
                                        {newNotification.targetType === 'specific_students' && (
                                            <div className="space-y-4">
                                                <div className="mb-2">
                                                    <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                                                        Tìm kiếm sinh viên theo mã số
                                                    </Typography>
                                                    <TextField
                                                        fullWidth
                                                        placeholder="Nhập mã số sinh viên"
                                                        onChange={(e) => {
                                                            const studentID = e.target.value;
                                                            if (studentID) {
                                                                fetchStudents(studentID);
                                                            }
                                                        }}
                                                    />
                                                </div>
                                                <div className="max-h-60 overflow-auto">
                                                    {students.length > 0 ? (
                                                        <List>
                                                            {students.map((student) => (
                                                                <ListItem
                                                                    key={student.studentID}
                                                                    secondaryAction={
                                                                        <Button
                                                                            size="small"
                                                                            onClick={() => {
                                                                                if (!selectedStudents.find(s => s.studentID === student.studentID)) {
                                                                                    setSelectedStudents([...selectedStudents, student]);
                                                                                }
                                                                            }}
                                                                            disabled={selectedStudents.some(s => s.studentID === student.studentID)}
                                                                        >
                                                                            Chọn
                                                                        </Button>
                                                                    }
                                                                >
                                                                    <ListItemText
                                                                        primary={student.user?.name || 'Không rõ tên'}
                                                                        secondary={`Mã số: ${student.studentID}`}
                                                                    />
                                                                </ListItem>
                                                            ))}
                                                        </List>
                                                    ) : (
                                                        <Typography variant="body2" color="text.secondary" align="center">
                                                            Không tìm thấy sinh viên
                                                        </Typography>
                                                    )}
                                                </div>
                                                {selectedStudents.length > 0 && (
                                                    <div className="mt-4">
                                                        <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                                                            Sinh viên đã chọn:
                                                        </Typography>
                                                        <List>
                                                            {selectedStudents.map((student) => (
                                                                <ListItem
                                                                    key={student.studentID}
                                                                    secondaryAction={
                                                                        <IconButton
                                                                            edge="end"
                                                                            onClick={() => {
                                                                                setSelectedStudents(selectedStudents.filter(s => s.studentID !== student.studentID));
                                                                            }}
                                                                        >
                                                                            <Delete />
                                                                        </IconButton>
                                                                    }
                                                                >
                                                                    <ListItemText
                                                                        primary={student.user?.name || 'Không rõ tên'}
                                                                        secondary={`Mã số: ${student.studentID}`}
                                                                    />
                                                                </ListItem>
                                                            ))}
                                                        </List>
                                                    </div>
                                                )}
                                            </div>
                                        )}
                                    </div>
                                </DialogContent>
                                <DialogActions className="p-4 border-t border-gray-200">
                                    <Button 
                                        onClick={handleCloseDialog}
                                        className="text-gray-600 hover:text-gray-800"
                                    >
                                        Hủy
                                    </Button>
                                    <Button
                                        onClick={handleSendNotification}
                                        variant="contained"
                                        color="primary"
                                        disabled={!newNotification.title || !newNotification.message || 
                                            (newNotification.targetType === 'specific_students' && selectedStudents.length === 0)}
                                        className="bg-blue-600 hover:bg-blue-700"
                                    >
                                        Gửi
                                    </Button>
                                </DialogActions>
                            </Dialog>
                        </div>
                    </div>
                    <div className="ml-64">
                        <Footer />
                    </div>
                </div>
            </div>
        </div>
    );
};

export default OrganizerNotifications; 