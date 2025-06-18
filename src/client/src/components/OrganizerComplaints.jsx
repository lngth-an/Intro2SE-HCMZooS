import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../contexts/AuthContext';

const OrganizerComplaints = () => {
  const [activities, setActivities] = useState([]);
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { user } = useAuth();

  // Fetch activities
  useEffect(() => {
    const fetchActivities = async () => {
      try {
        const response = await axios.get('/api/activity/organizer', {
          withCredentials: true
        });
        setActivities(response.data);
      } catch (err) {
        console.error('Error fetching activities:', err);
        setError('Không thể tải danh sách hoạt động');
      }
    };

    fetchActivities();
  }, []);

  // Fetch complaints
  useEffect(() => {
    const fetchComplaints = async () => {
      try {
        const response = await axios.get('/api/activity/complaint/organizer', {
          withCredentials: true
        });
        setComplaints(response.data);
      } catch (err) {
        console.error('Error fetching complaints:', err);
        setError('Không thể tải danh sách khiếu nại');
      } finally {
        setLoading(false);
      }
    };

    fetchComplaints();
  }, []);

  // Handle complaint response
  const handleResponse = async (complaintId, response) => {
    try {
      await axios.patch(`/api/activity/complaint/${complaintId}/respond`, {
        response
      }, {
        withCredentials: true
      });

      // Update complaints list
      setComplaints(prevComplaints =>
        prevComplaints.map(complaint =>
          complaint.id === complaintId
            ? { ...complaint, response, status: 'Đã duyệt' }
            : complaint
        )
      );
    } catch (err) {
      console.error('Error responding to complaint:', err);
      setError('Không thể gửi phản hồi');
    }
  };

  if (loading) {
    return <div className="p-4">Đang tải...</div>;
  }

  if (error) {
    return <div className="p-4 text-red-500">{error}</div>;
  }

  return (
    <div className="p-4">
      <h2 className="text-2xl font-bold mb-4">Quản lý khiếu nại</h2>
      
      {/* Activities List */}
      <div className="mb-8">
        <h3 className="text-xl font-semibold mb-2">Hoạt động của bạn</h3>
        <div className="grid gap-4">
          {activities.map(activity => (
            <div key={activity.id} className="bg-white p-4 rounded-lg shadow">
              <h4 className="font-semibold">{activity.name}</h4>
              <p className="text-gray-600">{activity.description}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Complaints List */}
      <div>
        <h3 className="text-xl font-semibold mb-2">Danh sách khiếu nại</h3>
        <div className="grid gap-4">
          {complaints.map(complaint => (
            <div key={complaint.id} className="bg-white p-4 rounded-lg shadow">
              <div className="flex justify-between items-start">
                <div>
                  <h4 className="font-semibold">Hoạt động: {complaint.activity?.name}</h4>
                  <p className="text-gray-600">{complaint.content}</p>
                  <p className="text-sm text-gray-500">
                    Người gửi: {complaint.student?.name}
                  </p>
                  <p className="text-sm text-gray-500">
                    Thời gian: {new Date(complaint.createdAt).toLocaleString()}
                  </p>
                </div>
                <div className="text-sm">
                  <span className={`px-2 py-1 rounded ${
                    complaint.status === 'Chờ duyệt' ? 'bg-yellow-100 text-yellow-800' :
                    complaint.status === 'Đã duyệt' ? 'bg-green-100 text-green-800' :
                    'bg-gray-100 text-gray-800'
                  }`}>
                    {complaint.status === 'Chờ duyệt' ? 'Chờ phản hồi' :
                     complaint.status === 'Đã duyệt' ? 'Đã phản hồi' :
                     'Đã đóng'}
                  </span>
                </div>
              </div>

              {complaint.status === 'Chờ duyệt' && (
                <div className="mt-4">
                  <textarea
                    className="w-full p-2 border rounded"
                    placeholder="Nhập phản hồi của bạn..."
                    rows="3"
                    onChange={(e) => handleResponse(complaint.id, e.target.value)}
                  />
                  <button
                    className="mt-2 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
                    onClick={() => handleResponse(complaint.id, document.querySelector(`textarea[placeholder="Nhập phản hồi của bạn..."]`).value)}
                  >
                    Gửi phản hồi
                  </button>
                </div>
              )}

              {complaint.response && (
                <div className="mt-4 p-3 bg-gray-50 rounded">
                  <p className="font-semibold">Phản hồi:</p>
                  <p className="text-gray-600">{complaint.response}</p>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default OrganizerComplaints; 