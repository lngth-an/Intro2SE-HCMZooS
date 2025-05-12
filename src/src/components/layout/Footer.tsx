import React from "react";
import { GraduationCap } from "lucide-react";
import { useNavigate } from "react-router-dom";

const Footer: React.FC = () => {
  const navigate = useNavigate();

  const handleNavigation = (path: string) => {
    navigate(path);
  };

  return (
    <footer className="w-full bg-gray-50 dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700">
      <div className="max-w-7xl mx-auto px-6 py-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Cột bên trái - Logo và thông tin trường */}
          <div className="space-y-3">
            <div className="flex items-center space-x-3">
              <GraduationCap className="h-8 w-8 text-gray-600 dark:text-gray-300" />
              <span className="text-xl font-bold text-gray-600 dark:text-gray-300">
                ActiHub
              </span>
            </div>
            <p className="text-gray-600 dark:text-gray-300">
              Hệ thống quản lý điểm rèn luyện
            </p>
            <p className="text-gray-600 dark:text-gray-300">
              Trường Đại học Khoa học tự nhiên, ĐHQG - HCM
            </p>
          </div>

          {/* Cột giữa - Thông tin */}
          <div className="space-y-3">
            <h3 className="text-lg font-semibold text-gray-700 dark:text-gray-200">
              Thông tin
            </h3>
            <ul className="space-y-2">
              <li>
                <a
                  href="https://hcmus.edu.vn/"
                  target="_blank"
                  className="text-gray-600 hover:text-gray-900 dark:text-gray-300 dark:hover:text-gray-100 underline"
                >
                  Website Trường
                </a>
              </li>
              <li>
                <a
                  href="https://new-portal2.hcmus.edu.vn/Login.aspx?ReturnUrl=%2f/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-gray-600 hover:text-gray-900 dark:text-gray-300 dark:hover:text-gray-100 underline"
                >
                  Portal
                </a>
              </li>
            </ul>
          </div>

          {/* Cột bên phải - Địa chỉ */}
          <div className="space-y-3">
            <h3 className="text-lg font-semibold text-gray-700 dark:text-gray-200">
              Địa chỉ
            </h3>
            <ul className="space-y-2">
              <li className="text-gray-600 dark:text-gray-300">
                <span className="font-medium">Cơ sở 1:</span> 227 Nguyễn Văn Cừ,
                Phường 4, Quận 5, Thành phố Hồ Chí Minh
              </li>
              <li className="text-gray-600 dark:text-gray-300">
                <span className="font-medium">Cơ sở 2:</span> Khu đô thị ĐHQG -
                HCM
              </li>
            </ul>
          </div>
        </div>

        {/* Copyright */}
        <div className="mt-8 pt-8 border-t border-gray-200 dark:border-gray-700">
          <p className="text-center text-gray-600 dark:text-gray-300">
            © 2025 ActiHub. Tất cả các quyền được bảo lưu.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
