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
    CircularProgress
} from '@mui/material';
import { useAuth } from '../contexts/AuthContext';
import axios from 'axios';
import { format } from 'date-fns';
import { vi } from 'date-fns/locale';
import io from 'socket.io-client';

// Cấu hình axios
axios.defaults.baseURL = 'http://localhost:3000';
axios.defaults.headers.common['Content-Type'] = 'application/json';

// Cấu hình Socket.IO
const socket = io('http://localhost:3000', {
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
            const response = await axios.get(`/api/notifications?userID=${user.userID}`);
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
                await axios.patch(`/api/notifications/${notification.notificationID}/read`);
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

    if (loading) {
        return (
            <Box display="flex" justifyContent="center" alignItems="center" minHeight="80vh">
                <CircularProgress />
            </Box>
        );
    }

    return (
        <Container maxWidth="md" sx={{ mt: 4, mb: 4 }}>
            <Typography variant="h4" gutterBottom>
                Thông báo
            </Typography>
            <Paper elevation={3}>
                {notifications.length === 0 ? (
                    <Box p={3} textAlign="center">
                        <Typography color="textSecondary">
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
                                    }}
                                >
                                    <ListItemText
                                        primary={
                                            <Typography
                                                variant="subtitle1"
                                                fontWeight={notification.notificationStatus === 'unread' ? 'bold' : 'normal'}
                                            >
                                                {notification.notificationTitle}
                                            </Typography>
                                        }
                                        secondary={
                                            <>
                                                <Typography variant="body2" color="text.secondary">
                                                    {notification.notificationMessage}
                                                </Typography>
                                                <Typography variant="caption" color="text.secondary">
                                                    {format(new Date(notification.createdAt), 'HH:mm dd/MM/yyyy', { locale: vi })}
                                                </Typography>
                                            </>
                                        }
                                    />
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