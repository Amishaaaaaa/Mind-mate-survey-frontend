import './App.css'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { useState, useEffect } from 'react'
import LandingPage from './components/LandingPage'
import StroopTest from './components/StroopTest'
import ReadingComprehensionTest from './components/ReadingComprehensionTest'
import About from './components/About'
import LoginSignup from './components/LoginSignup'
import Dashboard from './components/Dashboard'
import Content from './components/Content'
import SelfAssess from './components/SelfAssess'
import CompleteProfile from './components/CompleteProfile'
import BASE_URL from './config'

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    const email = localStorage.getItem('email');
    setIsLoggedIn(!!email);

    const wakeBackend = async () => {
      try {
        const res = await fetch(`${BASE_URL}/ping`);
        if (res.ok) {
          const data = await res.json();
          console.log("Backend awake:", data);
        } else {
          console.warn("Backend ping failed:", res.status);
        }
      } catch (err) {
        console.error("Backend not reachable yet:", err);
      }
    };

    wakeBackend();
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('email');
    setIsLoggedIn(false);
  };

  return (
    <Router>
      <div className="app">
        <Routes>
          <Route path="/" element={<LandingPage isLoggedIn={isLoggedIn} onLogout={handleLogout} />} />
          <Route path="/stroop" element={<StroopTest isLoggedIn={isLoggedIn} onLogout={handleLogout} />} />
          <Route path="/comprehension" element={<ReadingComprehensionTest isLoggedIn={isLoggedIn} onLogout={handleLogout} />} />
          <Route path="/about" element={<About isLoggedIn={isLoggedIn} onLogout={handleLogout} />} />
          <Route path="/login" element={<LoginSignup setIsLoggedIn={setIsLoggedIn} />} />
          <Route path="/dashboard/:username" element={<Dashboard isLoggedIn={isLoggedIn} onLogout={handleLogout} />} />
          <Route path="/content/english" element={<Content isLoggedIn={isLoggedIn} onLogout={handleLogout} />} />
          <Route path="/content/history" element={<Content isLoggedIn={isLoggedIn} onLogout={handleLogout} />} />
          <Route path="/content/information_technology" element={<Content isLoggedIn={isLoggedIn} onLogout={handleLogout} />} />
          <Route path="/self-assess/:subject" element={<SelfAssess isLoggedIn={isLoggedIn} onLogout={handleLogout} />} />
          <Route path="/complete-profile" element={<CompleteProfile isLoggedIn={isLoggedIn} onLogout={handleLogout} />} />
        </Routes>
      </div>
    </Router>
  )
}

export default App
