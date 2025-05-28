import React, { useState } from 'react';
import Header from '../components/common/Header';
import SidebarOrganizer from '../components/common/SidebarOrganizer';
import Footer from '../components/common/Footer';
import OrganizerHomeMain from '../components/pages/OrganizerHomeMain';

export default function OrganizerHome() {
  const [theme, setTheme] = useState('light');
  const user = { name: 'Nguyễn Văn B', avatar: '/avatar.png' };

  return (
    <div style={{ background: theme === 'dark' ? '#222' : '#fafbfc', minHeight: '100vh' }}>
      <Header onToggleTheme={() => setTheme(t => t === 'light' ? 'dark' : 'light')} user={user} />
      <SidebarOrganizer onLogout={() => alert('Đăng xuất!')} />
      <OrganizerHomeMain />
      <Footer />
    </div>
  );
} 