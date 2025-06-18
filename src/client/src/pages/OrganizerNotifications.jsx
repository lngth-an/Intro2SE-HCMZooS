import React, { useState, useEffect, useCallback } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import { useAuth } from "../contexts/AuthContext";
import Header from "../components/common/Header";
import SidebarOrganizer from "../components/common/SidebarOrganizer";
import Footer from "../components/common/Footer";
import {
  Button,
  Tabs,
  Modal,
  Input,
  Select,
  Typography,
  Badge,
  Spin,
  Row,
  Col,
  Card,
} from "antd";
import { SendOutlined, PlusOutlined, BellOutlined } from "@ant-design/icons";

const { Title, Text } = Typography;
const { TabPane } = Tabs;
const { Option } = Select;

const OrganizerNotifications = () => {
  const { logout } = useAuth();
  const [notifications, setNotifications] = useState([]);
  const [sentNotifications, setSentNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [openDialog, setOpenDialog] = useState(false);
  const [activities, setActivities] = useState([]);
  const [selectedActivity, setSelectedActivity] = useState("");
  const [sendTarget, setSendTarget] = useState("all");
  const [selectedStudents, setSelectedStudents] = useState([]);
  const [students, setStudents] = useState([]);
  const [newNotification, setNewNotification] = useState({
    title: "",
    message: "",
  });
  const [activeTab, setActiveTab] = useState("received");
  const [user, setUser] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const userRes = await axios.get("/auth/me");
        setUser(userRes.data);
        const notiRes = await axios.get(
          `/notifications?userID=${userRes.data.userID}`
        );
        setNotifications(notiRes.data.notifications || []);
        const sentRes = await axios.get(
          `/notifications/sent?userID=${userRes.data.userID}`
        );
        setSentNotifications(sentRes.data.notifications || []);
        const actRes = await axios.get("/activity/organizer");
        setActivities(actRes.data.activities || []);
      } catch (err) {
        toast.error("Không thể tải dữ liệu thông báo");
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const handleOpenDialog = () => {
    setOpenDialog(true);
    setNewNotification({ title: "", message: "" });
    setSelectedActivity("");
    setSendTarget("all");
    setSelectedStudents([]);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
  };

  const handleSendNotification = async () => {
    try {
      await axios.post("/notifications/send", {
        fromUserID: user.userID,
        toUserIDs:
          sendTarget === "specific"
            ? selectedStudents.map((s) => s.userID)
            : undefined,
        notificationTitle: newNotification.title,
        notificationMessage: newNotification.message,
        activityID: selectedActivity || undefined,
      });
      toast.success("Gửi thông báo thành công");
      setOpenDialog(false);
      // Refresh notifications
      const notiRes = await axios.get(`/notifications?userID=${user.userID}`);
      setNotifications(notiRes.data.notifications || []);
      const sentRes = await axios.get(
        `/notifications/sent?userID=${user.userID}`
      );
      setSentNotifications(sentRes.data.notifications || []);
    } catch (err) {
      toast.error("Lỗi khi gửi thông báo");
    }
  };

  const handleTabChange = (key) => {
    setActiveTab(key);
  };

  // Search students for specific send
  const handleSearchStudents = async (value) => {
    if (!value) return;
    try {
      const res = await axios.get(`/notifications/search?query=${value}`);
      setStudents(res.data.students || []);
    } catch (err) {
      toast.error("Lỗi khi tìm kiếm sinh viên");
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Header user={user} />
      <div className="flex flex-1 pt-16">
        <SidebarOrganizer onLogout={logout} />
        <div className="flex-1 flex flex-col ml-64">
          <main className="flex-1 p-6">
            <div className="container mx-auto px-4 py-8">
              <div className="bg-white shadow rounded-lg p-6">
                <div className="flex justify-between items-center mb-2">
                  <h1 className="text-4xl font-extrabold text-gray-900 tracking-tight mb-0">
                    THÔNG BÁO
                  </h1>
                  <Button
                    type="primary"
                    icon={<SendOutlined />}
                    onClick={handleOpenDialog}
                    className="h-12 px-6 text-base font-semibold bg-blue-600 hover:bg-blue-700 text-white normal-case"
                  >
                    Gửi thông báo mới
                  </Button>
                </div>
                <div className="mb-6">
                  <span className="text-lg text-gray-600 font-medium">
                    {
                      notifications.filter(
                        (n) => n.notificationStatus === "unread"
                      ).length
                    }{" "}
                    thông báo chưa đọc
                  </span>
                </div>
                <Tabs
                  activeKey={activeTab}
                  onChange={handleTabChange}
                  className="mb-6 custom-large-tab"
                >
                  <TabPane
                    tab={
                      <span className="text-lg font-semibold">
                        <BellOutlined /> Thông báo đã nhận
                      </span>
                    }
                    key="received"
                  >
                    {loading ? (
                      <div className="flex justify-center items-center py-12">
                        <Spin size="large" />
                      </div>
                    ) : notifications.length === 0 ? (
                      <div className="text-center text-gray-500 py-8">
                        Không có thông báo nào
                      </div>
                    ) : (
                      <Row gutter={[16, 16]}>
                        {notifications.map((n) => (
                          <Col xs={24} md={12} key={n.notificationID}>
                            <Card className="mb-4">
                              <div className="flex items-center mb-2">
                                <BellOutlined className="text-blue-500 mr-2" />
                                <Text className="font-semibold text-lg">
                                  {n.notificationTitle}
                                </Text>
                                {n.notificationStatus === "unread" && (
                                  <Badge color="blue" className="ml-2" />
                                )}
                              </div>
                              <Text className="block text-gray-700 mb-2">
                                {n.notificationMessage}
                              </Text>
                              <Text className="text-xs text-gray-400">
                                {n.sentAt
                                  ? new Date(n.sentAt).toLocaleString()
                                  : ""}
                              </Text>
                            </Card>
                          </Col>
                        ))}
                      </Row>
                    )}
                  </TabPane>
                  <TabPane
                    tab={
                      <span className="text-lg font-semibold">
                        <SendOutlined /> Thông báo đã gửi
                      </span>
                    }
                    key="sent"
                  >
                    {loading ? (
                      <div className="flex justify-center items-center py-12">
                        <Spin size="large" />
                      </div>
                    ) : sentNotifications.length === 0 ? (
                      <div className="text-center text-gray-500 py-8">
                        Không có thông báo đã gửi
                      </div>
                    ) : (
                      <Row gutter={[16, 16]}>
                        {sentNotifications.map((n) => (
                          <Col xs={24} md={12} key={n.notificationID}>
                            <Card className="mb-4">
                              <div className="flex items-center mb-2">
                                <SendOutlined className="text-blue-500 mr-2" />
                                <Text className="font-semibold text-lg">
                                  {n.notificationTitle}
                                </Text>
                              </div>
                              <Text className="block text-gray-700 mb-2">
                                {n.notificationMessage}
                              </Text>
                              <Text className="text-xs text-gray-400">
                                {n.sentAt
                                  ? new Date(n.sentAt).toLocaleString()
                                  : ""}
                              </Text>
                            </Card>
                          </Col>
                        ))}
                      </Row>
                    )}
                  </TabPane>
                </Tabs>
              </div>
            </div>
          </main>
          <Footer />
        </div>
      </div>
      <Modal
        title={
          <span className="text-xl font-semibold normal-case">
            Gửi thông báo mới
          </span>
        }
        open={openDialog}
        onCancel={handleCloseDialog}
        onOk={handleSendNotification}
        okText="Gửi"
        cancelText="Hủy"
        okButtonProps={{
          className:
            "bg-blue-600 hover:bg-blue-700 text-white normal-case font-semibold",
        }}
        cancelButtonProps={{
          className: "normal-case font-semibold",
        }}
      >
        <div className="space-y-4 mt-2">
          <Select
            showSearch
            placeholder="Chọn hoạt động (không bắt buộc)"
            value={selectedActivity}
            onChange={setSelectedActivity}
            className="w-full"
            optionFilterProp="children"
            filterOption={(input, option) =>
              option.children.toLowerCase().indexOf(input.toLowerCase()) >= 0
            }
          >
            <Option value="">-- Chọn hoạt động --</Option>
            {activities.map((act) => (
              <Option key={act.activityID} value={act.activityID}>
                {act.name}
              </Option>
            ))}
          </Select>
          <Select
            value={sendTarget}
            onChange={setSendTarget}
            className="w-full"
          >
            <Option value="all">Tất cả sinh viên tham gia hoạt động</Option>
            <Option value="specific">Một số sinh viên cụ thể</Option>
          </Select>
          {sendTarget === "specific" && (
            <Select
              mode="multiple"
              showSearch
              placeholder="Tìm kiếm sinh viên..."
              value={selectedStudents.map((s) => s.userID)}
              onSearch={handleSearchStudents}
              onChange={(values) => {
                const selected = students.filter((s) =>
                  values.includes(s.userID)
                );
                setSelectedStudents(selected);
              }}
              className="w-full"
              optionLabelProp="label"
            >
              {students.map((student) => (
                <Option
                  key={student.userID}
                  value={student.userID}
                  label={student.name || student.userID}
                >
                  {student.name || student.userID}
                </Option>
              ))}
            </Select>
          )}
          <Input
            placeholder="Tiêu đề thông báo"
            value={newNotification.title}
            onChange={(e) =>
              setNewNotification({ ...newNotification, title: e.target.value })
            }
            className="normal-case"
          />
          <Input.TextArea
            placeholder="Nội dung thông báo"
            rows={4}
            value={newNotification.message}
            onChange={(e) =>
              setNewNotification({
                ...newNotification,
                message: e.target.value,
              })
            }
            className="normal-case"
          />
        </div>
      </Modal>
    </div>
  );
};

export default OrganizerNotifications;
