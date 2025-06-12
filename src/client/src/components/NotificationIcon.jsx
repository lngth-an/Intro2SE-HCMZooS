import React, { useState, useEffect } from 'react';
import { Badge, IconButton } from '@mui/material';
import NotificationsIcon from '@mui/icons-material/Notifications';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const NotificationIcon = () => {
    const [unreadCount, setUnreadCount] = useState(0);
    const { user } = useAuth();
    const navigate = useNavigate();

    useEffect(() => {
        if (user) {
            fetchUnreadCount();
            
            // Subscribe to realtime notifications
            const socket = window.io;
            socket.on('new_notification', (data) => {
                if (data.notifications.some(n => n.toUserID === user.userID)) {
                    fetchUnreadCount();
                }
            });

            socket.on('notification_read', (data) => {
                if (data.toUserID === user.userID) {
                    fetchUnreadCount();
                }
            });

            return () => {
                socket.off('new_notification');
                socket.off('notification_read');
            };
        }
    }, [user]);

    const fetchUnreadCount = async () => {
        try {
            const response = await axios.get(`/notifications/unread/count?userID=${user.userID}`);
            setUnreadCount(response.data.unreadCount);
        } catch (error) {
            console.error('Error fetching unread count:', error);
        }
    };

    const handleClick = () => {
        // Điều hướng đến trang thông báo tương ứng với role
        if (user.role === 'student') {
            navigate('/student/notifications');
        } else if (user.role === 'organizer') {
            navigate('/organizer/notifications');
        }
    };

    return (
        <IconButton
            color="inherit"
            onClick={handleClick}
            sx={{ ml: 2 }}
        >
            <Badge badgeContent={unreadCount} color="error">
                <NotificationsIcon />
            </Badge>
        </IconButton>
    );
};

export default NotificationIcon; 