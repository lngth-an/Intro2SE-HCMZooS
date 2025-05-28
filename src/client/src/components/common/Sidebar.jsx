import React from 'react';

const menu = [
  { label: 'Trang chủ', icon: '🏠' },
  { label: 'Điểm rèn luyện', icon: '⭐' },
  { label: 'Đăng ký hoạt động', icon: '📝' },
  { label: 'Quản lý hoạt động', icon: '📋' },
  { label: 'Thông báo', icon: '🔔' },
  { label: 'Hồ sơ', icon: '👤' },
];

export default function Sidebar({ onLogout }) {
  return (
    <aside style={{
      width: 250, background: '#f5f5f5', height: '100vh', display: 'flex',
      flexDirection: 'column', justifyContent: 'space-between', position: 'fixed', left: 0, top: 0
    }}>
      <div>
        {menu.map(item => (
          <div key={item.label} style={{
            display: 'flex', alignItems: 'center', gap: 12, padding: '16px 24px',
            cursor: 'pointer', fontWeight: 500, fontSize: 16
          }}>
            <span>{item.icon}</span> <span>{item.label}</span>
          </div>
        ))}
      </div>
      <div style={{ padding: '24px' }}>
        <button onClick={onLogout} style={{
          width: '100%', background: '#d32f2f', color: '#fff', border: 'none',
          borderRadius: 8, padding: '10px 0', fontWeight: 600, fontSize: 16, cursor: 'pointer'
        }}>Đăng xuất</button>
      </div>
    </aside>
  );
} 