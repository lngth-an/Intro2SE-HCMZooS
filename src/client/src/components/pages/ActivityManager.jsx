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
  ExclamationCircleOutlined,
  CheckCircleOutlined,
} from "@ant-design/icons";
import { FileWarning, Eye, Edit, Trash2 } from "lucide-react";
import dayjs from "dayjs";
import { DOMAINS } from '../../constants/activityTypes';

const API_BASE_URL = "http://localhost:3001";
const ACTIVITIES_API_URL = `${API_BASE_URL}/activity/manage`;

// Map activityStatus to display colors
const statusColors = {
  draft: "bg-gray-200 text-gray-800",
  published: "bg-teal-100 text-teal-800",
  absent: "bg-red-100 text-red-800",
  completed: "bg-green-100 text-green-800"
};

// Map activityStatus to Vietnamese labels
const statusLabels = {
  draft: "Bản nháp",
  published: "Đã đăng tải",
  absent: "Vắng",
  completed: "Đã hoàn thành"
};

const DEFAULT_IMAGE =
  "https://cylpzmvdcyhkvghdeelb.supabase.co/storage/v1/object/public/activities//dai-hoc-khoa-ho-ctu-nhien-tphcm.jpg";

const { Option } = Select;
const { TextArea } = Input;

const ACTIVITY_TYPES = [
  { value: "Học thuật", label: "Học thuật" },
  { value: "Tình nguyện", label: "Tình nguyện" },
  { value: "Văn hóa", label: "Văn hóa" },
  { value: "Thể thao", label: "Thể thao" },
  { value: "Kỹ năng", label: "Kỹ năng" },
  { value: "Nghệ thuật", label: "Nghệ thuật" },
  { value: "Hội thảo", label: "Hội thảo" },
  { value: "Khác", label: "Khác" },
];

const ACTIVITY_STATUSES = [
  { value: "Bản nháp", label: "Bản nháp" },
  { value: "Đã đăng tải", label: "Đang diễn ra" },
  { value: "Đã hoàn thành", label: "Đã kết thúc" },
  { value: "Vắng", label: "Vắng" }
];

function ActivityManager() {
  const [activities, setActivities] = useState([]);
  const [totalActivities, setTotalActivities] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [activityTypes, setActivityTypes] = useState([]);

  const [editingId, setEditingId] = useState(null);
  const [editingActivity, setEditingActivity] = useState(null);

  const navigate = useNavigate();

  // States for search and filter
  const [searchTerm, setSearchTerm] = useState("");
  const [activityStatusFilter, setActivityStatusFilter] = useState("");
  const [activityTypeFilter, setActivityTypeFilter] = useState("");
  const [isApprovedFilter, setIsApprovedFilter] = useState("");
  const [sortBy, setSortBy] = useState("registrationStart");
  const [sortOrder, setSortOrder] = useState("desc");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

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

      let activitiesData = response.data.activities || [];

      // Extract unique activity types from all activities
      const uniqueTypes = [
        ...new Set(activitiesData.map((activity) => activity.type)),
      ];
      setActivityTypes(uniqueTypes);

      // Filter activities by type if activityTypeFilter is set
      if (activityTypeFilter) {
        activitiesData = activitiesData.filter(
          (activity) => activity.type === activityTypeFilter
        );
      }

      setActivities(activitiesData);
      setTotalActivities(activitiesData.length);
      setCurrentPage(1); // Reset to first page after filtering
      setItemsPerPage(response.data.limit || 10);
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
    activityTypeFilter,
    sortBy,
    sortOrder,
    currentPage,
    itemsPerPage,
  ]);

  useEffect(() => {
    fetchActivities();
  }, [activityTypeFilter, fetchActivities]);

  useEffect(() => {
    setCurrentPage(1);
  }, [activityTypeFilter, searchTerm, activityStatusFilter, isApprovedFilter]);

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
      toast.success("Đã đăng tải hoạt động thành công!");
      fetchActivities();
    } catch (error) {
      console.error("Publish error:", error);
      toast.error(
        error.response?.data?.message || "Không thể đăng tải hoạt động"
      );
    }
  };

  const handleComplete = async (id) => {
    const token = localStorage.getItem("accessToken");
    try {
      await axios.patch(
        `${API_BASE_URL}/activity/${id}/complete`,
        {},
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      toast.success("Hoạt động đã được đánh dấu hoàn thành!");
      fetchActivities();
    } catch (error) {
      console.error("Complete error:", error);
      toast.error(
        error.response?.data?.message || "Không thể đánh dấu hoàn thành"
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
        <span className={`px-2 py-1 rounded-full text-xs font-medium ${statusColors[status] || 'bg-gray-300 text-gray-800'}`}>{statusLabels[status] || status}</span>
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
              navigate(`/organizer/activities/${record.activityID}`, { state: { from: 'manager' } })
            }
          >
            Xem
          </Button>
          {record.activityStatus === "Bản nháp" && (
            <>
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
                description="Hành động này không thể hoàn tác."
                icon={<ExclamationCircleOutlined style={{ color: 'red' }} />}
                onConfirm={() => handleDelete(record.activityID)}
                okText="Có, xóa"
                cancelText="Hủy"
                okButtonProps={{ danger: true }}
                cancelButtonProps={{ type: 'default' }}
              >
                <Button type="default" danger icon={<DeleteOutlined />}>
                  Xóa
                </Button>
              </Popconfirm>
              <Popconfirm
                title="Xác nhận xuất bản hoạt động"
                description="Bạn có chắc chắn muốn xuất bản hoạt động này không? Hoạt động đã xuất bản sẽ không thể chỉnh sửa!"
                icon={<ExclamationCircleOutlined style={{ color: 'orange' }} />}
                onConfirm={() => handlePublish(record.activityID)}
                okText="Có, xuất bản"
                cancelText="Hủy"
                okButtonProps={{ type: 'primary' }}
                cancelButtonProps={{ type: 'default' }}
              >
                <Button
                  type="primary"
                >
                  Xuất bản
                </Button>
              </Popconfirm>
            </>
          )}
          {record.activityStatus === "Đã đăng tải" && (
            <Popconfirm
              title="Xác nhận hoàn thành hoạt động"
              description="Bạn có chắc chắn muốn đánh dấu hoạt động này đã hoàn thành? Hành động này sẽ cập nhật trạng thái hoạt động."
              icon={<CheckCircleOutlined style={{ color: 'green' }} />}
              onConfirm={() => handleComplete(record.activityID)}
              okText="Có, hoàn thành"
              cancelText="Hủy"
              okButtonProps={{ 
                style: { backgroundColor: '#52c41a', borderColor: '#52c41a' }
              }}
              cancelButtonProps={{ type: 'default' }}
            >
              <Button
                type="primary"
                style={{ backgroundColor: '#52c41a', borderColor: '#52c41a' }}
              >
                Hoàn thành
              </Button>
            </Popconfirm>
          )}
        </Space>
      ),
    },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-4xl font-extrabold text-gray-900 tracking-tight">
          QUẢN LÝ HOẠT ĐỘNG
        </h1>
        <Button
          type="primary"
          icon={<PlusOutlined />}
          onClick={() => navigate("/organizer/activity-create")}
          className="h-12 px-6 text-base font-semibold"
        >
          Tạo hoạt động
        </Button>
      </div>

      {/* Search and Filter */}
      <div className="flex justify-end space-x-4 mb-6">
        <Input
          placeholder="Tìm kiếm hoạt động..."
          prefix={<SearchOutlined />}
          value={searchTerm}
          onChange={(e) => {
            setSearchTerm(e.target.value);
            setCurrentPage(1);
          }}
          className="w-64"
        />
        <Select
          style={{ width: 200 }}
          placeholder="Lọc theo loại hoạt động..."
          value={activityTypeFilter}
          onChange={(value) => {
            setActivityTypeFilter(value);
          }}
          allowClear
          className="w-64"
        >
          {activityTypes.map((type) => (
            <Option key={type} value={type}>
              {type}
            </Option>
          ))}
        </Select>
      </div>

      {/* Display message based on filter */}
      {activityTypeFilter && (
        <div className="mb-4 text-lg font-medium text-gray-700">
          Những hoạt động thuộc lĩnh vực {activityTypeFilter}:
        </div>
      )}

      {/* Activities Table or No Activities Message */}
      {activities.length > 0 ? (
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
      ) : (
        <div className="text-center py-8">
          <div className="text-xl text-gray-600 mb-2">
            {activityTypeFilter
              ? `Không có hoạt động nào thuộc lĩnh vực ${activityTypeFilter}`
              : "Chưa có hoạt động nào được tạo"}
          </div>
          {!activityTypeFilter && (
            <Button
              type="primary"
              icon={<PlusOutlined />}
              onClick={() => navigate("/organizer/activity-create")}
            >
              Tạo hoạt động mới
            </Button>
          )}
        </div>
      )}

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
            dependencies={['startDate']}
            rules={[
              { required: true, message: "Vui lòng chọn ngày kết thúc" },
              ({ getFieldValue }) => ({
                validator(_, value) {
                  if (!value || !getFieldValue('startDate')) {
                    return Promise.resolve();
                  }
                  const startDate = getFieldValue('startDate');
                  if (value && startDate && value.isSameOrBefore(startDate)) {
                    return Promise.reject(new Error('Ngày kết thúc phải lớn hơn ngày bắt đầu!'));
                  }
                  return Promise.resolve();
                },
              }),
            ]}
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
