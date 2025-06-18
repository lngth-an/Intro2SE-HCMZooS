import React from 'react';
import { useAuth } from '../contexts/AuthContext';
import Header from '../components/common/Header';
import SidebarOrganizer from '../components/common/SidebarOrganizer';
import Footer from '../components/common/Footer';
import OrganizerComplaintsContent from '../components/pages/OrganizerComplaints';

export default function OrganizerComplaints() {
  const { user, logout } = useAuth();

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Header user={user} onLogout={logout} />
      <SidebarOrganizer onLogout={logout} />
      
      <div className="ml-64 pt-16 flex-1">
        <div className="p-6">
          <OrganizerComplaintsContent />
        </div>
      </div>
      
      <div className="ml-64">
        <Footer />
      </div>
    </div>
  );
} 