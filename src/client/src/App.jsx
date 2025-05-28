import React from 'react';
import ActivityManager from './components/ActivityManager';
import ActivityDetail from './components/ActivityDetail';
import './App.css';
import { Routes, Route } from 'react-router-dom';
import HomePlace from './components/Home';

function App() {
  return (
    <Routes>
      <Route path="/" element={<ActivityManager />} />
      <Route path="/activity/:activityId" element={<ActivityDetail />} />
    </Routes>
  );
}

export default App;
