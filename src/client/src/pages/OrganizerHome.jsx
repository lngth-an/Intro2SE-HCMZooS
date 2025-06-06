import React, { useEffect, useState } from "react";
import Header from "../components/common/Header";
import SidebarOrganizer from "../components/common/SidebarOrganizer";
import Footer from "../components/common/Footer";
import OrganizerHomeMain from "../components/pages/OrganizerHomeMain";

export default function OrganizerHome() {
  const [user, setUser] = useState(null);
  useEffect(() => {
    fetch("/user/me")
      .then((res) => res.json())
      .then((data) => setUser(data))
      .catch(() => setUser(null));
  }, []);

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      {/* Header */}
      <Header user={user || { name: "Đang tải...", avatar: "/avatar.png", role: "organizer" }} />

      {/* Main content with sidebar */}
      <div className="flex flex-1 pt-16">
        {/* Sidebar */}
        <SidebarOrganizer onLogout={() => alert("Đăng xuất!")} />

        {/* Main content area + Footer */}
        <div className="flex-1 flex flex-col ml-64">
          <main className="flex-1 p-6">
            <OrganizerHomeMain />
          </main>
          <Footer />
        </div>
      </div>
    </div>
  );
}
