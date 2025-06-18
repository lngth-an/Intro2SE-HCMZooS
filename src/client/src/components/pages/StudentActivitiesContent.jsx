import React, { useEffect, useState } from 'react';
import { useAuth } from "../../contexts/AuthContext";
import StudentActivityDetail from "./StudentActivityDetail";
import { toast } from 'react-toastify';
import axios from 'axios';
import { DOMAINS } from '../../constants/activityTypes';

const API_BASE_URL = 'http://localhost:3001';

export default function StudentActivitiesContent() {
  const { user } = useAuth();
  const [activities, setActivities] = useState([]);
  const [filteredActivities, setFilteredActivities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedType, setSelectedType] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('');
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
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [pendingCancelId, setPendingCancelId] = useState(null);

  const ALL_TYPES = [
    'Học thuật',
    'Tình nguyện',
    'Thể thao',
    'Kỹ năng',
    'Nghệ thuật',
    'Hội thảo',
    'Khác',
  ];
  const uniqueTypes = ALL_TYPES;

  const TYPE_LABELS = {
    'học thuật': 'Học thuật',
    'tình nguyện': 'Tình nguyện',
    'thể thao': 'Thể thao',
    'kỹ năng': 'Kỹ năng',
    'nghệ thuật': 'Nghệ thuật',
    'hội thảo': 'Hội thảo',
    'khác': 'Khác',
  };

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

    // Loại bỏ các hoạt động đã hủy và từ chối
    filtered = filtered.filter(
      act => act.participationStatus !== 'Đã hủy' && act.participationStatus !== 'Từ chối'
    );

    if (selectedType) {
      filtered = filtered.filter(act => act.type === selectedType);
    }

    // Lọc theo trạng thái nếu có chọn
    const allowedStatuses = [
      'Chờ duyệt',
      'Đã duyệt',
      'Đã tham gia',
      'Vắng'
    ];
    if (selectedStatus && allowedStatuses.includes(selectedStatus)) {
      filtered = filtered.filter(act => act.participationStatus === selectedStatus);
    } else {
      filtered = filtered.filter(act => allowedStatuses.includes(act.participationStatus));
    }

    // Sắp xếp theo ưu tiên trạng thái
    const statusPriority = {
      'Chờ duyệt': 1,
      'Đã duyệt': 2,
      'Đã tham gia': 3,
      'Vắng': 4
    };
    filtered = filtered.sort((a, b) => {
      return (statusPriority[a.participationStatus] || 99) - (statusPriority[b.participationStatus] || 99);
    });

    setFilteredActivities(filtered);
  }, [selectedType, activities, selectedStatus]);

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

  const handleCancelClick = (participationID) => {
    setPendingCancelId(participationID);
    setShowCancelModal(true);
  };

  const handleCancelConfirm = async () => {
    if (pendingCancelId) {
      await handleCancelRegistration(pendingCancelId);
      setPendingCancelId(null);
      setShowCancelModal(false);
    }
  };

  const handleCancelClose = () => {
    setPendingCancelId(null);
    setShowCancelModal(false);
  };

  const handleCancelRegistration = async (participationID) => {
    try {
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
  };

  const renderActivityCard = (activity) => {
    const domain = DOMAINS.find(d => d.id === activity.type);
    const points = domain ? domain.defaultPoint : 3;
    
    return (
      <div
        key={activity.activityID}
        className="bg-white rounded-lg shadow-md overflow-hidden"
      >
        <div className="w-full h-48 bg-gray-200">
          <img
            src={activity.image || "https://via.placeholder.com/300x200"}
            alt={activity.name}
            className="w-full h-48 object-cover"
          />
        </div>
        <div className="p-4">
          <h3 className="text-lg font-semibold text-gray-900 mb-2">{activity.name}</h3>
          <div className="flex items-center space-x-2 mb-3">
            <span className={`px-3 py-1 rounded-full text-sm font-medium ${domain?.color || 'bg-gray-100 text-gray-800'}`}>
              {activity.type}
            </span>
            <span className="px-3 py-1 rounded-full text-sm font-medium bg-yellow-100 text-yellow-800">
              {points} điểm
            </span>
          </div>
          <div className="text-sm text-gray-600 mb-2">
            <p>Thời gian: {new Date(activity.eventStart).toLocaleString()}</p>
            <p>Địa điểm: {activity.location}</p>
          </div>
          <div className="flex justify-between items-center mt-2">
            <div className="text-sm">
              <span className={`px-2 py-1 rounded ${
                activity.participationStatus === 'Đã tham gia' ? 'bg-green-100 text-green-800' :
                activity.participationStatus === 'Vắng' ? 'bg-red-100 text-red-800' :
                activity.participationStatus === 'Đã duyệt' ? 'bg-blue-100 text-blue-800' :
                activity.participationStatus === 'Chờ duyệt' ? 'bg-yellow-100 text-yellow-800' :
                activity.participationStatus === 'Từ chối' ? 'bg-gray-100 text-gray-800' :
                'bg-gray-100 text-gray-800'
              }`}>
                {activity.participationStatus}
              </span>
            </div>
            {activity.participationStatus === 'Đã tham gia' && (
              <div className="text-sm font-medium text-green-600">
                Điểm đã nhận: {activity.trainingPoint || points}
              </div>
            )}
          </div>
          <div className="mt-4 flex justify-between items-center">
            <button
              className="bg-blue-500 hover:bg-blue-600 text-white text-sm font-semibold py-2 px-4 rounded-md"
              onClick={() => handleShowDetail(activity)}
            >
              Xem chi tiết
            </button>

            {activity.participationStatus !== 'Đã tham gia' && 
             activity.participationStatus !== 'Đã hủy' && 
             activity.participationStatus !== 'Đã duyệt' && 
             activity.participationStatus !== 'Vắng' &&
              (
              <button 
                className="bg-red-500 hover:bg-red-600 text-white text-sm font-semibold py-2 px-4 rounded-md"
                onClick={() => handleCancelClick(activity.participationID)}
              >
                Hủy đăng ký
              </button>
            )}
          </div>
        </div>
      </div>
    );
  };

  if (loading) {
    return <div className="text-center text-gray-500">Đang tải hoạt động...</div>;
  }

  if (error) {
    return <div className="text-center text-red-500">{error}</div>;
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="space-y-3 order-1">
        <h1 className="text-4xl font-extrabold text-gray-900 tracking-tight">QUẢN LÝ HOẠT ĐỘNG</h1>
        <p className="text-xl text-gray-700 font-medium">Xem và quản lý các hoạt động bạn đã đăng ký tham gia.</p>
      </div>

      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">Danh sách hoạt động</h2>
        <div className="flex flex-wrap gap-2 mb-4">
          <button
            onClick={() => setSelectedType('')}
            className={`px-4 py-2 rounded-full text-sm font-medium ${
              !selectedType ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-800 hover:bg-gray-200'
            }`}
          >
            Tất cả
          </button>
          {uniqueTypes.map((type) => {
            const domain = DOMAINS.find(d => d.id === type);
            return (
              <button
                key={type}
                onClick={() => setSelectedType(type)}
                className={`px-4 py-2 rounded-full text-sm font-medium ${
                  selectedType === type ? domain?.selectedColor : domain?.color
                }`}
              >
                {type}
              </button>
            );
          })}
        </div>
        <div className="flex flex-wrap gap-2 mb-4">
          <button
            onClick={() => setSelectedStatus('')}
            className={`px-4 py-2 rounded-full text-sm font-medium ${
              !selectedStatus ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-800 hover:bg-gray-200'
            }`}
          >
            Tất cả trạng thái
          </button>
          {['Chờ duyệt', 'Đã duyệt', 'Đã tham gia', 'Vắng', 'Từ chối'].map((status) => (
            <button
              key={status}
              onClick={() => setSelectedStatus(status)}
              className={`px-4 py-2 rounded-full text-sm font-medium ${
                selectedStatus === status
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-800 hover:bg-gray-200'
              }`}
            >
              {status}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <div>Loading...</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredActivities
            .filter(activity => activity.participationStatus !== 'Đã hủy' && activity.participationStatus !== 'Từ chối')
            .map(activity => renderActivityCard(activity))}
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
      {showCancelModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
          <div className="bg-white rounded-lg shadow-lg p-6 max-w-sm w-full">
            <h3 className="text-lg font-semibold mb-4 text-gray-900">Xác nhận hủy đăng ký</h3>
            <p className="mb-6 text-gray-700">Bạn có chắc chắn muốn hủy đăng ký hoạt động này không?</p>
            <div className="flex justify-end gap-3">
              <button
                className="px-4 py-2 rounded bg-gray-200 text-gray-800 hover:bg-gray-300"
                onClick={handleCancelClose}
              >
                Không
              </button>
              <button
                className="px-4 py-2 rounded bg-red-500 text-white hover:bg-red-600"
                onClick={handleCancelConfirm}
              >
                Có, hủy đăng ký
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}