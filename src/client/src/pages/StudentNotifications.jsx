import React, { useState, useEffect, useCallback } from "react";
import axios from "axios";
import { useAuth } from "../contexts/AuthContext";
import { Box, CircularProgress, Modal, IconButton } from "@mui/material";
import { toast } from "react-toastify";
import Header from "../components/common/Header";
import SidebarStudent from "../components/common/SidebarStudent";
import Footer from "../components/common/Footer";
import CloseIcon from "@mui/icons-material/Close";
import { useNavigate } from "react-router-dom";

axios.defaults.baseURL = "http://localhost:3001";
axios.defaults.headers.common["Content-Type"] = "application/json";

const StudentNotifications = () => {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const [openDetail, setOpenDetail] = useState(false);
  const [selectedNotification, setSelectedNotification] = useState(null);
  const [selectedIds, setSelectedIds] = useState([]);
  const [users, setUsers] = useState([]);
  const navigate = useNavigate();

  const allSelected =
    notifications.length > 0 && selectedIds.length === notifications.length;

  const fetchNotifications = useCallback(async () => {
    try {
      const res = await axios.get(`/notifications?userID=${user.userID}`);
      setNotifications(res.data.notifications);
    } catch (err) {
      console.error("Failed to fetch notifications:", err);
      toast.error("Không thể tải thông báo");
    } finally {
      setLoading(false);
    }
  }, [user]);

  const fetchUsers = useCallback(async () => {
    try {
      const res = await axios.get("/users");
      setUsers(res.data.users || []);
    } catch (err) {
      console.error("Failed to fetch users:", err);
    }
  }, []);

  useEffect(() => {
    if (user) fetchNotifications();
    fetchUsers();
  }, [user, fetchNotifications, fetchUsers]);

  const getSenderNameById = (fromUserID) => {
    console.log("users:", users);
    console.log("fromUserID:", fromUserID);
    const matchedUser = users.find(
      (u) => Number(u.userID) === Number(fromUserID)
    );
    console.log("matchedUser:", matchedUser);
    return matchedUser?.name || "Không xác định";
  };

  const handleOpenDetail = (notification) => {
    setSelectedNotification(notification);
    setOpenDetail(true);
  };

  const handleCloseDetail = async () => {
    setOpenDetail(false);
    if (
      selectedNotification &&
      selectedNotification.notificationStatus === "unread"
    ) {
      try {
        await axios.patch(
          `/notifications/${selectedNotification.notificationID}/read`
        );
        setNotifications((prev) =>
          prev.map((n) =>
            n.notificationID === selectedNotification.notificationID
              ? { ...n, notificationStatus: "read" }
              : n
          )
        );
      } catch (err) {
        toast.error("Không thể đánh dấu đã đọc");
      }
    }
    setSelectedNotification(null);
  };

  const handleSelectAll = (e) => {
    if (e.target.checked) {
      setSelectedIds(notifications.map((n) => n.notificationID));
    } else {
      setSelectedIds([]);
    }
  };

  const handleSelectOne = (id) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    );
  };

  const handleMarkRead = async () => {
    const idsToUpdate = selectedIds.filter((id) => {
      const n = notifications.find((n) => n.notificationID === id);
      return n && n.notificationStatus !== "read";
    });
    await Promise.all(
      idsToUpdate.map((id) => axios.patch(`/notifications/${id}/read`))
    );
    await fetchNotifications();
    setSelectedIds([]);
  };

  const handleDelete = async (id) => {
    const confirm = window.confirm("Bạn có chắc muốn xóa thông báo này?");
    if (!confirm) return;

    try {
      await axios.delete(`/notifications/${id}`);
      setNotifications((prev) => prev.filter((n) => n.notificationID !== id));
      toast.success("Xóa thông báo thành công");
    } catch (err) {
      console.error("Failed to delete notification:", err);
      toast.error("Xóa thông báo thất bại");
    }
  };

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

  if (loading) {
    return (
      <Box className="flex justify-center items-center min-h-[70vh]">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-gray-50 to-gray-100">
      <Header user={user} onLogout={handleLogout} />

      <div className="flex flex-1 pt-16">
        <SidebarStudent onLogout={handleLogout} />

        <main className="flex-1 flex flex-col ml-64 px-6 py-8 w-full">
          <h1 className="text-4xl font-extrabold text-gray-900 tracking-tight">
            THÔNG BÁO
          </h1>
          <div className="mb-6">
            <span className="text-lg text-gray-600 font-medium">
              Có{" "}
              {
                notifications.filter((n) => n.notificationStatus === "unread")
                  .length
              }{" "}
              thông báo mới.
            </span>
          </div>

          <div className="flex items-center justify-between mb-4 w-full">
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={allSelected}
                onChange={handleSelectAll}
                className="w-5 h-5 accent-blue-600"
              />
              <span className="text-base text-gray-700">Chọn tất cả</span>
            </div>
            <div className="flex gap-2">
              <button
                className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 font-semibold"
                onClick={handleMarkRead}
                disabled={selectedIds.length === 0}
              >
                Đánh dấu là đã đọc
              </button>
            </div>
          </div>

          <div className="flex flex-col w-full gap-4">
            {notifications.length === 0 && (
              <p className="text-lg text-gray-500">Không có thông báo nào</p>
            )}
            {[...notifications]
              .sort((a, b) => {
                if (
                  a.notificationStatus === "unread" &&
                  b.notificationStatus !== "unread"
                )
                  return -1;
                if (
                  a.notificationStatus !== "unread" &&
                  b.notificationStatus === "unread"
                )
                  return 1;
                return 0;
              })
              .map((notification) => (
                <div
                  key={notification.notificationID}
                  className={`w-full rounded-lg shadow-md p-5 transition duration-300 flex flex-row items-center gap-4 cursor-pointer border ${
                    selectedIds.includes(notification.notificationID)
                      ? "border-blue-600 ring-2 ring-blue-300 bg-blue-50"
                      : notification.notificationStatus === "unread"
                      ? "bg-blue-50 border-l-4 border-blue-500"
                      : "bg-white border-l-4 border-gray-300"
                  }`}
                >
                  <input
                    type="checkbox"
                    checked={selectedIds.includes(notification.notificationID)}
                    onChange={() =>
                      handleSelectOne(notification.notificationID)
                    }
                    className="w-5 h-5 accent-blue-600 mr-4"
                    onClick={(e) => e.stopPropagation()}
                  />
                  <div
                    className="flex-1 flex flex-col"
                    onClick={() => handleOpenDetail(notification)}
                  >
                    <div className="flex justify-between items-start mb-2">
                      <h2
                        className={`text-lg ${
                          notification.notificationStatus === "unread"
                            ? "font-semibold text-blue-800"
                            : "font-medium text-gray-800"
                        }`}
                      >
                        {notification.notificationTitle}
                      </h2>
                      <span
                        className={`text-xs px-2 py-0.5 rounded-full font-medium mt-1 ${
                          notification.notificationStatus === "unread"
                            ? "bg-blue-200 text-blue-800"
                            : "bg-gray-200 text-gray-700"
                        }`}
                      >
                        {notification.notificationStatus === "unread"
                          ? "Mới"
                          : "Đã đọc"}
                      </span>
                    </div>
                    <p className="text-base text-gray-700 leading-relaxed mb-3">
                      {notification.notificationMessage}
                    </p>
                  </div>
                </div>
              ))}
          </div>
        </main>
      </div>

      <div className="ml-64">
        <Footer />
      </div>

      <Modal open={openDetail} onClose={handleCloseDetail}>
        <div
          style={{
            position: "absolute",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            background: "white",
            borderRadius: 12,
            boxShadow: "0 2px 16px rgba(0,0,0,0.2)",
            padding: 32,
            minWidth: 500,
            maxWidth: 700,
            outline: "none",
          }}
        >
          <IconButton
            onClick={handleCloseDetail}
            style={{ position: "absolute", top: 8, right: 8 }}
            aria-label="close"
          >
            <CloseIcon />
          </IconButton>
          {selectedNotification && (
            <>
              <h2 className="text-2xl font-bold mb-4">
                {selectedNotification.notificationTitle}
              </h2>
              <div className="mb-2 text-gray-600 text-sm">
                Được gửi từ:{" "}
                <span className="font-semibold">
                  {getSenderNameById(selectedNotification.fromUserID)}
                </span>
              </div>
              <div className="text-base text-gray-800 mb-2">
                {selectedNotification.notificationMessage}
              </div>
            </>
          )}
        </div>
      </Modal>
    </div>
  );
};

export default StudentNotifications;
