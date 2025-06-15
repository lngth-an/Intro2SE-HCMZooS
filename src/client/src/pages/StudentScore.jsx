import React, { useEffect, useState } from "react";
import Header from "../components/common/Header";
import SidebarStudent from "../components/common/SidebarStudent";
import Footer from "../components/common/Footer";

export default function StudentScore() {
  const [semesters, setSemesters] = useState([]);
  const [selectedSemester, setSelectedSemester] = useState(null);
  const [activities, setActivities] = useState([]);
  const [totalPoints, setTotalPoints] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Fetch semesters
    fetch("/semester")
      .then((res) => res.json())
      .then((data) => {
        setSemesters(data.semesters || []);
        if (data.semesters && data.semesters.length > 0) {
          setSelectedSemester(data.semesters[0].semesterID);
        }
      })
      .catch((err) => console.error("Error fetching semesters:", err));
  }, []);

  useEffect(() => {
    if (selectedSemester) {
      setLoading(true);
      // Fetch activities and score for selected semester
      Promise.all([
        fetch(`/student/activities?semesterID=${selectedSemester}`).then(
          (res) => res.json()
        ),
        fetch(`/student/score?semesterID=${selectedSemester}`).then((res) =>
          res.json()
        ),
      ])
        .then(([activitiesData, scoreData]) => {
          setActivities(activitiesData.activities || []);
          setTotalPoints(scoreData.score || 0);
          setLoading(false);
        })
        .catch((err) => {
          console.error("Error fetching data:", err);
          setLoading(false);
        });
    }
  }, [selectedSemester]);

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      {/* Header */}
      <Header
        user={{ name: "Nguyễn Văn A", avatar: "/avatar.png", role: "student" }}
      />

      {/* Main content with sidebar */}
      <div className="flex flex-1 pt-16">
        {/* Sidebar */}
        <SidebarStudent onLogout={() => alert("Đăng xuất!")} />

        {/* Main content area */}
        <div className="flex-1 flex flex-col ml-64">
          <main className="flex-1 p-6">
            <div className="max-w-7xl mx-auto">
              {/* Page Header */}
              <div className="mb-8">
                <h1 className="text-2xl font-bold text-gray-900">
                  Điểm rèn luyện
                </h1>
                <p className="mt-2 text-sm text-gray-600">
                  Xem chi tiết điểm rèn luyện theo từng học kỳ
                </p>
              </div>

              {/* Semester Selector */}
              <div className="mb-6">
                <label
                  htmlFor="semester"
                  className="block text-sm font-medium text-gray-700 mb-2"
                >
                  Chọn học kỳ
                </label>
                <select
                  id="semester"
                  value={selectedSemester || ""}
                  onChange={(e) => setSelectedSemester(e.target.value)}
                  className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
                >
                  {semesters.map((semester) => (
                    <option
                      key={semester.semesterID}
                      value={semester.semesterID}
                    >
                      {semester.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Total Points Card */}
              <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-800">
                      Tổng điểm rèn luyện
                    </h3>
                    <p className="text-sm text-gray-600">Học kỳ hiện tại</p>
                  </div>
                  <div className="text-3xl font-bold text-blue-600">
                    {loading ? "..." : totalPoints}
                  </div>
                </div>
              </div>

              {/* Activities List */}
              <div className="bg-white rounded-lg shadow-sm overflow-hidden">
                <div className="px-6 py-4 border-b border-gray-200">
                  <h2 className="text-lg font-semibold text-gray-800">
                    Chi tiết hoạt động
                  </h2>
                </div>
                {loading ? (
                  <div className="p-6 text-center text-gray-500">
                    Đang tải dữ liệu...
                  </div>
                ) : activities.length === 0 ? (
                  <div className="p-6 text-center text-gray-500">
                    Không có hoạt động nào trong học kỳ này
                  </div>
                ) : (
                  <div className="divide-y divide-gray-200">
                    {activities.map((activity) => (
                      <div key={activity.participationID} className="p-6">
                        <div className="flex items-center justify-between">
                          <div className="flex-1">
                            <h3 className="text-lg font-medium text-gray-900">
                              {activity.name}
                            </h3>
                            <div className="mt-1 flex items-center space-x-4">
                              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                                {activity.type}
                              </span>
                              <span className="text-sm text-gray-500">
                                {new Date(
                                  activity.eventStart
                                ).toLocaleDateString()}
                              </span>
                              <span className="text-sm text-gray-500">
                                {activity.location}
                              </span>
                            </div>
                          </div>
                          <div className="ml-4 flex-shrink-0">
                            <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800">
                              {activity.trainingPoint} điểm
                            </span>
                          </div>
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
    </div>
  );
}
