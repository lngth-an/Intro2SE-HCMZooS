import React from "react";
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
} from "lucide-react";
import { useLocation, useNavigate } from "react-router-dom";
import { NavLink } from "react-router-dom";

interface SidebarProps {
  isOpen: boolean;
}

const Sidebar: React.FC<SidebarProps> = ({ isOpen }) => {
  const location = useLocation();
  const navigate = useNavigate();

  const navItems = [
    { icon: Home, label: "Trang chủ", path: "/" },
    { icon: Activity, label: "Hoạt động", path: "/activities" },
    { icon: Trophy, label: "Điểm rèn luyện", path: "/training-points" },
    { icon: Bell, label: "Thông báo", path: "/notifications" },
    { icon: Settings, label: "Cài đặt tài khoản", path: "/account-settings" },
  ];

  return (
    <aside
      className={`fixed left-0 top-0 h-full bg-white dark:bg-gray-800 shadow-lg transform transition-transform duration-300 ease-in-out ${
        isOpen ? "translate-x-0" : "-translate-x-full"
      }`}
    >
      <div className="flex flex-col h-full">
        <div className="flex items-center space-x-3 px-4 py-3">
          <img
            src="https://via.placeholder.com/32"
            alt="Logo"
            className="w-8 h-8"
          />
          <span className="text-xl font-bold text-blue-600 dark:text-blue-400">
            ActiHub
          </span>
        </div>

        <nav className="flex-1 px-2 py-4 space-y-1">
          <div className="space-y-1">
            <NavLink
              to="/dashboard"
              className={({ isActive }) =>
                `flex items-center px-4 py-2 text-sm font-medium rounded-lg ${
                  isActive
                    ? "bg-blue-50 text-blue-700 dark:bg-blue-900/50 dark:text-blue-300"
                    : "text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700"
                }`
              }
            >
              <Home className="h-5 w-5 mr-3" />
              Trang chủ
            </NavLink>
            <NavLink
              to="/training-points"
              className={({ isActive }) =>
                `flex items-center px-4 py-2 text-sm font-medium rounded-lg ${
                  isActive
                    ? "bg-blue-50 text-blue-700 dark:bg-blue-900/50 dark:text-blue-300"
                    : "text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700"
                }`
              }
            >
              <Trophy className="h-5 w-5 mr-3" />
              Điểm rèn luyện
            </NavLink>
            <NavLink
              to="/register-activity"
              className={({ isActive }) =>
                `flex items-center px-4 py-2 text-sm font-medium rounded-lg ${
                  isActive
                    ? "bg-blue-50 text-blue-700 dark:bg-blue-900/50 dark:text-blue-300"
                    : "text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700"
                }`
              }
            >
              <CalendarCheck className="h-5 w-5 mr-3" />
              Đăng ký hoạt động
            </NavLink>
            <NavLink
              to="/activities"
              className={({ isActive }) =>
                `flex items-center px-4 py-2 text-sm font-medium rounded-lg ${
                  isActive
                    ? "bg-blue-50 text-blue-700 dark:bg-blue-900/50 dark:text-blue-300"
                    : "text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700"
                }`
              }
            >
              <Activity className="h-5 w-5 mr-3" />
              Quản lý hoạt động
            </NavLink>

            {/* Move Thông báo (Bell) above Hồ sơ (Profile) */}
            <NavLink
              to="/notifications"
              className={({ isActive }) =>
                `flex items-center px-4 py-2 text-sm font-medium rounded-lg ${
                  isActive
                    ? "bg-blue-50 text-blue-700 dark:bg-blue-900/50 dark:text-blue-300"
                    : "text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700"
                }`
              }
            >
              <Bell className="h-5 w-5 mr-3" />
              Thông báo
            </NavLink>

            <NavLink
              to="/profile"
              className={({ isActive }) =>
                `flex items-center px-4 py-2 text-sm font-medium rounded-lg ${
                  isActive
                    ? "bg-blue-50 text-blue-700 dark:bg-blue-900/50 dark:text-blue-300"
                    : "text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700"
                }`
              }
            >
              <User className="h-5 w-5 mr-3" />
              Hồ sơ
            </NavLink>
          </div>
        </nav>

        <div className="p-4 border-t dark:border-gray-700">
          <button
            onClick={() => navigate("/logout")}
            className="flex items-center space-x-3 px-4 py-2 w-full rounded-lg text-red-600 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-900"
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
