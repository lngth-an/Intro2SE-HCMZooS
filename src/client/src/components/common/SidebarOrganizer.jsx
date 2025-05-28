import React from 'react';
import { useNavigate } from 'react-router-dom';

// Updated menu with icons matching the new sample image
const menu = [
  { label: 'Trang chủ', icon: <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-home"><path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>, path: '/organizer' },
  { label: 'Quản lý hoạt động', icon: <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-clipboard-list"><rect width="8" height="14" x="4" y="8" rx="1"/><path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-2"/><path d="M8 12h6"/><path d="M8 16h6"/><path d="M8 20h6"/><path d="M9 4h4"/></svg>, path: '/organizer/activities' },
  { label: 'Phê duyệt đăng ký', icon: <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-circle-check"><circle cx="12" cy="12" r="10"/><path d="m9 12 2 2 4-4"/></svg> },
  { label: 'Thông báo', icon: <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-bell"><path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9"/><path d="M10.3 21a1.94 1.94 0 0 0 3.4 0"/></svg> },
  { label: 'Khiếu nại', icon: <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-circle-alert"><circle cx="12" cy="12" r="10"/><line x1="12" x2="12" y1="8" y2="12"/><line x1="12" x2="12.01" y1="16" y2="16"/></svg> },
  { label: 'Hồ sơ', icon: <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-user"><path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg> },
];

export default function SidebarOrganizer({ onLogout }) {
  const navigate = useNavigate();
  return (
    <aside style={{
      width: 220, background: '#fff', display: 'flex', // Changed background to white
      flexDirection: 'column', justifyContent: 'space-between',
      padding: '16px 0' // Adjusted padding
    }}>
      <div>
        {menu.map(item => (
          <div key={item.label}
            onClick={() => item.path && navigate(item.path)}
            style={{
              display: 'flex', alignItems: 'center', gap: 12, padding: '12px 24px',
              cursor: 'pointer', fontWeight: 500, fontSize: 15, // Adjusted font size
              color: '#333'
            }}>
            <span style={{ color: '#1976d2' }}>{item.icon}</span> {/* Changed icon color */}
            <span>{item.label}</span>
          </div>
        ))}
      </div>
      <div style={{ padding: '16px 24px' }}> {/* Adjusted padding around button */}
        <button onClick={onLogout} style={{
          width: '100%', background: 'none', color: '#d32f2f', border: 'none',
          borderRadius: 6, padding: '8px 0', fontWeight: 600, fontSize: 16, cursor: 'pointer',
          display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8
        }}>
          <span>←</span>
          <span>Đăng xuất</span>
        </button>
      </div>
    </aside>
  );
} 