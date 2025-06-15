import React, { useEffect, useState } from "react";
import Header from "../../components/common/Header";
import SidebarStudent from "../../components/common/SidebarStudent";
import Footer from "../../components/common/Footer";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";

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
  { id: "registerStartAsc", label: "Ngày mở đăng ký (tăng dần)" },
  { id: "registerStartDesc", label: "Ngày mở đăng ký (giảm dần)" },
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

  // Filter States
  const [searchTerm, setSearchTerm] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [sortBy, setSortBy] = useState("");

  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const location = useLocation();

  // --- Fetch Activities based on filters ---
  useEffect(() => {
    setLoading(true);
    const fetchActivities = () => {
      let query = [];
      if (searchTerm) query.push(`search=${encodeURIComponent(searchTerm)}`);
      if (startDate) query.push(`startDate=${startDate}`);
      if (endDate) query.push(`endDate=${endDate}`);
      const queryString = query.length > 0 ? `?${query.join("&")}` : "";
      fetch(`/participation/open${queryString}`)
        .then((res) => res.json())
        .then((data) => {
          let filteredActivities = data.activities || [];
          // Apply sorting
          filteredActivities = filteredActivities.sort((a, b) => {
            const getTime = (val) => (val ? new Date(val).getTime() : 0);
            switch (sortBy) {
              case "eventStartAsc":
                return getTime(a.eventStart) - getTime(b.eventStart);
              case "eventStartDesc":
                return getTime(b.eventStart) - getTime(a.eventStart);
              case "registerStartAsc":
                return getTime(a.registerStart) - getTime(b.registerStart);
              case "registerStartDesc":
                return getTime(b.registerStart) - getTime(a.registerStart);
              default:
                return 0;
            }
          });
          setActivities(filteredActivities);
          setLoading(false);
        })
        .catch((error) => {
          console.error("Error fetching activities:", error);
          setLoading(false);
        });
    };
    const handler = setTimeout(() => {
      fetchActivities();
    }, 500); // Wait 500ms after user stops typing
    return () => {
      clearTimeout(handler);
    };
  }, [searchTerm, startDate, endDate, sortBy]);

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const search = params.get("search");
    if (search) setSearchTerm(search);
  }, [location.search]);

  // --- Handlers for Activity Details and Registration ---
  const handleShowDetail = (activity) => {
    setSelected(activity);
    setShowDetail(true);
    setShowForm(false);
    setError("");
    setSuccess("");
    setConfirm(false);
    setSuggested([]);
  };

  const handleCloseDetail = () => {
    setShowDetail(false);
    setSelected(null);
    setShowForm(false);
    setError("");
    setSuccess("");
    setConfirm(false);
    setSuggested([]);
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
    fetch("/participation/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
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
        }
      })
      .catch((error) => {
        console.error("Error submitting:", error);
        setError("Gửi đăng ký thất bại, vui lòng thử lại!");
      });
  };

  return (
    <div className="min-h-screen flex flex-col" style={{ fontFamily: "'Segoe UI', Arial, sans-serif" }}>
      <header className="fixed top-0 left-0 w-full bg-white shadow-md z-20">
        <Header />
      </header>
      <div className="flex flex-1 mt-16">
        <aside className="fixed top-16 left-0 w-64 h-[calc(100vh-4rem)] bg-white shadow-md overflow-auto z-10">
          <SidebarStudent />
        </aside>
        <main className="ml-64 flex-1 w-full p-6 bg-gray-50">
          <div style={{ maxWidth: 1200, margin: "0 auto" }}>
            <div className="space-y-3 order-1">
              <h1 className="text-4xl font-extrabold text-gray-900 tracking-tight">ĐĂNG KÝ HOẠT ĐỘNG</h1>
              <p className="text-xl text-gray-700 font-medium">Xem và đăng ký các hoạt động bạn muốn tham gia.</p>
            </div>

            {/* Filter and Sort Section */}
            <div className="flex items-center justify-end gap-6 mt-6 mb-6">
              <div className="flex items-center gap-2">
                <label className="text-sm font-medium text-gray-700">Tìm kiếm:</label>
                <input
                  type="text"
                  placeholder="Tìm kiếm hoạt động..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-48 p-2 border rounded-md pr-8"
                />
              </div>
              <div className="flex items-center gap-2">
                <label className="text-sm font-medium text-gray-700">Ngày diễn ra:</label>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="w-48 p-2 border rounded-md pr-8"
                >
                  <option value="">Sắp xếp theo</option>
                  {SORT_OPTIONS.map((o) => (
                    <option key={o.id} value={o.id}>{o.label}</option>
                  ))}
                </select>
              </div>
              <div className="flex items-center gap-2">
                <label className="text-sm font-medium text-gray-700">Từ ngày:</label>
                <input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="w-48 p-2 border rounded-md"
                />
              </div>
              <div className="flex items-center gap-2">
                <label className="text-sm font-medium text-gray-700">Đến ngày:</label>
                <input
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="w-48 p-2 border rounded-md"
                />
              </div>
            </div>

            {loading ? (
              <div className="text-center text-gray-500">Đang tải hoạt động...</div>
            ) : activities.length === 0 ? (
              <div className="text-center text-gray-500">Chưa có hoạt động nào.</div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {activities.map((a) => (
                  <div
                    key={a.activityID}
                    className="bg-white rounded-lg shadow-md overflow-hidden"
                  >
                    <img
                      src={a.image || "https://via.placeholder.com/300x200"}
                      alt={a.name}
                      className="w-full h-48 object-cover"
                    />
                    <div className="p-4">
                      <h3 className="text-xl font-bold text-gray-900 mb-2">{a.name}</h3>
                      <p className="text-gray-700 text-sm mb-1">
                        <span className="font-semibold">Loại:</span> {a.type}
                      </p>
                      <p className="text-gray-700 text-sm mb-1">
                        <span className="font-semibold">Thời gian:</span>{" "}
                        {a.eventStart ? new Date(a.eventStart).toLocaleString() : ""}
                      </p>
                      <p className="text-gray-700 text-sm mb-1">
                        <span className="font-semibold">Địa điểm:</span> {a.location}
                      </p>
                      <div className="mt-2">
                        <span
                          className={`inline-block px-2 py-1 text-xs rounded font-semibold ${
                            a.activityStatus === "ĐANG DIỄN RA"
                              ? "bg-blue-100 text-blue-800"
                              : a.activityStatus === "SẮP DIỄN RA"
                              ? "bg-yellow-100 text-yellow-800"
                              : "bg-gray-100 text-gray-700"
                          }`}
                        >
                          {a.activityStatus || "ĐANG DIỄN RA"}
                        </span>
                      </div>
                      <div className="mt-4 flex justify-between items-center">
                        <button
                          className="bg-blue-500 hover:bg-blue-600 text-white text-sm font-semibold py-2 px-4 rounded-md"
                          onClick={() => handleShowDetail(a)}
                        >
                          Xem chi tiết
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Chi tiết hoạt động */}
            {showDetail && selected && (
              <div
                style={{
                  position: "fixed",
                  top: 0,
                  left: 0,
                  width: "100vw",
                  height: "100vh",
                  background: "rgba(0,0,0,0.25)",
                  zIndex: 1000,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <div
                  style={{
                    background: "#fff",
                    borderRadius: "12px",
                    boxShadow: "0 2px 16px #bdbdbd",
                    padding: "32px",
                    minWidth: "350px",
                    maxWidth: "500px",
                    position: "relative",
                  }}
                >
                  <button
                    onClick={handleCloseDetail}
                    style={{
                      position: "absolute",
                      top: "12px",
                      right: "12px",
                      background: "#bdbdbd",
                      color: "#fff",
                      border: "none",
                      borderRadius: "50%",
                      width: "28px",
                      height: "28px",
                      fontWeight: "700",
                      fontSize: "18px",
                      cursor: "pointer",
                    }}
                  >
                    ×
                  </button>
                  <h2 className="text-2xl font-bold text-gray-900">{selected.name}</h2>
                  <div className="text-gray-700 mt-2">
                    <p><strong>Mô tả:</strong> {selected.description || "Không có mô tả"}</p>
                    <p className="mt-1"><strong>Thời gian:</strong> {selected.eventStart ? new Date(selected.eventStart).toLocaleString() : ""} - {selected.eventEnd ? new Date(selected.eventEnd).toLocaleString() : ""}</p>
                    <p className="mt-1"><strong>Địa điểm:</strong> {selected.location}</p>
                    <p className="mt-1"><strong>Lĩnh vực:</strong> {selected.type}</p>
                    <p className="mt-1"><strong>Số lượng tối đa:</strong> {selected.capacity || "Không giới hạn"}</p>
                    <p className="mt-1"><strong>Trạng thái:</strong> {selected.activityStatus}</p>
                  </div>
                  {!showForm && !success && (
                    <button
                      className="bg-blue-500 hover:bg-blue-600 text-white font-semibold py-2 px-4 rounded-md mt-4"
                      onClick={() => handleRegister(selected)}
                    >
                      Đăng ký
                    </button>
                  )}
                  {showForm && (
                    <form
                      onSubmit={handleFormSubmit}
                      className="bg-gray-100 rounded-md p-4 mt-4"
                    >
                      <div>
                        <label className="block text-sm font-medium text-gray-700">Ghi chú</label>
                        <textarea
                          name="note"
                          value={form.note}
                          onChange={handleFormChange}
                          className="w-full mt-1 p-2 border rounded-md"
                        />
                      </div>
                      <div className="mt-2 flex gap-2">
                        <button
                          type="submit"
                          className="bg-blue-500 hover:bg-blue-600 text-white font-semibold py-2 px-4 rounded-md"
                        >
                          Gửi đăng ký
                        </button>
                        <button
                          type="button"
                          className="bg-gray-500 hover:bg-gray-600 text-white font-semibold py-2 px-4 rounded-md"
                          onClick={() => setShowForm(false)}
                        >
                          Hủy
                        </button>
                      </div>
                    </form>
                  )}
                  {confirm && (
                    <div className="bg-yellow-50 border border-yellow-200 rounded-md p-4 mt-4 text-center">
                      <p>Bạn xác nhận gửi đăng ký tham gia hoạt động này?</p>
                      <div className="mt-2 flex gap-2 justify-center">
                        <button
                          className="bg-green-500 hover:bg-green-600 text-white font-semibold py-2 px-4 rounded-md"
                          onClick={handleConfirm}
                        >
                          Xác nhận
                        </button>
                        <button
                          className="bg-gray-500 hover:bg-gray-600 text-white font-semibold py-2 px-4 rounded-md"
                          onClick={() => setConfirm(false)}
                        >
                          Hủy
                        </button>
                      </div>
                    </div>
                  )}
                  {error && <div className="text-red-500 mt-2">{error}</div>}
                  {success && <div className="text-green-500 mt-2 font-semibold">{success}</div>}
                  {suggested.length > 0 && (
                    <div className="mt-4">
                      <p className="font-semibold">Hoạt động cùng lĩnh vực:</p>
                      <div className="mt-2 flex gap-2">
                        {suggested.map((a) => (
                          <div
                            key={a.activityID}
                            className="bg-gray-100 rounded-md p-2"
                          >
                            <p className="font-medium">{a.name}</p>
                            <button
                              className="bg-blue-500 hover:bg-blue-600 text-white text-sm font-semibold py-1 px-2 rounded-md mt-1"
                              onClick={() => {
                                handleCloseDetail();
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
            )}
          </div>
        </main>
      </div>
      <footer className="w-full bg-gray-100 py-6">
        <div style={{ maxWidth: 1200, margin: "0 auto", padding: "0 16px" }}>
          <Footer />
        </div>
      </footer>
    </div>
  );
}

export default ActivityRegister;