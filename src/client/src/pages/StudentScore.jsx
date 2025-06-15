import React from "react";
import Header from "../components/common/Header";
import SidebarStudent from "../components/common/SidebarStudent";
import Footer from "../components/common/Footer";
import StudentScoreContent from "../components/pages/StudentScoreContent"; // Import the refactored content component
import axios from "axios";
import { message } from "antd";
import { useNavigate } from "react-router-dom";

export default function StudentScore() {
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await axios.post('/auth/logout');
      localStorage.removeItem('accessToken');
      localStorage.removeItem('role');
      localStorage.removeItem('userID');
      localStorage.removeItem('user');
      message.success('Đăng xuất thành công');
      navigate('/login');
    } catch (error) {
      message.error('Có lỗi xảy ra khi đăng xuất');
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-gray-50 to-gray-100">
      <Header
        user={{ name: "Nguyễn Văn A", avatar: "https://upload.wikimedia.org/wikipedia/commons/thumb/a/ac/Default_pfp.jpg/120px-Default_pfp.jpg", role: "student" }}
        onLogout={handleLogout}
      />

      <div className="flex flex-1 pt-16">
        <SidebarStudent onLogout={handleLogout} />

        <div className="flex-1 flex flex-col ml-64">
          <StudentScoreContent /> {/* Render the content component here */}
          <Footer />
        </div>
      </div>
    </div>
  );
}
