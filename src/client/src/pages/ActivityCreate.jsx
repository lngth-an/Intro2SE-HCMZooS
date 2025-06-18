import React from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import Header from "../components/common/Header";
import SidebarOrganizer from "../components/common/SidebarOrganizer";
import Footer from "../components/common/Footer";
import ActivityForm from "../components/pages/ActivityForm";

const DOMAINS = [
  {
    id: "Workshop",
    label: "Workshop",
    type: "workshop",
    color: "bg-blue-100 text-blue-800",
    selectedColor: "bg-blue-600 text-white",
  },
  {
    id: "Tình nguyện",
    label: "Tình nguyện",
    type: "volunteer",
    color: "bg-green-100 text-green-800",
    selectedColor: "bg-green-600 text-white",
  },
  {
    id: "Học thuật",
    label: "Học thuật",
    type: "academic",
    color: "bg-yellow-100 text-yellow-800",
    selectedColor: "bg-yellow-600 text-white",
  },
  {
    id: "Hội thảo",
    label: "Hội thảo",
    type: "seminar",
    color: "bg-purple-100 text-purple-800",
    selectedColor: "bg-purple-600 text-white",
  },
  {
    id: "Cuộc thi",
    label: "Cuộc thi",
    type: "competition",
    color: "bg-pink-100 text-pink-800",
    selectedColor: "bg-pink-600 text-white",
  },
  {
    id: "Chuyên đề",
    label: "Chuyên đề",
    type: "specialized",
    color: "bg-indigo-100 text-indigo-800",
    selectedColor: "bg-indigo-600 text-white",
  },
  {
    id: "Khác",
    label: "Khác",
    type: "other",
    color: "bg-gray-100 text-gray-800",
    selectedColor: "bg-gray-600 text-white",
  },
];

const ActivityCreate = () => {
  const navigate = useNavigate();
  const { logout } = useAuth();

  const handleSubmit = async (data) => {
    try {
      const response = await fetch("/activity", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        throw new Error("Có lỗi xảy ra khi tạo hoạt động");
      }

      navigate("/organizer/activities");
    } catch (error) {
      console.error("Error creating activity:", error);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      {/* Header */}
      <Header />

      {/* Main content with sidebar */}
      <div className="flex flex-1 pt-16">
        {/* Sidebar */}
        <SidebarOrganizer onLogout={logout} />

        {/* Main content area + Footer */}
        <div className="flex-1 flex flex-col ml-64">
          <main className="flex-1 p-6">
            <div className="bg-white shadow rounded-lg p-6">
              <h1 className="text-4xl font-extrabold text-gray-900 tracking-tight mb-6">
                TẠO HOẠT ĐỘNG
              </h1>
              <ActivityForm onSubmit={handleSubmit} domains={DOMAINS} />
            </div>
          </main>
          <Footer />
        </div>
      </div>
    </div>
  );
};

export default ActivityCreate;
