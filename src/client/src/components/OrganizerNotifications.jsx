import React, { useState, useEffect } from 'react';
import { io } from 'socket.io-client';
import { useAuth } from '../contexts/AuthContext';
import axios from 'axios';

const OrganizerNotifications = () => {
  const [notifications, setNotifications] = useState([]);
  const [socket, setSocket] = useState(null);
  const { user } = useAuth();

  useEffect(() => {
    // Khởi tạo socket connection
    const newSocket = io('http://localhost:3001', {
      transports: ['websocket'],
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
      withCredentials: true
    });

    // Xử lý các sự kiện socket
    newSocket.on('connect', () => {
      console.log('Connected to socket server');
    });

    newSocket.on('connect_error', (error) => {
      console.error('Socket connection error:', error);
    });

    newSocket.on('disconnect', (reason) => {
      console.log('Disconnected from socket server:', reason);
    });

    newSocket.on('notification', (notification) => {
      console.log('Received notification:', notification);
      setNotifications(prev => [notification, ...prev]);
    });

    setSocket(newSocket);

    // Cleanup khi component unmount
    return () => {
      if (newSocket) {
        newSocket.disconnect();
      }
    };
  }, []);

  // Fetch notifications khi component mount
  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        const response = await axios.get('http://localhost:3001/notifications', {
          withCredentials: true
        });
        setNotifications(response.data);
      } catch (error) {
        console.error('Error fetching notifications:', error);
      }
    };

    fetchNotifications();
  }, []);

  // Mark notification as read
  const markAsRead = async (notificationId) => {
    try {
      await axios.patch(`http://localhost:3001/notifications/${notificationId}/read`, {}, {
        withCredentials: true
      });
      setNotifications(prev =>
        prev.map(notif =>
          notif.id === notificationId ? { ...notif, read: true } : notif
        )
      );
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  };

  return (
    <div className="p-4">
      <h2 className="text-2xl font-bold mb-4">Thông báo</h2>
      <div className="space-y-4">
        {notifications.length === 0 ? (
          <p className="text-gray-500">Không có thông báo mới</p>
        ) : (
          notifications.map(notification => (
            <div
              key={notification.id}
              className={`p-4 rounded-lg shadow ${
                notification.read ? 'bg-gray-100' : 'bg-white'
              }`}
            >
              <div className="flex justify-between items-start">
                <div>
                  <p className="font-semibold">{notification.title}</p>
                  <p className="text-gray-600">{notification.message}</p>
                  <p className="text-sm text-gray-500">
                    {new Date(notification.createdAt).toLocaleString()}
                  </p>
                </div>
                {!notification.read && (
                  <button
                    onClick={() => markAsRead(notification.id)}
                    className="text-blue-500 hover:text-blue-700"
                  >
                    Đánh dấu đã đọc
                  </button>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default OrganizerNotifications; 