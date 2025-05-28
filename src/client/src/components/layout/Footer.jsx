import React from "react";
import { GraduationCap } from "lucide-react";
import { useNavigate } from "react-router-dom";

const Footer = ({ isDarkMode }) => {
  const navigate = useNavigate();

  const handleNavigation = (path) => {
    navigate(path);
  };

  return (
    <footer className={`w-full ${isDarkMode ? 'bg-gray-800' : 'bg-gray-50'} border-t ${isDarkMode ? 'border-gray-700' : 'border-gray-200'}`}>
      <div className="max-w-7xl mx-auto px-6 py-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Cột bên trái - Logo và thông tin trường */}
          <div className="space-y-3">
            <div className="flex items-center space-x-3">
              <GraduationCap className={`h-8 w-8 ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`} />
              <span className={`text-xl font-bold ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                ActiHub
              </span>
            </div>
            <p className={isDarkMode ? 'text-gray-300' : 'text-gray-600'}>
              Hệ thống quản lý điểm rèn luyện
            </p>
            <p className={isDarkMode ? 'text-gray-300' : 'text-gray-600'}>
              Trường Đại học Khoa học tự nhiên, ĐHQG - HCM
            </p>
          </div>

          {/* Cột giữa - Thông tin */}
          <div className="space-y-3">
            <h3 className={`text-lg font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
              Thông tin liên hệ
            </h3>
            <p className={isDarkMode ? 'text-gray-300' : 'text-gray-600'}>
              Địa chỉ: 227 Nguyễn Văn Cừ, Quận 5, TP.HCM
            </p>
            <p className={isDarkMode ? 'text-gray-300' : 'text-gray-600'}>
              Email: actihub@hcmus.edu.vn
            </p>
            <p className={isDarkMode ? 'text-gray-300' : 'text-gray-600'}>
              Điện thoại: (028) 1234 5678
            </p>
          </div>

          {/* Cột phải - Liên kết */}
          <div className="space-y-3">
            <h3 className={`text-lg font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
              Liên kết nhanh
            </h3>
            <div className="space-y-2">
              <button
                onClick={() => handleNavigation("/about")}
                className={`block ${isDarkMode ? 'text-gray-300 hover:text-blue-400' : 'text-gray-600 hover:text-blue-600'}`}
              >
                Giới thiệu
              </button>
              <button
                onClick={() => handleNavigation("/contact")}
                className={`block ${isDarkMode ? 'text-gray-300 hover:text-blue-400' : 'text-gray-600 hover:text-blue-600'}`}
              >
                Liên hệ
              </button>
              <button
                onClick={() => handleNavigation("/faq")}
                className={`block ${isDarkMode ? 'text-gray-300 hover:text-blue-400' : 'text-gray-600 hover:text-blue-600'}`}
              >
                FAQ
              </button>
            </div>
          </div>
        </div>

        <div className={`mt-8 pt-8 border-t ${isDarkMode ? 'border-gray-700' : 'border-gray-200'}`}>
          <p className={`text-center ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
            © 2025 ActiHub. Tất cả các quyền được bảo lưu.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer; 