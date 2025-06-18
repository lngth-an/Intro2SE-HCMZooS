import React, { useEffect, useState } from 'react';
import { useAuth } from "../../contexts/AuthContext";
import StudentActivityDetail from "./StudentActivityDetail";
import { toast } from 'react-toastify';
import axios from 'axios';

const API_BASE_URL = 'http://localhost:3001';

export default function StudentActivitiesContent() {
  const { user } = useAuth();
  const [activities, setActivities] = useState([]);
  const [filteredActivities, setFilteredActivities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedType, setSelectedType] = useState('');
  const [sortOrder, setSortOrder] = useState('desc');
  const [selected, setSelected] = useState(null);
  const [showDetail, setShowDetail] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ note: "" });
  const [confirm, setConfirm] = useState(false);
  const [success, setSuccess] = useState("");
  const [suggested, setSuggested] = useState([]);
  const [participationID, setParticipationID] = useState(null);
  const [isRegistered, setIsRegistered] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchActivities();
  }, []);

  const fetchActivities = async () => {
    try {
      const token = localStorage.getItem('accessToken');
      const response = await axios.get(`${API_BASE_URL}/student/activities?allStatus=true`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      setActivities(response.data.activities || []);
      setFilteredActivities(response.data.activities || []);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching activities:', error);
      toast.error('Không thể tải danh sách hoạt động');
      setLoading(false);
    }
  };

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
    setSelected(activity);
    setShowDetail(true);
    setShowForm(false);
    setError("");
    setSuccess("");
    setConfirm(false);
    setSuggested([]);
    
    // Check if student is already registered
    const token = localStorage.getItem('accessToken');
    axios.get(`${API_BASE_URL}/participation/check-registration/${activity.activityID}`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    })
      .then(response => {
        setIsRegistered(response.data.isRegistered);
      })
      .catch(error => {
        console.error("Error checking registration:", error);
        setIsRegistered(false);
      });
  };

  const handleCloseDetail = () => {
    setShowDetail(false);
    setSelected(null);
    setShowForm(false);
    setError("");
    setSuccess("");
    setConfirm(false);
    setSuggested([]);
    setIsRegistered(false);
  };

  const handleCancelRegistration = async (participationID) => {
    try {
      if (!window.confirm('Bạn có chắc chắn muốn hủy đăng ký hoạt động này?')) {
        return;
      }

      const token = localStorage.getItem('accessToken');
      await axios.delete(`${API_BASE_URL}/participation/${participationID}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      // Cập nhật lại danh sách hoạt động
      const updatedActivities = activities.map(activity => {
        if (activity.participationID === participationID) {
          return {
            ...activity,
            participationStatus: 'Đã hủy'
          };
        }
        return activity;
      });

      setActivities(updatedActivities);
      toast.success('Hủy đăng ký thành công!');
      handleCloseDetail();
      fetchActivities(); // Refresh the list
    } catch (error) {
      console.error('Error cancelling registration:', error);
      toast.error(error.response?.data?.error || 'Có lỗi xảy ra khi hủy đăng ký');
    }
  };

  const handleRegister = (activity) => {
    fetch(`${API_BASE_URL}/participation/check-eligibility/${activity.activityID}`, {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('accessToken')}`
      }
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.eligible) {
          setShowForm(true);
          setError("");
        } else {
          setError(data.reason || "Bạn không đủ điều kiện đăng ký hoạt động này");
          fetch(`${API_BASE_URL}/participation/suggest?domain=${activity.type}`, {
            headers: {
              'Authorization': `Bearer ${localStorage.getItem('accessToken')}`
            }
          })
            .then((res) => res.json())
            .then((data) => setSuggested(data.activities || []));
        }
      })
      .catch((error) => {
        console.error("Error checking eligibility:", error);
        setError("Có lỗi xảy ra, vui lòng thử lại!");
      });
  };

  const handleFormChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleFormSubmit = (e) => {
    e.preventDefault();
    setError("");
    fetch(`${API_BASE_URL}/participation/register`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        'Authorization': `Bearer ${localStorage.getItem('accessToken')}`
      },
      body: JSON.stringify({
        activityID: selected.activityID,
        note: form.note,
      }),
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.error) setError(data.error);
        else {
          setParticipationID(data.participation.participationID);
          setConfirm(true);
        }
      })
      .catch((error) => {
        console.error("Error registering:", error);
        setError("Đăng ký thất bại, vui lòng thử lại!");
      });
  };

  const handleConfirm = () => {
    fetch(`${API_BASE_URL}/participation/submit`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        'Authorization': `Bearer ${localStorage.getItem('accessToken')}`
      },
      body: JSON.stringify({ participationID }),
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.error) setError(data.error);
        else {
          setSuccess("Đăng ký thành công! Đơn đăng ký đã gửi tới đơn vị tổ chức.");
          setShowForm(false);
          setParticipationID(null);
          setIsRegistered(true);
          fetchActivities(); // Refresh the activities list
        }
      })
      .catch((error) => {
        console.error("Error submitting:", error);
        setError("Gửi đăng ký thất bại, vui lòng thử lại!");
      });
  };

  const handleTypeChange = (type) => {
    setSelectedType(type);
    if (type === '') {
      setFilteredActivities(activities);
    } else {
      setFilteredActivities(activities.filter(act => act.type === type));
    }
  };

  if (loading) {
    return <div className="text-center text-gray-500">Đang tải hoạt động...</div>;
  }

  if (error) {
    return <div className="text-center text-red-500">{error}</div>;
  }

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
              onChange={(e) => handleTypeChange(e.target.value)}
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

      {filteredActivities.length === 0 ? (
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
                    act.participationStatus === 'Chờ duyệt' ? 'bg-yellow-100 text-yellow-800' :
                      act.participationStatus === 'Đã duyệt' ? 'bg-blue-100 text-blue-800' :
                        act.participationStatus === 'present' ? 'bg-green-100 text-green-800' :
                          act.participationStatus === 'Từ chối' ? 'bg-red-100 text-red-800' :
                            'bg-gray-100 text-gray-700'
                  }`}>
                    {act.participationStatus === 'Chờ duyệt' ? 'Chờ duyệt' :
                      act.participationStatus === 'Đã duyệt' ? 'Đã duyệt' :
                        act.participationStatus === 'present' ? 'Đã tham gia' :
                          act.participationStatus === 'Từ chối' ? 'Bị từ chối' :
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
                   act.participationStatus !== 'Đã hủy' && 
                   act.participationStatus !== 'Đã duyệt' && (
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

      {showDetail && selected && (
        <StudentActivityDetail
          activity={selected}
          onClose={handleCloseDetail}
          onRegister={handleRegister}
          showForm={showForm}
          form={form}
          onFormChange={handleFormChange}
          onFormSubmit={handleFormSubmit}
          error={error}
          success={success}
          confirm={confirm}
          onConfirm={handleConfirm}
          onCancelConfirm={() => setConfirm(false)}
          suggested={suggested}
          isRegistered={isRegistered}
          isManagementView={true}
        />
      )}
    </div>
  );
}