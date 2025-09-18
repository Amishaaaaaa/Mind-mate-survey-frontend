// import { useState } from 'react';
// import { useNavigate } from 'react-router-dom';
// import Header from './Header';
// import './LandingPage.css';

// function LandingPage({ isLoggedIn, onLogout }) {
//   const navigate = useNavigate();
//   const [consentGiven, setConsentGiven] = useState(false);

//   const handleGetStarted = () => {
//     const storedUsername = localStorage.getItem('username');
//     if (isLoggedIn && storedUsername) {
//       navigate(`/dashboard/${storedUsername}`);
//     } else {
//       navigate('/login');
//     }
//   };

//   return (
//     <div className="landing-container">
//       <Header isLoggedIn={isLoggedIn} onLogout={onLogout} />
//       <main className="landing-content">
//         <h1 className="landing-title">Welcome to MindMate-Survey</h1>
//         <p className="landing-description">
//           MindMate helps you assess your attention, memory, and vocabulary skills.
//         </p>

//         <div className="consent-container">
//           <label>
//             <input
//               type="checkbox"
//               checked={consentGiven}
//               onChange={(e) => setConsentGiven(e.target.checked)}
//             />
//             <span> I agree to participate in the Mindmate Study</span>
//           </label>
//         </div>

//         <button className="get-started-button" onClick={handleGetStarted} disabled={!consentGiven}>
//           Get Started
//         </button>
//       </main>
//     </div>
//   );
// }

// export default LandingPage;

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

  return (
    <div className="landing-container">
      <Header isLoggedIn={isLoggedIn} onLogout={onLogout} />
      <main className="landing-content">
        <h1 className="landing-title">Welcome to MindMate-Study</h1>
        <p className="landing-description">
          MindMate helps you assess your attention, memory, and vocabulary skills.
        </p>

        {/* Consent form */}
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

        <button
          className={`get-started-button ${!consentGiven ? 'disabled' : ''}`}
          onClick={handleGetStarted}
          disabled={!consentGiven}
        >
          Get Started
        </button>
      </main>
    </div>
  );
}

export default LandingPage;

