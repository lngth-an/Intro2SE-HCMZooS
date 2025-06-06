import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import OrganizerHome from './pages/OrganizerHome';
import OrganizerManageActivity from './pages/OganizerManageActivity';
//import ActivityManager from './components/pages/ActivityManager';
import ActivityDetail from './components/pages/ActivityDetail';
import './App.css';
import StudentHome from './pages/StudentHome';
import { ActivityRegister } from './components/pages';
import StudentScore from './components/pages/StudentScore';
import StudentActivities from './components/pages/StudentActivities';
import OrganizerComplaints from './pages/OrganizerComplaints';
import Profile from './pages/Profile';

function App() {
  return (
    <Routes>
      <Route path="/student/home" element={<StudentHome />} />
      <Route path="/organizer/home" element={<OrganizerHome />} />
      <Route path="/organizer/activities" element={<OrganizerManageActivity />} />
      <Route path="/organizer/activities/:activityId" element={<ActivityDetail />} />
      <Route path="/organizer/complaints" element={<OrganizerComplaints />} />
      <Route path="/student/register" element={<ActivityRegister />} />
      <Route path="/student/score" element={<StudentScore />} />
      <Route path="/student/activities" element={<StudentActivities />} />
      <Route path="/student/profile" element={<Profile />} />
      <Route path="/organizer/profile" element={<Profile />} />
    </Routes>
  );
}

export default App;
