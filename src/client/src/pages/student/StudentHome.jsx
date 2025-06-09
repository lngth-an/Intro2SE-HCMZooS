import React from "react";
import Header from "../../components/common/Header";
import SidebarStudent from "../../components/common/SidebarStudent";
import Footer from "../../components/common/Footer";
import StudentHomeMain from "../../components/pages/StudentHomeMain";

export default function StudentHome() {
  const user = { name: "Nguyễn Văn A", avatar: "/avatar.png", role: "student" };

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      {/* Header */}
      <Header user={user} />

      {/* Main content with sidebar */}
      <div className="flex flex-1 pt-16">
        {/* Sidebar */}
        <SidebarStudent onLogout={() => alert("Đăng xuất!")} />

        {/* Main content area + Footer */}
        <div className="flex-1 flex flex-col ml-64">
          <main className="flex-1 p-6">
            <StudentHomeMain />
          </main>
          <Footer />
        </div>
      </div>
    </div>
  );
}
