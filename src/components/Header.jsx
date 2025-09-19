// import { useNavigate, useLocation  } from 'react-router-dom';
// import './Header.css';

// function Header({ isLoggedIn, onLogout }) {
//   const navigate = useNavigate();
//   const location = useLocation();

//   const handleLogoutClick = () => {
//     if (onLogout) {
//       onLogout();
//     }
//     navigate('/login');
//   };

//   const handleLogoClick = () => {
//     if (isLoggedIn) {
//       const username = localStorage.getItem('username');
//       if (username) {
//         navigate(`/dashboard/${username}`);
//       } else {
//         navigate('/login'); 
//       }
//     } else {
//       navigate('/');
//     }
//   };

//   const showNav = location.pathname !== '/login';

//   return (
//     <header className="main-header">
//       <div className="header-left" style={{ cursor: 'pointer' }} onClick={handleLogoClick}>MindMate</div>
//       {showNav && (
//         <nav className="header-nav">
//         {/* <button className="header-link" onClick={() => navigate('/about')}>About</button> */}
//         {isLoggedIn ? (
//           <button className="header-link" onClick={handleLogoutClick}>Logout</button>
//         ) : (
//           <button className="header-link" onClick={() => navigate('/login')}>Login/Signup</button>
//         )}
//       </nav>
//       )}
//     </header>
//   );
// }

// export default Header; 

import { useNavigate, useLocation  } from 'react-router-dom';
import './Header.css';

function Header({ isLoggedIn, onLogout }) {
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogoutClick = () => {
    if (onLogout) {
      onLogout();
    }
    navigate('/login');
  };

  const handleLogoClick = () => {
    if (isLoggedIn) {
      const username = localStorage.getItem('username');
      if (username) {
        navigate(`/dashboard/${username}`);
      } else {
        navigate('/login'); 
      }
    } else {
      navigate('/');
    }
  };

  // Hide nav on login page AND landing page
  const showNav = location.pathname !== '/login' && location.pathname !== '/';

  return (
    <header className="main-header">
      <div className="header-left" style={{ cursor: 'pointer' }} onClick={handleLogoClick}>MindMate</div>
      {showNav && (
        <nav className="header-nav">
        {/* <button className="header-link" onClick={() => navigate('/about')}>About</button> */}
        {isLoggedIn ? (
          <button className="header-link" onClick={handleLogoutClick}>Logout</button>
        ) : (
          <button className="header-link" onClick={() => navigate('/login')}>Login/Signup</button>
        )}
      </nav>
      )}
    </header>
  );
}

export default Header;