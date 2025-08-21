import Header from './Header';
import './Header.css';
import './ReadingComprehensionTest.css';

function About({ isLoggedIn, onLogout }) {
  return (
    <div className="reading-container">
      <Header isLoggedIn={isLoggedIn} onLogout={onLogout} />
      <main className="reading-content" style={{ marginTop: '70px'}}>
        <div className="reading-card">
          <h1>About MindMate</h1>
          <p style={{ fontSize: 22, lineHeight: 1.7, marginTop: 32 }}>
            MindMate
          </p>
        </div>
      </main>
    </div>
  );
}

export default About; 

// MindMate is a cognitive assessment platform designed to help you evaluate your attention, memory, and vocabulary skills. Our tests are based on established psychological paradigms and are easy to use for all ages.<br /><br />
//             Use the navigation above to try out the Stroop Test, Reading Comprehension, or learn more about how MindMate can help you!