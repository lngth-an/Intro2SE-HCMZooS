import React from "react";
import { useNavigate } from "react-router-dom";
import Header from "../components/common/Header";
import SidebarOrganizer from "../components/common/SidebarOrganizer";
import Footer from "../components/common/Footer";
import ActivityForm from "../components/pages/ActivityForm";

const DOMAINS = [
  {
    id: "Học thuật",
    label: "Học thuật",
    color: "bg-blue-100 text-blue-800",
    selectedColor: "bg-blue-600 text-white",
  },
  {
    id: "Tình nguyện",
    label: "Tình nguyện",
    color: "bg-green-100 text-green-800",
    selectedColor: "bg-green-600 text-white",
  },
  {
    id: "Văn hóa - Thể thao",
    label: "Văn hóa - Thể thao",
    color: "bg-yellow-100 text-yellow-800",
    selectedColor: "bg-yellow-600 text-white",
  },
  {
    id: "Kỹ năng",
    label: "Kỹ năng",
    color: "bg-purple-100 text-purple-800",
    selectedColor: "bg-purple-600 text-white",
  },
  {
    id: "Nghệ thuật",
    label: "Nghệ thuật",
    color: "bg-pink-100 text-pink-800",
    selectedColor: "bg-pink-600 text-white",
  },
  {
    id: "Khác",
    label: "Khác",
    color: "bg-gray-100 text-gray-800",
    selectedColor: "bg-gray-600 text-white",
  },
];

const ActivityCreate = () => {
  const navigate = useNavigate();

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
        <SidebarOrganizer />

        {/* Main content area + Footer */}
        <div className="flex-1 flex flex-col ml-64">
          <main className="flex-1 p-6">
            <ActivityForm onSubmit={handleSubmit} domains={DOMAINS} />
          </main>
          <Footer />
        </div>
      </div>
    </div>
  );
};

export default ActivityCreate;
