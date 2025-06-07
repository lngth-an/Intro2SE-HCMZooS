import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import ActivityForm from './ActivityForm';
import axios from 'axios';
import { toast } from 'react-hot-toast';

const API_URL = '/activity';
const DOMAINS = [
  { id: 'academic', label: 'Học thuật', color: 'bg-blue-40 text-blue-800', selectedColor: 'bg-blue-100 text-blue-800' },
  { id: 'volunteer', label: 'Tình nguyện', color: 'bg-green-40 text-green-800', selectedColor: 'bg-green-100 text-green-800' },
  { id: 'sports', label: 'Thể thao', color: 'bg-yellow-40 text-yellow-800', selectedColor: 'bg-yellow-100 text-yellow-800' },
  { id: 'skills', label: 'Kỹ năng', color: 'bg-purple-40 text-purple-800', selectedColor: 'bg-purple-100 text-purple-800' },
  { id: 'arts', label: 'Nghệ thuật', color: 'bg-pink-40 text-pink-800', selectedColor: 'bg-pink-100 text-pink-800' },
  { id: 'other', label: 'Khác', color: 'bg-gray-40 text-gray-800', selectedColor: 'bg-gray-100 text-gray-800' },
];
const statusColors = {
  draft: '#bdbdbd',
  published: '#1976d2',
  completed: '#388e3c',
};

const DEFAULT_IMAGE = 'https://cylpzmvdcyhkvghdeelb.supabase.co/storage/v1/object/public/activities//dai-hoc-khoa-ho-ctu-nhien-tphcm.jpg';

function ActivityManager() {
  const [activities, setActivities] = useState([]);
  const [editingId, setEditingId] = useState(null);
  const [editingActivity, setEditingActivity] = useState(null);
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState('success');
  const navigate = useNavigate();

  const fetchActivities = async () => {
    try {
      const res = await axios.get(API_URL);
      setActivities(res.data.activities || []);
    } catch (error) {
      toast.error('Không thể tải danh sách hoạt động');
    }
  };

  useEffect(() => {
    fetchActivities();
  }, []);

  const handleEdit = (activity) => {
    setEditingId(activity.activityID);
    setEditingActivity(activity);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Bạn có chắc chắn muốn xóa hoạt động này?')) {
      try {
        await axios.delete(`${API_URL}/${id}`);
        toast.success('Xóa hoạt động thành công');
        fetchActivities();
      } catch (error) {
        toast.error('Không thể xóa hoạt động');
      }
    }
  };

  const handlePublish = async (id) => {
    try {
      await axios.patch(`${API_URL}/${id}/publish`);
      toast.success('Đã xuất bản hoạt động thành công!');
      fetchActivities();
    } catch (error) {
      toast.error('Không thể xuất bản hoạt động');
    }
  };

  const handleFormSubmit = async (formData) => {
    try {
      if (editingId) {
        await axios.put(`${API_URL}/${editingId}`, formData);
        toast.success('Đã cập nhật hoạt động thành công!');
      } else {
        await axios.post(API_URL, formData);
        toast.success('Đã tạo hoạt động thành công!');
      }
      setEditingId(null);
      setEditingActivity(null);
      fetchActivities();
    } catch (error) {
      toast.error('Có lỗi xảy ra khi lưu hoạt động');
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6 text-left text-black-600">
        {editingId ? 'Chỉnh sửa hoạt động' : 'Tạo hoạt động mới'}
      </h1>
      
      {message && (
        <div className={`mb-4 p-3 rounded-md text-center ${
          messageType === 'success' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
        }`}>
          {message}
        </div>
      )}

      <ActivityForm 
        onSubmit={handleFormSubmit}
        editingId={editingId}
        onCancel={() => {
          setEditingId(null);
          setEditingActivity(null);
        }}
        domains={DOMAINS}
        initialData={editingActivity}
      />

      <div className="mt-12">
        <h2 className="text-xl font-semibold mb-4 text-gray-800">Danh sách hoạt động</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {activities.map(activity => (
            <div key={activity.activityID} className="bg-white rounded-lg shadow-md overflow-hidden">
              <img 
                src={activity.image || DEFAULT_IMAGE} 
                alt={activity.name} 
                className="w-full h-48 object-cover"
              />
              <div className="p-4">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-lg font-semibold text-blue-600">{activity.name}</h3>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium text-white`}
                    style={{ backgroundColor: statusColors[activity.activityStatus] || '#bdbdbd' }}>
                    {activity.activityStatus}
                  </span>
                </div>
                
                <div className="space-y-2 text-sm text-gray-600">
                  <p><span className="font-medium">Thời gian:</span> {new Date(activity.eventStart).toLocaleString()}</p>
                  <p><span className="font-medium">Địa điểm:</span> {activity.location}</p>
                  <p><span className="font-medium">Lĩnh vực:</span> {
                    Array.isArray(activity.domains) 
                      ? activity.domains.map(d => DOMAINS.find(dm => dm.id === d)?.label).join(', ')
                      : ''
                  }</p>
                  <p><span className="font-medium">Đối tượng:</span> {activity.targetAudience}</p>
                  <p><span className="font-medium">Điểm rèn luyện:</span> {activity.trainingScore} điểm</p>
                </div>

                <div className="mt-4 flex flex-wrap gap-2">
                  {activity.activityStatus === 'draft' && (
                    <>
                      <button 
                        onClick={() => handleEdit(activity)}
                        className="px-3 py-1 bg-yellow-100 text-yellow-800 rounded-md hover:bg-yellow-200 transition-colors"
                      >
                        Chỉnh sửa
                      </button>
                      <button 
                        onClick={() => handleDelete(activity.activityID)}
                        className="px-3 py-1 bg-red-100 text-red-800 rounded-md hover:bg-red-200 transition-colors"
                      >
                        Xóa
                      </button>
                      <button 
                        onClick={() => handlePublish(activity.activityID)}
                        className="px-3 py-1 bg-blue-100 text-blue-800 rounded-md hover:bg-blue-200 transition-colors"
                      >
                        Xuất bản
                      </button>
                    </>
                  )}
                  <button 
                    onClick={() => navigate(`/organizer/activities/${activity.activityID}`)}
                    className="px-3 py-1 bg-gray-100 text-gray-800 rounded-md hover:bg-gray-200 transition-colors ml-auto"
                  >
                    Xem chi tiết
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default ActivityManager; 