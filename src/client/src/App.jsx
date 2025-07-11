import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { useEffect } from "react";
import { AuthProvider } from "./contexts/AuthContext";
import { Toaster } from "react-hot-toast";

// Auth pages
import LoginPage from "./pages/auth/LoginPage";
import ForgotPasswordPage from "./pages/auth/ForgotPasswordPage";

// Student pages
import StudentHome from "./pages/StudentHome";
import StudentActivities from "./pages/StudentActivities";
import StudentScore from "./pages/StudentScore";
import ActivityRegister from "./components/pages/ActivityRegister";
import StudentNotifications from "./pages/StudentNotifications";
import Profile from "./pages/ProfileStudent";

// Organizer pages
import OrganizerHome from "./pages/OrganizerHome";
import OrganizerManageActivity from "./pages/OrganizerManageActivity";
import ActivityDetail from "./pages/ActivityDetail";
import OrganizerNotifications from "./pages/OrganizerNotifications";
import OrganizerComplaints from "./pages/OrganizerComplaints";
import ActivityCreate from "./pages/ActivityCreate";
import ActivityEdit from "./pages/ActivityEdit";
import ProfileOrganizer from "./pages/ProfileOrganizer";

// Protected Route component
const ProtectedRoute = ({ children, allowedRoles }) => {
  const token = localStorage.getItem("accessToken");
  const role = localStorage.getItem("role");

  // Nếu chưa đăng nhập hoặc không có role, chuyển về trang login
  if (!token || !role) {
    localStorage.removeItem("accessToken");
    localStorage.removeItem("role");
    return <Navigate to="/login" replace />;
  }

  // Nếu đã đăng nhập nhưng role không được phép truy cập
  if (allowedRoles && !allowedRoles.includes(role)) {
    return (
      <Navigate
        to={role === "student" ? "/student/home" : "/organizer/home"}
        replace
      />
    );
  }

  return children;
};

// Public Route component (chỉ cho phép truy cập khi chưa đăng nhập)
const PublicRoute = ({ children }) => {
  const token = localStorage.getItem("accessToken");
  const role = localStorage.getItem("role");

  // Nếu đã đăng nhập và có role hợp lệ, chuyển về trang tương ứng
  if (token && role && (role === "student" || role === "organizer")) {
    return (
      <Navigate
        to={role === "student" ? "/student/home" : "/organizer/home"}
        replace
      />
    );
  }

  // Nếu có token nhưng không có role hoặc role không hợp lệ, xóa token và cho phép truy cập
  if (token && (!role || (role !== "student" && role !== "organizer"))) {
    localStorage.removeItem("accessToken");
    localStorage.removeItem("role");
  }

  return children;
};

// Root Route component
const RootRoute = () => {
  const token = localStorage.getItem("accessToken");
  const role = localStorage.getItem("role");

  // Nếu chưa đăng nhập hoặc không có role, chuyển về trang login
  if (!token || !role) {
    localStorage.removeItem("accessToken");
    localStorage.removeItem("role");
    return <Navigate to="/login" replace />;
  }

  // Nếu role không hợp lệ, xóa token và chuyển về trang login
  if (role !== "student" && role !== "organizer") {
    localStorage.removeItem("accessToken");
    localStorage.removeItem("role");
    return <Navigate to="/login" replace />;
  }

  return (
    <Navigate
      to={role === "student" ? "/student/home" : "/organizer/home"}
      replace
    />
  );
};

function App() {
  // Kiểm tra và dọn dẹp localStorage khi ứng dụng khởi động
  useEffect(() => {
    const token = localStorage.getItem("accessToken");
    const role = localStorage.getItem("role");

    // Nếu có token nhưng không có role hoặc role không hợp lệ, xóa token
    if (token && (!role || (role !== "student" && role !== "organizer"))) {
      localStorage.removeItem("accessToken");
      localStorage.removeItem("role");
    }
  }, []);

  return (
    <AuthProvider>
      <BrowserRouter>
        <ToastContainer 
          position="top-right"
          autoClose={false}
          hideProgressBar={false}
          newestOnTop={false}
          closeOnClick={true}
          rtl={false}
          pauseOnFocusLoss={true}
          draggable={true}
          pauseOnHover={true}
        />
        <Routes>
          {/* Public routes */}
          <Route
            path="/login"
            element={
              <PublicRoute>
                <LoginPage />
              </PublicRoute>
            }
          />
          <Route
            path="/forgot-password"
            element={
              <PublicRoute>
                <ForgotPasswordPage />
              </PublicRoute>
            }
          />

          {/* Student routes */}
          <Route
            path="/student/home"
            element={
              <ProtectedRoute allowedRoles={["student"]}>
                <StudentHome />
              </ProtectedRoute>
            }
          />
          <Route
            path="/student/activities"
            element={
              <ProtectedRoute allowedRoles={["student"]}>
                <StudentActivities />
              </ProtectedRoute>
            }
          />
          <Route
            path="/student/score"
            element={
              <ProtectedRoute allowedRoles={["student"]}>
                <StudentScore />
              </ProtectedRoute>
            }
          />
          <Route
            path="/student/register"
            element={
              <ProtectedRoute allowedRoles={["student"]}>
                <ActivityRegister />
              </ProtectedRoute>
            }
          />
          <Route
            path="/student/notifications"
            element={
              <ProtectedRoute allowedRoles={["student"]}>
                <StudentNotifications />
              </ProtectedRoute>
            }
          />
          <Route
            path="/student/profile"
            element={
              <ProtectedRoute allowedRoles={["student"]}>
                <Profile />
              </ProtectedRoute>
            }
          />

          {/* Organizer routes */}
          <Route
            path="/organizer/home"
            element={
              <ProtectedRoute allowedRoles={["organizer"]}>
                <OrganizerHome />
              </ProtectedRoute>
            }
          />
          <Route
            path="/organizer/activities"
            element={
              <ProtectedRoute allowedRoles={["organizer"]}>
                <OrganizerManageActivity />
              </ProtectedRoute>
            }
          />
          <Route
            path="/organizer/activity-create"
            element={
              <ProtectedRoute allowedRoles={["organizer"]}>
                <ActivityCreate />
              </ProtectedRoute>
            }
          />
          <Route
            path="/organizer/activities/:id/edit"
            element={
              <ProtectedRoute allowedRoles={["organizer"]}>
                <ActivityEdit />
              </ProtectedRoute>
            }
          />
          <Route
            path="/organizer/activities/:activityId"
            element={
              <ProtectedRoute allowedRoles={["organizer"]}>
                <ActivityDetail />
              </ProtectedRoute>
            }
          />
          <Route
            path="/organizer/notifications"
            element={
              <ProtectedRoute allowedRoles={["organizer"]}>
                <OrganizerNotifications />
              </ProtectedRoute>
            }
          />
          <Route
            path="/organizer/complaints"
            element={
              <ProtectedRoute allowedRoles={["organizer"]}>
                <OrganizerComplaints />
              </ProtectedRoute>
            }
          />
          <Route
            path="/organizer/profile"
            element={
              <ProtectedRoute allowedRoles={["organizer"]}>
                <ProfileOrganizer />
              </ProtectedRoute>
            }
          />

          {/* Root route - Always redirect to login */}
          <Route path="/" element={<Navigate to="/login" replace />} />

          {/* Catch all route */}
          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
