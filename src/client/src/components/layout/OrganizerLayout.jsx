import React, { useState } from 'react';
import Header from '../common/Header';
import SidebarOrganizer from '../common/SidebarOrganizer';

export default function OrganizerLayout({ children }) {
  const [theme, setTheme] = useState('light');
  const user = { name: 'Đội Sinh viên tình nguyện', avatar: '/avatar.png' };

  return (
    <div style={{
      display: 'grid',
      gridTemplateColumns: '250px 1fr', // Sidebar width and main content area
      gridTemplateRows: 'auto 1fr', // Header height, sidebar/main height
      gridTemplateAreas:
        `"header header"
         "sidebar main"`,
      height: '100vh', // Constrain grid to viewport height
      overflow: 'hidden', // Hide overall grid overflow
      background: theme === 'dark' ? '#222' : '#fafbfc',
    }}>
      <header style={{ gridArea: 'header', zIndex: 10 }}>
        <Header onToggleTheme={() => setTheme(t => t === 'light' ? 'dark' : 'light')} user={user} />
      </header>
      <aside style={{
        gridArea: 'sidebar',
        background: '#f5f5f5',
        overflowY: 'auto', // Allow sidebar content to scroll
        height: '100%' // Ensure sidebar takes full height of its grid row
      }}> 
        <SidebarOrganizer onLogout={() => alert('Đăng xuất!')} />
      </aside>
      <main style={{
        gridArea: 'main',
        padding: '24px 0px 24px 0px', // Adjusted padding for main content: top, right, bottom, left (0 on left)
        overflowY: 'auto', // Allow main content to scroll
        height: '100%', // Ensure main takes full height of its grid row
        width: '100%'
      }}>
        {children}
      </main>
    </div>
  );
} 