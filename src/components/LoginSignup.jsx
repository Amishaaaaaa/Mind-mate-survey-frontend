import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { GoogleLogin } from '@react-oauth/google';
import { jwtDecode } from 'jwt-decode';
import Header from './Header';
import './Header.css';
import './ReadingComprehensionTest.css';

function LoginSignup({ setIsLoggedIn }) {
  const [isLogin, setIsLogin] = useState(true);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    username: '',
    age: '',
    gender: '',
    grade: ''
  });
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    try {
      const endpoint = isLogin ? '/login' : '/signup';

      const dataToSend = isLogin ? {
        email: formData.email,
        password: formData.password
      } : {
        name: formData.name,
        email: formData.email,
        password: formData.password,
        confirm_password: formData.confirmPassword,
        username: formData.username,
        age: parseInt(formData.age, 10),
        gender: formData.gender,
        grade: formData.grade
      };

      const response = await fetch(`http://localhost:8000${endpoint}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(dataToSend)
      });

      const data = await response.json();

      if (!response.ok) {
        const errorDetail = data.detail;
        if (Array.isArray(errorDetail)) {
          setError(errorDetail.map(err => `${err.loc.join(' -> ')}: ${err.msg}`).join(', '));
        } else if (typeof errorDetail === 'string') {
          setError(errorDetail);
        } else {
          setError('Something went wrong');
        }
        throw new Error(data.detail || 'Something went wrong');
      }

      console.log('Success:', data);

      if (!isLogin) {
        setIsLogin(true);
        navigate('/login');
      } else {
        localStorage.setItem('email', formData.email);
        setIsLoggedIn(true);
        navigate(`/dashboard/${data.username}`);
      }

    } catch (err) {
      if (!error) {
        setError(err.message);
      }
    }
  };

  const handleGoogleSuccess = async (credentialResponse) => {
    try {
      const decoded = jwtDecode(credentialResponse.credential);
      const { email, name, sub: googleId } = decoded;

      const response = await fetch('http://localhost:8000/google-login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, name, google_id: googleId })
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.detail || 'Google login failed');
        return;
      }

      localStorage.setItem('email', email);
      localStorage.setItem('username', data.username);

      if (data.is_new_user) {
        navigate('/complete-profile'); 
      } else {
        setIsLoggedIn(true);
        navigate(`/dashboard/${data.username}`);
      }

    } catch (err) {
      console.error('Google login error:', err);
      setError('Google login failed');
    }
  };

  const handleGoogleFailure = () => {
    setError('Google login failed. Please try again.');
  };

  return (
    <div className="reading-container">
      <Header />
      <main className="reading-content" style={{ alignItems: 'center', justifyContent: 'center' }}>
        <div className="reading-card" style={{ maxWidth: 350, width: '100%', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: 18 }}>
          {isLogin ? (
            <>
              <h1>Login</h1>
              <form onSubmit={handleSubmit} style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: 18 }}>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="Email"
                  required
                  style={{ padding: 12, borderRadius: 8, border: '1px solid #ccc', fontSize: 18 }}
                />
                <input
                  type="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="Password"
                  required
                  style={{ padding: 12, borderRadius: 8, border: '1px solid #ccc', fontSize: 18 }}
                />
                {error && <p style={{ color: 'red', margin: 0 }}>{error}</p>}
                <button className="start-button" type="submit" style={{ fontSize: 18, marginTop: 8 }}>Login</button>
              </form>

              {/* Google Login Button */}
              <div style={{ marginTop: 12 }}>
                <GoogleLogin
                  onSuccess={handleGoogleSuccess}
                  onError={handleGoogleFailure}
                />
              </div>

              <p style={{ marginTop: 18, fontSize: 16 }}>
                Don't have an account?{' '}
                <span style={{ color: '#2980b9', cursor: 'pointer', fontWeight: 600 }} onClick={() => setIsLogin(false)}>
                  Sign up
                </span>
              </p>
            </>
          ) : (
            <>
              <h1>Sign Up</h1>
              <form onSubmit={handleSubmit} style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: 18 }}>
                <input type="text" name="name" value={formData.name} onChange={handleChange} placeholder="Name" required style={{ padding: 12, borderRadius: 8, border: '1px solid #ccc', fontSize: 18 }} />
                <input type="email" name="email" value={formData.email} onChange={handleChange} placeholder="Email" required style={{ padding: 12, borderRadius: 8, border: '1px solid #ccc', fontSize: 18 }} />
                <input type="password" name="password" value={formData.password} onChange={handleChange} placeholder="Password" required style={{ padding: 12, borderRadius: 8, border: '1px solid #ccc', fontSize: 18 }} />
                <input type="password" name="confirmPassword" value={formData.confirmPassword} onChange={handleChange} placeholder="Confirm Password" required style={{ padding: 12, borderRadius: 8, border: '1px solid #ccc', fontSize: 18 }} />
                <input type="text" name="username" value={formData.username} onChange={handleChange} placeholder="Username" required style={{ padding: 12, borderRadius: 8, border: '1px solid #ccc', fontSize: 18 }} />
                <input type="number" name="age" value={formData.age} onChange={handleChange} placeholder="Age" required min="1" style={{ padding: 12, borderRadius: 8, border: '1px solid #ccc', fontSize: 18 }} />
                <select name="gender" value={formData.gender} onChange={handleChange} required style={{ padding: 12, borderRadius: 8, border: '1px solid #ccc', fontSize: 18 }}>
                  <option value="">Select Gender</option>
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                  <option value="Other">Other</option>
                </select>
                <select name="grade" value={formData.grade} onChange={handleChange} required style={{ padding: 12, borderRadius: 8, border: '1px solid #ccc', fontSize: 18 }}>
                  <option value="">Select Grade</option>
                  <option value="8th">8th</option>
                  <option value="9th">9th</option>
                  <option value="10th">10th</option>
                  <option value="11th">11th</option>
                  <option value="12th">12th</option>
                  <option value="UG">UG</option>
                  <option value="PG">PG</option>
                  <option value="PhD">PhD</option>
                </select>
                {error && <p style={{ color: 'red', margin: 0 }}>{error}</p>}
                <button className="start-button" type="submit" style={{ fontSize: 18, marginTop: 8 }}>Sign Up</button>
              </form>
              <p style={{ marginTop: 18, fontSize: 16 }}>
                Already have an account?{' '}
                <span style={{ color: '#2980b9', cursor: 'pointer', fontWeight: 600 }} onClick={() => setIsLogin(true)}>
                  Login
                </span>
              </p>
            </>
          )}
        </div>
      </main>
    </div>
  );
}

export default LoginSignup;
