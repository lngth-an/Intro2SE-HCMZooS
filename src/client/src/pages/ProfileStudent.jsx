import React, { useEffect, useState } from "react";
import axios from "axios";
import Header from "../components/common/Header";
import SidebarStudent from "../components/common/SidebarStudent";
import Footer from "../components/common/Footer";
import { useAuth } from "../contexts/AuthContext";

export default function ProfileStudent() {
  const { user } = useAuth();
  const [profile, setProfile] = useState(null);
  const [form, setForm] = useState({ name: "", email: "", phone: "" });
  const [formError, setFormError] = useState("");
  const [formSuccess, setFormSuccess] = useState("");
  const [loading, setLoading] = useState(false);

  const [pwMode, setPwMode] = useState(false);
  const [pwForm, setPwForm] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [pwError, setPwError] = useState("");
  const [pwSuccess, setPwSuccess] = useState("");
  const [pwLoading, setPwLoading] = useState(false);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const endpoint = "/student/me";
        const { data } = await axios.get(endpoint);
        setProfile(data);
        setForm({
          name: data.name || data.user?.name || "",
          email: data.email || data.user?.email || "",
          phone: data.phone || data.user?.phone || "",
        });
      } catch (err) {
        setFormError(err.response?.data?.message || "Không thể tải hồ sơ.");
      }
    };

    if (user) fetchProfile();
  }, [user]);

  const handleChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });
  const handlePwChange = (e) =>
    setPwForm({ ...pwForm, [e.target.name]: e.target.value });

  const handleSave = async (e) => {
    e.preventDefault();
    setFormError("");
    setFormSuccess("");
    setLoading(true);

    if (!form.email || !form.phone) {
      setFormError("Vui lòng điền đủ thông tin.");
      setLoading(false);
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) {
      setFormError("Email không hợp lệ.");
      setLoading(false);
      return;
    }
    if (!/^\d{9,11}$/.test(form.phone)) {
      setFormError("Số điện thoại không hợp lệ.");
      setLoading(false);
      return;
    }

    try {
      const endpoint = "/student/me";
      await axios.patch(endpoint, { email: form.email, phone: form.phone });
      setFormSuccess("Cập nhật thành công!");
    } catch (err) {
      setFormError(err.response?.data?.message || "Lỗi cập nhật.");
    } finally {
      setLoading(false);
    }
  };

  const handlePwSubmit = async (e) => {
    e.preventDefault();
    setPwError("");
    setPwSuccess("");
    setPwLoading(true);

    if (
      !pwForm.currentPassword ||
      !pwForm.newPassword ||
      !pwForm.confirmPassword
    ) {
      setPwError("Vui lòng nhập đầy đủ thông tin.");
      setPwLoading(false);
      return;
    }
    if (pwForm.newPassword.length < 6) {
      setPwError("Mật khẩu mới phải ít nhất 6 ký tự.");
      setPwLoading(false);
      return;
    }
    if (pwForm.newPassword !== pwForm.confirmPassword) {
      setPwError("Xác nhận mật khẩu không khớp.");
      setPwLoading(false);
      return;
    }

    try {
      await axios.post("/auth/change-password", pwForm);
      setPwSuccess("Đổi mật khẩu thành công!");
      setPwForm({ currentPassword: "", newPassword: "", confirmPassword: "" });
      setPwMode(false);
    } catch (err) {
      setPwError(err.response?.data?.message || "Lỗi đổi mật khẩu.");
    } finally {
      setPwLoading(false);
    }
  };

  if (!user)
    return (
      <div className="p-8 text-center">Vui lòng đăng nhập để tiếp tục.</div>
    );
  if (!profile) return <div className="p-8 text-center">Đang tải hồ sơ...</div>;

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Header />
      <div className="flex flex-1">
        <SidebarStudent />

        <main className="flex-1 ml-60 px-6 md:px-10 pt-24">
          <h1 className="text-4xl font-extrabold text-gray-900 tracking-tight">
            HỒ SƠ CÁ NHÂN
          </h1>

          <div className="bg-white shadow rounded-2xl p-6 mb-8 mt-6">
            <h2 className="text-xl font-semibold mb-4">Thông tin cá nhân</h2>
            <form onSubmit={handleSave} className="space-y-4">
              <div>
                <label className="block text-sm font-medium">Họ tên</label>
                <input
                  name="name"
                  value={form.name}
                  disabled
                  className="w-full px-3 py-2 rounded-lg bg-gray-100 border text-gray-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium">Email</label>
                <input
                  name="email"
                  value={form.email}
                  onChange={handleChange}
                  className="w-full px-3 py-2 rounded-lg border"
                />
              </div>
              <div>
                <label className="block text-sm font-medium">
                  Số điện thoại
                </label>
                <input
                  name="phone"
                  value={form.phone}
                  onChange={handleChange}
                  className="w-full px-3 py-2 rounded-lg border"
                />
              </div>
              <div className="flex gap-4">
                <button
                  type="submit"
                  className="bg-blue-600 text-white px-5 py-2 rounded-lg hover:bg-blue-700"
                  disabled={loading}
                >
                  {loading ? "Đang lưu..." : "Lưu thay đổi"}
                </button>
                <button
                  type="button"
                  className="text-sm underline"
                  onClick={() =>
                    setForm({
                      ...form,
                      email: profile.email,
                      phone: profile.phone,
                    })
                  }
                >
                  Hủy thay đổi
                </button>
              </div>
              {formError && <p className="text-red-600 text-sm">{formError}</p>}
              {formSuccess && (
                <p className="text-green-600 text-sm">{formSuccess}</p>
              )}
            </form>
          </div>

          <div className="bg-white shadow rounded-2xl p-6">
            <h2 className="text-xl font-semibold mb-4">Bảo mật</h2>
            {!pwMode ? (
              <button
                className="bg-blue-100 text-blue-700 px-4 py-2 rounded-md hover:bg-blue-200"
                onClick={() => setPwMode(true)}
              >
                Đổi mật khẩu
              </button>
            ) : (
              <form onSubmit={handlePwSubmit} className="space-y-4 mt-4">
                <div>
                  <label className="block text-sm font-medium">
                    Mật khẩu hiện tại
                  </label>
                  <input
                    name="currentPassword"
                    type="password"
                    value={pwForm.currentPassword}
                    onChange={handlePwChange}
                    className="w-full px-3 py-2 rounded-lg border"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium">
                    Mật khẩu mới
                  </label>
                  <input
                    name="newPassword"
                    type="password"
                    value={pwForm.newPassword}
                    onChange={handlePwChange}
                    className="w-full px-3 py-2 rounded-lg border"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium">
                    Xác nhận mật khẩu
                  </label>
                  <input
                    name="confirmPassword"
                    type="password"
                    value={pwForm.confirmPassword}
                    onChange={handlePwChange}
                    className="w-full px-3 py-2 rounded-lg border"
                  />
                </div>
                <div className="flex gap-4">
                  <button
                    type="submit"
                    className="bg-blue-600 text-white px-5 py-2 rounded-lg hover:bg-blue-700"
                    disabled={pwLoading}
                  >
                    {pwLoading ? "Đang xử lý..." : "Xác nhận"}
                  </button>
                  <button
                    type="button"
                    className="text-sm underline"
                    onClick={() => {
                      setPwMode(false);
                      setPwForm({
                        currentPassword: "",
                        newPassword: "",
                        confirmPassword: "",
                      });
                    }}
                  >
                    Hủy
                  </button>
                </div>
                {pwError && <p className="text-red-600 text-sm">{pwError}</p>}
                {pwSuccess && (
                  <p className="text-green-600 text-sm">{pwSuccess}</p>
                )}
              </form>
            )}
          </div>
        </main>
      </div>
      <footer className="bg-gray-100 py-6 ml-auto w-fit pr-4">
        <Footer />
      </footer>
    </div>
  );
}
