import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'react-toastify';

const ActivityDetail = () => {
  const { activityId } = useParams();
  const [activity, setActivity] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchActivity = async () => {
      try {
        const response = await axios.get(`/activity/${activityId}`);
        setActivity(response.data);
      } catch (error) {
        toast.error('Không thể tải thông tin hoạt động');
      } finally {
        setLoading(false);
      }
    };

    fetchActivity();
  }, [activityId]);

  if (loading) {
    return <div>Đang tải...</div>;
  }

  if (!activity) {
    return <div>Không tìm thấy hoạt động</div>;
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">{activity.name}</h1>
      <div className="bg-white rounded-lg shadow p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h2 className="text-lg font-semibold mb-2">Thông tin cơ bản</h2>
            <p><span className="font-medium">Trạng thái:</span> {activity.activityStatus}</p>
            <p><span className="font-medium">Ngày bắt đầu:</span> {new Date(activity.eventStart).toLocaleDateString()}</p>
            <p><span className="font-medium">Ngày kết thúc:</span> {new Date(activity.eventEnd).toLocaleDateString()}</p>
            <p><span className="font-medium">Địa điểm:</span> {activity.location}</p>
          </div>
          <div>
            <h2 className="text-lg font-semibold mb-2">Mô tả</h2>
            <p className="whitespace-pre-wrap">{activity.description}</p>
          </div>
      </div>
      </div>
    </div>
  );
};

export default ActivityDetail;