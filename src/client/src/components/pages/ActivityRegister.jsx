import React, { useEffect, useState } from "react";
import Header from '../../components/common/Header';
import SidebarStudent from '../../components/common/SidebarStudent';
import Footer from '../../components/common/Footer';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { toast } from 'react-toastify';
import { Link } from 'react-router-dom';
import { FaSearch, FaFilter } from 'react-icons/fa';
import { DOMAINS } from '../../constants/activityTypes';

function ActivityRegister() {
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // Filter States
  const [searchTerm, setSearchTerm] = useState("");
  const [organizerSearch, setOrganizerSearch] = useState("");
  // XÓA minRegistrations và maxRegistrations ở đây
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [selectedDomain, setSelectedDomain] = useState(""); // Renamed from 'domain' to avoid conflict

  // Modal States
  const [selectedActivity, setSelectedActivity] = useState(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [showRegisterForm, setShowRegisterForm] = useState(false);
  const [registrationNote, setRegistrationNote] = useState("");
  const [suggestedActivities, setSuggestedActivities] = useState([]);
  const [participationID, setParticipationID] = useState(null); // Used for confirmation step

  const navigate = useNavigate();
  // Vẫn giữ lại user, logout vì bạn đã xử lý warning bằng cách sử dụng chúng
  const { user, logout } = useAuth();

  // --- Fetch Activities based on filters ---
  useEffect(() => {
    const fetchActivities = async () => {
      setLoading(true);
      setError("");
      setActivities([]); // Clear previous activities

      const queryParams = new URLSearchParams();
      if (searchTerm) queryParams.append("search", searchTerm);
      if (organizerSearch) queryParams.append("organizerName", organizerSearch);
      // XÓA các dòng này:
      // if (minRegistrations) queryParams.append("minRegistrations", minRegistrations);
      // if (maxRegistrations) queryParams.append("maxRegistrations", maxRegistrations);
      if (startDate) queryParams.append("eventStart", startDate);
      if (endDate) queryParams.append("eventEnd", endDate);
      if (selectedDomain) queryParams.append("type", selectedDomain);

      try {
        const response = await axios.get(
          `/student/activities/search?${queryParams.toString()}`
        );
        setActivities(response.data.activities || []);
      } catch (err) {
        console.error("Error fetching activities:", err);
        setError("Không thể tải hoạt động. Vui lòng thử lại.");
      } finally {
        setLoading(false);
      }
    };

    // Debounce search/filter inputs to avoid excessive API calls
    const handler = setTimeout(() => {
      fetchActivities();
    }, 500); // Wait 500ms after user stops typing

    return () => {
      clearTimeout(handler);
    };
  }, [
    searchTerm,
    organizerSearch,
    /* XÓA minRegistrations, maxRegistrations ở đây */ startDate,
    endDate,
    selectedDomain,
  ]);

  // --- Handlers for Activity Details and Registration ---

  const handleShowDetail = (activity) => {
    setSelectedActivity(activity);
    setShowDetailModal(true);
    setShowRegisterForm(false);
    setError("");
    setSuccess("");
    setSuggestedActivities([]);
    setRegistrationNote(""); // Clear note when opening new detail
  };

  const handleCloseDetailModal = () => {
    setShowDetailModal(false);
    setSelectedActivity(null);
    setShowRegisterForm(false);
    setError("");
    setSuccess("");
    setSuggestedActivities([]);
  };

  const handleRegisterEligibilityCheck = async () => {
    if (!selectedActivity) return;
    setError("");
    setSuccess("");
    setSuggestedActivities([]);

    try {
      const response = await axios.get(
        `/participation/check-eligibility/${selectedActivity.activityID}`
      );
      const data = response.data;

      if (data.eligible) {
        setShowRegisterForm(true);
      } else {
        setError(
          data.reason || "Bạn không đủ điều kiện đăng ký hoạt động này."
        );
        // Suggest similar activities
        const suggestResponse = await axios.get(
          `/participation/suggest?domain=${selectedActivity.type}`
        );
        setSuggestedActivities(suggestResponse.data.activities || []);
      }
    } catch (err) {
      console.error("Error checking eligibility:", err);
      setError("Có lỗi xảy ra khi kiểm tra điều kiện. Vui lòng thử lại.");
    }
  };

  const handleRegistrationSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    try {
      const response = await axios.post("/participation/register", {
        activityID: selectedActivity.activityID,
        note: registrationNote,
      });

      const data = response.data;
      if (data.error) {
        setError(data.error);
      } else {
        setParticipationID(data.participation.participationID);
        setSuccess("Đơn đăng ký đã được tạo. Vui lòng xác nhận.");
      }
    } catch (err) {
      console.error("Error registering:", err);
      setError("Có lỗi xảy ra khi gửi đăng ký. Vui lòng thử lại.");
    }
  };

  const handleConfirmRegistration = async () => {
    setError("");
    setSuccess("");

    if (!participationID) {
      setError("Không có đơn đăng ký nào để xác nhận.");
      return;
    }

    try {
      const response = await axios.post("/participation/submit", {
        participationID,
      });
      const data = response.data;

            if (data.error) {
                setError(data.error);
            } else {
          setSuccess("Đăng ký thành công! Đơn đăng ký đã gửi tới đơn vị tổ chức.");
                setShowRegisterForm(false);
          setParticipationID(null);
            }
        } catch (err) {
            console.error("Error confirming registration:", err);
            setError("Có lỗi xảy ra khi xác nhận đăng ký. Vui lòng thử lại.");
        }
    };

    const handleDeleteDraft = async () => {
        try {
            const response = await fetch('/participation/delete-draft', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ participationID }),
            });

            if (!response.ok) {
                throw new Error('Failed to delete draft');
            }

            setParticipationID(null);
            setSuccess("");
            toast.success('Đã hủy đăng ký thành công');
        } catch (error) {
            console.error('Error deleting draft:', error);
            toast.error('Có lỗi xảy ra khi hủy đăng ký');
        }
    };

  const isRegistrationOpen =
    selectedActivity &&
    new Date() >= new Date(selectedActivity.registrationStart) &&
    new Date() <= new Date(selectedActivity.registrationEnd);

  const handleLogout = async () => {
    try {
      await axios.post("/auth/logout");
      localStorage.removeItem("accessToken");
      localStorage.removeItem("role");
      localStorage.removeItem("userID");
      localStorage.removeItem("user");
      toast.success("Đăng xuất thành công");
      navigate("/login");
    } catch (error) {
      toast.error("Có lỗi xảy ra khi đăng xuất");
    }
  };

  const renderActivityCard = (activity) => {
    const domain = DOMAINS.find(d => d.id === activity.type);
    const points = domain ? domain.defaultPoint : 3;

    return (
      <div
        key={activity.activityID}
        className="bg-white rounded-lg shadow-md overflow-hidden cursor-pointer hover:shadow-lg transition-shadow"
        onClick={() => handleShowDetail(activity)}
      >
        <div className="relative">
          <img
            src={activity.image || "https://via.placeholder.com/400x200"}
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
          <div className="text-sm text-gray-600 space-y-1">
            <p>Đơn vị tổ chức: {activity.organizerName}</p>
            <p>Thời gian: {new Date(activity.eventStart).toLocaleString()}</p>
            <p>Địa điểm: {activity.location}</p>
            {activity.maxParticipants && (
              <p>Số lượng: {activity.maxParticipants} người</p>
            )}
          </div>
          <div className="mt-4 text-sm">
            <span className="text-blue-600 hover:text-blue-800">
              Xem chi tiết →
            </span>
          </div>
        </div>
      </div>
    );
  };

  const renderActivityCard = (activity) => {
    const domain = DOMAINS.find(d => d.id === activity.type);
    const points = domain ? domain.defaultPoint : 3;

    return (
      <div
        key={activity.activityID}
        className="bg-white rounded-lg shadow-md overflow-hidden cursor-pointer hover:shadow-lg transition-shadow"
        onClick={() => handleShowDetail(activity)}
      >
        <div className="relative">
          <img
            src={activity.image || "https://via.placeholder.com/400x200"}
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
          <div className="text-sm text-gray-600 space-y-1">
            <p>Đơn vị tổ chức: {activity.organizerName}</p>
            <p>Thời gian: {new Date(activity.eventStart).toLocaleString()}</p>
            <p>Địa điểm: {activity.location}</p>
            {activity.maxParticipants && (
              <p>Số lượng: {activity.maxParticipants} người</p>
            )}
          </div>
          <div className="mt-4 text-sm">
            <span className="text-blue-600 hover:text-blue-800">
              Xem chi tiết →
            </span>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Header onLogout={handleLogout} />

      <div className="flex flex-1 pt-16">
        <SidebarStudent onLogout={handleLogout} />

        <div className="flex-1 flex flex-col ml-64">
          <main className="flex-1 p-6">
            <div className="max-w-7xl mx-auto">
              {/* Page Header */}
              <div className="mb-8">
                <h1 className="text-2xl font-bold text-gray-900">Đăng ký hoạt động</h1>
                <p className="mt-2 text-sm text-gray-600">
                  Tìm và đăng ký tham gia các hoạt động phù hợp với bạn
                </p>
              </div>

              {/* Search and Filter Section */}
              <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {/* Search by Name */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Tên hoạt động
                    </label>
                    <div className="relative">
                      <input
                        type="text"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        placeholder="Tìm theo tên..."
                        className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                      />
                      <FaSearch className="absolute left-3 top-3 text-gray-400" />
                    </div>
                  </div>

                  {/* Search by Organizer */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Đơn vị tổ chức
                    </label>
                    <input
                      type="text"
                      value={organizerSearch}
                      onChange={(e) => setOrganizerSearch(e.target.value)}
                      placeholder="Tìm theo đơn vị..."
                      className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>

                  {/* Filter by Domain */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Lĩnh vực
                    </label>
                    <select
                      value={selectedDomain}
                      onChange={(e) => setSelectedDomain(e.target.value)}
                      className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                    >
                      <option value="">Tất cả lĩnh vực</option>
                      {DOMAINS.map((domain) => (
                        <option key={domain.id} value={domain.id}>
                          {domain.id}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Date Range */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Từ ngày
                    </label>
                    <input
                      type="date"
                      value={startDate}
                      onChange={(e) => setStartDate(e.target.value)}
                      className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Đến ngày
                    </label>
                    <input
                      type="date"
                      value={endDate}
                      onChange={(e) => setEndDate(e.target.value)}
                      className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                </div>
              </div>

              {/* Activities Grid */}
              {loading ? (
                <div className="text-center py-8">Đang tải...</div>
              ) : error ? (
                <div className="text-center py-8 text-red-600">{error}</div>
              ) : activities.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  Không tìm thấy hoạt động nào
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {activities.map(activity => renderActivityCard(activity))}
                </div>
              )}
            </div>
          </main>
          <Footer />
        </div>
      </div>

      {/* Activity Detail Modal */}
      {showDetailModal && selectedActivity && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg max-w-4xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-start mb-4">
                <h2 className="text-2xl font-bold text-gray-900">
                  {selectedActivity.name}
                </h2>
                <button
                  onClick={handleCloseDetailModal}
                  className="text-gray-500 hover:text-gray-700"
                >
                  ×
                </button>
              </div>

              <div className="space-y-2 text-gray-700 text-base">
                <p>
                  <span className="font-semibold">Mô tả:</span> {selectedActivity.description || 'Chưa có mô tả chi tiết.'}
                </p>
                <p>
                  <span className="font-semibold">Đơn vị tổ chức:</span> {selectedActivity.organizerName || 'Đang cập nhật'}
                </p>
                <p>
                  <span className="font-semibold">Thời gian:</span>{" "}
                  {selectedActivity.eventStart ? new Date(selectedActivity.eventStart).toLocaleString() : "N/A"} -{" "}
                  {selectedActivity.eventEnd ? new Date(selectedActivity.eventEnd).toLocaleString() : "N/A"}
                </p>
                <p>
                  <span className="font-semibold">Địa điểm:</span> {selectedActivity.location || 'Chưa xác định'}
                </p>
                <p>
                  <span className="font-semibold">Lĩnh vực:</span>{" "}
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-sm font-medium bg-blue-100 text-blue-800">
                    {DOMAINS.find(d => d.id === selectedActivity.type)?.label || selectedActivity.type || 'Chưa phân loại'}
                  </span>
                </p>
                <p>
                  <span className="font-semibold">Số lượng tối đa:</span> {selectedActivity.capacity ? `${selectedActivity.capacity} người` : "Không giới hạn"}
                </p>
                <p>
                  <span className="font-semibold">Trạng thái hoạt động:</span>{" "}
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium
                    ${selectedActivity.activityStatus === 'Open' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}`}>
                    {selectedActivity.activityStatus || 'N/A'}
                  </span>
                </p>
                <p>
                  <span className="font-semibold">Thời gian đăng ký:</span>{" "}
                  {selectedActivity.registrationStart ? new Date(selectedActivity.registrationStart).toLocaleString() : "N/A"} -{" "}
                  {selectedActivity.registrationEnd ? new Date(selectedActivity.registrationEnd).toLocaleString() : "N/A"}
                </p>
              </div>

              {/* Registration Status / Button */}
              <div className="mt-6 pt-4 border-t border-gray-200">
                {!isRegistrationOpen ? (
                  <div className="bg-yellow-50 border border-yellow-200 text-yellow-800 p-3 rounded-md text-sm">
                    Hoạt động này hiện tại chưa mở đăng ký.
                  </div>
                ) : (
                  <>
                    {!showRegisterForm && !success && !error && (
                      <button
                        className="w-full bg-green-600 text-white py-3 rounded-md text-lg font-bold hover:bg-green-700 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2"
                        onClick={handleRegisterEligibilityCheck}
                      >
                        Đăng ký
                      </button>
                    )}

                    {/* Registration Form */}
                    {showRegisterForm && !success && (
                      <form onSubmit={handleRegistrationSubmit} className="mt-4 bg-gray-50 p-4 rounded-lg shadow-sm">
                        <div className="mb-4">
                          <label htmlFor="note" className="block text-sm font-medium text-gray-700 mb-1">
                            Ghi chú (Tùy chọn)
                          </label>
                          <textarea
                            id="note"
                            name="note"
                            rows="3"
                            className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm p-2"
                            value={registrationNote}
                            onChange={(e) => setRegistrationNote(e.target.value)}
                            placeholder="Nhập ghi chú của bạn (ví dụ: yêu cầu đặc biệt)..."
                          ></textarea>
                        </div>
                        <div className="flex justify-end space-x-3">
                          <button
                            type="button"
                            className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
                            onClick={() => setShowRegisterForm(false)}
                          >
                            Hủy
                          </button>
                          <button
                            type="submit"
                            className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                          >
                            Gửi đăng ký
                          </button>
                        </div>
                      </form>
                    )}

                    {/* Confirmation Message */}
                    {participationID && success && (
                      <div className="mt-4 p-4 rounded-lg bg-yellow-50 border border-yellow-200 text-yellow-800 text-center">
                        <p className="font-semibold mb-2">{success}</p>
                        <button
                          className="inline-flex justify-center py-2 px-5 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
                          onClick={handleConfirmRegistration}
                        >
                          Xác nhận cuối cùng
                        </button>
                        <button
                          className="ml-3 inline-flex justify-center py-2 px-5 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
                          onClick={handleDeleteDraft}
                        >
                          Hủy
                        </button>
                      </div>
                    )}
                  </>
                )}

                {/* Error/Success Messages */}
                {error && (
                  <div className="mt-4 p-4 rounded-md bg-red-50 border border-red-200 text-red-700 text-center font-medium">
                    {error}
                  </div>
                )}
                {success && !participationID && (
                  <div className="mt-4 p-4 rounded-md bg-green-50 border border-green-200 text-green-700 text-center font-medium">
                    {success}
                  </div>
                )}

                {/* Suggested Activities */}
                {suggestedActivities.length > 0 && (
                  <div className="mt-6 pt-4 border-t border-gray-200">
                    <h3 className="text-lg font-semibold text-gray-800 mb-3">Hoạt động tương tự có thể bạn quan tâm:</h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {suggestedActivities.map((a) => (
                        <div key={a.activityID} className="bg-gray-100 p-4 rounded-md shadow-sm">
                          <h4 className="text-base font-semibold text-gray-800">{a.name}</h4>
                          <p className="text-sm text-gray-600 mb-2">
                            {a.eventStart ? new Date(a.eventStart).toLocaleDateString() : ""} - {a.location || ''}
                          </p>
                          <button
                            className="text-blue-600 hover:underline text-sm font-medium"
                            onClick={() => {
                              handleCloseDetailModal();
                              handleShowDetail(a);
                            }}
                          >
                            Xem chi tiết
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default ActivityRegister;
