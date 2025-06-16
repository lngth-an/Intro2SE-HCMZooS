import React, { useEffect, useState } from 'react';
import { toast } from 'react-toastify';
import axios from 'axios';

const API_BASE_URL = 'http://localhost:3001';

export default function StudentActivitiesContent() {
  const [activities, setActivities] = useState([]);
  const [filteredActivities, setFilteredActivities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedType, setSelectedType] = useState('');
  const [sortOrder, setSortOrder] = useState('desc');
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [selectedActivity, setSelectedActivity] = useState(null);

  useEffect(() => {
    const token = localStorage.getItem('accessToken');
    fetch(`${API_BASE_URL}/student/activities?allStatus=true`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    })
      .then(res => res.json())
      .then(data => {
        setActivities(data.activities || []);
        setFilteredActivities(data.activities || []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  useEffect(() => {
    let filtered = [...activities];

    if (selectedType) {
      filtered = filtered.filter(act => act.type === selectedType);
    }

    filtered.sort((a, b) => {
      const dateA = new Date(a.eventStart);
      const dateB = new Date(b.eventStart);
      return sortOrder === 'asc' ? dateA - dateB : dateB - dateA;
    });

    setFilteredActivities(filtered);
  }, [selectedType, activities, sortOrder]);

  const uniqueTypes = [...new Set(activities.map(act => act.type))];

  const toggleSort = () => {
    setSortOrder(prev => prev === 'asc' ? 'desc' : 'asc');
  };

    const handleShowDetail = (activity) => {
        setSelectedActivity(activity);
        setShowDetailModal(true);
    };

    const handleCloseDetailModal = () => {
        setShowDetailModal(false);
    };

  const handleCancelRegistration = async (participationID) => {
    try {
      // Hiển thị xác nhận trước khi hủy
      if (!window.confirm('Bạn có chắc chắn muốn hủy đăng ký hoạt động này?')) {
        return;
      }

      const token = localStorage.getItem('accessToken');
      const response = await axios.delete(`${API_BASE_URL}/participation/${participationID}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      // Cập nhật lại danh sách hoạt động
      const updatedActivities = activities.map(activity => {
        if (activity.participationID === participationID) {
          return {
            ...activity,
            participationStatus: 'cancelled'
          };
        }
        return activity;
      });

      setActivities(updatedActivities);
      toast.success('Hủy đăng ký thành công!');
    } catch (error) {
      console.error('Error cancelling registration:', error);
      toast.error(error.response?.data?.error || 'Có lỗi xảy ra khi hủy đăng ký');
    }
  };

  return (
    <div className="flex-1 p-6">
      <div className="space-y-3 order-1">
        <h1 className="text-4xl font-extrabold text-gray-900 tracking-tight">QUẢN LÝ HOẠT ĐỘNG</h1>
        <p className="text-xl text-gray-700 font-medium">Xem và quản lý các hoạt động bạn đã đăng ký tham gia.</p>
      </div>

      {/* Filter and Sort Section */}
      <div className="flex items-center justify-end gap-6 mt-6 mb-6">
        <div className="flex items-center gap-2">
          <label className="text-sm font-medium text-gray-700">Lĩnh vực:</label>
          <div className="relative">
            <select
              value={selectedType}
              onChange={(e) => setSelectedType(e.target.value)}
              className="appearance-none w-48 p-2 border rounded-md pr-8 pl-8"
            >
              <option value="">Tất cả</option>
              {uniqueTypes.map((type) => (
                <option key={type} value={type}>{type}</option>
              ))}
            </select>
            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700">
              <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"><path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z"/></svg>
            </div>
            <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center px-2 text-gray-700">
              <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z"/>
              </svg>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <label className="text-sm font-medium text-gray-700">Ngày diễn ra:</label>
          <button
            onClick={toggleSort}
            className="w-48 p-2 border rounded-md bg-white hover:bg-gray-50 flex items-center justify-center gap-2"
          >
            <svg
              className="w-4 h-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4h13M3 8h9m-9 4h6m4 0l4-4m0 0l4 4m-4-4v12" />
            </svg>
            <span>Ngày</span>
            <svg
              className={`w-4 h-4 transform ${sortOrder === 'asc' ? 'rotate-180' : ''}`}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </button>
        </div>
      </div>

      {loading ? (
        <div>Đang tải hoạt động...</div>
      ) : filteredActivities.length === 0 ? (
        <div>Chưa có hoạt động nào.</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {filteredActivities.map(act => (
            <div key={act.participationID || act.activityID} className="bg-white rounded-lg shadow-md overflow-hidden">
              <div className="w-full h-48 bg-gray-200 flex items-center justify-center text-gray-500">
                {/* Placeholder for activity image. Replace with <img src={act.imageUrl} alt={act.name} /> if image URL is available */}
                <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"></path></svg>
              </div>
              <div className="p-4">
                <h3 className="text-xl font-bold text-gray-900 mb-2">{act.name}</h3>
                <p className="text-gray-700 text-sm mb-1"><span className="font-semibold">Loại:</span> {act.type}</p>
                <p className="text-gray-700 text-sm mb-1"><span className="font-semibold">Thời gian:</span> {act.eventStart ? new Date(act.eventStart).toLocaleString() : ''}</p>
                <p className="text-gray-700 text-sm mb-1"><span className="font-semibold">Địa điểm:</span> {act.location}</p>
                <div className="mt-2">
                  <span className={`inline-block px-2 py-1 text-xs rounded font-semibold ${
                    act.participationStatus === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                      act.participationStatus === 'approved' ? 'bg-blue-100 text-blue-800' :
                        act.participationStatus === 'present' ? 'bg-green-100 text-green-800' :
                          act.participationStatus === 'rejected' ? 'bg-red-100 text-red-800' :
                            'bg-gray-100 text-gray-700'
                  }`}>
                    {act.participationStatus === 'pending' ? 'Chờ duyệt' :
                      act.participationStatus === 'approved' ? 'Đã duyệt' :
                        act.participationStatus === 'present' ? 'Đã tham gia' :
                          act.participationStatus === 'rejected' ? 'Bị từ chối' :
                            act.participationStatus}
                  </span>
                </div>
                <div className="mt-4 flex justify-between items-center">
                  <button
                    className="bg-blue-500 hover:bg-blue-600 text-white text-sm font-semibold py-2 px-4 rounded-md"
                    onClick={() => handleShowDetail(act)}
                  >
                    Xem chi tiết
                  </button>
                  {act.participationStatus !== 'present' && 
                   act.participationStatus !== 'cancelled' && 
                   act.participationStatus !== 'approved' && (
                    <button 
                      className="bg-red-500 hover:bg-red-600 text-white text-sm font-semibold py-2 px-4 rounded-md"
                      onClick={() => handleCancelRegistration(act.participationID)}
                    >
                      Hủy đăng ký
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

        {/* Activity Detail Modal */}
        {showDetailModal && selectedActivity && (
            <div className="fixed inset-0 bg-gray-600 bg-opacity-75 flex items-center justify-center z-50 p-4">
                <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-2xl relative max-h-[90vh] overflow-y-auto">
                    <button
                        onClick={handleCloseDetailModal}
                        className="absolute top-3 right-3 text-gray-500 hover:text-gray-700 transition-colors duration-200"
                    >
                        <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>

                    <h2 className="text-2xl font-bold text-gray-900 mb-4">
                        {selectedActivity.name}
                    </h2>

                    <div className="space-y-2 text-gray-700 text-base">
                        <p>
                            <span className="font-semibold">Mô tả:</span> {selectedActivity.description || 'Chưa có mô tả chi tiết.'}
                        </p>
                        <p>
                            <span className="font-semibold">Đơn vị tổ chức:</span> {selectedActivity.organizerName || 'Đang cập nhật'}
                        </p>
                        <p>
                            <span className="font-semibold">Thời gian:</span>
                            {selectedActivity.eventStart ? new Date(selectedActivity.eventStart).toLocaleString() : "N/A"} -
                            {selectedActivity.eventEnd ? new Date(selectedActivity.eventEnd).toLocaleString() : "N/A"}
                        </p>
                        <p>
                            <span className="font-semibold">Địa điểm:</span> {selectedActivity.location || 'Chưa xác định'}
                        </p>
                        <p>
                            <span className="font-semibold">Lĩnh vực:</span>
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-sm font-medium bg-blue-100 text-blue-800">
                                {selectedActivity.type || 'Chưa phân loại'}
                            </span>
                        </p>
                    </div>
                </div>
            </div>
        )}
    </div>
  );
}