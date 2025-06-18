import React from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import Header from "../components/common/Header";
import SidebarOrganizer from "../components/common/SidebarOrganizer";
import Footer from "../components/common/Footer";
import ActivityForm from "../components/pages/ActivityForm";
import { DOMAINS } from '../constants/activityTypes';

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
