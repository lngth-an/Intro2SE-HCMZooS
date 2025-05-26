import logo from './logo.svg';
import './App.css';
import { Routes, Route } from 'react-router-dom';
import HomePlace from './components/Home';

function App() {
  return (
    <Routes>
      <Route path="/" element={<HomePlace />} />
    </Routes>
  );
}

export default App;
