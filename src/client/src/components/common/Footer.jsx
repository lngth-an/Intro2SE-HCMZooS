import React from "react";
import { GraduationCap } from "lucide-react";

const Footer = ({ isDarkMode }) => {
  return (
    <footer
      className={`w-full ${
        isDarkMode ? "bg-gray-800" : "bg-gray-50"
      } border-t ${isDarkMode ? "border-gray-700" : "border-gray-200"}`}
    >
      <div className="max-w-7xl mx-auto px-6 py-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Cột 1 - Logo và mô tả */}
          <div className="space-y-3">
            <div className="flex items-center space-x-3">
              <GraduationCap
                className={`h-8 w-8 ${
                  isDarkMode ? "text-gray-300" : "text-gray-600"
                }`}
              />
              <span
                className={`text-xl font-bold ${
                  isDarkMode ? "text-gray-300" : "text-gray-600"
                }`}
              >
                ActiHub
              </span>
            </div>
            <p className={isDarkMode ? "text-gray-300" : "text-gray-600"}>
              Hệ thống quản lý điểm rèn luyện
            </p>
            <p className={isDarkMode ? "text-gray-300" : "text-gray-600"}>
              Trường Đại học Khoa học Tự nhiên, ĐHQG - HCM
            </p>
          </div>

          {/* Cột 2 - Liên kết nhanh */}
          <div className="space-y-3">
            <h3
              className={`text-lg font-semibold ${
                isDarkMode ? "text-white" : "text-gray-900"
              }`}
            >
              Thông tin
            </h3>
            <div className="space-y-2">
              <button
                onClick={() =>
                  window.open(
                    "https://new-portal1.hcmus.edu.vn//Login.aspx?ReturnUrl=%2f",
                    "_blank"
                  )
                }
                className={`block ${
                  isDarkMode
                    ? "text-gray-300 hover:text-blue-400"
                    : "text-gray-600 hover:text-blue-600"
                }`}
              >
                Portal sinh viên
              </button>
              <button
                onClick={() => window.open("https://hcmus.edu.vn/", "_blank")}
                className={`block ${
                  isDarkMode
                    ? "text-gray-300 hover:text-blue-400"
                    : "text-gray-600 hover:text-blue-600"
                }`}
              >
                Website trường
              </button>
            </div>
          </div>

          {/* Cột 3 - Thông tin liên hệ */}
          <div className="space-y-3">
            <h3
              className={`text-lg font-semibold ${
                isDarkMode ? "text-white" : "text-gray-900"
              }`}
            >
              Địa chỉ
            </h3>
            <p className={isDarkMode ? "text-gray-300" : "text-gray-600"}>
              Cơ sở 1: 227 Nguyễn Văn Cừ, Quận 5, TP.HCM
            </p>
            <p className={isDarkMode ? "text-gray-300" : "text-gray-600"}>
              Cơ sở 2: Khu phố 6, Phường Linh Trung, TP. Thủ Đức
            </p>
          </div>
        </div>

        {/* Dòng dưới cùng */}
        <div
          className={`mt-8 pt-8 border-t ${
            isDarkMode ? "border-gray-700" : "border-gray-200"
          }`}
        >
          <p
            className={`text-center ${
              isDarkMode ? "text-gray-300" : "text-gray-600"
            }`}
          >
            © 2025 ActiHub. Tất cả các quyền được bảo lưu.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
