import React from "react";
import {
  Home,
  Award,
  Calendar,
  ClipboardList,
  Bell,
  User,
  LogOut,
} from "lucide-react";
import { useNavigate, useLocation } from "react-router-dom";

const SidebarStudent = ({ onLogout }) => {
  const navigate = useNavigate();
  const location = useLocation();

  const menuItems = [
    { icon: <Home size={20} />, label: "Trang chủ", path: "/student/home" },
    {
      icon: <Award size={20} />,
      label: "Điểm rèn luyện",
      path: "/student/score",
    },
    {
      icon: <Calendar size={20} />,
      label: "Đăng ký hoạt động",
      path: "/student/register",
    },
    {
      icon: <ClipboardList size={20} />,
      label: "Quản lý hoạt động",
      path: "/student/activities",
    },
    {
      icon: <Bell size={20} />,
      label: "Thông báo",
      path: "/student/notifications",
    },
    { icon: <User size={20} />, label: "Hồ sơ", path: "/student/profile" },
  ];

  const isActive = (path) => {
    return location.pathname.startsWith(path);
  };

  return (
    <aside className="fixed left-0 top-16 h-[calc(100vh-4rem)] w-64 bg-gray-50 shadow-lg">
      <div className="flex flex-col h-full">
        {/* Menu items */}
        <nav className="flex-1 py-4">
          {menuItems.map((item, index) => (
            <button
              key={index}
              onClick={() => navigate(item.path)}
              className={`w-full px-4 py-3 flex items-center space-x-3 transition-colors duration-200 ${
                isActive(item.path)
                  ? "bg-gray-200 text-blue-600 font-semibold"
                  : "text-black hover:bg-gray-100"
              }`}
            >
              {item.icon}
              <span className="text-sm font-medium">{item.label}</span>
            </button>
          ))}
        </nav>

        {/* Logout button */}
        <div className="sticky bottom-0 w-full border-t border-gray-200 bg-white">
          <button
            onClick={onLogout}
            className="w-full px-4 py-3 flex items-center space-x-3 text-red-600 hover:bg-gray-100 transition-colors duration-200"
          >
            <LogOut size={20} />
            <span className="text-sm font-medium">Đăng xuất</span>
          </button>
        </div>
      </div>
    </aside>
  );
};

export default SidebarStudent;
