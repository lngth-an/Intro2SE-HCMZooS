import React, { useEffect, useState } from "react";
import { useAuth } from "../contexts/AuthContext";
import Header from "../components/common/Header";
import SidebarOrganizer from "../components/common/SidebarOrganizer";
import Footer from "../components/common/Footer";
import OrganizerComplaintsContent from "../components/pages/OrganizerComplaints";
import axios from "axios";

function useOrganizerStats() {
  const [completedCount, setCompletedCount] = useState(0);
  const [pendingComplaints, setPendingComplaints] = useState(0);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        // Lấy danh sách hoạt động của organizer
        const activitiesRes = await axios.get("/activity/organizer");
        const activities = activitiesRes.data.activities || [];
        setCompletedCount(
          activities.filter(
            (activity) => activity.activityStatus === "Đã hoàn thành"
          ).length
        );

        // Lấy danh sách complaints của organizer
        const complaintsRes = await axios.get("/activity/complaint/organizer");
        const complaints = complaintsRes.data.complaints || [];
        const pendingCount = complaints.filter(
          (complaint) => complaint.complaintStatus === "Chờ duyệt"
        ).length;
        setPendingComplaints(pendingCount);
      } catch (err) {
        // handle error
      }
    };
    fetchStats();
  }, []);

  return { completedCount, pendingComplaints };
}

export default function OrganizerComplaints() {
  const { user, logout } = useAuth();
  const { completedCount, pendingComplaints } = useOrganizerStats();

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Header user={user} onLogout={logout} />
      <SidebarOrganizer onLogout={logout} />

      <div className="ml-64 pt-16 flex-1">
        <div className="p-6">
          <OrganizerComplaintsContent />
        </div>
      </div>

      <div className="ml-64">
        <Footer />
      </div>

      <div className="ml-64">
        <div>
          <h2>Quản lý hoạt động</h2>
          <p>Số lượng hoạt động đã hoàn thành: {completedCount}</p>
        </div>
        <div className="bg-blue-50 p-4 rounded-lg">
          <div className="text-gray-600 block mb-1">
            Xem các hoạt động của bạn
          </div>
        </div>
      </div>

      <div className="ml-64">
        <div>
          <div className="text-gray-600 block mb-1">Xem các đơn khiếu nại</div>
        </div>
        <div className="bg-orange-50 p-4 rounded-lg">
          <div className="text-gray-600 block mb-1">Xem các đơn khiếu nại</div>
        </div>
      </div>
    </div>
  );
}
