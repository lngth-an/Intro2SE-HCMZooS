import React from 'react';

export default function Header({ onToggleTheme, user }) {
  return (
    <header style={{
      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      padding: '8px 32px', background: '#fff', color: '#333', borderBottom: '1px solid #e0e0e0'
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-graduation-cap" style={{ color: '#1976d2' }}><path d="M21.42 10.98v10.01a2 2 0 0 1-1.96 2a2 2 0 0 1-2-1.96V11"/><path d="M16 6l-1.94 1.94"/><path d="M8 8l1.94-1.94"/><path d="M10.98 21.42a2 2 0 0 0 1.96 0L22 13 12 2 2 13l8.98 8.42Z"/></svg>
        <span style={{ fontWeight: 700, fontSize: 20, color: '#1976d2' }}>ActiHub</span>
      </div>
      <div style={{ position: 'relative', flex: 1, margin: '0 24px', maxWidth: 400 }}>
        <input
          placeholder="Tìm kiếm hoạt động..."
          style={{
            width: '100%', padding: '8px 12px 8px 36px', borderRadius: 20, border: '1px solid #ccc',
            outline: 'none', fontSize: 15, background: '#f0f0f0'
          }}
        />
        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-search" style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: '#888' }}><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/></svg>
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
        <button onClick={onToggleTheme} style={{
          background: 'none', border: 'none', color: '#333', fontSize: 20, cursor: 'pointer'
        }}>🌙</button>
        <div style={{
          display: 'flex', alignItems: 'center', gap: 8
        }}>
          <img src={user.avatar || '/avatar.png'} alt="avatar" style={{ width: 32, height: 32, borderRadius: '50%', border: '1px solid #ccc' }} />
          <div>
            <div style={{ fontWeight: 600, fontSize: 14 }}>{user.name}</div>
            <div style={{ fontSize: 11, color: '#555' }}>Ban tổ chức</div>
          </div>
        </div>
      </div>
    </header>
  );
} 