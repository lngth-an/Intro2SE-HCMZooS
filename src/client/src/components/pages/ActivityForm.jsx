import React, { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { Upload, X } from "lucide-react";
import { supabase } from "../../supabaseClient";

const SEMESTER_API = "/semester/current";

// Cập nhật danh sách lĩnh vực
const ACTIVITY_TYPES = [
  {
    id: "Tình nguyện",
    label: "Tình nguyện",
    type: "Tình nguyện",
    color: "bg-green-100 text-green-800",
    selectedColor: "bg-green-600 text-white",
  },
  {
    id: "Học thuật",
    label: "Học thuật",
    type: "Học thuật",
    color: "bg-blue-100 text-blue-800",
    selectedColor: "bg-blue-600 text-white",
  },
  {
    id: "Văn hóa",
    label: "Văn hóa",
    type: "Văn hóa",
    color: "bg-orange-100 text-orange-800",
    selectedColor: "bg-orange-600 text-white",
  },
  {
    id: "Thể thao",
    label: "Thể thao",
    type: "Thể thao",
    color: "bg-yellow-100 text-yellow-800",
    selectedColor: "bg-yellow-600 text-white",
  },
  {
    id: "Nghệ thuật",
    label: "Nghệ thuật",
    type: "Nghệ thuật",
    color: "bg-purple-100 text-purple-800",
    selectedColor: "bg-purple-600 text-white",
  },
  {
    id: "Kỹ năng",
    label: "Kỹ năng",
    type: "Kỹ năng",
    color: "bg-pink-100 text-pink-800",
    selectedColor: "bg-pink-600 text-white",
  },
  {
    id: "Hội thảo",
    label: "Hội thảo",
    type: "Hội thảo",
    color: "bg-indigo-100 text-indigo-800",
    selectedColor: "bg-indigo-600 text-white",
  },
  {
    id: "Khác",
    label: "Khác",
    type: "Khác",
    color: "bg-gray-100 text-gray-800",
    selectedColor: "bg-gray-600 text-white",
  },
];

function ActivityForm({
  onSubmit,
  editingId,
  onCancel,
  activityTypes = ACTIVITY_TYPES,
  initialData,
}) {
  console.log("ActivityForm received initialData:", initialData);
  const [selectedImage, setSelectedImage] = useState(null);
  const [imageUrl, setImageUrl] = useState(initialData?.image || "");
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState("");
  const [selectedType, setSelectedType] = useState(
    initialData?.type || ""
  );
  const [semesterID, setSemesterID] = useState(null);
  const [loadingSemester, setLoadingSemester] = useState(true);

  const {
    register,
    handleSubmit,
    setValue,
    reset,
    formState: { errors },
  } = useForm({
    defaultValues: initialData
      ? {
          name: initialData.name,
          description: initialData.description,
          eventStart: initialData.eventStart?.slice(0, 16),
          eventEnd: initialData.eventEnd?.slice(0, 16),
          location: initialData.location,
          capacity: initialData.capacity,
          registrationStart: initialData.registrationStart?.slice(0, 16),
          registrationEnd: initialData.registrationEnd?.slice(0, 16),
        }
      : {},
  });

  useEffect(() => {
    fetch(SEMESTER_API)
      .then((res) => res.json())
      .then((data) => {
        setSemesterID(data.semesterID || null);
        setLoadingSemester(false);
      })
      .catch(() => setLoadingSemester(false));
  }, []);

  useEffect(() => {
    console.log("Setting form values with initialData:", initialData);
    if (initialData) {
      // Đặt lại tất cả các giá trị form
      Object.keys(initialData).forEach((key) => {
        if (
          key === "eventStart" ||
          key === "eventEnd" ||
          key === "registrationStart" ||
          key === "registrationEnd"
        ) {
          setValue(key, initialData[key]?.slice(0, 16));
        } else {
          setValue(key, initialData[key]);
        }
      });
      // Đặt lại type và image
      setSelectedType(initialData.type || "");
      setImageUrl(initialData.image || "");
    }
  }, [initialData, setValue]);

  const handleImageChange = async (e) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setSelectedImage(file);
      setUploadError("");
      setUploading(true);
      // Upload lên Supabase
      const fileExt = file.name.split(".").pop();
      const fileName = `activity_${Date.now()}.${fileExt}`;
      const { error: uploadError } = await supabase.storage
        .from("activities")
        .upload(fileName, file, { upsert: true });
      if (uploadError) {
        setUploadError("Lỗi upload ảnh");
        setUploading(false);
        setImageUrl("");
        return;
      }
      // Lấy public URL
      const { data } = supabase.storage
        .from("activities")
        .getPublicUrl(fileName);
      const publicUrl = data.publicUrl;
      const { error: insertError } = await supabase
        .from("activities")
        .insert([{ image_url: publicUrl }]);
      setImageUrl(publicUrl);
      setUploading(false);
    }
  };

  const handleTypeSelect = (typeId) => {
    setSelectedType(typeId);
  };

  const handleFormSubmit = async (data) => {
    console.log("handleFormSubmit called", data);
    const selectedActivityType =
      activityTypes.find((t) => t.id === selectedType)?.type || selectedType;

    const submitData = {
      ...data,
      image:
        imageUrl ||
        "https://cylpzmvdcyhkvghdeelb.supabase.co/storage/v1/object/public/activities//dai-hoc-khoa-ho-ctu-nhien-tphcm.jpg", // Set default image if no image uploaded
      type: selectedActivityType,
      semesterID,
    };
    console.log("Submitting data:", submitData); // Debug log
    await onSubmit(submitData);
    if (!editingId) {
      reset();
      setSelectedImage(null);
      setSelectedType("");
      setImageUrl("");
    }
  };

  if (loadingSemester)
    return <div className="text-center mt-10">Đang tải học kỳ hiện tại...</div>;

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="bg-white shadow rounded-lg p-6">
        <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-6">
          {/* Tải hình ảnh */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Tải hình ảnh
            </label>
            <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-lg">
              <div className="space-y-1 text-center">
                {imageUrl ? (
                  <div className="relative">
                    <img
                      src={imageUrl}
                      alt="Preview"
                      className="mx-auto h-32 w-auto"
                    />
                    <button
                      type="button"
                      onClick={() => {
                        setImageUrl("");
                        setSelectedImage(null);
                      }}
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
                {uploading && (
                  <div className="text-blue-600 mt-2">Đang upload...</div>
                )}
                {uploadError && (
                  <div className="text-red-600 mt-2">{uploadError}</div>
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
              {...register("name", { required: "Vui lòng nhập tên hoạt động" })}
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
              {...register("description", {
                required: "Vui lòng nhập mô tả chi tiết",
              })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            {errors.description && (
              <p className="mt-1 text-sm text-red-600">
                {errors.description.message}
              </p>
            )}
          </div>

          {/* Thời gian diễn ra */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Thời gian bắt đầu <span className="text-red-500">*</span>
              </label>
              <input
                type="datetime-local"
                {...register("eventStart", {
                  required: "Vui lòng chọn thời gian bắt đầu",
                })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              {errors.eventStart && (
                <p className="mt-1 text-sm text-red-600">
                  {errors.eventStart.message}
                </p>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Thời gian kết thúc <span className="text-red-500">*</span>
              </label>
              <input
                type="datetime-local"
                {...register("eventEnd", {
                  required: "Vui lòng chọn thời gian kết thúc",
                  validate: (value) => {
                    const eventStart = document.querySelector('input[name="eventStart"]')?.value;
                    if (eventStart && value && value <= eventStart) {
                      return "Thời gian kết thúc phải lớn hơn thời gian bắt đầu!";
                    }
                    return true;
                  }
                })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              {errors.eventEnd && (
                <p className="mt-1 text-sm text-red-600">
                  {errors.eventEnd.message}
                </p>
              )}
            </div>
          </div>

          {/* Địa điểm và số lượng */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Địa điểm <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                {...register("location", {
                  required: "Vui lòng nhập địa điểm",
                })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              {errors.location && (
                <p className="mt-1 text-sm text-red-600">
                  {errors.location.message}
                </p>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Số lượng tham gia <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                min="1"
                {...register("capacity", {
                  required: "Vui lòng nhập số lượng tham gia",
                  min: { value: 1, message: "Số lượng phải lớn hơn 0" },
                })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              {errors.capacity && (
                <p className="mt-1 text-sm text-red-600">
                  {errors.capacity.message}
                </p>
              )}
            </div>
          </div>

          {/* Lĩnh vực */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Loại hoạt động <span className="text-red-500">*</span>
            </label>
            <div className="flex flex-wrap gap-2">
              {activityTypes.map((activityType) => (
                <button
                  key={activityType.id}
                  type="button"
                  onClick={() => handleTypeSelect(activityType.id)}
                  className={`px-4 py-2 rounded-full text-sm font-medium transition-colors duration-200 ${
                    selectedType === activityType.id
                      ? activityType.selectedColor
                      : activityType.color
                  }`}
                >
                  {activityType.label}
                </button>
              ))}
            </div>
            {!selectedType && (
              <p className="mt-1 text-sm text-red-600">
                Vui lòng chọn loại hoạt động
              </p>
            )}
          </div>

          {/* Thời gian đăng ký */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Thời gian đăng ký bắt đầu{" "}
                <span className="text-red-500">*</span>
              </label>
              <input
                type="datetime-local"
                {...register("registrationStart", {
                  required: "Vui lòng chọn thời gian bắt đầu đăng ký",
                })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              {errors.registrationStart && (
                <p className="mt-1 text-sm text-red-600">
                  {errors.registrationStart.message}
                </p>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Thời gian đăng ký kết thúc{" "}
                <span className="text-red-500">*</span>
              </label>
              <input
                type="datetime-local"
                {...register("registrationEnd", {
                  required: "Vui lòng chọn thời gian kết thúc đăng ký",
                  validate: (value) => {
                    const registrationStart = document.querySelector('input[name="registrationStart"]')?.value;
                    if (registrationStart && value && value <= registrationStart) {
                      return "Thời gian đăng ký kết thúc phải lớn hơn thời gian đăng ký bắt đầu!";
                    }
                    return true;
                  }
                })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              {errors.registrationEnd && (
                <p className="mt-1 text-sm text-red-600">
                  {errors.registrationEnd.message}
                </p>
              )}
            </div>
          </div>

          {/* Nút hành động */}
          <div className="flex justify-end">
            <button
              type="submit"
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
            >
              {editingId ? "Cập nhật" : "Tạo hoạt động"}
            </button>
            {editingId && (
              <button
                type="button"
                className="ml-3 px-4 py-2 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400"
                onClick={onCancel}
              >
                Hủy
              </button>
            )}
          </div>
        </form>
      </div>
    </div>
  );
}

export default ActivityForm;
