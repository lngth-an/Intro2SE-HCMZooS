import React, { useState } from 'react';
import { Link, Outlet } from 'react-router-dom';
import { Search, Sun, Moon, Home, Calendar, CheckCircle, Bell, AlertCircle, User } from 'lucide-react';
import Footer from '../layout/Footer';

const OrganizerLayout = () => {
  const [isDarkMode, setIsDarkMode] = useState(false);

  const toggleTheme = () => {
    setIsDarkMode(!isDarkMode);
    document.documentElement.classList.toggle('dark');
  };

  const menuItems = [
    { icon: Home, label: 'Trang chủ', path: '/organizer' },
    { icon: Calendar, label: 'Quản lý hoạt động', path: '/organizer/activities' },
    { icon: CheckCircle, label: 'Phê duyệt đăng ký', path: '/organizer/approvals' },
    { icon: Bell, label: 'Thông báo', path: '/organizer/notifications' },
    { icon: AlertCircle, label: 'Khiếu nại', path: '/organizer/complaints' },
    { icon: User, label: 'Hồ sơ', path: '/organizer/profile' },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-8">
              <Link to="/organizer" className="text-2xl font-bold text-blue-600">
                ActiHub
              </Link>
              <div className="relative">
                <input
                  type="text"
                  placeholder="Tìm kiếm hoạt động..."
                  className="w-64 pl-10 pr-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <Search className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <button
                onClick={toggleTheme}
                className="p-2 rounded-lg hover:bg-gray-100"
              >
                {isDarkMode ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
              </button>
              <div className="flex items-center space-x-2">
                <div className="h-8 w-8 rounded-full bg-gray-200"></div>
                <span className="font-medium">Organizer Name</span>
              </div>
            </div>
          </div>
        </div>
      </header>

      <div className="flex">
        {/* Sidebar */}
        <aside className="w-64 min-h-screen bg-white shadow-sm">
          <nav className="mt-5 px-2">
            {menuItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                className="group flex items-center px-2 py-2 text-base font-medium rounded-md text-gray-600 hover:bg-gray-50 hover:text-gray-900"
              >
                <item.icon className="mr-4 h-6 w-6" />
                {item.label}
              </Link>
            ))}
          </nav>
        </aside>

        {/* Main Content */}
        <main className="flex-1 p-8">
          <Outlet />
        </main>
      </div>

      {/* Footer */}
      <Footer />
    </div>
  );
};

export default OrganizerLayout; 