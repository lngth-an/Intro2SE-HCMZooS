import React, { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { useNavigate } from 'react-router-dom';

const API_URL = '/activity';
const DOMAINS = [
  { id: 'academic', label: 'Học thuật' },
  { id: 'volunteer', label: 'Tình nguyện' },
  { id: 'sports', label: 'Thể thao' },
  { id: 'skills', label: 'Kỹ năng' },
  { id: 'arts', label: 'Nghệ thuật' },
  { id: 'other', label: 'Khác' },
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
    <div className="max-w-4xl mx-auto" style={{ fontFamily: 'Segoe UI, Arial, sans-serif' }}>
      <h1 className="text-2xl font-bold mb-8" style={{ color: '#1976d2', textAlign: 'center' }}>Quản lý hoạt động</h1>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6" style={{ background: '#f5f5f5', padding: 24, borderRadius: 12, marginBottom: 32, boxShadow: '0 2px 8px #e0e0e0' }}>
        {/* Upload Image */}
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
                    style={{ position: 'absolute', top: 0, right: 0, background: '#d32f2f', color: '#fff', border: 'none', borderRadius: '50%', width: 24, height: 24, cursor: 'pointer' }}
                  >X</button>
                </div>
              ) : (
                <>
                  <div style={{ fontSize: 32, color: '#bdbdbd' }}>📤</div>
                  <div className="flex text-sm text-gray-600">
                    <label style={{ cursor: 'pointer', color: '#1976d2', fontWeight: 500 }}>
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
        {/* Activity Name */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Tên hoạt động <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            {...register('name', { required: 'Vui lòng nhập tên hoạt động' })}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          {errors.name && (
            <p className="mt-1 text-sm text-red-600">{errors.name.message}</p>
          )}
        </div>
        {/* Description */}
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
        <div style={{ display: 'flex', gap: 16 }}>
          <div style={{ flex: 1 }}>
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
          <div style={{ flex: 1 }}>
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
        {/* Location */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Địa điểm <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            {...register('location', { required: 'Vui lòng nhập địa điểm' })}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          {errors.location && (
            <p className="mt-1 text-sm text-red-600">{errors.location.message}</p>
          )}
        </div>
        {/* Capacity */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Số lượng tham gia <span className="text-red-500">*</span>
          </label>
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
        {/* Target Audience */}
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
        {/* Domains */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Lĩnh vực <span className="text-red-500">*</span>
          </label>
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            {DOMAINS.map(domain => (
              <button
                type="button"
                key={domain.id}
                onClick={() => handleDomainToggle(domain.id)}
                style={{
                  padding: '6px 14px', borderRadius: 16, border: '1px solid #1976d2',
                  background: selectedDomains.includes(domain.id) ? '#1976d2' : '#fff',
                  color: selectedDomains.includes(domain.id) ? '#fff' : '#1976d2',
                  fontWeight: 500, cursor: 'pointer'
                }}
              >{domain.label}</button>
            ))}
          </div>
          {selectedDomains.length === 0 && <p className="mt-1 text-sm text-red-600">Vui lòng chọn ít nhất 1 lĩnh vực</p>}
        </div>
        <div>
          <button type="submit" style={{ background: '#1976d2', color: '#fff', border: 'none', borderRadius: 6, padding: '10px 28px', fontWeight: 600, fontSize: 16, cursor: 'pointer' }}>{editingId ? 'Cập nhật' : 'Tạo mới'}</button>
          {editingId && <button type="button" style={{ background: '#bdbdbd', color: '#fff', border: 'none', borderRadius: 6, padding: '10px 28px', fontWeight: 600, fontSize: 16, cursor: 'pointer', marginLeft: 12 }} onClick={() => { setEditingId(null); reset(); setSelectedImage(null); setSelectedDomains([]); }}>Hủy</button>}
        </div>
        {message && <div style={{ color: '#388e3c', marginTop: 12 }}>{message}</div>}
      </form>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 24, justifyContent: activities.length > 1 ? 'flex-start' : 'center' }}>
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
                <button onClick={() => handleEdit(a)} style={{ background: '#fffde7', color: '#1976d2', border: '1px solid #ffe082', borderRadius: 6, padding: '6px 12px', cursor: 'pointer', fontWeight: 500 }}>Edit</button>
                <button onClick={() => handleDelete(a.activityID)} style={{ background: '#ffebee', color: '#d32f2f', border: '1px solid #ffcdd2', borderRadius: 6, padding: '6px 12px', cursor: 'pointer', fontWeight: 500 }}>Delete</button>
                <button onClick={() => handlePublish(a.activityID)} style={{ background: '#e3f2fd', color: '#388e3c', border: '1px solid #90caf9', borderRadius: 6, padding: '6px 12px', cursor: 'pointer', fontWeight: 500 }}>Publish</button>
              </>}
              <button onClick={() => navigate(`/organizer/activities/${a.activityID}`)} style={{ background: '#f5f5f5', color: '#1976d2', border: '1px solid #bdbdbd', borderRadius: 6, padding: '6px 12px', fontWeight: 500, marginLeft: 'auto', cursor: 'pointer' }}>View</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default ActivityManager; 