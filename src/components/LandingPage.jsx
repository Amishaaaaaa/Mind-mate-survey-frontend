import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from './Header';
import './LandingPage.css';

function LandingPage({ isLoggedIn, onLogout }) {
  const navigate = useNavigate();
  const [consentGiven, setConsentGiven] = useState(false);

  const handleGetStarted = () => {
    const storedUsername = localStorage.getItem('username');
    if (isLoggedIn && storedUsername) {
      navigate(`/dashboard/${storedUsername}`);
    } else {
      navigate('/login');
    }
  };

  const shouldShowConsent = !isLoggedIn;
  const canProceed = isLoggedIn || consentGiven;

  return (
    <div className="landing-container">
      <Header isLoggedIn={isLoggedIn} onLogout={onLogout} />
      <main className="landing-content">
        <h1 className="landing-title">Welcome to MindMate-Study</h1>
        <p className="landing-description">
          Try taking this study at a quiet place on your laptop.
          Time for the Study: 30 minutes (Approx.)
        </p>

        {/* Only show consent form for non-logged-in users */}
        {shouldShowConsent && (
          <div className="consent-container">
            <label>
              <input
                type="checkbox"
                className="consent-checkbox"
                checked={consentGiven}
                onChange={(e) => setConsentGiven(e.target.checked)}
              />
              <span> I agree to participate in the Mindmate Study</span>
            </label>
          </div>
        )}

        {/* Show different messages based on login status */}
        {isLoggedIn && (
          <p className="welcome-back-message" style={{ 
            color: '#28a745', 
            fontWeight: '500', 
            marginTop: '1rem',
            fontSize: '1.1rem'
          }}>
            Welcome back! Continue with your study sessions.
          </p>
        )}

        <button
          className={`get-started-button ${!canProceed ? 'disabled' : ''}`}
          onClick={handleGetStarted}
          disabled={!canProceed}
        >
          {isLoggedIn ? 'Continue to Dashboard' : 'Get Started'}
        </button>
      </main>
    </div>
  );
}

export default LandingPage;
