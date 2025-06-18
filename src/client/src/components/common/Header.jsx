import React, { useState } from "react";
import { Search, GraduationCap } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";
import axios from "axios";
import { toast } from "react-hot-toast";
import { Link } from "react-router-dom";
const API_URL = "http://localhost:3001";

const Header = () => {
  const { user: authUser } = useAuth();
  // Set default values for user properties
  const userName = authUser?.name || "Guest";
  const userAvatar =
    authUser?.avatar ||
    "https://upload.wikimedia.org/wikipedia/commons/thumb/a/ac/Default_pfp.jpg/120px-Default_pfp.jpg";
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");

  // Hàm thực hiện điều hướng tìm kiếm
  const performSearch = () => {
    if (searchQuery.trim()) {
      const query = encodeURIComponent(searchQuery.trim());
      if (authUser?.role === "student") {
        navigate(`/student/register?search=${query}`);
      } else if (authUser?.role === "organizer") {
        navigate(`/organizer/activity/manage?search=${query}`);
      }
    }
  };

  // Nhấn Enter để tìm kiếm
  const handleSearch = async (e) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;
    performSearch();
  };

  // Thêm hàm xử lý khi nhấn Enter
  const handleKeyPress = (e) => {
    if (e.key === "Enter") {
      handleSearch(e);
    }
  };

  return (
    <header className="fixed top-0 left-0 right-0 bg-gray-50 shadow-sm z-50 transition-colors duration-200">
      <div className="px-4 sm:px-6 lg:px-8">
        <div className="flex justify-start items-center h-16">
          {/* Logo */}
          <div className="flex items-center">
            <GraduationCap className="h-12 w-12 text-blue-600" />
            <span className="ml-4 text-3xl font-extrabold bg-gradient-to-r from-blue-400 to-blue-600 bg-clip-text text-transparent">
              ActiHub
            </span>
          </div>

          {/* Avatar và tên người dùng */}
          <div className="flex items-center space-x-4 ml-auto">
            <div className="flex items-center space-x-3">
              <img
                src={userAvatar}
                alt="Avatar"
                className="w-10 h-10 rounded-full border-2 border-blue-500"
              />
              <div className="flex flex-col">
                <span className="text-sm font-medium text-gray-600">
                  {userName}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
