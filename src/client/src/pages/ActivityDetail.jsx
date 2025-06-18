import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate, useParams } from "react-router-dom";
import { message } from "antd";
import Header from "../components/common/Header";
import SidebarOrganizer from "../components/common/SidebarOrganizer";
import Footer from "../components/common/Footer";
import OrganizerActivityDetail from "../components/pages/OrganizerActivityDetail";

const ActivityDetail = () => {
  const navigate = useNavigate();
  const { activityId } = useParams();
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

  const handleBack = () => {
    navigate("/organizer/activities");
  };

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
            <button
              onClick={handleBack}
              className="mb-4 flex items-center text-gray-600 hover:text-gray-900"
            >
              <svg
                className="w-5 h-5 mr-2"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M10 19l-7-7m0 0l7-7m-7 7h18"
                />
              </svg>
              Quay lại
            </button>
            <OrganizerActivityDetail activityId={activityId} />
          </main>
          <Footer />
        </div>
      </div>
    </div>
  );
};

export default ActivityDetail; 