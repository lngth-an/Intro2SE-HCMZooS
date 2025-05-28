import React, { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { useNavigate } from 'react-router-dom';
import Footer from '../common/Footer';
import { Upload, X } from 'lucide-react';

const API_URL = '/activity';
const DOMAINS = [
  { id: 'academic', label: 'Học thuật', color: 'bg-blue-50 text-blue-800', selectedColor: 'bg-blue-100 text-blue-800' },
  { id: 'volunteer', label: 'Tình nguyện', color: 'bg-green-50 text-green-800', selectedColor: 'bg-green-100 text-green-800' },
  { id: 'sports', label: 'Thể thao', color: 'bg-yellow-50 text-yellow-800', selectedColor: 'bg-yellow-100 text-yellow-800' },
  { id: 'skills', label: 'Kỹ năng', color: 'bg-purple-50 text-purple-800', selectedColor: 'bg-purple-100 text-purple-800' },
  { id: 'arts', label: 'Nghệ thuật', color: 'bg-pink-50 text-pink-800', selectedColor: 'bg-pink-100 text-pink-800' },
  { id: 'other', label: 'Khác', color: 'bg-gray-50 text-gray-800', selectedColor: 'bg-gray-100 text-gray-800' },
];
const statusColors = {
  draft: '#bdbdbd',
  published: '#1976d2',
  completed: '#388e3c',
};

function ActivityManager() {
  const [activities, setActivities] = useState([]);
  const [editingId, setEditingId] = useState(null);
  const [selectedImage, setSelectedImage] = useState(null);
  const [selectedDomains, setSelectedDomains] = useState([]);
  const [message, setMessage] = useState('');
  const navigate = useNavigate();
  const { register, handleSubmit, setValue, reset, formState: { errors } } = useForm();

  const fetchActivities = async () => {
    const res = await fetch(API_URL);
    const data = await res.json();
    setActivities(data.activities || []);
  };

  useEffect(() => {
    fetchActivities();
  }, []);

  const handleImageChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setSelectedImage(e.target.files[0]);
    }
  };

  const handleDomainToggle = (domainId) => {
    setSelectedDomains(prev =>
      prev.includes(domainId)
        ? prev.filter(id => id !== domainId)
        : [...prev, domainId]
    );
  };

  const onSubmit = async (data) => {
    let formData = new FormData();
    Object.entries(data).forEach(([key, value]) => formData.append(key, value));
    if (selectedImage) formData.append('image', selectedImage);
    formData.append('domains', JSON.stringify(selectedDomains));
    formData.append('trainingScore', data.trainingScore);
    formData.append('registrationStart', data.registrationStart);
    formData.append('registrationEnd', data.registrationEnd);
    formData.append('contactInfo', data.contactInfo);
    formData.append('description', data.description);

    let res;
    if (editingId) {
      res = await fetch(`${API_URL}/${editingId}`, {
        method: 'PUT',
        body: formData,
      });
      setMessage('Activity updated!');
    } else {
      res = await fetch(API_URL, {
        method: 'POST',
        body: formData,
      });
      setMessage('Activity created!');
    }
    setSelectedImage(null);
    setSelectedDomains([]);
    reset();
    setEditingId(null);
    fetchActivities();
  };

  const handleEdit = (activity) => {
    setEditingId(activity.activityID);
    setValue('name', activity.name);
    setValue('description', activity.description);
    setValue('eventStart', activity.eventStart?.slice(0, 16));
    setValue('eventEnd', activity.eventEnd?.slice(0, 16));
    setValue('location', activity.location);
    setValue('capacity', activity.capacity);
    setValue('targetAudience', activity.targetAudience || '');
    setSelectedDomains(activity.domains || []);
    setSelectedImage(null);
    setValue('trainingScore', activity.trainingScore || '');
    setValue('registrationStart', activity.registrationStart?.slice(0, 16));
    setValue('registrationEnd', activity.registrationEnd?.slice(0, 16));
    setValue('contactInfo', activity.contactInfo || '');
  };

  const handleDelete = async id => {
    if (window.confirm('Delete this activity?')) {
      await fetch(`${API_URL}/${id}`, { method: 'DELETE' });
      setMessage('Activity deleted!');
      fetchActivities();
    }
  };

  const handlePublish = async id => {
    await fetch(`${API_URL}/${id}/publish`, { method: 'PATCH' });
    setMessage('Activity published!');
    fetchActivities();
  };

  return (
    <div className="max-w-6xl mx-auto" style={{ fontFamily: 'Segoe UI, Arial, sans-serif', padding: '20px 0' }}>
      <h1 className="text-2xl font-bold mb-6" style={{ color: '#1976d2', textAlign: 'center' }}>Tạo hoạt động mới</h1>
      
      <form onSubmit={handleSubmit(onSubmit)} className="bg-white p-8 rounded-lg shadow-md space-y-6">
        {/* Tải hình ảnh */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Tải hình ảnh <span className="text-red-500">*</span>
          </label>
          <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-lg">
            <div className="space-y-1 text-center">
              {selectedImage ? (
                <div className="relative">
                  <img
                    src={URL.createObjectURL(selectedImage)}
                    alt="Preview"
                    className="mx-auto h-32 w-auto"
                  />
                  <button
                    type="button"
                    onClick={() => setSelectedImage(null)}
                    className="absolute -top-2 -right-2 p-1 bg-red-500 text-white rounded-full"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              ) : (
                <>
                  <Upload className="mx-auto h-12 w-12 text-gray-400" />
                  <div className="flex text-sm text-gray-600">
                    <label className="relative cursor-pointer bg-white rounded-md font-medium text-blue-600 hover:text-blue-500">
                      <span>Tải ảnh lên</span>
                      <input
                        type="file"
                        className="sr-only"
                        accept="image/*"
                        onChange={handleImageChange}
                      />
                    </label>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Tên hoạt động */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Tên hoạt động <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            {...register('name', { required: 'Vui lòng nhập tên hoạt động' })}
            placeholder="Nhập tên hoạt động"
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          {errors.name && (
            <p className="mt-1 text-sm text-red-600">{errors.name.message}</p>
          )}
        </div>

        {/* Mô tả chi tiết */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Mô tả chi tiết <span className="text-red-500">*</span>
          </label>
          <textarea
            rows={4}
            {...register('description', { required: 'Vui lòng nhập mô tả chi tiết' })}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          {errors.description && (
            <p className="mt-1 text-sm text-red-600">{errors.description.message}</p>
          )}
        </div>

        {/* Time Range */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Thời gian bắt đầu <span className="text-red-500">*</span>
            </label>
            <input
              type="datetime-local"
              {...register('eventStart', { required: 'Vui lòng chọn thời gian bắt đầu' })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            {errors.eventStart && (
              <p className="mt-1 text-sm text-red-600">{errors.eventStart.message}</p>
            )}
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Thời gian kết thúc <span className="text-red-500">*</span>
            </label>
            <input
              type="datetime-local"
              {...register('eventEnd', { required: 'Vui lòng chọn thời gian kết thúc' })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            {errors.eventEnd && (
              <p className="mt-1 text-sm text-red-600">{errors.eventEnd.message}</p>
            )}
          </div>
        </div>

        {/* Địa điểm, số lượng */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Địa điểm <span className="text-red-500">*</span></label>
            <input type="text" {...register('location', { required: 'Vui lòng nhập địa điểm' })} className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500" />
            {errors.location && <p className="mt-1 text-sm text-red-600">{errors.location.message}</p>}
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Số lượng tham gia <span className="text-red-500">*</span></label>
            <input
              type="number"
              min="1"
              {...register('capacity', {
                required: 'Vui lòng nhập số lượng tham gia',
                min: { value: 1, message: 'Số lượng phải lớn hơn 0' }
              })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            {errors.capacity && (
              <p className="mt-1 text-sm text-red-600">{errors.capacity.message}</p>
            )}
          </div>
        </div>

        {/* Đối tượng */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Đối tượng <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            {...register('targetAudience', { required: 'Vui lòng nhập đối tượng' })}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          {errors.targetAudience && (
            <p className="mt-1 text-sm text-red-600">{errors.targetAudience.message}</p>
          )}
        </div>

        {/* Lĩnh vực */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Lĩnh vực <span className="text-red-500">*</span>
          </label>
          <div className="flex flex-wrap gap-2">
            {DOMAINS.map(domain => (
              <button
                key={domain.id}
                type="button"
                onClick={() => handleDomainToggle(domain.id)}
                className={`px-3 py-1 rounded-full text-sm font-medium ${selectedDomains.includes(domain.id) ? domain.selectedColor : domain.color}`}
              >
                {domain.label}
              </button>
            ))}
          </div>
          {selectedDomains.length === 0 && (
            <p className="mt-1 text-sm text-red-600">Vui lòng chọn ít nhất một lĩnh vực</p>
          )}
        </div>

        {/* Điểm rèn luyện */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Điểm rèn luyện <span className="text-red-500">*</span>
          </label>
          <select
            {...register('trainingScore', { required: 'Vui lòng nhập điểm rèn luyện' })}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">Chọn điểm rèn luyện</option>
            <option value="3">3 điểm</option>
            <option value="5">5 điểm</option>
            <option value="10">10 điểm</option>
            <option value="15">15 điểm</option>
          </select>
          {errors.trainingScore && (
            <p className="mt-1 text-sm text-red-600">{errors.trainingScore.message}</p>
          )}
        </div>

        {/* Thời gian đăng ký */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Thời gian đăng ký bắt đầu <span className="text-red-500">*</span>
            </label>
            <input
              type="datetime-local"
              {...register('registrationStart', { required: 'Vui lòng chọn thời gian bắt đầu đăng ký' })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            {errors.registrationStart && (
              <p className="mt-1 text-sm text-red-600">{errors.registrationStart.message}</p>
            )}
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Thời gian đăng ký kết thúc <span className="text-red-500">*</span>
            </label>
            <input
              type="datetime-local"
              {...register('registrationEnd', { required: 'Vui lòng chọn thời gian kết thúc đăng ký' })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            {errors.registrationEnd && (
              <p className="mt-1 text-sm text-red-600">{errors.registrationEnd.message}</p>
            )}
          </div>
        </div>

        {/* Thông tin liên hệ */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Thông tin liên hệ <span className="text-red-500">*</span>
          </label>
          <textarea
            rows={3}
            {...register('contactInfo', { required: 'Vui lòng nhập thông tin liên hệ' })}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Nhập thông tin liên hệ (email, số điện thoại, người phụ trách...)"
          />
          {errors.contactInfo && (
            <p className="mt-1 text-sm text-red-600">{errors.contactInfo.message}</p>
          )}
        </div>

        {/* Nút submit */}
        <div className="flex justify-end">
          <button
            type="submit"
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
          >
            {editingId ? 'Cập nhật' : 'Tạo hoạt động'}
          </button>
          {editingId && (
            <button type="button" className="ml-3 px-4 py-2 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400" onClick={() => { setEditingId(null); reset(); setSelectedImage(null); setSelectedDomains([]); }}>
              Hủy
            </button>
          )}
        </div>
      </form>

      {message && <div className="mt-4 text-green-600 text-center">{message}</div>}

      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 24, justifyContent: activities.length > 1 ? 'flex-start' : 'center', marginTop: '32px' }}>
        {activities.map(a => (
          <div key={a.activityID} style={{ background: '#fff', borderRadius: 12, boxShadow: '0 2px 8px #e0e0e0', padding: 24, minWidth: 320, maxWidth: 350, flex: '1 1 320px', marginBottom: 16, position: 'relative', transition: 'box-shadow 0.2s', display: 'flex', flexDirection: 'column', gap: 10 }}>
            <div style={{ display: 'flex', alignItems: 'center', marginBottom: 8 }}>
              <span style={{ fontWeight: 600, fontSize: 18, color: '#1976d2', flex: 1 }}>{a.name}</span>
              <span style={{ background: statusColors[a.activityStatus] || '#bdbdbd', color: '#fff', borderRadius: 8, padding: '2px 12px', fontSize: 13, marginLeft: 8 }}>{a.activityStatus}</span>
            </div>
            {a.image && <img src={a.image} alt={a.name} style={{ width: '100%', height: 120, objectFit: 'cover', borderRadius: 8, marginBottom: 8 }} />}
            <div style={{ color: '#555', fontSize: 15, marginBottom: 4 }}><b>Date:</b> {a.eventStart ? new Date(a.eventStart).toLocaleString() : ''}</div>
            <div style={{ color: '#555', fontSize: 15, marginBottom: 4 }}><b>Location:</b> {a.location}</div>
            <div style={{ color: '#555', fontSize: 15, marginBottom: 4 }}><b>Domains:</b> {Array.isArray(a.domains) ? a.domains.map(d => DOMAINS.find(dm => dm.id === d)?.label).join(', ') : ''}</div>
            <div style={{ color: '#555', fontSize: 15, marginBottom: 4 }}><b>Target:</b> {a.targetAudience}</div>
            <div style={{ display: 'flex', gap: 8, marginTop: 10 }}>
              {a.activityStatus === 'draft' && <>
                <button onClick={() => handleEdit(a)} className="bg-yellow-100 text-blue-700 border border-yellow-300 rounded-md px-3 py-1 cursor-pointer font-medium text-sm">Edit</button>
                <button onClick={() => handleDelete(a.activityID)} className="bg-red-100 text-red-700 border border-red-300 rounded-md px-3 py-1 cursor-pointer font-medium text-sm">Delete</button>
                <button onClick={() => handlePublish(a.activityID)} className="bg-blue-100 text-green-700 border border-blue-300 rounded-md px-3 py-1 cursor-pointer font-medium text-sm">Publish</button>
              </>}
              <button onClick={() => navigate(`/organizer/activities/${a.activityID}`)} className="bg-gray-100 text-blue-700 border border-gray-300 rounded-md px-3 py-1 font-medium text-sm ml-auto cursor-pointer">View</button>
            </div>
          </div>
        ))}
      </div>
      <Footer />
    </div>
  );
}

export default ActivityManager; 