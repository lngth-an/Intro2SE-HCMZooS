import React, { useEffect, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import axios from 'axios';

export default function Profile() {
  const { user } = useAuth();
  const [profile, setProfile] = useState(null);
  const [form, setForm] = useState({ name: '', email: '', phone: '' });
  const [formError, setFormError] = useState('');
  const [formSuccess, setFormSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  // Password change
  const [pwMode, setPwMode] = useState(false);
  const [pwForm, setPwForm] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' });
  const [pwError, setPwError] = useState('');
  const [pwSuccess, setPwSuccess] = useState('');
  const [pwLoading, setPwLoading] = useState(false);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        // Xác định endpoint dựa vào role
        const endpoint = user?.role === 'student' ? '/student/me' : '/organizer/me';
        console.log('Fetching from endpoint:', endpoint);
        
        const response = await axios.get(endpoint);
        console.log('Profile data:', response.data);
        
        setProfile(response.data);
        setForm({ 
          name: response.data.name || response.data.user?.name, 
          email: response.data.email || response.data.user?.email, 
          phone: response.data.phone || response.data.user?.phone 
        });
      } catch (err) {
        console.error('Error fetching profile:', err);
        setFormError(err.response?.data?.message || 'Không thể tải thông tin hồ sơ');
      }
    };

    if (user) {
      fetchProfile();
    }
  }, [user]);

  const handleFormChange = e => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSave = async e => {
    e.preventDefault();
    setFormError(''); setFormSuccess(''); setLoading(true);
    
    // Validation
    if (!form.email || !form.phone) {
      setFormError('Vui lòng nhập đầy đủ thông tin'); setLoading(false); return;
    }
    if (!/^\S+@\S+\.\S+$/.test(form.email)) {
      setFormError('Email không hợp lệ'); setLoading(false); return;
    }
    if (!/^\d{9,11}$/.test(form.phone)) {
      setFormError('Số điện thoại không hợp lệ'); setLoading(false); return;
    }

    try {
      const endpoint = user?.role === 'student' ? '/student/me' : '/organizer/me';
      const response = await axios.patch(endpoint, { 
        email: form.email, 
        phone: form.phone 
      });
      
      setFormSuccess('Cập nhật thành công!');
      setProfile({ ...profile, email: form.email, phone: form.phone });
    } catch (err) {
      setFormError(err.response?.data?.message || 'Lỗi cập nhật');
    } finally {
      setLoading(false);
    }
  };

  // Nút Hủy: hoàn tác lại thay đổi
  const handleCancel = () => {
    setForm({ 
      name: profile.name || profile.user?.name, 
      email: profile.email || profile.user?.email, 
      phone: profile.phone || profile.user?.phone 
    });
    setFormError('');
    setFormSuccess('');
  };

  // Password change handlers
  const handlePwChange = e => {
    setPwForm({ ...pwForm, [e.target.name]: e.target.value });
  };

  const handlePwSubmit = async e => {
    e.preventDefault();
    setPwError(''); setPwSuccess(''); setPwLoading(true);
    
    if (!pwForm.currentPassword || !pwForm.newPassword || !pwForm.confirmPassword) {
      setPwError('Vui lòng nhập đầy đủ thông tin'); setPwLoading(false); return;
    }
    if (pwForm.newPassword.length < 6) {
      setPwError('Mật khẩu mới phải từ 6 ký tự'); setPwLoading(false); return;
    }
    if (pwForm.newPassword !== pwForm.confirmPassword) {
      setPwError('Mật khẩu xác nhận không khớp'); setPwLoading(false); return;
    }

    try {
      const response = await axios.patch('/auth/change-password', pwForm);
      setPwSuccess('Đổi mật khẩu thành công!');
      setPwForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
      setPwMode(false);
    } catch (err) {
      setPwError(err.response?.data?.message || 'Lỗi đổi mật khẩu');
    } finally {
      setPwLoading(false);
    }
  };

  if (!user) return <div className="p-8">Vui lòng đăng nhập để xem hồ sơ</div>;
  if (!profile) return <div className="p-8">Đang tải hồ sơ...</div>;

  return (
    <div className="max-w-xl mx-auto p-6">
      <h2 className="text-2xl font-bold mb-4">Hồ sơ cá nhân</h2>
      <form onSubmit={handleSave} className="space-y-3">
        <div>
          <label className="block font-medium">Họ tên</label>
          <input
            name="name"
            value={form.name}
            className="w-full border rounded px-2 py-1 bg-gray-100 cursor-not-allowed"
            disabled
          />
        </div>
        <div>
          <label className="block font-medium">Email</label>
          <input
            name="email"
            value={form.email}
            onChange={handleFormChange}
            className="w-full border rounded px-2 py-1"
          />
        </div>
        <div>
          <label className="block font-medium">Số điện thoại</label>
          <input
            name="phone"
            value={form.phone}
            onChange={handleFormChange}
            className="w-full border rounded px-2 py-1"
          />
        </div>
        <div className="flex gap-3 mt-2">
          <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded" disabled={loading}>{loading ? 'Đang lưu...' : 'Lưu'}</button>
          <button type="button" className="text-gray-500 underline text-sm" onClick={handleCancel}>Hủy</button>
        </div>
        {formError && <div className="text-red-600">{formError}</div>}
        {formSuccess && <div className="text-green-600">{formSuccess}</div>}
      </form>
      <div className="mt-8">
        {!pwMode ? (
          <button className="text-blue-600 underline" onClick={()=>{setPwMode(true); setPwError(''); setPwSuccess('');}}>Đổi mật khẩu</button>
        ) : (
          <form onSubmit={handlePwSubmit} className="space-y-2">
            <div>
              <label className="block font-medium">Mật khẩu hiện tại</label>
              <input
                name="currentPassword"
                type="password"
                value={pwForm.currentPassword}
                onChange={handlePwChange}
                className="w-full border rounded px-2 py-1"
                autoComplete="current-password"
              />
            </div>
            <div>
              <label className="block font-medium">Mật khẩu mới</label>
              <input
                name="newPassword"
                type="password"
                value={pwForm.newPassword}
                onChange={handlePwChange}
                className="w-full border rounded px-2 py-1"
                autoComplete="new-password"
              />
            </div>
            <div>
              <label className="block font-medium">Xác nhận mật khẩu mới</label>
              <input
                name="confirmPassword"
                type="password"
                value={pwForm.confirmPassword}
                onChange={handlePwChange}
                className="w-full border rounded px-2 py-1"
                autoComplete="new-password"
              />
            </div>
            <div className="flex gap-3 mt-2">
              <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded" disabled={pwLoading}>{pwLoading ? 'Đang lưu...' : 'Xác nhận'}</button>
              <button type="button" className="text-gray-500 underline text-sm" onClick={()=>{setPwMode(false); setPwForm({ currentPassword: '', newPassword: '', confirmPassword: '' });}}>Hủy</button>
            </div>
            {pwError && <div className="text-red-600">{pwError}</div>}
            {pwSuccess && <div className="text-green-600">{pwSuccess}</div>}
          </form>
        )}
      </div>
    </div>
  );
} 