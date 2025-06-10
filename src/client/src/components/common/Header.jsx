import React, { useState } from "react";
import { Search, GraduationCap } from "lucide-react";
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';

const Header = ({ user }) => {
  // Set default values for user properties
  const userName = user?.name || "Guest";
  const userAvatar = user?.avatar || "https://upload.wikimedia.org/wikipedia/commons/thumb/a/ac/Default_pfp.jpg/120px-Default_pfp.jpg";
  const navigate = useNavigate();
  const { user: authUser } = useAuth();
  const [searchQuery, setSearchQuery] = useState('');

  // Hàm thực hiện điều hướng tìm kiếm
  const performSearch = () => {
    if (searchQuery.trim()) {
      const query = encodeURIComponent(searchQuery.trim());
      if (authUser?.role === 'student') {
        navigate(`/activities/explore?q=${query}`);
      } else if (authUser?.role === 'organizer') {
        navigate(`/organizer/activities/manage?q=${query}`);
      }
    }
  };

  // Nhấn Enter để tìm kiếm
  const handleSearch = (e) => {
    if (e.key === 'Enter') performSearch();
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

          {/* Search bar */}
          <div className="flex-1 max-w-2xl mx-10">
            <div className="relative">
              <input
                type="text"
                placeholder="Tìm kiếm hoạt động..."
                className="w-full px-4 py-2 rounded-lg border bg-white border-gray-400 text-gray-600 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyPress={handleSearch}
              />
              {/* Icon có thể click */}
              <Search
                className="absolute right-3 top-2.5 h-5 w-5 text-gray-600 cursor-pointer"
                onClick={performSearch}
              />
            </div>
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
