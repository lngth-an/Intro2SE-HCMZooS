import React from 'react';
import { Calendar, MapPin, Users } from 'lucide-react';

function OngoingActivities() {
  const activities = [
    {
      title: 'Tình nguyện tại Sở thú',
      date: '15/03/2024',
      location: 'Sở thú HCM',
      participants: 25,
      status: 'Đang diễn ra',
    },
    {
      title: 'Chăm sóc động vật',
      date: '20/03/2024',
      location: 'Khu bảo tồn',
      participants: 15,
      status: 'Sắp diễn ra',
    },
    {
      title: 'Giáo dục môi trường',
      date: '25/03/2024',
      location: 'Trường học',
      participants: 30,
      status: 'Sắp diễn ra',
    },
  ];

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow">
      <div className="p-6">
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
          Hoạt động đang diễn ra
        </h2>
        <div className="space-y-4">
          {activities.map((activity, index) => (
            <div
              key={index}
              className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700 rounded-lg"
            >
              <div className="flex-1">
                <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                  {activity.title}
                </h3>
                <div className="mt-2 flex items-center space-x-4 text-sm text-gray-500 dark:text-gray-400">
                  <div className="flex items-center">
                    <Calendar className="h-4 w-4 mr-1" />
                    {activity.date}
                  </div>
                  <div className="flex items-center">
                    <MapPin className="h-4 w-4 mr-1" />
                    {activity.location}
                  </div>
                  <div className="flex items-center">
                    <Users className="h-4 w-4 mr-1" />
                    {activity.participants} người tham gia
                  </div>
                </div>
              </div>
              <span
                className={`px-3 py-1 rounded-full text-sm font-medium ${
                  activity.status === 'Đang diễn ra'
                    ? 'bg-green-100 text-green-800'
                    : 'bg-yellow-100 text-yellow-800'
                }`}
              >
                {activity.status}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default OngoingActivities; 