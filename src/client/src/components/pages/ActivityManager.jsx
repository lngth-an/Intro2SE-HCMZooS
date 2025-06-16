import React, { useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { toast } from "react-hot-toast";
import {
  message,
  Table,
  Button,
  Modal,
  Form,
  Input,
  Select,
  DatePicker,
  Space,
  Popconfirm,
} from "antd";
import {
  SearchOutlined,
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  EyeOutlined,
} from "@ant-design/icons";
import { FileWarning, Eye, Edit, Trash2 } from "lucide-react";
import dayjs from "dayjs";

const API_BASE_URL = "http://localhost:3001";
const ACTIVITIES_API_URL = `${API_BASE_URL}/activity/manage`;

// Static data for domains
const DOMAINS = [
  { id: "Học thuật", label: "Học thuật", color: "bg-blue-100 text-blue-800" },
  {
    id: "Tình nguyện",
    label: "Tình nguyện",
    color: "bg-green-100 text-green-800",
  },
  {
    id: "Văn hóa - Thể thao",
    label: "Văn hóa - Thể thao",
    color: "bg-yellow-100 text-yellow-800",
  },
  { id: "Kỹ năng", label: "Kỹ năng", color: "bg-purple-100 text-purple-800" },
  { id: "Nghệ thuật", label: "Nghệ thuật", color: "bg-pink-100 text-pink-800" },
  { id: "Khác", label: "Khác", color: "bg-gray-100 text-gray-800" },
];

// Map activityStatus to display colors
const statusColors = {
  draft: "bg-gray-200 text-gray-800",
  pending: "bg-yellow-100 text-yellow-800",
  approved: "bg-blue-100 text-blue-800",
  rejected: "bg-red-100 text-red-800",
  finished: "bg-green-100 text-green-800",
  upcoming: "bg-indigo-100 text-indigo-800",
  cancelled: "bg-red-200 text-red-900",
  published: "bg-teal-100 text-teal-800",
};

// Map activityStatus to Vietnamese labels
const statusLabels = {
  draft: "Bản nháp",
  pending: "Chờ duyệt",
  approved: "Đã duyệt",
  rejected: "Bị từ chối",
  finished: "Đã hoàn thành",
  upcoming: "Sắp diễn ra",
  cancelled: "Đã hủy",
  published: "Đã đăng tải",
};

const DEFAULT_IMAGE =
  "https://cylpzmvdcyhkvghdeelb.supabase.co/storage/v1/object/public/activities//dai-hoc-khoa-ho-ctu-nhien-tphcm.jpg";

const { Option } = Select;
const { TextArea } = Input;

const ACTIVITY_TYPES = [
  { value: "training", label: "Đào tạo" },
  { value: "event", label: "Sự kiện" },
  { value: "competition", label: "Cuộc thi" },
];

const ACTIVITY_STATUSES = [
  { value: "draft", label: "Bản nháp" },
  { value: "published", label: "Đang diễn ra" },
  { value: "completed", label: "Đã kết thúc" },
];

function ActivityManager() {
  const [activities, setActivities] = useState([]);
  const [totalActivities, setTotalActivities] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [editingId, setEditingId] = useState(null);
  const [editingActivity, setEditingActivity] = useState(null);

  const navigate = useNavigate();

  // States for search and filter
  const [searchTerm, setSearchTerm] = useState("");
  const [activityStatusFilter, setActivityStatusFilter] = useState("");
  const [isApprovedFilter, setIsApprovedFilter] = useState(""); // true/false or '' for all
  const [sortBy, setSortBy] = useState("registrationStart");
  const [sortOrder, setSortOrder] = useState("desc");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10); // Matches default limit in backend

  const [modalVisible, setModalVisible] = useState(false);
  const [selectedActivity, setSelectedActivity] = useState(null);
  const [form] = Form.useForm();

  const [totalPages, setTotalPages] = useState(0);

  const filters = {
    q: searchTerm,
    status: activityStatusFilter,
    isApproved: isApprovedFilter,
    sortBy: sortBy,
    sortOrder: sortOrder,
  };

  const fetchActivities = useCallback(async () => {
    setLoading(true);
    setError("");
    const token = localStorage.getItem("accessToken");

    if (!token) {
      setError("Bạn chưa đăng nhập. Vui lòng đăng nhập lại.");
      setLoading(false);
      return;
    }

    try {
      const response = await axios.get(ACTIVITIES_API_URL, {
        headers: { Authorization: `Bearer ${token}` },
        params: {
          q: searchTerm,
          status: activityStatusFilter,
          isApproved: isApprovedFilter,
          sortBy,
          sortOrder,
          page: currentPage,
          limit: itemsPerPage,
        },
      });

      setActivities(response.data.activities || []);
      setTotalActivities(response.data.total || 0);
      setCurrentPage(response.data.page || 1);
      setItemsPerPage(response.data.limit || 10); // Update from backend response
    } catch (err) {
      console.error("Error fetching activities:", err);
      if (err.response && err.response.status === 401) {
        setError("Phiên đăng nhập hết hạn. Vui lòng đăng nhập lại.");
      } else {
        setError(
          err.response?.data?.message ||
            "Đã có lỗi xảy ra khi tải danh sách hoạt động."
        );
      }
    } finally {
      setLoading(false);
    }
  }, [
    searchTerm,
    activityStatusFilter,
    isApprovedFilter,
    sortBy,
    sortOrder,
    currentPage,
    itemsPerPage,
  ]);

  useEffect(() => {
    fetchActivities();
  }, [fetchActivities]);

  const handleEdit = (record) => {
    setSelectedActivity(record);
    form.setFieldsValue({
      ...record,
      startDate: record.startDate ? dayjs(record.startDate) : null,
      endDate: record.endDate ? dayjs(record.endDate) : null,
    });
    setModalVisible(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Bạn có chắc chắn muốn xóa hoạt động này?")) {
      return;
    }
    const token = localStorage.getItem("accessToken");
    try {
      await axios.delete(`${API_BASE_URL}/activity/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      toast.success("Xóa hoạt động thành công");
      fetchActivities();
    } catch (error) {
      console.error("Delete error:", error);
      toast.error(error.response?.data?.message || "Không thể xóa hoạt động");
    }
  };

  const handlePublish = async (id) => {
    const token = localStorage.getItem("accessToken");
    try {
      await axios.patch(
        `${API_BASE_URL}/activity/${id}/publish`,
        {},
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      toast.success("Đã xuất bản hoạt động thành công!");
      fetchActivities();
    } catch (error) {
      console.error("Publish error:", error);
      toast.error(
        error.response?.data?.message || "Không thể xuất bản hoạt động"
      );
    }
  };

  const handleSubmit = async (values) => {
    setLoading(true);
    const token = localStorage.getItem("accessToken");
    try {
      if (selectedActivity) {
        await axios.put(
          `${ACTIVITIES_API_URL}/${selectedActivity.activityID}`,
          values,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        toast.success("Đã cập nhật hoạt động thành công!");
      } else {
        await axios.post(ACTIVITIES_API_URL, values, {
          headers: { Authorization: `Bearer ${token}` },
        });
        toast.success("Đã tạo hoạt động thành công!");
      }
      setModalVisible(false);
      setEditingId(null);
      setEditingActivity(null);
      fetchActivities();
    } catch (error) {
      console.error("Form submit error:", error);
      toast.error(
        error.response?.data?.message || "Có lỗi xảy ra khi lưu hoạt động"
      );
    } finally {
      setLoading(false);
    }
  };

  const handlePageChange = (newPage) => {
    setCurrentPage(newPage);
  };

  // Helper to render pagination buttons
  const renderPagination = () => {
    if (totalPages <= 1) return null;

    const pages = [];
    for (let i = 1; i <= totalPages; i++) {
      pages.push(
        <button
          key={i}
          onClick={() => handlePageChange(i)}
          className={`px-3 py-1 rounded-md text-sm font-medium ${
            currentPage === i
              ? "bg-blue-600 text-white"
              : "bg-gray-200 text-gray-700 hover:bg-gray-300"
          }`}
        >
          {i}
        </button>
      );
    }
    return (
      <div className="flex justify-center items-center space-x-2 mt-8">
        <button
          onClick={() => handlePageChange(currentPage - 1)}
          disabled={currentPage === 1}
          className="px-3 py-1 rounded-md bg-gray-200 text-gray-700 hover:bg-gray-300 disabled:opacity-50"
        >
          Trước
        </button>
        {pages}
        <button
          onClick={() => handlePageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
          className="px-3 py-1 rounded-md bg-gray-200 text-gray-700 hover:bg-gray-300 disabled:opacity-50"
        >
          Sau
        </button>
      </div>
    );
  };

  // Helper to map domain IDs to labels
  const getDomainLabels = (domainIds) => {
    if (!Array.isArray(domainIds)) return "N/A";
    return domainIds
      .map((id) => DOMAINS.find((d) => d.id === id)?.label || id)
      .join(", ");
  };

  const columns = [
    {
      title: "Tên hoạt động",
      dataIndex: "name",
      key: "name",
      render: (text, record) => (
        <div className="flex items-center space-x-2">
          <img
            src={record.image || DEFAULT_IMAGE}
            alt={text}
            className="w-10 h-10 rounded object-cover"
          />
          <span>{text}</span>
        </div>
      ),
    },
    {
      title: "Trạng thái",
      dataIndex: "activityStatus",
      key: "activityStatus",
      render: (status) => (
        <span
          className={`px-2 py-1 rounded-full text-xs font-medium ${
            statusColors[status] || "bg-gray-200 text-gray-800"
          }`}
        >
          {statusLabels[status] || status}
        </span>
      ),
    },
    {
      title: "Thời gian",
      dataIndex: "eventStart",
      key: "eventStart",
      render: (date) => (date ? new Date(date).toLocaleDateString() : "N/A"),
    },
    {
      title: "Địa điểm",
      dataIndex: "location",
      key: "location",
    },
    {
      title: "Thao tác",
      key: "actions",
      render: (_, record) => (
        <Space size="middle">
          <Button
            type="primary"
            icon={<EyeOutlined />}
            onClick={() =>
              navigate(`/organizer/activities/${record.activityID}`)
            }
          >
            Xem
          </Button>
          <Button
            type="default"
            icon={<EditOutlined />}
            onClick={() => {
              console.log(
                "Navigating to edit page for activity:",
                record.activityID
              );
              navigate(`/organizer/activities/${record.activityID}/edit`, {
                replace: false,
              });
            }}
          >
            Sửa
          </Button>
          <Popconfirm
            title="Bạn có chắc chắn muốn xóa hoạt động này?"
            onConfirm={() => handleDelete(record.activityID)}
            okText="Có"
            cancelText="Không"
          >
            <Button type="default" danger icon={<DeleteOutlined />}>
              Xóa
            </Button>
          </Popconfirm>
          {record.activityStatus === "draft" && (
            <Button
              type="primary"
              onClick={() => handlePublish(record.activityID)}
            >
              Xuất bản
            </Button>
          )}
        </Space>
      ),
    },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Quản lý hoạt động</h1>
        <Button
          type="primary"
          icon={<PlusOutlined />}
          onClick={() => navigate("/organizer/activity-create")}
        >
          Tạo hoạt động mới
        </Button>
      </div>

      {/* Search and Filter */}
      <div className="flex space-x-4 mb-6">
        <Input
          placeholder="Tìm kiếm hoạt động..."
          prefix={<SearchOutlined />}
          value={searchTerm}
          onChange={(e) => {
            setSearchTerm(e.target.value);
            setCurrentPage(1); // Reset to first page on new search
          }}
          className="w-64"
        />
        <Select
          placeholder="Trạng thái"
          value={activityStatusFilter}
          onChange={setActivityStatusFilter}
          allowClear
          className="w-48"
        >
          <Option value="draft">Bản nháp</Option>
          <Option value="published">Đã đăng tải</Option>
          <Option value="finished">Đã hoàn thành</Option>
          <Option value="cancelled">Đã hủy</Option>
          <Option value="pending">Chờ duyệt</Option>
          <Option value="approved">Đã duyệt</Option>
          <Option value="rejected">Bị từ chối</Option>
          <Option value="upcoming">Sắp diễn ra</Option>
        </Select>
      </div>

      {/* Activities Table */}
      <Table
        columns={columns}
        dataSource={activities}
        rowKey="activityID"
        loading={loading}
        pagination={{
          current: currentPage,
          pageSize: itemsPerPage,
          total: totalActivities,
          onChange: handlePageChange,
        }}
      />

      {error && (
        <div className="mt-4 p-4 bg-red-100 text-red-700 rounded">{error}</div>
      )}

      <Modal
        title={selectedActivity ? "Chỉnh sửa hoạt động" : "Tạo hoạt động mới"}
        open={modalVisible}
        onCancel={() => setModalVisible(false)}
        footer={null}
      >
        <Form form={form} layout="vertical" onFinish={handleSubmit}>
          <Form.Item
            name="name"
            label="Tên hoạt động"
            rules={[{ required: true, message: "Vui lòng nhập tên hoạt động" }]}
          >
            <Input />
          </Form.Item>

          <Form.Item
            name="type"
            label="Loại hoạt động"
            rules={[
              { required: true, message: "Vui lòng chọn loại hoạt động" },
            ]}
          >
            <Select>
              {ACTIVITY_TYPES.map((type) => (
                <Option key={type.value} value={type.value}>
                  {type.label}
                </Option>
              ))}
            </Select>
          </Form.Item>

          <Form.Item
            name="startDate"
            label="Ngày bắt đầu"
            rules={[{ required: true, message: "Vui lòng chọn ngày bắt đầu" }]}
          >
            <DatePicker className="w-full" />
          </Form.Item>

          <Form.Item
            name="endDate"
            label="Ngày kết thúc"
            rules={[{ required: true, message: "Vui lòng chọn ngày kết thúc" }]}
          >
            <DatePicker className="w-full" />
          </Form.Item>

          <Form.Item
            name="description"
            label="Mô tả"
            rules={[{ required: true, message: "Vui lòng nhập mô tả" }]}
          >
            <TextArea rows={4} />
          </Form.Item>

          <Form.Item>
            <Space>
              <Button type="primary" htmlType="submit">
                {selectedActivity ? "Cập nhật" : "Tạo mới"}
              </Button>
              <Button onClick={() => setModalVisible(false)}>Hủy</Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
}

export default ActivityManager;
