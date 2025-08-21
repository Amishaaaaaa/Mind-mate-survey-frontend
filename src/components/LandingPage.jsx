import { useNavigate } from 'react-router-dom';
import Header from './Header';
import './LandingPage.css';

function LandingPage({ isLoggedIn, onLogout }) {
  const navigate = useNavigate();

  const handleGetStarted = () => {
    const storedUsername = localStorage.getItem('username');
    if (isLoggedIn && storedUsername) {
      navigate(`/dashboard/${storedUsername}`);
    } else {
      navigate('/login');
    }
  };

  return (
    <div className="landing-container">
      <Header isLoggedIn={isLoggedIn} onLogout={onLogout} />
      <main className="landing-content">
        <h1 className="landing-title">Welcome to MindMate-Survey</h1>
        <p className="landing-description">
          MindMate helps you assess your attention, memory, and vocabulary skills.
        </p>
        <button className="get-started-button" onClick={handleGetStarted}>
          Get Started
        </button>
      </main>
    </div>
  );
}

export default LandingPage;
