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

    // Loại bỏ các hoạt động đã hủy
    filtered = filtered.filter(act => act.participationStatus !== 'Đã hủy');

    if (selectedType) {
      filtered = filtered.filter(act => act.type === selectedType);
    }

    // Lọc theo trạng thái nếu có chọn
    const allowedStatuses = [
      'Chờ duyệt',
      'Đã duyệt',
      'Đã tham gia',
      'Vắng',
      'Từ chối',
    ];
    if (selectedStatus && allowedStatuses.includes(selectedStatus)) {
      filtered = filtered.filter(act => act.participationStatus === selectedStatus);
    } else {
      filtered = filtered.filter(act => allowedStatuses.includes(act.participationStatus));
    }

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

      {/* Danh sách hoạt động đã đăng ký/tham gia */}
      <div className="mt-12">
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
            <label className="text-sm font-medium text-gray-700">Trạng thái:</label>
            <div className="relative">
              <select
                value={selectedStatus}
                onChange={e => setSelectedStatus(e.target.value)}
                className="appearance-none w-48 p-2 border rounded-md pr-8 pl-8"
              >
                <option value="">Tất cả</option>
                <option value="Đã tham gia">Đã tham gia</option>
                <option value="Đã duyệt">Đã duyệt</option>
                <option value="Chờ duyệt">Chờ duyệt</option>
                <option value="Từ chối">Từ chối</option>
                <option value="Vắng">Vắng</option>
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
        </div>
      </div>

      {filteredActivities.length === 0 ? (
        <div>Chưa có hoạt động nào.</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {filteredActivities.map(act => (
            <div key={act.participationID || act.activityID} className="bg-white rounded-lg shadow-md overflow-hidden">
              <div className="w-full h-48 bg-gray-200">
                <img
                  src={act.image || "https://via.placeholder.com/300x200"}
                  alt={act.name}
                  className="w-full h-48 object-cover"
                />
              </div>
              <div className="p-4">
                <h3 className="text-xl font-bold text-gray-900 mb-2">{act.name}</h3>
                <span className="inline-block mb-2 px-3 py-1 rounded-full bg-blue-100 text-blue-800 text-xs font-semibold">
                  {TYPE_LABELS[(act.type || '').trim().toLowerCase()] || act.type || 'Chưa phân loại'}
                </span>
                <p className="text-gray-700 text-sm mb-1"><span className="font-semibold">Thời gian:</span> {act.eventStart ? new Date(act.eventStart).toLocaleString() : ''}</p>
                <p className="text-gray-700 text-sm mb-1"><span className="font-semibold">Địa điểm:</span> {act.location}</p>
                <div className="mt-2">
                  <span className={`inline-block px-2 py-1 text-xs rounded font-semibold ${
                    act.participationStatus === 'Chờ duyệt' ? 'bg-yellow-100 text-yellow-800' :
                      act.participationStatus === 'Đã duyệt' ? 'bg-blue-100 text-blue-800' :
                        act.participationStatus === 'Đã tham gia' ? 'bg-green-100 text-green-800' :
                          act.participationStatus === 'Từ chối' ? 'bg-red-100 text-red-800' :
                            'bg-gray-100 text-gray-700'
                  }`}>
                    {act.participationStatus === 'Chờ duyệt' ? 'Chờ duyệt' :
                      act.participationStatus === 'Đã duyệt' ? 'Đã duyệt' :
                        act.participationStatus === 'Đã tham gia' ? 'Đã tham gia' :
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

                  {act.participationStatus !== 'Đã tham gia' && 
                   act.participationStatus !== 'Đã hủy' && 
                   act.participationStatus !== 'Đã duyệt' && (
                    <button 
                      className="bg-red-500 hover:bg-red-600 text-white text-sm font-semibold py-2 px-4 rounded-md"
                      onClick={() => handleCancelClick(act.participationID)}
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