import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { useAuth } from '../contexts/AuthContext';
import { Email, Visibility, Delete } from '@mui/icons-material';
import Header from "../components/common/Header";
import SidebarOrganizer from "../components/common/SidebarOrganizer";
import Footer from "../components/common/Footer";
import { Box, CircularProgress } from '@mui/material';
import { toast } from 'react-toastify';

axios.defaults.baseURL = 'http://localhost:3001';
axios.defaults.headers.common['Content-Type'] = 'application/json';

const StudentNotifications = () => {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  const fetchNotifications = useCallback(async () => {
    try {
      const res = await axios.get(`/notifications?userID=${user.userID}`);
      setNotifications(res.data.notifications);
    } catch (err) {
      console.error('Failed to fetch notifications:', err);
      toast.error('Không thể tải thông báo');
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    if (user) fetchNotifications();
  }, [user, fetchNotifications]);

  const markAsRead = async (id) => {
    try {
      await axios.patch(`/notifications/${id}/read`);
      setNotifications((prev) =>
        prev.map((n) =>
          n.notificationID === id ? { ...n, notificationStatus: 'read' } : n
        )
      );
    } catch (err) {
      console.error('Failed to mark as read:', err);
      toast.error('Không thể đánh dấu đã đọc');
    }
  };

  const sendMail = (notification) => {
    const mailto = `mailto:${notification.senderEmail || 'example@domain.com'}?subject=Phản hồi thông báo: ${encodeURIComponent(notification.notificationTitle)}`;
    window.open(mailto);
  };

  const handleDelete = async (id) => {
    const confirm = window.confirm('Bạn có chắc muốn xóa thông báo này?');
    if (!confirm) return;

    try {
      await axios.delete(`/notifications/${id}`);
      setNotifications((prev) => prev.filter(n => n.notificationID !== id));
      toast.success('Xóa thông báo thành công');
    } catch (err) {
      console.error('Failed to delete notification:', err);
      toast.error('Xóa thông báo thất bại');
    }
  };

  if (loading) {
    return (
      <Box className="flex justify-center items-center min-h-[70vh]">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      {/* Header */}
      <Header user={user} />

      <div className="flex flex-1 pt-16">
        {/* Sidebar */}
        <SidebarOrganizer />

        {/* Main content */}
        <main className="flex-1 flex flex-col ml-64 px-6 py-8 max-w-3xl mx-auto w-full">
          <h1 className="text-2xl font-bold mb-6 text-gray-800">Thông báo</h1>

          <div className="space-y-4">
            {notifications.length === 0 && (
              <p className="text-gray-500">Không có thông báo nào</p>
            )}

            {notifications.map((notification) => (
              <div
                key={notification.notificationID}
                className={`rounded-lg shadow-md p-4 transition duration-300 ${
                  notification.notificationStatus === 'unread'
                    ? 'bg-blue-100 border-l-4 border-blue-500'
                    : 'bg-gray-100 border-l-4 border-gray-400'
                }`}
              >
                <div className="flex justify-between items-center mb-2">
                  <h2
                    className={`text-base ${
                      notification.notificationStatus === 'unread'
                        ? 'font-bold text-blue-800'
                        : 'font-medium text-gray-700'
                    }`}
                  >
                    {notification.notificationTitle}
                  </h2>
                  <span
                    className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                      notification.notificationStatus === 'unread'
                        ? 'bg-blue-200 text-blue-800'
                        : 'bg-gray-300 text-gray-700'
                    }`}
                  >
                    {notification.notificationStatus === 'unread' ? 'Mới' : 'Đã đọc'}
                  </span>
                </div>
                <p className="text-sm text-gray-600 mb-3">
                  {notification.notificationMessage}
                </p>
                <div className="flex gap-3">
                  <button
                    onClick={() => markAsRead(notification.notificationID)}
                    className="px-3 py-1 bg-yellow-100 text-yellow-800 text-sm rounded-md hover:bg-yellow-200 transition-colors flex items-center gap-1"
                  >
                    <Visibility fontSize="small" /> Xem chi tiết
                  </button>
                  <button
                    onClick={() => sendMail(notification)}
                    className="px-3 py-1 bg-blue-100 text-blue-800 text-sm rounded-md hover:bg-blue-200 transition-colors flex items-center gap-1"
                  >
                    <Email fontSize="small" /> Gửi mail phản hồi
                  </button>
                  <button
                    onClick={() => handleDelete(notification.notificationID)}
                    className="px-3 py-1 bg-red-100 text-red-800 text-sm rounded-md hover:bg-red-200 transition-colors flex items-center gap-1"
                  >
                    <Delete fontSize="small" /> Xóa
                  </button>
                </div>
              </div>
            ))}
          </div>
        </main>
      </div>

      {/* Footer */}
      <Footer />
    </div>
  );
};

export default StudentNotifications;
