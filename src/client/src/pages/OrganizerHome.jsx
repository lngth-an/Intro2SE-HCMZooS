import OrganizerHomeMain from "../components/pages/OrganizerHomeMain";
import Header from "../components/common/Header";
import SidebarOrganizer from "../components/common/SidebarOrganizer";
import Footer from "../components/common/Footer";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { message } from "antd";

export default function OrganizerHome(props) {
  const navigate = useNavigate();

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
    <OrganizerHomeMain
      Header={Header}
      SidebarOrganizer={SidebarOrganizer}
      Footer={Footer}
      onLogout={handleLogout}
    />
  );
}
