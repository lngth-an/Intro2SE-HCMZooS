import React from 'react';
import {
  Home,
  Activity,
  Trophy,
  Bell,
  MessageSquare,
  Settings,
  LogOut,
  User,
  CalendarCheck,
  ChevronRight,
} from 'lucide-react';
import { useLocation, useNavigate, Link } from 'react-router-dom';

const Sidebar = ({ isOpen, menuItems, isDarkMode }) => {
  const location = useLocation();
  const navigate = useNavigate();

  if (!isOpen) return null;

  return (
    <aside
      className={`fixed left-0 top-0 h-full ${
        isDarkMode ? 'bg-gray-800' : 'bg-white'
      } shadow-lg transform transition-transform duration-300 ease-in-out ${
        isOpen ? 'translate-x-0' : '-translate-x-full'
      }`}
    >
      <div className="flex flex-col h-full">
        <div className="flex items-center space-x-3 px-4 py-3">
          <img
            src="https://via.placeholder.com/32"
            alt="Logo"
            className="w-8 h-8"
          />
          <span className={`text-xl font-bold ${isDarkMode ? 'text-blue-400' : 'text-blue-600'}`}>
            ActiHub
          </span>
        </div>

        <nav className="flex-1 px-2 py-4 space-y-1">
          <div className="space-y-1">
            {menuItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                className={`group flex items-center px-4 py-2 text-sm font-medium rounded-lg ${
                  isDarkMode
                    ? 'text-gray-300 hover:bg-gray-700'
                    : 'text-gray-700 hover:bg-gray-100'
                }`}
              >
                <item.icon className="h-5 w-5 mr-3" />
                {item.label}
                <ChevronRight className="ml-auto h-5 w-5 opacity-0 group-hover:opacity-100 transition-opacity" />
              </Link>
            ))}
          </div>
        </nav>

        <div className={`p-4 border-t ${isDarkMode ? 'border-gray-700' : 'border-gray-200'}`}>
          <button
            onClick={() => navigate("/logout")}
            className={`flex items-center space-x-3 px-4 py-2 w-full rounded-lg ${
              isDarkMode
                ? 'text-red-400 hover:bg-red-900'
                : 'text-red-600 hover:bg-red-50'
            }`}
          >
            <LogOut className="w-5 h-5" />
            <span>Đăng xuất</span>
          </button>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar; 