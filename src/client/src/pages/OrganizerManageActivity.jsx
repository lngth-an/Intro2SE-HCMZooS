import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { message } from "antd";
import Header from "../components/common/Header";
import SidebarOrganizer from "../components/common/SidebarOrganizer";
import Footer from "../components/common/Footer";
import ActivityManager from "../components/pages/ActivityManager";

const OrganizerManageActivity = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState({ name: "", avatar: "", role: "organizer" });
  const [loading, setLoading] = useState(false);

  const handleLogout = async () => {
    try {
      await axios.post("/auth/logout");
      localStorage.removeItem("accessToken");
      localStorage.removeItem("role");
      localStorage.removeItem("userID");
      localStorage.removeItem("user");
      message.success("Đăng xuất thành công");
      navigate("/login");
    } catch (error) {
      message.error("Có lỗi xảy ra khi đăng xuất");
    }
  };

  useEffect(() => {
    fetch("/activity/organizer/me")
      .then((res) => res.json())
      .then((data) =>
        setUser({
          name: data.name || "Organizer",
          avatar:
            data.avatar ||
            "https://upload.wikimedia.org/wikipedia/commons/thumb/a/ac/Default_pfp.jpg/120px-Default_pfp.jpg",
          role: "organizer",
        })
      );
  }, []);

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      {/* Header */}
      <Header onLogout={handleLogout} />

      {/* Main content with sidebar */}
      <div className="flex flex-1 pt-16">
        {/* Sidebar */}
        <SidebarOrganizer onLogout={handleLogout} />

        {/* Main content area + Footer */}
        <div className="flex-1 flex flex-col ml-64">
          <main className="flex-1 p-6">
            <ActivityManager />
          </main>
          <Footer />
        </div>
      </div>
    </div>
  );
};

export default OrganizerManageActivity;
