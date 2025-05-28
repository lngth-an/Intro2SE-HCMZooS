import React from 'react';

export default function Footer() {
  return (
    <footer style={{
      background: '#1976d2', color: '#fff', display: 'flex', justifyContent: 'space-between',
      padding: '32px 48px', marginTop: 40
    }}>
      <div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <img src="/logo192.png" alt="logo" style={{ width: 32, height: 32 }} />
          <span style={{ fontWeight: 700, fontSize: 20 }}>ActiHub</span>
        </div>
        <div style={{ marginTop: 8, fontSize: 14, color: '#e3f2fd' }}>
          Nền tảng quản lý và đăng ký hoạt động sinh viên hiện đại, tiện lợi.
        </div>
      </div>
      <div>
        <div style={{ fontWeight: 600, fontSize: 16 }}>Thông tin</div>
        <div style={{ marginTop: 8 }}>
          <a href="https://hcmus.edu.vn" style={{ color: '#fff', textDecoration: 'underline', display: 'block' }}>Website trường</a>
          <a href="https://portal.hcmus.edu.vn" style={{ color: '#fff', textDecoration: 'underline', display: 'block' }}>Portal</a>
        </div>
      </div>
      <div>
        <div style={{ fontWeight: 600, fontSize: 16 }}>Địa chỉ</div>
        <div style={{ marginTop: 8, fontSize: 14 }}>
          Cơ sở 1: 227 Nguyễn Văn Cừ, Q.5, TP.HCM<br />
          Cơ sở 2: Khu phố 6, Linh Trung, Thủ Đức, TP.HCM
        </div>
      </div>
    </footer>
  );
} 