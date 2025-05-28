import React, { useState } from "react";
import {
  Moon,
  Sun,
  Search,
  LogOut,
  ChevronRight,
  GraduationCap,
  Home,
  Calendar,
  Award,
  Bell,
  User,
  PlusCircle,
  List,
  BarChart,
  CheckCircle,
  AlertCircle,
} from "lucide-react";
import { Routes, Route } from "react-router-dom";
import Sidebar from "./components/layout/Sidebar";
import Header from "./components/layout/Header";
import DashboardStats from "./components/common/DashboardStats";
import OngoingActivities from "./components/common/OngoingActivities";
import Footer from "./components/layout/Footer";
import CreateActivity from "./pages/organizer/CreateActivity";

// Layout component that can be reused for both student and organizer
function Layout({ children, menuItems, userInfo }) {
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  return (
    <div
      className={`min-h-screen flex flex-col ${
        isDarkMode ? "dark bg-gray-900" : "bg-gray-50"
      }`}
    >
      {/* Header */}
      <Header 
        isDarkMode={isDarkMode}
        onToggleTheme={() => setIsDarkMode(!isDarkMode)}
        userInfo={userInfo}
      />

      {/* Main Content and Footer Container */}
      <div className="flex-1 flex">
        {/* Sidebar */}
        <div
          className={`fixed left-0 top-16 h-[calc(100vh-4rem)] ${
            isSidebarOpen ? "w-64" : "w-0"
          }`}
        >
          <Sidebar isOpen={isSidebarOpen} menuItems={menuItems} />
        </div>

        {/* Main Content and Footer */}
        <div
          className={`flex-1 flex flex-col ${isSidebarOpen ? "ml-64" : "ml-0"}`}
        >
          {/* Main Content Area */}
          <main className="flex-1 p-8 pt-24">
            <div className="max-w-7xl mx-auto">
              {children}
            </div>
          </main>

          {/* Footer */}
          <Footer />
        </div>
      </div>
    </div>
  );
}

// Student Home component
function StudentHome() {
  const menuItems = [
    { icon: Home, label: 'Trang chủ', path: '/student' },
    { icon: Calendar, label: 'Hoạt động', path: '/student/activities' },
    { icon: Award, label: 'Điểm rèn luyện', path: '/student/points' },
    { icon: Bell, label: 'Thông báo', path: '/student/notifications' },
    { icon: User, label: 'Hồ sơ', path: '/student/profile' },
  ];

  const userInfo = {
    name: "Nguyễn Văn A",
    role: "student" as const,
  };

  return (
    <Layout menuItems={menuItems} userInfo={userInfo}>
      <DashboardStats />
      <div className="mt-8">
        <OngoingActivities />
      </div>
    </Layout>
  );
}

// Organizer Home component
function OrganizerHome() {
  const menuItems = [
    { icon: Home, label: 'Trang chủ', path: '/organizer' },
    { icon: List, label: 'Quản lý hoạt động', path: '/organizer/activities/manage' },
    { icon: CheckCircle, label: 'Phê duyệt đăng ký', path: '/organizer/approvals' },
    { icon: Bell, label: 'Thông báo', path: '/organizer/notifications' },
    { icon: AlertCircle, label: 'Khiếu nại', path: '/organizer/complaints' },
    { icon: User, label: 'Hồ sơ', path: '/organizer/profile' },
  ];

  const userInfo = {
    name: "Đội Sinh viên Tình nguyện",
    role: "organizer" as const,
  };

  return (
    <Layout menuItems={menuItems} userInfo={userInfo}>
      <DashboardStats />
      <div className="mt-8">
        <OngoingActivities />
      </div>
    </Layout>
  );
}

// Create Activity component
function CreateActivityPage() {
  const menuItems = [
    { icon: Home, label: 'Trang chủ', path: '/organizer' },
    { icon: List, label: 'Quản lý hoạt động', path: '/organizer/activities/manage' },
    { icon: CheckCircle, label: 'Phê duyệt đăng ký', path: '/organizer/approvals' },
    { icon: Bell, label: 'Thông báo', path: '/organizer/notifications' },
    { icon: AlertCircle, label: 'Khiếu nại', path: '/organizer/complaints' },
    { icon: User, label: 'Hồ sơ', path: '/organizer/profile' },
  ];

  const userInfo = {
    name: "Đội Sinh viên Tình nguyện",
    role: "organizer" as const,
  };

  return (
    <Layout menuItems={menuItems} userInfo={userInfo}>
      <CreateActivity />
    </Layout>
  );
}

function App() {
  return (
    <Routes>
      {/* Student routes */}
      <Route path="/" element={<StudentHome />} />
      <Route path="/student" element={<StudentHome />} />

      {/* Organizer routes */}
      <Route path="/organizer" element={<OrganizerHome />} />
      <Route path="/organizer/activities/create" element={<CreateActivityPage />} />
    </Routes>
  );
}

export default App;
