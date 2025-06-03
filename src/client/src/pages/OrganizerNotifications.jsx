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
    Autocomplete
} from '@mui/material';
import { useAuth } from '../contexts/AuthContext';
import axios from 'axios';
import io from 'socket.io-client';
import { NotificationsActive, NotificationsOff, Delete, Send } from '@mui/icons-material';
import { toast } from 'react-hot-toast';

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
    const [loading, setLoading] = useState(true);
    const [openDialog, setOpenDialog] = useState(false);
    const [students, setStudents] = useState([]);
    const [selectedStudents, setSelectedStudents] = useState([]);
    const [newNotification, setNewNotification] = useState({
        title: '',
        message: '',
        targetType: 'all_students'
    });
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

    useEffect(() => {
        if (user) {
            fetchNotifications();
            fetchStudents('');

            // Subscribe to realtime notifications
            socket.on('new_notification', (data) => {
                if (data.notifications.some(n => n.fromUserID === user.userID)) {
                    fetchNotifications();
                }
            });

            return () => {
                socket.off('new_notification');
            };
        }
    }, [user, fetchNotifications, fetchStudents]);

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

    if (loading) {
        return (
            <Box display="flex" justifyContent="center" alignItems="center" minHeight="80vh">
                <CircularProgress />
            </Box>
        );
    }

    return (
        <Container maxWidth="md" sx={{ mt: 4, mb: 4 }}>
            <Box display="flex" alignItems="center" mb={3}>
                <Typography variant="h4" component="h1" sx={{ flexGrow: 1 }}>
                    Thông báo
                </Typography>
                <Badge badgeContent={notifications.filter(n => n.notificationStatus === 'unread').length} color="error">
                    <NotificationsActive color="primary" />
                </Badge>
                <Button
                    variant="contained"
                    color="primary"
                    startIcon={<Send />}
                    onClick={handleOpenDialog}
                    sx={{ ml: 2 }}
                >
                    Gửi thông báo mới
                </Button>
            </Box>

            <Paper elevation={3} sx={{ borderRadius: 2, overflow: 'hidden' }}>
                {notifications.length === 0 ? (
                    <Box p={4} textAlign="center">
                        <NotificationsOff sx={{ fontSize: 60, color: 'text.secondary', mb: 2 }} />
                        <Typography color="textSecondary" variant="h6">
                            Không có thông báo nào
                        </Typography>
                    </Box>
                ) : (
                    <List>
                        {notifications.map((notification, index) => (
                            <React.Fragment key={notification.notificationID}>
                                <ListItem
                                    button
                                    onClick={() => handleNotificationClick(notification)}
                                    sx={{
                                        backgroundColor: notification.notificationStatus === 'unread' ? 'action.hover' : 'inherit',
                                        '&:hover': {
                                            backgroundColor: 'action.selected',
                                        },
                                        py: 2,
                                    }}
                                >
                                    <ListItemText
                                        primary={
                                            <Box display="flex" alignItems="center" gap={1}>
                                                <Typography
                                                    variant="subtitle1"
                                                    fontWeight={notification.notificationStatus === 'unread' ? 'bold' : 'normal'}
                                                >
                                                    {notification.notificationTitle}
                                                </Typography>
                                                <Chip
                                                    label={notification.notificationStatus === 'unread' ? 'Mới' : 'Đã đọc'}
                                                    size="small"
                                                    color={notification.notificationStatus === 'unread' ? 'primary' : 'default'}
                                                />
                                            </Box>
                                        }
                                        secondary={
                                            <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                                                {notification.notificationMessage}
                                            </Typography>
                                        }
                                    />
                                    <Tooltip title="Xóa thông báo">
                                        <IconButton
                                            edge="end"
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                handleDeleteNotification(notification.notificationID);
                                            }}
                                        >
                                            <Delete />
                                        </IconButton>
                                    </Tooltip>
                                </ListItem>
                                {index < notifications.length - 1 && <Divider />}
                            </React.Fragment>
                        ))}
                    </List>
                )}
            </Paper>

            {/* Dialog gửi thông báo mới */}
            <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
                <DialogTitle>Gửi thông báo mới</DialogTitle>
                <DialogContent>
                    <Grid container spacing={2} sx={{ mt: 1 }}>
                        <Grid item xs={12}>
                            <TextField
                                fullWidth
                                label="Tiêu đề"
                                value={newNotification.title}
                                onChange={(e) => setNewNotification({ ...newNotification, title: e.target.value })}
                            />
                        </Grid>
                        <Grid item xs={12}>
                            <TextField
                                fullWidth
                                multiline
                                rows={4}
                                label="Nội dung"
                                value={newNotification.message}
                                onChange={(e) => setNewNotification({ ...newNotification, message: e.target.value })}
                            />
                        </Grid>
                        <Grid item xs={12}>
                            <FormControl fullWidth>
                                <InputLabel>Loại người nhận</InputLabel>
                                <Select
                                    value={newNotification.targetType}
                                    onChange={(e) => setNewNotification({ ...newNotification, targetType: e.target.value })}
                                >
                                    <MenuItem value="all_students">Tất cả sinh viên</MenuItem>
                                    <MenuItem value="specific_students">Sinh viên cụ thể</MenuItem>
                                </Select>
                            </FormControl>
                        </Grid>
                        {newNotification.targetType === 'specific_students' && (
                            <Grid item xs={12}>
                                <Box sx={{ mb: 2 }}>
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
                                </Box>
                                <Box sx={{ maxHeight: 300, overflow: 'auto' }}>
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
                                                        primary={`${student.name}`}
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
                                </Box>
                                {selectedStudents.length > 0 && (
                                    <Box sx={{ mt: 2 }}>
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
                                                        primary={`${student.name}`}
                                                        secondary={`Mã số: ${student.studentID}`}
                                                    />
                                                </ListItem>
                                            ))}
                                        </List>
                                    </Box>
                                )}
                            </Grid>
                        )}
                    </Grid>
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleCloseDialog}>Hủy</Button>
                    <Button
                        onClick={handleSendNotification}
                        variant="contained"
                        color="primary"
                        disabled={!newNotification.title || !newNotification.message || 
                            (newNotification.targetType === 'specific_students' && selectedStudents.length === 0)}
                        startIcon={<Send />}
                    >
                        Gửi
                    </Button>
                </DialogActions>
            </Dialog>
        </Container>
    );
};

export default OrganizerNotifications; 