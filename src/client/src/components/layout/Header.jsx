import React from 'react';
import { Moon, Sun, Search, GraduationCap } from 'lucide-react';

const Header = ({ isDarkMode, onToggleTheme, userInfo }) => {
  return (
    <header className={`fixed top-0 left-0 right-0 ${isDarkMode ? 'bg-gray-800' : 'bg-white'} shadow-sm z-50`}>
      <div className="flex items-center justify-between px-4 h-16">
        <div className="flex items-center space-x-4">
          <h1 className="text-2xl font-bold tracking-tighter sm:text-3xl bg-gradient-to-r from-blue-600 to-blue-400 bg-clip-text text-transparent flex items-center">
            <GraduationCap className={`h-8 w-8 ${isDarkMode ? 'text-blue-400' : 'text-blue-600'} mr-2`} />
            ActiHub
          </h1>
          <div className="relative ml-8 translate-x-6">
            <input
              type="text"
              placeholder="Tìm kiếm hoạt động..."
              className={`w-65 px-4 py-2 rounded-lg border ${
                isDarkMode 
                  ? 'border-gray-600 bg-gray-700 text-white' 
                  : 'border-gray-300 bg-white text-gray-900'
              } focus:outline-none focus:ring-2 focus:ring-blue-500`}
            />
            <Search
              className={`absolute right-5 top-2.5 ${isDarkMode ? 'text-gray-300' : 'text-gray-400'}`}
              size={20}
            />
          </div>
        </div>
        
        <div className="flex items-center space-x-4">
          <button
            onClick={onToggleTheme}
            className={`p-2 rounded-lg ${isDarkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-100'}`}
          >
            {isDarkMode ? (
              <Sun size={24} className="text-yellow-500" />
            ) : (
              <Moon size={24} className="text-gray-600" />
            )}
          </button>
          <div className="flex items-center space-x-2">
            <img
              src={userInfo.avatar || "https://via.placeholder.com/40"}
              alt="Avatar"
              className="w-10 h-10 rounded-full"
            />
            <div className="flex flex-col">
              <span className={`font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                {userInfo.name}
              </span>
              <span className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                {userInfo.role === 'student' ? 'Sinh viên' : 'Ban tổ chức'}
              </span>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header; 