import React, { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { Upload, X } from 'lucide-react';
import { supabase } from '../../supabaseClient';

const SEMESTER_API = '/semester/current';

function ActivityForm({ onSubmit, editingId, onCancel, domains, initialData }) {
  const [selectedImage, setSelectedImage] = useState(null);
  const [imageUrl, setImageUrl] = useState(initialData?.image || '');
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState('');
  const [selectedDomains, setSelectedDomains] = useState([]);
  const [semesterID, setSemesterID] = useState(null);
  const [loadingSemester, setLoadingSemester] = useState(true);
  
  const { register, handleSubmit, setValue, reset, formState: { errors } } = useForm();

  useEffect(() => {
    fetch(SEMESTER_API)
      .then(res => res.json())
      .then(data => {
        setSemesterID(data.semesterID || null);
        setLoadingSemester(false);
      })
      .catch(() => setLoadingSemester(false));
  }, []);

  useEffect(() => {
    if (initialData) {
      setValue('name', initialData.name);
      setValue('description', initialData.description);
      setValue('eventStart', initialData.eventStart?.slice(0, 16));
      setValue('eventEnd', initialData.eventEnd?.slice(0, 16));
      setValue('location', initialData.location);
      setValue('capacity', initialData.capacity);
      setValue('targetAudience', initialData.targetAudience || '');
      setValue('trainingScore', initialData.trainingScore || '');
      setValue('registrationStart', initialData.registrationStart?.slice(0, 16));
      setValue('registrationEnd', initialData.registrationEnd?.slice(0, 16));
      setValue('contactInfo', initialData.contactInfo || '');
      setSelectedDomains(initialData.domains || []);
      setImageUrl(initialData.image || '');
    }
  }, [initialData, setValue]);

  const handleImageChange = async (e) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setSelectedImage(file);
      setUploadError('');
      setUploading(true);
      // Upload lên Supabase
      const fileExt = file.name.split('.').pop();
      const fileName = `activity_${Date.now()}.${fileExt}`;
      const { error: uploadError } = await supabase.storage
        .from('activities')
        .upload(fileName, file, { upsert: true });
      if (uploadError) {
        setUploadError('Lỗi upload ảnh');
        setUploading(false);
        setImageUrl('');
        return;
      }
      // Lấy public URL
      const { data } = supabase.storage.from('activities').getPublicUrl(fileName);
      const publicUrl = data.publicUrl;
      const { error: insertError } = await supabase
      .from('activities')
      .insert([{ image_url: publicUrl }]);
      setImageUrl(publicUrl);
      setUploading(false);
    }
  };

  const handleDomainToggle = (domainId) => {
    setSelectedDomains(prev =>
      prev.includes(domainId)
        ? prev.filter(id => id !== domainId)
        : [...prev, domainId]
    );
  };

  const handleFormSubmit = async (data) => {
    const submitData = {
      ...data,
      image: imageUrl || 'https://cylpzmvdcyhkvghdeelb.supabase.co/storage/v1/object/public/activities//dai-hoc-khoa-ho-ctu-nhien-tphcm.jpg', // Set default image if no image uploaded
      domains: selectedDomains,
      semesterID,
    };
    console.log('Submitting data:', submitData); // Debug log
    await onSubmit(submitData);
    if (!editingId) {
      reset();
      setSelectedImage(null);
      setSelectedDomains([]);
      setImageUrl('');
    }
  };

  if (loadingSemester) return <div className="text-center mt-10">Đang tải học kỳ hiện tại...</div>;

  return (
    <form onSubmit={handleSubmit(handleFormSubmit)} className="bg-white p-8 rounded-lg shadow-md space-y-6">
      {/* Tải hình ảnh */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Tải hình ảnh</label>
        <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-lg">
          <div className="space-y-1 text-center">
            {imageUrl ? (
              <div className="relative">
                <img src={imageUrl} alt="Preview" className="mx-auto h-32 w-auto" />
                <button type="button" onClick={() => { setImageUrl(''); setSelectedImage(null); }} className="absolute -top-2 -right-2 p-1 bg-red-500 text-white rounded-full">
                  <X className="h-4 w-4" />
                </button>
              </div>
            ) : (
              <>
                <Upload className="mx-auto h-12 w-12 text-gray-400" />
                <div className="flex text-sm text-gray-600">
                  <label className="relative cursor-pointer bg-white rounded-md font-medium text-blue-600 hover:text-blue-500">
                    <span>Tải ảnh lên</span>
                    <input type="file" className="sr-only" accept="image/*" onChange={handleImageChange} />
                  </label>
                </div>
              </>
            )}
            {uploading && <div className="text-blue-600 mt-2">Đang upload...</div>}
            {uploadError && <div className="text-red-600 mt-2">{uploadError}</div>}
          </div>
        </div>
      </div>

      {/* Tên hoạt động */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Tên hoạt động <span className="text-red-500">*</span></label>
        <input type="text" {...register('name', { required: 'Vui lòng nhập tên hoạt động' })} className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500" />
        {errors.name && <p className="mt-1 text-sm text-red-600">{errors.name.message}</p>}
      </div>

      {/* Mô tả chi tiết */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Mô tả chi tiết <span className="text-red-500">*</span></label>
        <textarea rows={4} {...register('description', { required: 'Vui lòng nhập mô tả chi tiết' })} className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500" />
        {errors.description && <p className="mt-1 text-sm text-red-600">{errors.description.message}</p>}
      </div>

      {/* Thời gian diễn ra */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Thời gian bắt đầu <span className="text-red-500">*</span></label>
          <input type="datetime-local" {...register('eventStart', { required: 'Vui lòng chọn thời gian bắt đầu' })} className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500" />
          {errors.eventStart && <p className="mt-1 text-sm text-red-600">{errors.eventStart.message}</p>}
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Thời gian kết thúc <span className="text-red-500">*</span></label>
          <input type="datetime-local" {...register('eventEnd', { required: 'Vui lòng chọn thời gian kết thúc' })} className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500" />
          {errors.eventEnd && <p className="mt-1 text-sm text-red-600">{errors.eventEnd.message}</p>}
        </div>
      </div>

      {/* Địa điểm và số lượng */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Địa điểm <span className="text-red-500">*</span></label>
          <input type="text" {...register('location', { required: 'Vui lòng nhập địa điểm' })} className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500" />
          {errors.location && <p className="mt-1 text-sm text-red-600">{errors.location.message}</p>}
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Số lượng tham gia <span className="text-red-500">*</span></label>
          <input type="number" min="1" {...register('capacity', { required: 'Vui lòng nhập số lượng tham gia', min: { value: 1, message: 'Số lượng phải lớn hơn 0' } })} className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500" />
          {errors.capacity && <p className="mt-1 text-sm text-red-600">{errors.capacity.message}</p>}
        </div>
      </div>

      {/* Đối tượng */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Đối tượng <span className="text-red-500">*</span></label>
        <input type="text" {...register('targetAudience', { required: 'Vui lòng nhập đối tượng' })} className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500" />
        {errors.targetAudience && <p className="mt-1 text-sm text-red-600">{errors.targetAudience.message}</p>}
      </div>

      {/* Lĩnh vực */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Lĩnh vực <span className="text-red-500">*</span></label>
        <div className="flex flex-wrap gap-2">
          {domains.map(domain => (
            <button key={domain.id} type="button" onClick={() => handleDomainToggle(domain.id)} className={`px-3 py-1 rounded-full text-sm font-medium ${selectedDomains.includes(domain.id) ? domain.selectedColor : domain.color}`}>
              {domain.label}
            </button>
          ))}
        </div>
        {selectedDomains.length === 0 && <p className="mt-1 text-sm text-red-600">Vui lòng chọn ít nhất một lĩnh vực</p>}
      </div>

      {/* Điểm rèn luyện */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Điểm rèn luyện <span className="text-red-500">*</span></label>
        <select {...register('trainingScore', { required: 'Vui lòng chọn điểm rèn luyện' })} className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500">
          <option value="">Chọn điểm rèn luyện</option>
          <option value="3">3 điểm</option>
          <option value="5">5 điểm</option>
          <option value="10">10 điểm</option>
          <option value="15">15 điểm</option>
        </select>
        {errors.trainingScore && <p className="mt-1 text-sm text-red-600">{errors.trainingScore.message}</p>}
      </div>

      {/* Thời gian đăng ký */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Thời gian đăng ký bắt đầu <span className="text-red-500">*</span></label>
          <input type="datetime-local" {...register('registrationStart', { required: 'Vui lòng chọn thời gian bắt đầu đăng ký' })} className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500" />
          {errors.registrationStart && <p className="mt-1 text-sm text-red-600">{errors.registrationStart.message}</p>}
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Thời gian đăng ký kết thúc <span className="text-red-500">*</span></label>
          <input type="datetime-local" {...register('registrationEnd', { required: 'Vui lòng chọn thời gian kết thúc đăng ký' })} className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500" />
          {errors.registrationEnd && <p className="mt-1 text-sm text-red-600">{errors.registrationEnd.message}</p>}
        </div>
      </div>

      {/* Thông tin liên hệ */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Thông tin liên hệ <span className="text-red-500">*</span></label>
        <textarea rows={3} {...register('contactInfo', { required: 'Vui lòng nhập thông tin liên hệ' })} className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500" placeholder="Nhập thông tin liên hệ (email, số điện thoại, người phụ trách...)" />
        {errors.contactInfo && <p className="mt-1 text-sm text-red-600">{errors.contactInfo.message}</p>}
      </div>

      {/* Nút hành động */}
      <div className="flex justify-end">
        <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2">
          {editingId ? 'Cập nhật' : 'Tạo hoạt động'}
        </button>
        {editingId && (
          <button type="button" className="ml-3 px-4 py-2 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400" onClick={onCancel}>
            Hủy
          </button>
        )}
      </div>
    </form>
  );
}

export default ActivityForm;
