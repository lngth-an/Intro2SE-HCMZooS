import React, { useEffect, useState } from "react";
import Header from "../../components/common/Header";
import SidebarStudent from "../../components/common/SidebarStudent";
import Footer from "../../components/common/Footer";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";
import { toast } from 'react-toastify';
import StudentActivityDetail from "./StudentActivityDetail";
import axios from 'axios';

const DOMAINS = [
  { id: "academic", label: "Học thuật" },
  { id: "volunteer", label: "Tình nguyện" },
  { id: "sports", label: "Thể thao" },
  { id: "skills", label: "Kỹ năng" },
  { id: "arts", label: "Nghệ thuật" },
  { id: "other", label: "Khác" },
];

const SORT_OPTIONS = [
  { id: "eventStartAsc", label: "Ngày diễn ra (tăng dần)" },
  { id: "eventStartDesc", label: "Ngày diễn ra (giảm dần)" },
  { id: "registrationStartAsc", label: "Ngày mở đăng ký (tăng dần)" },
  { id: "registrationStartDesc", label: "Ngày mở đăng ký (giảm dần)" },
];

function ActivityRegister() {
  // Activity States
  const [activities, setActivities] = useState([]);
  const [domain, setDomain] = useState("");
  const [selected, setSelected] = useState(null);
  const [showDetail, setShowDetail] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ note: "" });
  const [error, setError] = useState("");
  const [confirm, setConfirm] = useState(false);
  const [success, setSuccess] = useState("");
  const [suggested, setSuggested] = useState([]);
  const [participationID, setParticipationID] = useState(null);
  const [loading, setLoading] = useState(false);
  const [isRegistered, setIsRegistered] = useState(false);

  // Filter States
  const [searchTerm, setSearchTerm] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [sortBy, setSortBy] = useState("eventStartDesc");

  const navigate = useNavigate();
  const { user } = useAuth();

  // --- Fetch Activities based on filters ---
  useEffect(() => {
    setLoading(true);
    const fetchActivities = () => {
      let query = [];
      if (searchTerm) query.push(`search=${encodeURIComponent(searchTerm)}`);
      if (startDate) query.push(`startDate=${startDate}`);
      if (endDate) query.push(`endDate=${endDate}`);
      if (domain) query.push(`domain=${domain}`);
      
      const queryString = query.length > 0 ? `?${query.join("&")}` : "";
      
      axios.get(`/participation/open${queryString}`)
        .then((response) => {
          let filteredActivities = response.data.activities || [];
          // Apply sorting
          filteredActivities = filteredActivities.sort((a, b) => {
            const getTime = (val) => (val ? new Date(val).getTime() : 0);
            switch (sortBy) {
              case "eventStartAsc":
                return getTime(a.eventStart) - getTime(b.eventStart);
              case "eventStartDesc":
                return getTime(b.eventStart) - getTime(a.eventStart);
              case "registrationStartAsc":
                return getTime(a.registrationStart) - getTime(b.registrationStart);
              case "registrationStartDesc":
                return getTime(b.registrationStart) - getTime(a.registrationStart);
              default:
                return 0;
            }
          });
          setActivities(filteredActivities);
          setLoading(false);
        })
        .catch((error) => {
          console.error("Error fetching activities:", error);
          toast.error("Không thể tải hoạt động. Vui lòng thử lại.");
          setLoading(false);
        });
    };

    // Debounce search inputs
    const handler = setTimeout(() => {
      fetchActivities();
    }, 500);

    return () => {
      clearTimeout(handler);
    };
  }, [searchTerm, startDate, endDate, domain, sortBy]);

  // --- Handlers for Activity Details and Registration ---

  const handleShowDetail = (activity) => {
    setSelected(activity);
    setShowDetail(true);
    setShowForm(false);
    setError("");
    setSuccess("");
    setConfirm(false);
    setSuggested([]);
    // Check if student is already registered
    fetch(`/participation/check-registration/${activity.activityID}`, {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('accessToken')}`
      }
    })
      .then(res => res.json())
      .then(data => {
        setIsRegistered(data.isRegistered);
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

  const handleRegister = (activity) => {
    fetch(`/participation/check-eligibility/${activity.activityID}`)
      .then((res) => res.json())
      .then((data) => {
        if (data.eligible) {
          setShowForm(true);
          setError("");
        } else {
          setError(data.reason || "Bạn không đủ điều kiện đăng ký hoạt động này");
          fetch(`/participation/suggest?domain=${activity.type}`)
            .then((res) => res.json())
            .then((data) => setSuggested(data.activities || []));
        }
    });
  };

  const handleRegistrationSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    try {
      const response = await axios.post("/participation/register", {
        activityID: selected.activityID,
        note: form.note,
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

  const handleConfirm = () => {
    fetch("/participation/submit", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
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
        }
    });
  };

  const isRegistrationOpen = selected &&
    new Date() >= new Date(selected.registrationStart) &&
    new Date() <= new Date(selected.registrationEnd);

  const handleLogout = async () => {
    try {
      await axios.post('/auth/logout');
      localStorage.removeItem('accessToken');
      localStorage.removeItem('role');
      localStorage.removeItem('userID');
      localStorage.removeItem('user');
      toast.success('Đăng xuất thành công');
      navigate('/login');
    } catch (error) {
      toast.error('Có lỗi xảy ra khi đăng xuất');
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
                <h1 className="text-3xl font-extrabold text-gray-900">
                  Đăng ký hoạt động
                </h1>
                <p className="mt-2 text-base text-gray-600">
                  Tìm kiếm và đăng ký các hoạt động phù hợp với bạn
                </p>
              </div>

              {/* Search and Filter Section */}
              <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
                <h2 className="text-xl font-semibold text-gray-800 mb-4">Tìm kiếm & Lọc</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
                  {/* Search by Name */}
                  <div>
                    <label htmlFor="searchTerm" className="block text-sm font-medium text-gray-700">Tên hoạt động</label>
                    <input
                      type="text"
                      id="searchTerm"
                      className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm p-2"
                      placeholder="Tìm theo tên hoạt động..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                    />
                  </div>
                  {/* Filter by Date Range */}
                  <div className="col-span-1 md:col-span-2 lg:col-span-1 grid grid-cols-2 gap-4">
                    <div>
                      <label htmlFor="startDate" className="block text-sm font-medium text-gray-700">Từ ngày</label>
                      <input
                        type="date"
                        id="startDate"
                        className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm p-2"
                        value={startDate}
                        onChange={(e) => setStartDate(e.target.value)}
                      />
                    </div>
                    <div>
                      <label htmlFor="endDate" className="block text-sm font-medium text-gray-700">Đến ngày</label>
                      <input
                        type="date"
                        id="endDate"
                        className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm p-2"
                        value={endDate}
                        onChange={(e) => setEndDate(e.target.value)}
                      />
                    </div>
                  </div>
                </div>

                {/* Domain Filter Pills */}
                <div className="mb-4">
                  <span className="block text-sm font-medium text-gray-700 mb-2">Lọc theo lĩnh vực:</span>
                  <div className="flex flex-wrap gap-2">
                    <button
                      className={`px-4 py-2 rounded-full text-sm font-medium transition-colors duration-200
                        ${!domain
                          ? "bg-blue-600 text-white shadow"
                          : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                        }`}
                      onClick={() => setDomain("")}
                    >
                      Tất cả
                    </button>
                    {DOMAINS.map((d) => (
                      <button
                        key={d.id}
                        className={`px-4 py-2 rounded-full text-sm font-medium transition-colors duration-200
                          ${domain === d.id
                            ? "bg-blue-600 text-white shadow"
                            : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                          }`}
                        onClick={() => setDomain(d.id)}
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
                  <h2 className="text-xl font-semibold text-gray-800">Danh sách hoạt động</h2>
                </div>
                {loading ? (
                  <div className="p-6 text-center text-gray-500">
                    Đang tải hoạt động...
                  </div>
                ) : error ? (
                  <div className="p-6 text-center text-red-600">
                    {error}
                  </div>
                ) : activities.length === 0 ? (
                  <div className="p-6 text-center text-gray-500">
                    Không tìm thấy hoạt động nào phù hợp.
                  </div>
                ) : (
                  <div className="p-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {activities.map((a) => (
                      <div
                        key={a.activityID}
                        className="bg-white rounded-lg shadow-sm overflow-hidden hover:shadow-md transition-shadow duration-200"
                      >
                        <div className="p-4">
                          <img
                            src={a.image || "https://via.placeholder.com/300x200"}
                            alt={a.name}
                            className="w-full h-48 object-cover rounded-lg mb-4"
                          />
                          <h3 className="text-lg font-semibold text-gray-900 mb-2">
                            {a.name}
                          </h3>
                          <p className="text-sm text-gray-600 mb-1">
                            <span className="font-semibold">Đơn vị:</span> {a.organizerName || 'Đang cập nhật'}
                          </p>
                          <p className="text-sm text-gray-600 mb-1">
                            <span className="font-semibold">Thời gian:</span> {a.eventStart ? new Date(a.eventStart).toLocaleString() : ""}
                          </p>
                          <p className="text-sm text-gray-600 mb-1">
                            <span className="font-semibold">Địa điểm:</span> {a.location || 'Chưa xác định'}
                          </p>
                          <p className="text-sm text-gray-600">
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                              {DOMAINS.find(d => d.id === a.type)?.label || a.type || 'Chưa phân loại'}
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
      {showDetail && selected && (
        <StudentActivityDetail
          activity={selected}
          onClose={handleCloseDetail}
          onRegister={handleRegister}
          showForm={showForm}
          form={form}
          onFormChange={(e) => setForm({ ...form, [e.target.name]: e.target.value })}
          onFormSubmit={handleRegistrationSubmit}
          error={error}
          success={success}
          confirm={confirm}
          onConfirm={handleConfirm}
          onCancelConfirm={() => setConfirm(false)}
          suggested={suggested}
          isRegistered={isRegistered}
        />
      )}
    </div>
  );
}

export default ActivityRegister;