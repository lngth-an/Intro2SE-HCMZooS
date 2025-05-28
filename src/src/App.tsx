import React, { useState } from "react";
import {
  Moon,
  Sun,
  Search,
  LogOut,
  ChevronRight,
  GraduationCap,
} from "lucide-react";
import Sidebar from "./components/layout/Sidebar";
import DashboardStats from "./components/common/DashboardStats";
import OngoingActivities from "./components/common/OngoingActivities";
import Footer from "./components/layout/Footer";

function App() {
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  return (
    <div
      className={`min-h-screen flex flex-col ${
        isDarkMode ? "dark bg-gray-900" : "bg-gray-50"
      }`}
    >
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 bg-white dark:bg-gray-800 shadow-sm z-50">
        <div className="flex items-center justify-between px-4 h-16">
          <div className="flex items-center space-x-4">
            <h1 className="text-2xl font-bold tracking-tighter sm:text-3xl bg-gradient-to-r from-blue-600 to-blue-400 bg-clip-text text-transparent flex items-center">
              <GraduationCap className="h-8 w-8 text-blue-600 mr-2" />
              ActiHub
            </h1>
            <div className="relative ml-8 translate-x-6">
              <input
                type="text"
                placeholder="Tìm kiếm hoạt động..."
                className="w-65 px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <Search
                className="absolute right-5 top-2.5 text-gray-400"
                size={20}
              />
            </div>
          </div>
          <div className="flex items-center space-x-4">
            <button
              onClick={() => setIsDarkMode(!isDarkMode)}
              className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700"
            >
              {isDarkMode ? (
                <Sun size={24} className="text-yellow-500" />
              ) : (
                <Moon size={24} />
              )}
            </button>
            <div className="flex items-center space-x-2">
              <img
                src="https://via.placeholder.com/40"
                alt="Avatar"
                className="w-10 h-10 rounded-full"
              />
              <span className="text-gray-700 dark:text-gray-300">
                Nguyễn Văn A
              </span>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content and Footer Container */}
      <div className="flex-1 flex">
        {/* Sidebar */}
        <div
          className={`fixed left-0 top-16 h-[calc(100vh-4rem)] ${
            isSidebarOpen ? "w-64" : "w-0"
          }`}
        >
          <Sidebar isOpen={isSidebarOpen} />
        </div>

        {/* Main Content and Footer */}
        <div
          className={`flex-1 flex flex-col ${isSidebarOpen ? "ml-64" : "ml-0"}`}
        >
          {/* Main Content Area */}
          <main className="flex-1 p-8 pt-24">
            <div className="max-w-7xl mx-auto">
              <DashboardStats />
              <div className="mt-8">
                <OngoingActivities />
              </div>
            </div>
          </main>

          {/* Footer */}
          <Footer />
        </div>
      </div>
    </div>
  );
}

export default App;
