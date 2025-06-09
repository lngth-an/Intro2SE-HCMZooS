import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { Email, Visibility, Delete, Add } from '@mui/icons-material';
import Header from "../components/common/Header";
import SidebarOrganizer from "../components/common/SidebarOrganizer";
import Footer from "../components/common/Footer";
import { Box, CircularProgress } from '@mui/material';
import { toast } from 'react-toastify';
import { useNavigate } from 'react-router-dom';

axios.defaults.baseURL = 'http://localhost:3001';
axios.defaults.headers.common['Content-Type'] = 'application/json';

const OrganizerNotifications = () => {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const fetchNotifications = useCallback(async () => {
    try {
      const res = await axios.get(`/notifications/organizer`);
      setNotifications(res.data.notifications);
    } catch (err) {
      console.error('Failed to fetch notifications:', err);
      toast.error('Không thể tải thông báo');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchNotifications();
  }, [fetchNotifications]);

  const sendMail = (notification) => {
    const mailto = `mailto:${notification.receiverEmail || 'example@domain.com'}?subject=Phản hồi thông báo: ${encodeURIComponent(notification.notificationTitle)}`;
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

  const handleCreateNotification = () => {
    navigate('/organizer/notifications/create');
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
      <Header />

      <div className="flex flex-1 pt-16">
        {/* Sidebar */}
        <SidebarOrganizer />

        {/* Main content */}
        <main className="flex-1 flex flex-col ml-64 px-6 py-8 max-w-3xl mx-auto w-full">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-2xl font-bold text-gray-800">Thông báo</h1>
            <button
              onClick={handleCreateNotification}
              className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-md text-sm font-medium flex items-center gap-1"
            >
              <Add fontSize="small" /> Tạo thông báo
            </button>
          </div>

          <div className="space-y-4">
            {notifications.length === 0 && (
              <p className="text-gray-500">Không có thông báo nào</p>
            )}

            {notifications.map((notification) => (
              <div
                key={notification.notificationID}
                className={`rounded-lg shadow-md p-4 transition duration-300 bg-gray-100 border-l-4 border-gray-400`}
              >
                <div className="flex justify-between items-center mb-2">
                  <h2 className="text-base font-medium text-gray-700">
                    {notification.notificationTitle}
                  </h2>
                  <span className="text-xs px-2 py-0.5 rounded-full bg-gray-300 text-gray-700 font-medium">
                    Đã gửi
                  </span>
                </div>
                <p className="text-sm text-gray-600 mb-3">
                  {notification.notificationMessage}
                </p>
                <div className="flex gap-3">
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

      <div className="ml-64">
        <Footer />
      </div>
    </div>
  );
};

export default OrganizerNotifications;
