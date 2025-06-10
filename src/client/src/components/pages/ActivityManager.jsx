import React, { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import ActivityForm from './ActivityForm';
import axios from 'axios';
import { toast } from 'react-hot-toast'; 
import { message, Table, Button, Modal, Form, Input, Select, DatePicker, Space, Popconfirm } from 'antd';
import { SearchOutlined, PlusOutlined, EditOutlined, DeleteOutlined, EyeOutlined } from '@ant-design/icons';
import { FileWarning, Eye, Edit, Trash2 } from 'lucide-react';
import dayjs from 'dayjs';

const API_BASE_URL = 'http://localhost:3001'; 
const ACTIVITIES_API_URL = `${API_BASE_URL}/activity`;

// Static data for domains (can be fetched from API if dynamic)
const DOMAINS = [
  { id: 'Học thuật', label: 'Học thuật', color: 'bg-blue-100 text-blue-800' },
  { id: 'Tình nguyện', label: 'Tình nguyện', color: 'bg-green-100 text-green-800' },
  { id: 'Văn hóa - Thể thao', label: 'Văn hóa - Thể thao', color: 'bg-yellow-100 text-yellow-800' },
  { id: 'Kỹ năng', label: 'Kỹ năng', color: 'bg-purple-100 text-purple-800' },
  { id: 'Nghệ thuật', label: 'Nghệ thuật', color: 'bg-pink-100 text-pink-800' },
  { id: 'Khác', label: 'Khác', color: 'bg-gray-100 text-gray-800' },
];

// Map activityStatus to display colors
const statusColors = {
  draft: 'bg-gray-200 text-gray-800',
  pending: 'bg-yellow-100 text-yellow-800',
  approved: 'bg-blue-100 text-blue-800',
  rejected: 'bg-red-100 text-red-800',
  finished: 'bg-green-100 text-green-800',
  upcoming: 'bg-indigo-100 text-indigo-800',
  cancelled: 'bg-red-200 text-red-900',
  published: 'bg-teal-100 text-teal-800' // Assuming 'published' is a status
};

const DEFAULT_IMAGE = 'https://cylpzmvdcyhkvghdeelb.supabase.co/storage/v1/object/public/activities//dai-hoc-khoa-ho-ctu-nhien-tphcm.jpg';

const { Option } = Select;
const { TextArea } = Input;

const ACTIVITY_TYPES = [
  { value: 'training', label: 'Đào tạo' },
  { value: 'event', label: 'Sự kiện' },
  { value: 'competition', label: 'Cuộc thi' }
];

const ACTIVITY_STATUSES = [
  { value: 'draft', label: 'Bản nháp' },
  { value: 'published', label: 'Đã xuất bản' },
  { value: 'ongoing', label: 'Đang diễn ra' },
  { value: 'completed', label: 'Đã kết thúc' }
];

function ActivityManager() {
  const [activities, setActivities] = useState([]);
  const [totalActivities, setTotalActivities] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [editingId, setEditingId] = useState(null);
  const [editingActivity, setEditingActivity] = useState(null);

  const navigate = useNavigate();

  // States for search and filter
  const [searchTerm, setSearchTerm] = useState('');
  const [activityStatusFilter, setActivityStatusFilter] = useState('');
  const [isApprovedFilter, setIsApprovedFilter] = useState(''); // true/false or '' for all
  const [sortBy, setSortBy] = useState('registrationStart');
  const [sortOrder, setSortOrder] = useState('desc');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10); // Matches default limit in backend

  const [modalVisible, setModalVisible] = useState(false);
  const [selectedActivity, setSelectedActivity] = useState(null);
  const [form] = Form.useForm();

  // Function to fetch activities with search/filter parameters
  const fetchActivities = useCallback(async () => {
    setLoading(true);
    setError('');
    const token = localStorage.getItem('accessToken');

    if (!token) {
      setError("Bạn chưa đăng nhập. Vui lòng đăng nhập lại.");
      setLoading(false);
      return;
    }

    try {
      const params = new URLSearchParams();
      if (searchTerm) params.append('q', searchTerm);
      if (activityStatusFilter) params.append('status', activityStatusFilter);
      if (isApprovedFilter !== '') params.append('isApproved', isApprovedFilter);
      params.append('sortBy', sortBy);
      params.append('sortOrder', sortOrder);
      params.append('page', currentPage);
      params.append('limit', itemsPerPage);

      const response = await axios.get(ACTIVITIES_API_URL, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      setActivities(response.data.activities || []);
      setTotalActivities(response.data.total || 0);
      setCurrentPage(response.data.page || 1);
      setItemsPerPage(response.data.limit || 10); // Update from backend response

    } catch (err) {
      console.error("Error fetching activities:", err);
      if (err.response && err.response.status === 401) {
        setError("Phiên đăng nhập hết hạn. Vui lòng đăng nhập lại.");
        // navigate('/login'); // Uncomment if you want to redirect
      } else {
        setError(err.response?.data?.message || "Đã có lỗi xảy ra khi tải danh sách hoạt động.");
      }
    } finally {
      setLoading(false);
    }
  }, [searchTerm, activityStatusFilter, isApprovedFilter, sortBy, sortOrder, currentPage, itemsPerPage]);

  useEffect(() => {
    fetchActivities();
  }, [fetchActivities]); // Re-fetch when search/filter/pagination changes

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
    if (!window.confirm('Bạn có chắc chắn muốn xóa hoạt động này?')) {
      return;
    }
    const token = localStorage.getItem('accessToken');
    try {
      await axios.delete(`${ACTIVITIES_API_URL}/${id}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      toast.success('Xóa hoạt động thành công');
      fetchActivities(); // Re-fetch activities after delete
    } catch (error) {
      console.error("Delete error:", error);
      toast.error(error.response?.data?.message || 'Không thể xóa hoạt động');
    }
  };

  const handlePublish = async (id) => {
    const token = localStorage.getItem('accessToken');
    try {
      await axios.patch(`${ACTIVITIES_API_URL}/${id}/publish`, {}, { // Send empty body for PATCH if not needed
        headers: { 'Authorization': `Bearer ${token}` }
      });
      toast.success('Đã xuất bản hoạt động thành công!');
      fetchActivities(); // Re-fetch activities after publish
    } catch (error) {
      console.error("Publish error:", error);
      toast.error(error.response?.data?.message || 'Không thể xuất bản hoạt động');
    }
  };

  const handleSubmit = async (values) => {
    setLoading(true);
    const token = localStorage.getItem('accessToken');
    try {
      if (selectedActivity) {
        await axios.put(`${ACTIVITIES_API_URL}/${selectedActivity.activityID}`, values, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        toast.success('Đã cập nhật hoạt động thành công!');
      } else {
        await axios.post(ACTIVITIES_API_URL, values, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        toast.success('Đã tạo hoạt động thành công!');
      }
      setModalVisible(false);
      setEditingId(null);
      setEditingActivity(null);
      fetchActivities(); // Re-fetch activities after submit
    } catch (error) {
      console.error("Form submit error:", error);
      toast.error(error.response?.data?.message || 'Có lỗi xảy ra khi lưu hoạt động');
    } finally {
      setLoading(false);
    }
  };

  const handlePageChange = (newPage) => {
    setCurrentPage(newPage);
  };

  // Helper to render pagination buttons
  const renderPagination = () => {
    const totalPages = Math.ceil(totalActivities / itemsPerPage);
    if (totalPages <= 1) return null;

    const pages = [];
    for (let i = 1; i <= totalPages; i++) {
      pages.push(
        <button
          key={i}
          onClick={() => handlePageChange(i)}
          className={`px-3 py-1 rounded-md text-sm font-medium ${
            currentPage === i ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
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
    if (!Array.isArray(domainIds)) return 'N/A';
    return domainIds.map(id => DOMAINS.find(d => d.id === id)?.label || id).join(', ');
  };

  const columns = [
    {
      title: 'Tên hoạt động',
      dataIndex: 'name',
      key: 'name',
      render: (text) => <span className="font-medium">{text}</span>,
    },
    {
      title: 'Loại hoạt động',
      dataIndex: 'type',
      key: 'type',
      render: (text) => {
        const type = ACTIVITY_TYPES.find(t => t.value === text);
        return type ? type.label : text;
      },
    },
    {
      title: 'Thời gian',
      key: 'time',
      render: (_, record) => (
        <div className="space-y-1">
          <div className="text-sm text-gray-600">
            Bắt đầu: {new Date(record.startDate).toLocaleDateString()}
          </div>
          <div className="text-sm text-gray-600">
            Kết thúc: {new Date(record.endDate).toLocaleDateString()}
          </div>
        </div>
      ),
    },
    {
      title: 'Trạng thái',
      dataIndex: 'activityStatus',
      key: 'activityStatus',
      render: (text) => {
        const status = ACTIVITY_STATUSES.find(s => s.value === text);
        return (
          <span className={`px-2 py-1 rounded-full text-xs font-medium ${
            text === 'published' ? 'bg-green-100 text-green-800' :
            text === 'draft' ? 'bg-gray-100 text-gray-800' :
            'bg-yellow-100 text-yellow-800'
          }`}>
            {status ? status.label : text}
          </span>
        );
      },
    },
    {
      title: 'Thao tác',
      key: 'action',
      render: (_, record) => (
        <Space size="middle">
          <Button
            type="text"
            icon={<Eye className="w-4 h-4" />}
            onClick={() => {
              setSelectedActivity(record);
              setModalVisible(true);
            }}
          />
          <Button
            type="text"
            icon={<Edit className="w-4 h-4" />}
            onClick={() => handleEdit(record)}
          />
          <Popconfirm
            title="Bạn có chắc chắn muốn xóa hoạt động này?"
            onConfirm={() => handleDelete(record.activityID)}
            okText="Có"
            cancelText="Không"
          >
            <Button
              type="text"
              danger
              icon={<Trash2 className="w-4 h-4" />}
            />
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      {/* Activity Form for Create/Edit */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-8">
        <h1 className="text-2xl font-bold mb-6 text-gray-800">
          {editingId ? 'Chỉnh sửa hoạt động' : 'Tạo hoạt động mới'}
        </h1>
        <ActivityForm
          onSubmit={handleSubmit}
          editingId={editingId}
          onCancel={() => {
            setEditingId(null);
            setEditingActivity(null);
            setModalVisible(false);
          }}
          domains={DOMAINS}
          initialData={editingActivity}
          form={form}
        />
      </div>

      {/* Search and Filter Section */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-8">
        <h2 className="text-xl font-semibold mb-4 text-gray-800">Tìm kiếm và Lọc hoạt động</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {/* Search Input */}
          <div>
            <label htmlFor="search" className="block text-sm font-medium text-gray-700 mb-1">
              Tìm kiếm theo tên
            </label>
            <input
              type="text"
              id="search"
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
              placeholder="Nhập tên hoạt động..."
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setCurrentPage(1); // Reset to first page on new search
              }}
            />
          </div>

          {/* Activity Status Filter */}
          <div>
            <label htmlFor="activityStatusFilter" className="block text-sm font-medium text-gray-700 mb-1">
              Lọc theo trạng thái hoạt động
            </label>
            <select
              id="activityStatusFilter"
              className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
              value={activityStatusFilter}
              onChange={(e) => {
                setActivityStatusFilter(e.target.value);
                setCurrentPage(1); // Reset to first page on new filter
              }}
            >
              <option value="">Tất cả trạng thái</option>
              <option value="draft">Bản nháp</option>
              <option value="pending">Chờ duyệt</option>
              <option value="approved">Đã duyệt</option>
              <option value="rejected">Bị từ chối</option>
              <option value="published">Đã xuất bản</option>
              <option value="upcoming">Sắp diễn ra</option>
              <option value="finished">Đã hoàn thành</option>
              <option value="cancelled">Đã hủy</option>
            </select>
          </div>

          {/* Approval Status Filter */}
          <div>
            <label htmlFor="isApprovedFilter" className="block text-sm font-medium text-gray-700 mb-1">
              Lọc theo trạng thái duyệt
            </label>
            <select
              id="isApprovedFilter"
              className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
              value={isApprovedFilter}
              onChange={(e) => {
                setIsApprovedFilter(e.target.value);
                setCurrentPage(1); // Reset to first page on new filter
              }}
            >
              <option value="">Tất cả</option>
              <option value="true">Đã duyệt</option>
              <option value="false">Chưa duyệt</option>
            </select>
          </div>

          {/* Sort By */}
          <div>
            <label htmlFor="sortBy" className="block text-sm font-medium text-gray-700 mb-1">
              Sắp xếp theo
            </label>
            <select
              id="sortBy"
              className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
              value={sortBy}
              onChange={(e) => {
                setSortBy(e.target.value);
                setCurrentPage(1);
              }}
            >
              <option value="registrationStart">Ngày đăng ký</option>
              <option value="registrations">Số lượng đăng ký</option>
            </select>
          </div>

          {/* Sort Order */}
          <div>
            <label htmlFor="sortOrder" className="block text-sm font-medium text-gray-700 mb-1">
              Thứ tự
            </label>
            <select
              id="sortOrder"
              className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
              value={sortOrder}
              onChange={(e) => {
                setSortOrder(e.target.value);
                setCurrentPage(1);
              }}
            >
              <option value="desc">Mới nhất / Giảm dần</option>
              <option value="asc">Cũ nhất / Tăng dần</option>
            </select>
          </div>
        </div>
      </div>

      {/* Activity List Section */}
      <div className="mt-8 bg-white rounded-lg shadow-md overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-800">Danh sách hoạt động của bạn ({totalActivities})</h2>
        </div>

        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative m-6" role="alert">
            <strong className="font-bold">Lỗi!</strong>
            <span className="block sm:inline"> {error}</span>
          </div>
        )}

        {loading ? (
          <div className="p-6 text-center text-gray-500">
            Đang tải danh sách hoạt động...
          </div>
        ) : activities.length === 0 ? (
          <div className="p-6 text-center text-gray-500">
            Không tìm thấy hoạt động nào phù hợp với điều kiện tìm kiếm/lọc.
          </div>
        ) : (
          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {activities.map(activity => (
                <div key={activity.activityID} className="bg-white border border-gray-200 rounded-lg shadow-sm overflow-hidden transform hover:scale-105 transition-all duration-300 ease-in-out">
                  <img
                    src={activity.image || DEFAULT_IMAGE}
                    alt={activity.name}
                    className="w-full h-48 object-cover"
                  />
                  <div className="p-4">
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="text-lg font-semibold text-blue-700 leading-tight">{activity.name}</h3>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${statusColors[activity.activityStatus] || 'bg-gray-100 text-gray-800'}`}>
                        {activity.activityStatus === 'draft' ? 'Bản nháp' :
                         activity.activityStatus === 'pending' ? 'Chờ duyệt' :
                         activity.activityStatus === 'approved' ? 'Đã duyệt' :
                         activity.activityStatus === 'rejected' ? 'Bị từ chối' :
                         activity.activityStatus === 'published' ? 'Đã xuất bản' :
                         activity.activityStatus === 'upcoming' ? 'Sắp diễn ra' :
                         activity.activityStatus === 'finished' ? 'Đã hoàn thành' :
                         activity.activityStatus === 'cancelled' ? 'Đã hủy' :
                         activity.activityStatus}
                      </span>
                    </div>

                    <div className="space-y-1 text-sm text-gray-600">
                      <p><span className="font-medium">Thời gian:</span> {new Date(activity.eventStart).toLocaleString('vi-VN')}</p>
                      <p><span className="font-medium">Địa điểm:</span> {activity.location || 'N/A'}</p>
                      <p><span className="font-medium">Lĩnh vực:</span> {getDomainLabels(activity.domains)}</p>
                      <p><span className="font-medium">Đối tượng:</span> {activity.targetAudience || 'N/A'}</p>
                      <p><span className="font-medium">Điểm rèn luyện:</span> {activity.trainingPoint || 0} điểm</p>
                      <p><span className="font-medium">Đăng ký:</span> {activity.registrationCount || 0} / {activity.approvedCount || 0} (Tổng / Đã duyệt)</p>
                      <p><span className="font-medium">Duyệt bởi ĐV:</span> {activity.isApproved ? 'Đã duyệt' : 'Chờ duyệt'}</p>
                    </div>

                    <div className="mt-4 flex flex-wrap gap-2 justify-end">
                      {activity.activityStatus === 'draft' && (
                        <>
                          <button
                            onClick={() => handleEdit(activity)}
                            className="flex items-center px-3 py-1 bg-yellow-100 text-yellow-800 rounded-md hover:bg-yellow-200 transition-colors text-sm"
                            title="Chỉnh sửa hoạt động"
                          >
                            <Edit className="w-4 h-4 mr-1" /> Sửa
                          </button>
                          <button
                            onClick={() => handleDelete(activity.activityID)}
                            className="flex items-center px-3 py-1 bg-red-100 text-red-800 rounded-md hover:bg-red-200 transition-colors text-sm"
                            title="Xóa hoạt động"
                          >
                            <DeleteOutlined className="w-4 h-4 mr-1" /> Xóa
                          </button>
                          <button
                            onClick={() => handlePublish(activity.activityID)}
                            className="flex items-center px-3 py-1 bg-blue-100 text-blue-800 rounded-md hover:bg-blue-200 transition-colors text-sm"
                            title="Xuất bản hoạt động"
                          >
                            <PlusOutlined className="w-4 h-4 mr-1" /> Xuất bản
                          </button>
                        </>
                      )}
                      <button
                        onClick={() => navigate(`/organizer/activities/${activity.activityID}`)}
                        className="flex items-center px-3 py-1 bg-gray-100 text-gray-800 rounded-md hover:bg-gray-200 transition-colors text-sm ml-auto"
                        title="Xem chi tiết hoạt động"
                      >
                        <EyeOutlined className="w-4 h-4 mr-1" /> Chi tiết
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            {renderPagination()}
          </div>
        )}
      </div>

      <Modal
        title={selectedActivity ? 'Chỉnh sửa hoạt động' : 'Tạo hoạt động mới'}
        open={modalVisible}
        onCancel={() => setModalVisible(false)}
        footer={null}
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleSubmit}
        >
          <Form.Item
            name="name"
            label="Tên hoạt động"
            rules={[{ required: true, message: 'Vui lòng nhập tên hoạt động' }]}
          >
            <Input />
          </Form.Item>

          <Form.Item
            name="type"
            label="Loại hoạt động"
            rules={[{ required: true, message: 'Vui lòng chọn loại hoạt động' }]}
          >
            <Select>
              {ACTIVITY_TYPES.map(type => (
                <Option key={type.value} value={type.value}>{type.label}</Option>
              ))}
            </Select>
          </Form.Item>

          <Form.Item
            name="startDate"
            label="Ngày bắt đầu"
            rules={[{ required: true, message: 'Vui lòng chọn ngày bắt đầu' }]}
          >
            <DatePicker className="w-full" />
          </Form.Item>

          <Form.Item
            name="endDate"
            label="Ngày kết thúc"
            rules={[{ required: true, message: 'Vui lòng chọn ngày kết thúc' }]}
          >
            <DatePicker className="w-full" />
          </Form.Item>

          <Form.Item
            name="description"
            label="Mô tả"
            rules={[{ required: true, message: 'Vui lòng nhập mô tả' }]}
          >
            <TextArea rows={4} />
          </Form.Item>

          <Form.Item>
            <Space>
              <Button type="primary" htmlType="submit">
                {selectedActivity ? 'Cập nhật' : 'Tạo mới'}
              </Button>
              <Button onClick={() => setModalVisible(false)}>
                Hủy
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
}

export default ActivityManager;