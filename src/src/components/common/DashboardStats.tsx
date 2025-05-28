import React from "react";
import { Trophy, Activity, ChevronRight } from "lucide-react";

const DashboardStats: React.FC = () => {
  const stats = [
    {
      title: "Điểm rèn luyện",
      value: "85",
      icon: Trophy,
      color: "text-yellow-500",
      bgColor: "bg-yellow-100",
    },
    {
      title: "Đăng ký hoạt động",
      value: "Xem các hoạt động đã đăng ký",
      icon: Activity,
      color: "text-green-500",
      bgColor: "bg-green-100",
    },
    
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      {stats.map((stat, index) => {
        const Icon = stat.icon;
        return (
          <div
            key={index}
            className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 hover:shadow-lg transition-shadow"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div
                  className={`${stat.bgColor} ${stat.color} p-3 rounded-full`}
                >
                  <Icon className="w-6 h-6" />
                </div>
                <div>
                  <p className="text-gray-500 dark:text-gray-400 font-bold">
                    {stat.title}
                  </p>
                  <p className="text-lg text-gray-900 dark:text-white">
                    {stat.value}
                  </p>
                </div>
              </div>
              <button className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300">
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default DashboardStats;
