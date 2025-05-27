import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Upload, X } from 'lucide-react';

const DOMAINS = [
  { id: 'academic', label: 'Học thuật', color: 'bg-blue-100 text-blue-800' },
  { id: 'volunteer', label: 'Tình nguyện', color: 'bg-green-100 text-green-800' },
  { id: 'sports', label: 'Thể thao', color: 'bg-yellow-100 text-yellow-800' },
  { id: 'skills', label: 'Kỹ năng', color: 'bg-purple-100 text-purple-800' },
  { id: 'arts', label: 'Nghệ thuật', color: 'bg-pink-100 text-pink-800' },
  { id: 'other', label: 'Khác', color: 'bg-gray-100 text-gray-800' },
];

const CreateActivity = () => {
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [selectedDomains, setSelectedDomains] = useState<string[]>([]);
  const { register, handleSubmit, formState: { errors } } = useForm();

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setSelectedImage(e.target.files[0]);
    }
  };

  const handleDomainToggle = (domainId: string) => {
    setSelectedDomains(prev =>
      prev.includes(domainId)
        ? prev.filter(id => id !== domainId)
        : [...prev, domainId]
    );
  };

  const onSubmit = (data: any) => {
    console.log({ ...data, image: selectedImage, domains: selectedDomains });
  };

  return (
    <div className="max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-8">Tạo hoạt động mới</h1>
      
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
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
            <p className="mt-1 text-sm text-red-600">{errors.name.message as string}</p>
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
              {...register('startTime', { required: 'Vui lòng chọn thời gian bắt đầu' })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            {errors.startTime && (
              <p className="mt-1 text-sm text-red-600">{errors.startTime.message as string}</p>
            )}
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Thời gian kết thúc <span className="text-red-500">*</span>
            </label>
            <input
              type="datetime-local"
              {...register('endTime', { required: 'Vui lòng chọn thời gian kết thúc' })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            {errors.endTime && (
              <p className="mt-1 text-sm text-red-600">{errors.endTime.message as string}</p>
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
            <p className="mt-1 text-sm text-red-600">{errors.location.message as string}</p>
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
            <p className="mt-1 text-sm text-red-600">{errors.capacity.message as string}</p>
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
            <p className="mt-1 text-sm text-red-600">{errors.targetAudience.message as string}</p>
          )}
        </div>

        {/* Domains */}
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
                className={`px-3 py-1 rounded-full text-sm font-medium ${
                  selectedDomains.includes(domain.id)
                    ? domain.color
                    : 'bg-gray-100 text-gray-600'
                }`}
              >
                {domain.label}
              </button>
            ))}
          </div>
          {selectedDomains.length === 0 && (
            <p className="mt-1 text-sm text-red-600">Vui lòng chọn ít nhất một lĩnh vực</p>
          )}
        </div>

        {/* Training Points */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Điểm rèn luyện <span className="text-red-500">*</span>
          </label>
          <input
            type="number"
            min="3"
            max="15"
            {...register('trainingPoints', {
              required: 'Vui lòng nhập điểm rèn luyện',
              min: { value: 3, message: 'Điểm tối thiểu là 3' },
              max: { value: 15, message: 'Điểm tối đa là 15' }
            })}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          {errors.trainingPoints && (
            <p className="mt-1 text-sm text-red-600">{errors.trainingPoints.message as string}</p>
          )}
        </div>

        {/* Registration Time Range */}
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
              <p className="mt-1 text-sm text-red-600">{errors.registrationStart.message as string}</p>
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
              <p className="mt-1 text-sm text-red-600">{errors.registrationEnd.message as string}</p>
            )}
          </div>
        </div>

        {/* Description */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Mô tả chi tiết
          </label>
          <textarea
            {...register('description')}
            rows={4}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {/* Contact Information */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Thông tin liên hệ
          </label>
          <textarea
            {...register('contactInfo')}
            rows={2}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {/* Submit Button */}
        <div className="flex justify-end">
          <button
            type="submit"
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
          >
            Tạo hoạt động
          </button>
        </div>
      </form>
    </div>
  );
};

export default CreateActivity; 