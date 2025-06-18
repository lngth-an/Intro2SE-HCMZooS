import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import axios from "axios";
import { toast } from "react-hot-toast";
import { useAuth } from "../contexts/AuthContext";
import Header from "../components/common/Header";
import SidebarOrganizer from "../components/common/SidebarOrganizer";
import Footer from "../components/common/Footer";
import ActivityForm from "../components/pages/ActivityForm";
import { DOMAINS } from '../constants/activityTypes';

const ActivityEdit = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const { logout } = useAuth();
  const [activity, setActivity] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const fetchActivity = async () => {
      try {
        const token = localStorage.getItem("accessToken");
        const response = await axios.get(
          `http://localhost:3001/activity/${id}`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );

        // Map the activity type to the corresponding domain
        const activityData = response.data;
        // Map type string to id for UI selection
        const domain = DOMAINS.find((d) => d.type === activityData.type);
        if (domain) {
          activityData.type = domain.id;
        }

        setActivity(activityData);
      } catch (error) {
        console.error("Error fetching activity:", error);
        toast.error("Có lỗi xảy ra khi tải thông tin hoạt động");
        navigate("/organizer/activities");
      } finally {
        setLoading(false);
      }
    };

    fetchActivity();
  }, [id, navigate]);

  const handleSubmit = async (formData) => {
    console.log("handleSubmit called", formData);
    if (isSubmitting) return;

    setIsSubmitting(true);
    try {
      const token = localStorage.getItem("accessToken");
      if (!token) {
        throw new Error("Không tìm thấy token xác thực");
      }

      // Map type id (from UI) to type string before sending to server
      const domain = DOMAINS.find((d) => d.id === formData.type);
      if (domain) {
        formData.type = domain.type;
      }

      // Format dates if they exist
      if (formData.eventStart) {
        formData.eventStart = new Date(formData.eventStart).toISOString();
      }
      if (formData.eventEnd) {
        formData.eventEnd = new Date(formData.eventEnd).toISOString();
      }
      if (formData.registrationStart) {
        formData.registrationStart = new Date(
          formData.registrationStart
        ).toISOString();
      }
      if (formData.registrationEnd) {
        formData.registrationEnd = new Date(
          formData.registrationEnd
        ).toISOString();
      }

      console.log("Sending update data:", formData);

      // Update activity on server
      const response = await axios.put(
        `http://localhost:3001/activity/${id}`,
        formData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      console.log("Server response:", response.data);

      if (response.data) {
        setActivity(response.data);
        toast.success("Cập nhật hoạt động thành công!");
        setTimeout(() => {
          navigate("/organizer/activities");
        }, 2000);
      } else {
        throw new Error("Cập nhật không thành công");
      }
    } catch (error) {
      console.error("Error updating activity:", error);
      if (error.response) {
        console.error("Error response:", error.response.data);
        toast.error(
          error.response.data.message || "Có lỗi xảy ra khi cập nhật hoạt động"
        );
      } else {
        toast.error("Có lỗi xảy ra khi cập nhật hoạt động");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancel = () => {
    navigate("/organizer/activities");
  };

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col bg-gray-50">
        <Header />
        <div className="flex flex-1 pt-16">
          <SidebarOrganizer onLogout={logout} />
          <div className="flex-1 flex flex-col ml-64">
            <main className="flex-1 p-6">
              <div className="text-center">Đang tải...</div>
            </main>
            <Footer />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Header />
      <div className="flex flex-1 pt-16">
        <SidebarOrganizer onLogout={logout} />
        <div className="flex-1 flex flex-col ml-64">
          <main className="flex-1 p-6">
            <h1 className="text-2xl font-bold mb-6">Chỉnh sửa hoạt động</h1>
            {activity && (
              <ActivityForm
                onSubmit={handleSubmit}
                onCancel={handleCancel}
                domains={DOMAINS}
                initialData={activity}
                submitButtonText="Cập nhật"
                editingId={id}
                isSubmitting={isSubmitting}
              />
            )}
          </main>
          <Footer />
        </div>
      </div>
    </div>
  );
};

export default ActivityEdit;
