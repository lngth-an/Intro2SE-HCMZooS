import React, { useState } from 'react';
import Header from '../components/common/Header';
import Sidebar from '../components/common/Sidebar';
import Footer from '../components/common/Footer';
import StudentHomeMain from '../components/pages/StudentHomeMain';

export default function StudentHome() {
  const [theme, setTheme] = useState('light');
  const user = { name: 'Nguyễn Văn A', avatar: '/avatar.png' };

  return (
    <div style={{ background: theme === 'dark' ? '#222' : '#fafbfc', minHeight: '100vh' }}>
      <Header onToggleTheme={() => setTheme(t => t === 'light' ? 'dark' : 'light')} user={user} />
      <Sidebar onLogout={() => alert('Đăng xuất!')} />
      <StudentHomeMain
        onViewScore={() => alert('Điểm rèn luyện chi tiết')}
        onViewRegistered={() => alert('Xem hoạt động đã đăng ký')}
      />
      <Footer />
    </div>
  );
} 