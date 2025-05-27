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
  ChevronRight,
} from "lucide-react";
import { useLocation, useNavigate, Link } from "react-router-dom";
import { NavLink } from "react-router-dom";

interface MenuItem {
  icon: React.ElementType;
  label: string;
  path: string;
}

interface SidebarProps {
  isOpen: boolean;
  menuItems: MenuItem[];
}

const Sidebar: React.FC<SidebarProps> = ({ isOpen, menuItems }) => {
  const location = useLocation();
  const navigate = useNavigate();

  if (!isOpen) return null;

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
            {menuItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                className="group flex items-center px-4 py-2 text-sm font-medium rounded-lg text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700"
              >
                <item.icon className="h-5 w-5 mr-3" />
                {item.label}
                <ChevronRight className="ml-auto h-5 w-5 opacity-0 group-hover:opacity-100 transition-opacity" />
              </Link>
            ))}
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
