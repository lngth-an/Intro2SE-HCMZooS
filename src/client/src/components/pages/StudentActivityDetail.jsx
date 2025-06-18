import React from 'react';

function StudentActivityDetail({
  activity,
  onClose,
  onRegister,
  showForm,
  form,
  onFormChange,
  onFormSubmit,
  error,
  success,
  confirm,
  onConfirm,
  onCancelConfirm,
  suggested,
  isRegistered,
  isManagementView = false
}) {
  if (!activity) return null;

  return (
    <div 
      className="fixed inset-0 bg-black bg-opacity-25 z-50 flex items-center justify-center overflow-y-auto"
      onClick={(e) => {
        if (e.target === e.currentTarget) {
          onClose();
        }
      }}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full max-h-[90vh] flex items-center justify-center">
        <div className="bg-white rounded-lg shadow-lg overflow-hidden w-full relative">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 text-gray-400 hover:text-gray-700 text-2xl font-bold focus:outline-none"
            aria-label="Đóng"
          >
            ×
          </button>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 p-8">
            {/* Poster */}
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
            </div>

            {/* Nội dung bên phải */}
            <div className="space-y-6">
              <div>
                <h1 className="text-3xl font-bold text-gray-900 mb-2">{activity.name}</h1>
                <div className="flex flex-wrap gap-2 mb-4">
                  <span className="px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800">
                    <span className="font-semibold">Lĩnh vực:</span> {activity.type || "Chưa cập nhật"}
                  </span>
                  {isRegistered && !isManagementView && (
                    <span className="px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800">
                      Đã đăng ký
                    </span>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h3 className="text-sm font-medium text-gray-500">Thời gian diễn ra</h3>
                  <p className="mt-1 text-sm text-gray-900">
                    {activity.eventStart ? new Date(activity.eventStart).toLocaleString() : 'Chưa cập nhật'}
                  </p>
                </div>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h3 className="text-sm font-medium text-gray-500">Thời gian kết thúc</h3>
                  <p className="mt-1 text-sm text-gray-900">
                    {activity.eventEnd ? new Date(activity.eventEnd).toLocaleString() : 'Chưa cập nhật'}
                  </p>
                </div>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h3 className="text-sm font-medium text-gray-500">Số lượng tham gia</h3>
                  <p className="mt-1 text-sm text-gray-900">{activity.capacity || 'Chưa cập nhật'}</p>
                </div>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h3 className="text-sm font-medium text-gray-500">Địa điểm</h3>
                  <p className="mt-1 text-sm text-gray-900">{activity.location || 'Chưa cập nhật'}</p>
                </div>
              </div>

              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Mô tả chi tiết</h3>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <p className="text-gray-700 whitespace-pre-line">
                    {activity.description || 'Không có mô tả'}
                  </p>
                </div>
              </div>

              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Thời gian đăng ký</h3>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <p className="text-gray-700">
                    Từ: {activity.registrationStart ? new Date(activity.registrationStart).toLocaleString() : 'Chưa cập nhật'}    
                    <br/>        
                    Đến: {activity.registrationEnd ? new Date(activity.registrationEnd).toLocaleString() : 'Chưa cập nhật'}
                  </p>
                </div>
              </div>

              {!isManagementView && (
                <div className="mt-6 flex justify-end">
                  {!isRegistered ? (
                    <button
                      onClick={() => onRegister(activity)}
                      className="px-6 py-3 bg-blue-600 text-white font-semibold rounded-md hover:bg-blue-700 transition-colors shadow-md hover:shadow-lg transform hover:-translate-y-0.5"
                    >
                      Đăng ký tham gia
                    </button>
                  ) : (
                    <span className="px-4 py-2 bg-green-100 text-green-800 rounded-md font-semibold">
                      Đã đăng ký
                    </span>
                  )}
                </div>
              )}

              {showForm && (
                <div className="bg-white p-4 rounded-lg border border-gray-200">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Đăng ký tham gia</h3>
                  <form onSubmit={onFormSubmit} className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Ghi chú (không bắt buộc)
                      </label>
                      <textarea
                        name="note"
                        value={form.note}
                        onChange={onFormChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        rows={3}
                        placeholder="Nhập ghi chú nếu có..."
                      />
                    </div>
                    {error && <p className="text-sm text-red-600">{error}</p>}
                    {success && <p className="text-sm text-green-600">{success}</p>}
                    <div className="flex justify-end space-x-3">
                      <button
                        type="button"
                        onClick={onClose}
                        className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200"
                      >
                        Hủy
                      </button>
                      <button
                        type="submit"
                        className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700"
                      >
                        Gửi đăng ký
                      </button>
                    </div>
                  </form>
                </div>
              )}

              {confirm && (
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 text-center">
                  <p className="text-yellow-800 mb-4">Bạn xác nhận gửi đăng ký tham gia hoạt động này?</p>
                  <div className="flex justify-center space-x-4">
                    <button
                      onClick={onConfirm}
                      className="px-4 py-2 text-sm font-medium text-white bg-green-600 rounded-md hover:bg-green-700"
                    >
                      Xác nhận
                    </button>
                    <button
                      onClick={onCancelConfirm}
                      className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200"
                    >
                      Hủy
                    </button>
                  </div>
                </div>
              )}

              {suggested && suggested.length > 0 && (
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
                          onClick={() => {
                            onClose();
                            onRegister(a);
                          }}
                          className="text-sm text-blue-600 hover:text-blue-800 font-medium"
                        >
                          Xem chi tiết
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default StudentActivityDetail; 