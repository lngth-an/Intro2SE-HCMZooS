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
    Chip,
    IconButton,
    Tooltip,
    Badge
} from '@mui/material';
import { useAuth } from '../contexts/AuthContext';
import axios from 'axios';
//import { format } from 'date-fns';
//import { vi } from 'date-fns/locale';
import io from 'socket.io-client';
import { NotificationsActive, NotificationsOff, Delete } from '@mui/icons-material';

// Cấu hình axios
axios.defaults.baseURL = 'http://localhost:3001';
axios.defaults.headers.common['Content-Type'] = 'application/json';

// Cấu hình Socket.IO
const socket = io('http://localhost:3001', {
    withCredentials: true
});

const StudentNotifications = () => {
    const [notifications, setNotifications] = useState([]);
    const [loading, setLoading] = useState(true);
    const { user } = useAuth();

    console.log('Current user:', user);

    const fetchNotifications = useCallback(async () => {
        try {
            console.log('Fetching notifications for user:', user.userID);
            const response = await axios.get(`/notifications?userID=${user.userID}`);
            console.log('Notifications response:', response.data);
            setNotifications(response.data.notifications);
        } catch (error) {
            console.error('Error fetching notifications:', error);
        } finally {
            setLoading(false);
        }
    }, [user]);

    useEffect(() => {
        if (user) {
            fetchNotifications();

            // Subscribe to realtime notifications
            socket.on('new_notification', (data) => {
                if (data.notifications.some(n => n.toUserID === user.userID)) {
                    fetchNotifications();
                }
            });

            return () => {
                socket.off('new_notification');
            };
        }
    }, [user, fetchNotifications]);

    const handleNotificationClick = async (notification) => {
        if (notification.notificationStatus === 'unread') {
            try {
                await axios.patch(`/notifications/${notification.notificationID}/read`);
                setNotifications(notifications.map(n =>
                    n.notificationID === notification.notificationID
                        ? { ...n, notificationStatus: 'read' }
                        : n
                ));
            } catch (error) {
                console.error('Error marking notification as read:', error);
            }
        }
    };

    const handleDeleteNotification = async (notificationId) => {
        try {
            await axios.delete(`/notifications/${notificationId}`);
            setNotifications(notifications.filter(n => n.notificationID !== notificationId));
        } catch (error) {
            console.error('Error deleting notification:', error);
        }
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
        </Container>
    );
};

export default StudentNotifications; 