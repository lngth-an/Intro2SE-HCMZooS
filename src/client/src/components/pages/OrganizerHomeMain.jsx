import React, { useEffect, useState } from "react";
import {
  ClipboardList,
  FileWarning,
  Eye,
  Edit,
  Trash2,
  Upload,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { message } from "antd";
import Header from "../common/Header";
import SidebarOrganizer from "../common/SidebarOrganizer";
import Footer from "../common/Footer";

const DOMAINS = [
  { id: "academic", label: "Học thuật" },
  { id: "volunteer", label: "Tình nguyện" },
  { id: "sports", label: "Thể thao" },
  { id: "skills", label: "Kỹ năng" },
  { id: "arts", label: "Nghệ thuật" },
  { id: "other", label: "Khác" },
];
const statusColors = {
  'Bản nháp': "bg-gray-300 text-gray-800",
  'Đã đăng tải': "bg-blue-600 text-white",
  'Đã hoàn thành': "bg-green-600 text-white",
};

export default function OrganizerHomeMain({
  onManageActivities,
  onReviewComplaints,
}) {
  console.log("Component rendered");
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState("success");
  const [pendingComplaints, setPendingComplaints] = useState(0);
  const navigate = useNavigate();

  const fetchActivities = async () => {
    console.log("Fetching activities...");
    setLoading(true);
    try {
      const res = await fetch("/activity/organizer");
      if (!res.ok) throw new Error("Lỗi khi lấy dữ liệu hoạt động");
      const data = await res.json();
      console.log("Raw activities response:", data);
      setActivities(data.activities || []);
      console.log("Activities state updated:", data.activities);
    } catch (err) {
      setError(err.message);
      console.log("Error fetching activities:", err);
    } finally {
      setLoading(false);
    }
  };

  const fetchPendingComplaints = async () => {
    console.log("Fetching pending complaints...");
    try {
      const res = await fetch("/activity/complaint/organizer?status=Chờ duyệt");
      const data = await res.json();
      console.log("Raw complaints response:", data);
      setPendingComplaints(data.complaints ? data.complaints.length : 0);
      console.log("Pending complaints state updated:", data.complaints ? data.complaints.length : 0);
    } catch (err) {
      setPendingComplaints(0);
      console.log("Error fetching complaints:", err);
    }
  };

  useEffect(() => {
    console.log("useEffect triggered");
    fetchActivities();
    fetchPendingComplaints();
  }, []);

  // Handler cho các nút thao tác
  const handleEdit = (activity) => {
    navigate(`/organizer/activity/edit/${activity.activityID}`);
  };
  const handleDelete = async (id) => {
    if (window.confirm("Bạn có chắc chắn muốn xóa hoạt động này?")) {
      try {
        await fetch(`/activity/${id}`, { method: "DELETE" });
        setMessage("Đã xóa hoạt động thành công!");
        setMessageType("success");
        fetchActivities();
      } catch (error) {
        setMessage("Không thể xóa hoạt động");
        setMessageType("error");
      }
    }
  };
  const handlePublish = async (id) => {
    try {
      await fetch(`/activity/${id}/publish`, { method: "PATCH" });
      setMessage("Đã xuất bản hoạt động thành công!");
      setMessageType("success");
      fetchActivities();
    } catch (error) {
      setMessage("Không thể xuất bản hoạt động");
      setMessageType("error");
    }
  };

  const handleLogout = async () => {
    try {
      await axios.post("/auth/logout");
      localStorage.removeItem("accessToken");
      localStorage.removeItem("role");
      localStorage.removeItem("userID");
      localStorage.removeItem("user");
      message.success("Đăng xuất thành công");
      navigate("/login");
    } catch (error) {
      message.error("Có lỗi xảy ra khi đăng xuất");
    }
  };

  const completedCount = activities.filter(act => act.activityStatus === "Đã hoàn thành").length;
  console.log("Completed activities count:", completedCount);
  console.log("Pending complaints count:", pendingComplaints);

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Header onLogout={handleLogout} />
      <div className="flex flex-1 pt-16">
        <SidebarOrganizer onLogout={handleLogout} />
        <main className="min-h-screen bg-gray-50 p-6">
          {/* Quản lý và khiếu nại Section */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            {/* Quản lý hoạt động */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-semibold text-gray-800 mb-2 flex items-center gap-2">
                    Quản lý các hoạt động
                    <span className="inline-block bg-green-100 text-green-700 text-xs font-bold px-2 py-1 rounded ml-2">
                      Đã hoàn thành: {completedCount}
                    </span>
                  </h3>
                  <p className="text-gray-600">
                    Xem, chỉnh sửa hoặc kết thúc hoạt động
                  </p>
                </div>
                <button
                  onClick={onManageActivities}
                  className="w-10 h-10 flex items-center justify-center bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  <ClipboardList className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Đơn khiếu nại */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-semibold text-gray-800 mb-2 flex items-center gap-2">
                    Đơn khiếu nại chờ duyệt
                    <span className="inline-block bg-red-100 text-red-700 text-xs font-bold px-2 py-1 rounded ml-2">
                      Chờ xử lý: {pendingComplaints}
                    </span>
                  </h3>
                  <p className="text-gray-600">
                    Xử lý các đơn khiếu nại đang chờ duyệt
                  </p>
                </div>
                <button
                  onClick={onReviewComplaints}
                  className="w-10 h-10 flex items-center justify-center bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  <FileWarning className="w-5 h-5" />
                </button>
              </div>
            </div>
          </div>

          {/* Thông báo */}
          {message && (
            <div
              className={`mb-4 p-3 rounded-md text-center ${
                messageType === "success"
                  ? "bg-green-100 text-green-700"
                  : "bg-red-100 text-red-700"
              }`}
            >
              {message}
            </div>
          )}

          {/* Các hoạt động đang diễn ra */}
          <div>
            <h2 className="text-xl font-semibold text-gray-800 mb-6">
              Các hoạt động đang diễn ra
            </h2>
            {loading ? (
              <div>Đang tải hoạt động...</div>
            ) : error ? (
              <div className="text-red-500">{error}</div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {activities.map((act) => (
                  <div
                    key={act.activityID || act.id}
                    className="bg-white rounded-lg shadow-md overflow-hidden"
                  >
                    <img
                      src={
                        act.image ||
                        "https://cylpzmvdcyhkvghdeelb.supabase.co/storage/v1/object/public/activities//dai-hoc-khoa-ho-ctu-nhien-tphcm.jpg"
                      }
                      alt={act.name}
                      className="w-full h-48 object-cover"
                      onError={(e) => {
                        e.target.onerror = null;
                        e.target.src =
                          "https://cylpzmvdcyhkvghdeelb.supabase.co/storage/v1/object/public/activities//dai-hoc-khoa-ho-ctu-nhien-tphcm.jpg";
                      }}
                    />
                    <div className="p-4">
                      <div className="flex items-center justify-between mb-2">
                        <h3 className="text-lg font-semibold text-blue-600">
                          {act.name}
                        </h3>
                        <span
                          className={`px-2 py-1 rounded-full text-xs font-medium ${
                            statusColors[act.activityStatus] ||
                            "bg-gray-300 text-gray-800"
                          }`}
                        >
                          {act.activityStatus}
                        </span>
                      </div>
                      <div className="space-y-2 text-sm text-gray-600">
                        <p>
                          <span className="font-medium">Thời gian:</span>{" "}
                          {act.eventStart
                            ? new Date(act.eventStart).toLocaleString()
                            : ""}
                        </p>
                        <p>
                          <span className="font-medium">Địa điểm:</span>{" "}
                          {act.location}
                        </p>
                        <p>
                          <span className="font-medium">Lĩnh vực:</span>{" "}
                          {Array.isArray(act.domains)
                            ? act.domains
                                .map(
                                  (d) =>
                                    DOMAINS.find((dm) => dm.id === d)?.label
                                )
                                .join(", ")
                            : ""}
                        </p>
                        <p>
                          <span className="font-medium">Đối tượng:</span>{" "}
                          {act.targetAudience || ""}
                        </p>
                        <p>
                          <span className="font-medium">Điểm rèn luyện:</span>{" "}
                          {act.trainingScore || ""} điểm
                        </p>
                      </div>
                      <div className="mt-4 flex flex-row flex-wrap gap-2 justify-end items-center">
                        {act.activityStatus === "Bản nháp" && (
                          <button
                            onClick={() => handleEdit(act)}
                            className="flex items-center gap-1 px-3 py-1 bg-yellow-100 text-yellow-800 rounded-md hover:bg-yellow-200 transition-colors"
                          >
                            <Edit className="w-4 h-4" />
                            <span>Chỉnh sửa</span>
                          </button>
                        )}
                        {act.activityStatus === "Bản nháp" && (
                          <button
                            onClick={() => handleDelete(act.activityID)}
                            className="flex items-center gap-1 px-3 py-1 bg-red-100 text-red-800 rounded-md hover:bg-red-200 transition-colors"
                          >
                            <Trash2 className="w-4 h-4" />
                            <span>Xóa</span>
                          </button>
                        )}
                        {act.activityStatus === "Bản nháp" && (
                          <button
                            onClick={() => handlePublish(act.activityID)}
                            className="flex items-center gap-1 px-3 py-1 bg-blue-100 text-blue-800 rounded-md hover:bg-blue-200 transition-colors"
                          >
                            <Upload className="w-4 h-4" />
                            <span>Xuất bản</span>
                          </button>
                        )}
                        <button
                          onClick={() =>
                            navigate(`/organizer/activities/${act.activityID}`)
                          }
                          className="flex items-center gap-1 px-3 py-1 bg-gray-100 text-gray-800 rounded-md hover:bg-gray-200 transition-colors"
                        >
                          <Eye className="w-4 h-4" />
                          <span>Xem chi tiết</span>
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </main>
      </div>
      <Footer />
    </div>
  );
}
