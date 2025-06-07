import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useNotifications } from '../contexts/NotificationContext';
import { 
  HomeIcon, 
  UserGroupIcon, 
  CalendarIcon, 
  ChartBarIcon, 
  BellIcon,
  ArrowRightOnRectangleIcon
} from '@heroicons/react/24/outline';

const Sidebar = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const { unreadCount } = useNotifications();

  const handleLogout = async (e) => {
    e.preventDefault();
    try {
      // Gọi API đăng xuất
      await logout();
      // Xóa tất cả thông tin trong localStorage
      localStorage.removeItem('accessToken');
      localStorage.removeItem('role');
      localStorage.removeItem('userID');
      localStorage.removeItem('user');
      // Xóa cookie
      document.cookie = 'token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT';
      // Chuyển hướng về trang login
      window.location.href = '/login';
    } catch (error) {
      console.error('Error logging out:', error);
    }
  };

  const isActive = (path) => {
    return location.pathname === path;
  };

  const menuItems = [
    { path: '/', icon: HomeIcon, label: 'Trang chủ' },
    { path: '/activities', icon: CalendarIcon, label: 'Hoạt động' },
    { path: '/students', icon: UserGroupIcon, label: 'Sinh viên' },
    { path: '/reports', icon: ChartBarIcon, label: 'Báo cáo' },
  ];

  return (
    <div className="bg-white h-screen w-64 fixed left-0 top-0 shadow-lg">
      <div className="p-4">
        <h1 className="text-2xl font-bold text-blue-600">HCM ZooS</h1>
      </div>

      <nav className="mt-8">
        {menuItems.map((item) => (
          <Link
            key={item.path}
            to={item.path}
            className={`flex items-center px-4 py-3 text-gray-700 hover:bg-blue-50 hover:text-blue-600 ${
              isActive(item.path) ? 'bg-blue-50 text-blue-600' : ''
            }`}
          >
            <item.icon className="h-6 w-6 mr-3" />
            {item.label}
          </Link>
        ))}

        <Link
          to="/notifications"
          className={`flex items-center px-4 py-3 text-gray-700 hover:bg-blue-50 hover:text-blue-600 ${
            isActive('/notifications') ? 'bg-blue-50 text-blue-600' : ''
          }`}
        >
          <div className="relative">
            <BellIcon className="h-6 w-6 mr-3" />
            {unreadCount > 0 && (
              <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                {unreadCount}
              </span>
            )}
          </div>
          Thông báo
        </Link>

        <button
          onClick={handleLogout}
          className="flex items-center px-4 py-3 text-gray-700 hover:bg-blue-50 hover:text-blue-600 w-full text-left"
        >
          <ArrowRightOnRectangleIcon className="h-6 w-6 mr-3" />
          Đăng xuất
        </button>
      </nav>
    </div>
  );
};

export default Sidebar; 