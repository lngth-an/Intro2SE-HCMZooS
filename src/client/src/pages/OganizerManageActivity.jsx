import React, { useEffect, useState } from "react";
import Header from "../components/common/Header";
import SidebarOrganizer from "../components/common/SidebarOrganizer";
import Footer from "../components/common/Footer";
import ActivityManager from "../components/pages/ActivityManager";

export default function OrganizerManageActivity() {
  const [user, setUser] = useState({ name: "", avatar: "", role: "organizer" });

  useEffect(() => {
    fetch('/activity/organizer/me')
      .then(res => res.json())
      .then(data => setUser({
        name: data.name || "Organizer",
        avatar: data.avatar || "/avatar.png",
        role: "organizer"
      }));
  }, []);

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      {/* Header */}
      <Header user={user} />

      {/* Main content with sidebar */}
      <div className="flex flex-1 pt-16">
        {/* Sidebar */}
        <SidebarOrganizer onLogout={() => alert("Đăng xuất!")} />

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
}
