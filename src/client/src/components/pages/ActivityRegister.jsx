import React, { useEffect, useState } from "react";
import Header from "../../components/common/Header";
import SidebarStudent from "../../components/common/SidebarStudent";
import Footer from "../../components/common/Footer";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";
import { toast } from "react-toastify";

// You might want to define a more comprehensive list of domains, maybe from your backend
const DOMAINS = [
  { id: "Học thuật", label: "Học thuật" },
  { id: "Tình nguyện", label: "Tình nguyện" },
  // { id: "Hội thảo", label: "Hội thảo" },
  { id: "Thể thao", label: "Thể thao" },
  { id: "Kỹ năng", label: "Kỹ năng" },
  { id: "Nghệ thuật", label: "Nghệ thuật" },
  { id: "Hội thảo", label: "Hội thảo" },
  { id: "Khác", label: "Khác" },
];

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
        setSuccess(
          "Đăng ký thành công! Đơn đăng ký đã gửi tới đơn vị tổ chức."
        );
        setShowRegisterForm(false);
        setParticipationID(null);
      }
    } catch (err) {
      console.error("Error confirming registration:", err);
      setError("Có lỗi xảy ra khi xác nhận đăng ký. Vui lòng thử lại.");
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
                <h1 className="text-4xl font-extrabold text-gray-900 tracking-tight">
                  ĐĂNG KÝ HOẠT ĐỘNG
                </h1>
                <p className="mt-2 text-base text-gray-600">
                  Tìm kiếm và đăng ký các hoạt động phù hợp với bạn
                </p>
              </div>

              {/* Search and Filter Section */}
              <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
                <h2 className="text-xl font-semibold text-gray-800 mb-4">
                  Tìm kiếm & Lọc
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
                  {/* Search by Name */}
                  <div>
                    <label
                      htmlFor="searchTerm"
                      className="block text-sm font-medium text-gray-700"
                    >
                      Tên hoạt động
                    </label>
                    <input
                      type="text"
                      id="searchTerm"
                      className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm p-2"
                      placeholder="Tìm theo tên hoạt động..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                    />
                  </div>
                  {/* Search by Organizer */}
                  <div>
                    <label
                      htmlFor="organizerSearch"
                      className="block text-sm font-medium text-gray-700"
                    >
                      Đơn vị tổ chức
                    </label>
                    <input
                      type="text"
                      id="organizerSearch"
                      className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm p-2"
                      placeholder="Tìm theo tên đơn vị..."
                      value={organizerSearch}
                      onChange={(e) => setOrganizerSearch(e.target.value)}
                    />
                  </div>
                  {/* Filter by Date Range */}
                  {/* Lưu ý: Sau khi xóa phần Registrations, nếu bạn muốn giữ layout 3 cột, bạn có thể cần chỉnh lại col-span hoặc thêm một trường lọc khác vào đây. */}
                  <div className="col-span-1 md:col-span-2 lg:col-span-1 grid grid-cols-2 gap-4">
                    <div>
                      <label
                        htmlFor="startDate"
                        className="block text-sm font-medium text-gray-700"
                      >
                        Từ ngày
                      </label>
                      <input
                        type="date"
                        id="startDate"
                        className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm p-2"
                        value={startDate}
                        onChange={(e) => setStartDate(e.target.value)}
                      />
                    </div>
                    <div>
                      <label
                        htmlFor="endDate"
                        className="block text-sm font-medium text-gray-700"
                      >
                        Đến ngày
                      </label>
                      <input
                        type="date"
                        id="endDate"
                        className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm p-2"
                        value={endDate}
                        onChange={(e) => setEndDate(e.target.value)}
                      />
                    </div>
                  </div>
                  {/* XÓA KHỐI DIV DƯỚI ĐÂY: Filter by Registrations (Optional, can be removed if not practical) */}
                  {/* <div className="col-span-1 md:col-span-2 lg:col-span-1 grid grid-cols-2 gap-4">
                                        <div>
                                            <label htmlFor="minRegistrations" className="block text-sm font-medium text-gray-700">Đăng ký từ</label>
                                            <input
                                                type="number"
                                                id="minRegistrations"
                                                className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm p-2"
                                                placeholder="Min"
                                                value={minRegistrations}
                                                onChange={(e) => setMinRegistrations(e.target.value)}
                                            />
                                        </div>
                                        <div>
                                            <label htmlFor="maxRegistrations" className="block text-sm font-medium text-gray-700">Đến</label>
                                            <input
                                                type="number"
                                                id="maxRegistrations"
                                                className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm p-2"
                                                placeholder="Max"
                                                value={maxRegistrations}
                                                onChange={(e) => setMaxRegistrations(e.target.value)}
                                            />
                                        </div>
                                    </div> */}
                </div>

                {/* Domain Filter Pills */}
                <div className="mb-4">
                  <span className="block text-sm font-medium text-gray-700 mb-2">
                    Lọc theo lĩnh vực:
                  </span>
                  <div className="flex flex-wrap gap-2">
                    <button
                      className={`px-4 py-2 rounded-full text-sm font-medium transition-colors duration-200
                                                ${
                                                  !selectedDomain
                                                    ? "bg-blue-600 text-white shadow"
                                                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                                                }`}
                      onClick={() => setSelectedDomain("")}
                    >
                      Tất cả
                    </button>
                    {DOMAINS.map((d) => (
                      <button
                        key={d.id}
                        className={`px-4 py-2 rounded-full text-sm font-medium transition-colors duration-200
                                                    ${
                                                      selectedDomain === d.id
                                                        ? "bg-blue-600 text-white shadow"
                                                        : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                                                    }`}
                        onClick={() => setSelectedDomain(d.id)}
                      >
                        {d.label}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Activity List */}
              <div className="bg-white rounded-lg shadow-sm overflow-hidden">
                <div className="px-6 py-4 border-b border-gray-200">
                  <h2 className="text-xl font-semibold text-gray-800">
                    Danh sách hoạt động
                  </h2>
                </div>
                {loading ? (
                  <div className="p-6 text-center text-gray-500">
                    Đang tải hoạt động...
                  </div>
                ) : error ? (
                  <div className="p-6 text-center text-red-600">{error}</div>
                ) : activities.length === 0 ? (
                  <div className="p-6 text-center text-gray-500">
                    Không tìm thấy hoạt động nào phù hợp.
                  </div>
                ) : (
                  <div className="p-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {activities
                      .slice() // copy mảng để không ảnh hưởng state
                      .sort(
                        (a, b) =>
                          new Date(a.registrationStart) -
                          new Date(b.registrationStart)
                      )
                      .map((a) => (
                        <div
                          key={a.activityID}
                          className="bg-white rounded-lg shadow-sm overflow-hidden hover:shadow-md transition-shadow duration-200"
                        >
                          <div className="p-4">
                            <img
                              src={
                                a.image || "https://via.placeholder.com/300x200"
                              }
                              alt={a.name}
                              className="w-full h-48 object-cover rounded-lg mb-4"
                            />
                            <h3 className="text-lg font-semibold text-gray-900 mb-2">
                              {a.name}
                            </h3>
                            <p className="text-sm text-gray-600 mb-1">
                              <span className="font-semibold">Đơn vị:</span>{" "}
                              {a.organizerName || "Đang cập nhật"}
                            </p>
                            <p className="text-sm text-gray-600 mb-1">
                              <span className="font-semibold">Thời gian:</span>{" "}
                              {a.eventStart
                                ? new Date(a.eventStart).toLocaleString()
                                : ""}
                            </p>
                            <p className="text-sm text-gray-600 mb-1">
                              <span className="font-semibold">Địa điểm:</span>{" "}
                              {a.location || "Chưa xác định"}
                            </p>
                            <p className="text-sm text-gray-600">
                              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                                {DOMAINS.find((d) => d.id === a.type)?.label ||
                                  a.type ||
                                  "Chưa phân loại"}
                              </span>
                            </p>
                          </div>
                          <div className="p-5 border-t border-gray-200">
                            <button
                              className="w-full bg-blue-600 text-white py-2 px-4 rounded-md text-base font-semibold hover:bg-blue-700 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                              onClick={() => handleShowDetail(a)}
                            >
                              Xem chi tiết
                            </button>
                          </div>
                        </div>
                      ))}
                  </div>
                )}
              </div>
            </div>
          </main>
          <Footer />
        </div>
      </div>

      {/* Activity Detail Modal */}
      {showDetailModal && selectedActivity && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-75 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-2xl relative max-h-[90vh] overflow-y-auto">
            <button
              onClick={handleCloseDetailModal}
              className="absolute top-3 right-3 text-gray-500 hover:text-gray-700 transition-colors duration-200"
            >
              <svg
                className="h-6 w-6"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>

            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              {selectedActivity.name}
            </h2>

            <div className="space-y-2 text-gray-700 text-base">
              <p>
                <span className="font-semibold">Mô tả:</span>{" "}
                {selectedActivity.description || "Chưa có mô tả chi tiết."}
              </p>
              <p>
                <span className="font-semibold">Đơn vị tổ chức:</span>{" "}
                {selectedActivity.organizerName || "Đang cập nhật"}
              </p>
              <p>
                <span className="font-semibold">Thời gian:</span>{" "}
                {selectedActivity.eventStart
                  ? new Date(selectedActivity.eventStart).toLocaleString()
                  : "N/A"}{" "}
                -{" "}
                {selectedActivity.eventEnd
                  ? new Date(selectedActivity.eventEnd).toLocaleString()
                  : "N/A"}
              </p>
              <p>
                <span className="font-semibold">Địa điểm:</span>{" "}
                {selectedActivity.location || "Chưa xác định"}
              </p>
              <p>
                <span className="font-semibold">Lĩnh vực:</span>{" "}
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-sm font-medium bg-blue-100 text-blue-800">
                  {DOMAINS.find((d) => d.id === selectedActivity.type)?.label ||
                    selectedActivity.type ||
                    "Chưa phân loại"}
                </span>
              </p>
              <p>
                <span className="font-semibold">Số lượng tối đa:</span>{" "}
                {selectedActivity.capacity
                  ? `${selectedActivity.capacity} người`
                  : "Không giới hạn"}
              </p>
              <p>
                <span className="font-semibold">Trạng thái hoạt động:</span>{" "}
                <span
                  className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium
                                    ${
                                      selectedActivity.activityStatus === "Open"
                                        ? "bg-green-100 text-green-800"
                                        : "bg-yellow-100 text-yellow-800"
                                    }`}
                >
                  {selectedActivity.activityStatus || "N/A"}
                </span>
              </p>
              <p>
                <span className="font-semibold">Thời gian đăng ký:</span>{" "}
                {selectedActivity.registrationStart
                  ? new Date(
                      selectedActivity.registrationStart
                    ).toLocaleString()
                  : "N/A"}{" "}
                -{" "}
                {selectedActivity.registrationEnd
                  ? new Date(selectedActivity.registrationEnd).toLocaleString()
                  : "N/A"}
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
                    <form
                      onSubmit={handleRegistrationSubmit}
                      className="mt-4 bg-gray-50 p-4 rounded-lg shadow-sm"
                    >
                      <div className="mb-4">
                        <label
                          htmlFor="note"
                          className="block text-sm font-medium text-gray-700 mb-1"
                        >
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
                        onClick={() => {
                          setParticipationID(null);
                          setSuccess("");
                        }}
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
              {success &&
                !participationID && ( // Show final success if no confirmation needed
                  <div className="mt-4 p-4 rounded-md bg-green-50 border border-green-200 text-green-700 text-center font-medium">
                    {success}
                  </div>
                )}

              {/* Suggested Activities */}
              {suggestedActivities.length > 0 && (
                <div className="mt-6 pt-4 border-t border-gray-200">
                  <h3 className="text-lg font-semibold text-gray-800 mb-3">
                    Hoạt động tương tự có thể bạn quan tâm:
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {suggestedActivities.map((a) => (
                      <div
                        key={a.activityID}
                        className="bg-gray-100 p-4 rounded-md shadow-sm"
                      >
                        <h4 className="text-base font-semibold text-gray-800">
                          {a.name}
                        </h4>
                        <p className="text-sm text-gray-600 mb-2">
                          {a.eventStart
                            ? new Date(a.eventStart).toLocaleDateString()
                            : ""}{" "}
                          - {a.location || ""}
                        </p>
                        <button
                          className="text-blue-600 hover:underline text-sm font-medium"
                          onClick={() => {
                            handleCloseDetailModal(); // Close current modal
                            handleShowDetail(a); // Open detail for suggested activity
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
      )}
    </div>
  );
}

export default ActivityRegister;
