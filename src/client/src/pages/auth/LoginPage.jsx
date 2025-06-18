import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { useAuth } from '../../contexts/AuthContext';
import bgImage from '../../assets/hcmus.jpg';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const { login } = useAuth();

  const handleLogin = async (e) => {
    e.preventDefault();
    
    // Nếu đang loading thì không làm gì cả
    if (loading) return;
    
    setLoading(true);
    setError('');
    
    // Clear any existing toasts
    toast.dismiss();
    
    try {
      const result = await login(email, password);
      if (result.success) {
        toast.success('Đăng nhập thành công!', {
          toastId: 'login-success',
          position: "top-right",
          autoClose: 3000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
        });
        // Chỉ navigate khi thành công
        navigate('/student/dashboard');
      } else {
        const errorMessage = result.message || 'Tài khoản hoặc mật khẩu không chính xác!';
        setError(errorMessage);
        toast.error(errorMessage, {
          toastId: 'login-error',
          position: "top-right",
          autoClose: false,
          hideProgressBar: true,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
        });
        // Không navigate, chỉ hiển thị lỗi
      }
    } catch (error) {
      console.error('Login error:', error);
      const errorMessage = 'Tài khoản hoặc mật khẩu không chính xác!';
      setError(errorMessage);
      toast.error(errorMessage, {
        toastId: 'login-error',
        position: "top-right",
        autoClose: false,
        hideProgressBar: true,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
      });
      // Không navigate, chỉ hiển thị lỗi
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="min-h-screen flex items-center justify-center bg-cover bg-center relative"
      style={{ backgroundImage: `url(${bgImage})` }}
    >
      {/* Overlay mờ tối */}
      <div className="absolute inset-0 bg-black bg-opacity-40 backdrop-blur-sm z-0"></div>

      {/* Form đăng nhập */}
      <div className="relative z-10 w-full max-w-md bg-white bg-opacity-90 p-8 shadow-2xl rounded-2xl">
        <h2 className="text-3xl font-bold text-center mb-6 text-gray-800">Đăng nhập</h2>
        
        {/* Error message */}
        {error && (
          <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded-lg">
            {error}
          </div>
        )}
        
        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="block text-gray-700 font-medium">Email</label>
            <input
              type="email"
              className="w-full mt-1 px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          <div>
            <label className="block text-gray-700 font-medium">Mật khẩu</label>
            <input
              type="password"
              className="w-full mt-1 px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
          <button
            type="submit"
            className={`w-full py-2 rounded-lg text-white font-semibold ${
              loading ? 'bg-gray-400' : 'bg-blue-500 hover:bg-blue-600'
            }`}
            disabled={loading}
          >
            {loading ? 'Đang đăng nhập...' : 'Đăng nhập'}
          </button>
        </form>
      </div>
    </div>
  );
}