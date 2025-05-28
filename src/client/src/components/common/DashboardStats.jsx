import React from 'react';
import { GraduationCap, Calendar, Award, Bell } from 'lucide-react';

function DashboardStats() {
  const stats = [
    {
      title: 'Tổng số hoạt động',
      value: '12',
      icon: Calendar,
      color: 'bg-blue-500',
    },
    {
      title: 'Điểm rèn luyện',
      value: '85',
      icon: Award,
      color: 'bg-green-500',
    },
    {
      title: 'Hoạt động đã tham gia',
      value: '8',
      icon: GraduationCap,
      color: 'bg-purple-500',
    },
    {
      title: 'Thông báo mới',
      value: '3',
      icon: Bell,
      color: 'bg-yellow-500',
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {stats.map((stat, index) => (
        <div
          key={index}
          className="bg-white dark:bg-gray-800 rounded-lg shadow p-6"
        >
          <div className="flex items-center">
            <div className={`p-3 rounded-full ${stat.color}`}>
              <stat.icon className="h-6 w-6 text-white" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
                {stat.title}
              </p>
              <p className="text-2xl font-semibold text-gray-900 dark:text-white">
                {stat.value}
              </p>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

export default DashboardStats; 