import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import OrganizerHome from './pages/OrganizerHome';
import ActivityManager from './components/pages/ActivityManager';
import ActivityDetail from './components/pages/ActivityDetail';
import OrganizerLayout from './components/layout/OrganizerLayout';
import './App.css';
import StudentHome from './pages/StudentHome';

function App() {
  return (
    <Routes>
      <Route path="/student" element={<StudentHome />} />
      <Route path="/organizer" element={<OrganizerHome />} />
      <Route path="/organizer/activities" element={
        <OrganizerLayout>
          <ActivityManager />
        </OrganizerLayout>
      } />
      <Route path="/organizer/activities/:activityId" element={
        <OrganizerLayout>
          <ActivityDetail />
        </OrganizerLayout>
      } />
    </Routes>
  );
}

export default App;
