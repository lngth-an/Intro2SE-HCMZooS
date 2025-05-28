import React from "react";
import { Calendar, MapPin, Users, ChevronRight } from "lucide-react";

const OngoingActivities: React.FC = () => {
  const activities = [
    {
      id: 1,
      title: "Hội thao sinh viên",
      date: "15/04/2024",
      location: "Sân vận động trường",
      participants: 50,
      image: "https://via.placeholder.com/150",
      status: "Đang mở đăng ký",
    },
    {
      id: 2,
      title: "Cuộc thi lập trình",
      date: "20/04/2024",
      location: "Phòng máy A1",
      participants: 30,
      image: "https://via.placeholder.com/150",
      status: "Đã đóng đăng ký",
    },
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Đang mở đăng ký":
        return "bg-green-100 text-green-800";
      case "Đã đóng đăng ký":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow">
      <div className="p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white">
            Các hoạt động đang diễn ra
          </h2>
          <button className="text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 flex items-center">
            Xem thêm
            <ChevronRight className="w-4 h-4 ml-1" />
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {activities.map((activity) => (
            <div
              key={activity.id}
              className="bg-white dark:bg-gray-700 rounded-lg shadow overflow-hidden"
            >
              <div className="relative">
                <img
                  src={activity.image}
                  alt={activity.title}
                  className="w-full h-48 object-cover"
                />
                <span
                  className={`absolute top-4 right-4 px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(
                    activity.status
                  )}`}
                >
                  {activity.status}
                </span>
              </div>
              <div className="p-4">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
                  {activity.title}
                </h3>
                <div className="space-y-2">
                  <div className="flex items-center text-gray-600 dark:text-gray-300">
                    <Calendar className="w-5 h-5 mr-2" />
                    <span className="font-medium">Thời gian diễn ra:</span>
                    <span className="ml-2">{activity.date}</span>
                  </div>
                  <div className="flex items-center text-gray-600 dark:text-gray-300">
                    <MapPin className="w-5 h-5 mr-2" />
                    <span className="font-medium">Địa điểm diễn ra:</span>
                    <span className="ml-2">{activity.location}</span>
                  </div>
                  <div className="flex items-center text-gray-600 dark:text-gray-300">
                    <Users className="w-5 h-5 mr-2" />
                    <span className="font-medium">
                      Số lượng tình nguyện viên:
                    </span>
                    <span className="ml-2">{activity.participants}</span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default OngoingActivities;
