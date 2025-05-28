import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import OrganizerHome from './pages/OrganizerHome';
import ActivityManager from './components/pages/ActivityManager';
import ActivityDetail from './components/pages/ActivityDetail';
import './App.css';
import StudentHome from './pages/StudentHome';

function App() {
  return (
    <Routes>
      <Route path="/student" element={<StudentHome />} />
      <Route path="/organizer" element={<OrganizerHome />} />
      <Route path="/organizer/activities" element={<ActivityManager />} />
      <Route path="/organizer/activities/:activityId" element={<ActivityDetail />} />
    </Routes>
  );
}

export default App;
