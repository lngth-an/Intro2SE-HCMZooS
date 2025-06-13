import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Edit, Trash2, Upload } from 'lucide-react';

function ActivityDetail({ 
  activity,
  onEdit, 
  onDelete, 
  onPublish, 
  onRegister,
  showRegisterForm,
  registerNote,
  onRegisterNoteChange,
  onRegisterSubmit,
  onRegisterCancel,
  registerError,
  registerSuccess,
  isOrganizer = false,
  isStudent = false,
  confirm = false,
  onConfirm,
  onCancelConfirm,
  suggested = []
}) {
  const [domains, setDomains] = useState([]);

  useEffect(() => {
    fetch('/domain')
      .then(res => res.json())
      .then(data => setDomains(data.domains || []));
  }, []);

  if (!activity) return <div className="text-center mt-10">Không tìm thấy hoạt động.</div>;

  const activityDomains = domains.filter(domain => 
    activity.domains && activity.domains.includes(domain.id)
  );

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="bg-white rounded-lg shadow-lg overflow-hidden">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 p-8">
          {/* Phần poster bên trái */}
          <div className="space-y-4">
            <div className="aspect-w-4 aspect-h-3 rounded-lg overflow-hidden bg-gray-100">
              {activity.image ? (
                <img 
                  src={activity.image} 
                  alt={activity.name} 
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-gray-200">
                  <span className="text-gray-400">Không có hình ảnh</span>
                </div>
              )}
            </div>
            {/* Thông tin trạng thái */}
            <div className="bg-gray-50 p-4 rounded-lg">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Trạng thái hoạt động</h3>
              <div className="flex items-center">
                <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                  activity.activityStatus === 'Đang diễn ra' ? 'bg-green-100 text-green-800' :
                  activity.activityStatus === 'Sắp diễn ra' ? 'bg-blue-100 text-blue-800' :
                  activity.activityStatus === 'Đã kết thúc' ? 'bg-gray-100 text-gray-800' :
                  'bg-yellow-100 text-yellow-800'
                }`}>
                  {activity.activityStatus || 'Chưa cập nhật'}
                </span>
              </div>
            </div>
          </div>

          {/* Phần thông tin bên phải */}
          <div className="space-y-6">
            {/* Tên hoạt động */}
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">{activity.name}</h1>
              <div className="flex flex-wrap gap-2 mb-4">
                {activityDomains.map(domain => (
                  <span key={domain.id} className="px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800">
                    {domain.name}
                  </span>
                ))}
              </div>
            </div>

            {/* Thông tin cơ bản */}
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-gray-50 p-4 rounded-lg">
                <h3 className="text-sm font-medium text-gray-500">Thời gian diễn ra</h3>
                <p className="mt-1 text-sm text-gray-900">
                  {activity.eventStart ? new Date(activity.eventStart).toLocaleString() : 'Chưa cập nhật'}
                </p>
              </div>
              <div className="bg-gray-50 p-4 rounded-lg">
                <h3 className="text-sm font-medium text-gray-500">Địa điểm</h3>
                <p className="mt-1 text-sm text-gray-900">{activity.location || 'Chưa cập nhật'}</p>
              </div>
              <div className="bg-gray-50 p-4 rounded-lg">
                <h3 className="text-sm font-medium text-gray-500">Số lượng tham gia</h3>
                <p className="mt-1 text-sm text-gray-900">{activity.capacity || 'Chưa cập nhật'}</p>
              </div>
              <div className="bg-gray-50 p-4 rounded-lg">
                <h3 className="text-sm font-medium text-gray-500">Điểm rèn luyện</h3>
                <p className="mt-1 text-sm text-gray-900">
                  {activity.trainingScore ? `${activity.trainingScore} điểm` : 'Chưa cập nhật'}
                </p>
              </div>
            </div>

            {/* Mô tả chi tiết */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Mô tả chi tiết</h3>
              <div className="bg-gray-50 p-4 rounded-lg">
                <p className="text-gray-700 whitespace-pre-line">
                  {activity.description || 'Không có mô tả'}
                </p>
              </div>
            </div>

            {/* Thông tin đăng ký */}
            <div className="bg-blue-50 p-4 rounded-lg">
              <h3 className="text-lg font-semibold text-blue-900 mb-2">Thông tin đăng ký</h3>
              <div className="space-y-2">
                <div>
                  <p className="text-sm text-blue-800">Thời gian đăng ký:</p>
                  <p className="text-sm text-blue-900">
                    {activity.registrationStart ? new Date(activity.registrationStart).toLocaleString() : 'Chưa cập nhật'} - 
                    {activity.registrationEnd ? new Date(activity.registrationEnd).toLocaleString() : 'Chưa cập nhật'}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-blue-800">Đối tượng tham gia:</p>
                  <p className="text-sm text-blue-900">{activity.targetAudience || 'Chưa cập nhật'}</p>
                </div>
              </div>
            </div>

            {/* Thông tin liên hệ */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Thông tin liên hệ</h3>
              <div className="bg-gray-50 p-4 rounded-lg">
                <p className="text-gray-700">{activity.contactInfo || 'Chưa cập nhật'}</p>
              </div>
            </div>

            {/* Form đăng ký */}
            {showRegisterForm && (
              <div className="bg-white p-4 rounded-lg border border-gray-200">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Đăng ký tham gia</h3>
                <form onSubmit={onRegisterSubmit} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Ghi chú (không bắt buộc)
                    </label>
                    <textarea
                      value={registerNote}
                      onChange={onRegisterNoteChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      rows={3}
                      placeholder="Nhập ghi chú nếu có..."
                    />
                  </div>
                  {registerError && (
                    <p className="text-sm text-red-600">{registerError}</p>
                  )}
                  {registerSuccess && (
                    <p className="text-sm text-green-600">{registerSuccess}</p>
                  )}
                  <div className="flex justify-end space-x-3">
                    <button
                      type="button"
                      onClick={onRegisterCancel}
                      className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
                    >
                      Hủy
                    </button>
                    <button
                      type="submit"
                      className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                    >
                      Gửi đăng ký
                    </button>
                  </div>
                </form>
              </div>
            )}

            {/* Xác nhận đăng ký */}
            {confirm && (
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 text-center">
                <p className="text-yellow-800 mb-4">Bạn xác nhận gửi đăng ký tham gia hoạt động này?</p>
                <div className="flex justify-center space-x-4">
                  <button
                    onClick={onConfirm}
                    className="px-4 py-2 text-sm font-medium text-white bg-green-600 rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
                  >
                    Xác nhận
                  </button>
                  <button
                    onClick={onCancelConfirm}
                    className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
                  >
                    Hủy
                  </button>
                </div>
              </div>
            )}

            {/* Gợi ý hoạt động tương tự */}
            {suggested.length > 0 && (
              <div className="bg-gray-50 p-4 rounded-lg">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Hoạt động cùng lĩnh vực</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {suggested.map(a => (
                    <div key={a.activityID} className="bg-white p-4 rounded-lg border border-gray-200">
                      <h4 className="font-medium text-gray-900 mb-2">{a.name}</h4>
                      <p className="text-sm text-gray-600 mb-2">
                        {a.eventStart ? new Date(a.eventStart).toLocaleString() : 'Chưa cập nhật'}
                      </p>
                      <button
                        onClick={() => onRegister(a)}
                        className="text-sm text-blue-600 hover:text-blue-800 font-medium"
                      >
                        Xem chi tiết
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Các nút hành động */}
            <div className="flex justify-end space-x-4 pt-4">
              {isStudent ? (
                activity.activityStatus === 'published' && (
                  <button
                    onClick={onRegister}
                    className="px-4 py-2 bg-blue-100 text-blue-800 rounded-md hover:bg-blue-200 transition-colors"
                  >
                    Đăng ký tham gia
                  </button>
                )
              ) : (
                <>
                  {activity.activityStatus === 'draft' && (
                    <>
                      <button
                        onClick={() => onEdit(activity)}
                        className="px-4 py-2 bg-yellow-100 text-yellow-800 rounded-md hover:bg-yellow-200 transition-colors flex items-center gap-1"
                      >
                        <Edit className="w-4 h-4" />
                        <span>Chỉnh sửa</span>
                      </button>
                      <button
                        onClick={() => onDelete(activity.activityID)}
                        className="px-4 py-2 bg-red-100 text-red-800 rounded-md hover:bg-red-200 transition-colors flex items-center gap-1"
                      >
                        <Trash2 className="w-4 h-4" />
                        <span>Xóa</span>
                      </button>
                      <button
                        onClick={() => onPublish(activity.activityID)}
                        className="px-4 py-2 bg-blue-100 text-blue-800 rounded-md hover:bg-blue-200 transition-colors flex items-center gap-1"
                      >
                        <Upload className="w-4 h-4" />
                        <span>Xuất bản</span>
                      </button>
                    </>
                  )}
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ActivityDetail;