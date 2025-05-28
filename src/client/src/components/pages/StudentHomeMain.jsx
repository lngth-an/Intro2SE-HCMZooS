import React from "react";
import {
  GraduationCap,
  Calendar,
  Award,
  Bell,
  MapPin,
  Users,
} from "lucide-react";

export default function StudentHomeMain({ onViewScore, onViewRegistered }) {
  const stats = [
    {
      title: "Điểm rèn luyện",
      value: "85",
      icon: Award,
      color: "bg-green-500",
    },
    {
      title: "Đăng ký hoạt động",
      value: "Xem các hoạt động đang mở đăng ký...",
      icon: GraduationCap,
      color: "bg-purple-500",
    },
  ];

  const activities = [
    {
      id: 1,
      name: "Hiến máu nhân đạo",
      unit: "Đoàn trường",
      time: "10/06/2024",
      location: "Hội trường A",
      volunteers: 50,
      image: "/activity1.jpg",
    },
    {
      id: 2,
      name: "Chạy vì môi trường",
      unit: "CLB Xanh",
      time: "15/06/2024",
      location: "Công viên Lê Văn Tám",
      volunteers: 30,
      image: "/activity2.jpg",
    },
    {
      id: 3,
      name: "Tư vấn hướng nghiệp",
      unit: "Phòng CTSV",
      time: "20/06/2024",
      location: "Phòng A101",
      volunteers: 20,
      image: "/activity3.jpg",
    },
  ];

  return (
    <main className="min-h-screen bg-gray-50 p-6">
      {/* Score and Registration Section */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        {/* Score Card */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold text-gray-800 mb-2">
                Điểm rèn luyện
              </h3>
              <div className="text-3xl font-bold text-blue-600">85</div>
            </div>
            <button
              onClick={onViewScore}
              className="w-10 h-10 flex items-center justify-center bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M9 5l7 7-7 7"
                />
              </svg>
            </button>
          </div>
        </div>

        {/* Registration Card */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold text-gray-800 mb-2">
                Đăng ký hoạt động
              </h3>
              <p className="text-gray-600">Xem các hoạt động đang mở đăng ký</p>
            </div>
            <button
              onClick={onViewRegistered}
              className="w-10 h-10 flex items-center justify-center bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M9 5l7 7-7 7"
                />
              </svg>
            </button>
          </div>
        </div>
      </div>

      {/* Activities Section */}
      <div>
        <h2 className="text-xl font-semibold text-gray-800 mb-6">
          Các hoạt động đang diễn ra
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {activities.map((act) => (
            <div
              key={act.id}
              className="bg-white rounded-lg shadow-sm overflow-hidden"
            >
              <img
                src={act.image}
                alt={act.name}
                className="w-full h-48 object-cover"
              />
              <div className="p-4">
                <h3 className="text-lg font-semibold text-gray-800 mb-2">
                  {act.name}
                </h3>
                <p className="text-blue-600 font-medium mb-3">{act.unit}</p>
                <div className="space-y-2 text-sm text-gray-600">
                  <p>
                    <span className="font-medium">Thời gian:</span> {act.time}
                  </p>
                  <p>
                    <span className="font-medium">Địa điểm:</span>{" "}
                    {act.location}
                  </p>
                  <p>
                    <span className="font-medium">Tình nguyện viên:</span>{" "}
                    {act.volunteers}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </main>
  );
}
