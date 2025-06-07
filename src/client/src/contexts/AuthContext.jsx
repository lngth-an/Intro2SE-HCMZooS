import React, { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';

const AuthContext = createContext(null);

// Cấu hình axios
axios.defaults.baseURL = 'http://localhost:3001';
axios.defaults.withCredentials = true;

// Thêm interceptor để tự động thêm token vào header
axios.interceptors.request.use((config) => {
  const token = localStorage.getItem('accessToken');
  if (token) {
    config.headers['Authorization'] = `Bearer ${token}`;
  }
  return config;
});

// Thêm interceptor để xử lý lỗi 401
axios.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Xóa thông tin đăng nhập
      localStorage.removeItem('accessToken');
      localStorage.removeItem('role');
      localStorage.removeItem('userID');
      localStorage.removeItem('user');
      // Xóa cookie
      document.cookie = 'token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT';
      // Chuyển hướng về trang login
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    const savedUser = localStorage.getItem('user');
    return savedUser ? JSON.parse(savedUser) : null;
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('accessToken');
    if (token) {
      fetchUserInfo();
    } else {
      setLoading(false);
    }
  }, []);

  const fetchUserInfo = async () => {
    try {
      const response = await axios.get('/auth/me');
      const userData = response.data;
      setUser(userData);
      
      // Lưu thông tin user vào localStorage
      localStorage.setItem('userID', userData.userID);
      localStorage.setItem('role', userData.role);
      localStorage.setItem('user', JSON.stringify(userData));
    } catch (error) {
      console.error('Error fetching user info:', error);
      // Xóa thông tin đăng nhập nếu có lỗi
      localStorage.removeItem('accessToken');
      localStorage.removeItem('role');
      localStorage.removeItem('userID');
      localStorage.removeItem('user');
      // Xóa cookie
      document.cookie = 'token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT';
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  const login = async (email, password) => {
    try {
      const response = await axios.post('/auth/login', { email, password });
      const { token, role, user } = response.data;
      
      // Lưu token và thông tin user
      localStorage.setItem('accessToken', token);
      localStorage.setItem('role', role);
      localStorage.setItem('userID', user.userID);
      localStorage.setItem('user', JSON.stringify(user));
      setUser(user);
      
      return { success: true };
    } catch (error) {
      return { 
        success: false, 
        message: error.response?.data?.message || 'Đăng nhập thất bại' 
      };
    }
  };

  const logout = async () => {
    try {
      // Gọi API đăng xuất
      await axios.post('/auth/logout');
      
      // Xóa tất cả thông tin trong localStorage
      localStorage.removeItem('accessToken');
      localStorage.removeItem('role');
      localStorage.removeItem('userID');
      localStorage.removeItem('user');
      
      // Xóa cookie
      document.cookie = 'token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT';
      
      // Reset user state
      setUser(null);
      
      // Chuyển hướng về trang login
      window.location.href = '/login';
    } catch (error) {
      console.error('Error logging out:', error);
      // Vẫn xóa thông tin đăng nhập và chuyển hướng về trang login
      localStorage.removeItem('accessToken');
      localStorage.removeItem('role');
      localStorage.removeItem('userID');
      localStorage.removeItem('user');
      document.cookie = 'token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT';
      setUser(null);
      window.location.href = '/login';
    }
  };

  const value = {
    user,
    loading,
    login,
    logout
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}; 