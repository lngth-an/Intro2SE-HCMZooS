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
  const [stats, setStats] = useState({
    completedCount: 0,
    draftCount: 0,
    publishedCount: 0
  });
  const navigate = useNavigate();

  const fetchActivities = async () => {
    console.log("Fetching activities...");
    setLoading(true);
    try {
      // Sử dụng endpoint mới để lấy danh sách có kèm thống kê
      const res = await fetch("/activity/list?page=1&limit=10");
      if (!res.ok) throw new Error("Lỗi khi lấy dữ liệu hoạt động");
      const data = await res.json();
      console.log("Raw activities response:", data);
      
      // Cập nhật cả activities và stats
      setActivities(data.activities || []);
      setStats({
        completedCount: data.activities ? data.activities.filter(act => act.activityStatus === "Đã hoàn thành").length : 0,
        draftCount: data.draftCount || 0,
        publishedCount: data.publishedCount || 0
      });
      
      console.log("Activities and stats updated:", {
        activities: data.activities,
        stats: {
          completedCount: data.activities ? data.activities.filter(act => act.activityStatus === "Đã hoàn thành").length : 0,
          draftCount: data.draftCount,
          publishedCount: data.publishedCount
        }
      });
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
      if (!res.ok) throw new Error("Lỗi khi lấy dữ liệu khiếu nại");
      const data = await res.json();
      console.log("Raw complaints response:", data);
      const count = data.complaints ? data.complaints.length : 0;
      setPendingComplaints(count);
      console.log("Pending complaints state updated:", count);
    } catch (err) {
      console.log("Error fetching complaints:", err);
      setPendingComplaints(0);
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
        const res = await fetch(`/activity/${id}`, { method: "DELETE" });
        if (!res.ok) throw new Error("Không thể xóa hoạt động");
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
      const res = await fetch(`/activity/${id}/publish`, { method: "PATCH" });
      if (!res.ok) throw new Error("Không thể xuất bản hoạt động");
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
                      Đã hoàn thành: {stats.completedCount}
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
            ) : activities.length === 0 ? (
              <div>Không có hoạt động nào</div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {activities.map((activity) => (
                  <div
                    key={activity.activityID}
                    className="bg-white rounded-lg shadow-sm p-6"
                  >
                    <div className="flex justify-between items-start mb-4">
                      <h3 className="text-lg font-semibold text-gray-800">
                        {activity.name}
                      </h3>
                      <span
                        className={`px-2 py-1 rounded text-xs font-semibold ${
                          statusColors[activity.activityStatus]
                        }`}
                      >
                        {activity.activityStatus}
                      </span>
                    </div>
                    <p className="text-gray-600 mb-4">{activity.description}</p>
                    <div className="flex justify-end space-x-2">
                      <button
                        onClick={() => handleEdit(activity)}
                        className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg"
                        title="Chỉnh sửa"
                      >
                        <Edit className="w-5 h-5" />
                      </button>
                      {activity.activityStatus === "Bản nháp" && (
                        <>
                          <button
                            onClick={() => handlePublish(activity.activityID)}
                            className="p-2 text-green-600 hover:bg-green-50 rounded-lg"
                            title="Xuất bản"
                          >
                            <Upload className="w-5 h-5" />
                          </button>
                          <button
                            onClick={() => handleDelete(activity.activityID)}
                            className="p-2 text-red-600 hover:bg-red-50 rounded-lg"
                            title="Xóa"
                          >
                            <Trash2 className="w-5 h-5" />
                          </button>
                        </>
                      )}
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
