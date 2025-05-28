import React from "react";
import { ClipboardList, FileWarning } from "lucide-react";

export default function OrganizerHomeMain({
  onManageActivities,
  onReviewComplaints,
}) {
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
      {/* Quản lý và khiếu nại Section */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        {/* Quản lý hoạt động */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold text-gray-800 mb-2">
                Quản lý các hoạt động
              </h3>
              <p className="text-gray-600">
                Xem, chỉnh sửa hoặc kết thúc hoạt động
              </p>
            </div>
            <button
              onClick={onManageActivities}
              className="w-10 h-10 flex items-center justify-center bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <ClipboardList className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Đơn khiếu nại */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold text-gray-800 mb-2">
                Đơn khiếu nại chờ duyệt
              </h3>
              <p className="text-gray-600">
                Xử lý các đơn khiếu nại đang chờ duyệt
              </p>
            </div>
            <button
              onClick={onReviewComplaints}
              className="w-10 h-10 flex items-center justify-center bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <FileWarning className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>

      {/* Các hoạt động đang diễn ra */}
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
