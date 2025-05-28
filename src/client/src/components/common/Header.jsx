import React from 'react';

export default function Header({ onToggleTheme, user }) {
  return (
    <header style={{
      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      padding: '12px 32px', background: '#1976d2', color: '#fff'
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        <img src="/logo192.png" alt="logo" style={{ width: 36, height: 36 }} />
        <span style={{ fontWeight: 700, fontSize: 22, letterSpacing: 1 }}>ActiHub</span>
      </div>
      <input
        placeholder="Tìm kiếm hoạt động..."
        style={{
          flex: 1, margin: '0 32px', padding: 8, borderRadius: 8, border: 'none', minWidth: 300
        }}
      />
      <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
        <button onClick={onToggleTheme} style={{
          background: 'none', border: 'none', color: '#fff', fontSize: 20, cursor: 'pointer'
        }}>🌓</button>
        <div style={{
          display: 'flex', alignItems: 'center', gap: 8, background: '#1565c0',
          borderRadius: 20, padding: '4px 12px'
        }}>
          <img src={user.avatar || '/avatar.png'} alt="avatar" style={{ width: 28, height: 28, borderRadius: '50%' }} />
          <span>{user.name}</span>
        </div>
      </div>
    </header>
  );
} 