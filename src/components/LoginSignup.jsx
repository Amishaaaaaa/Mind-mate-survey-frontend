import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
// import { GoogleLogin } from '@react-oauth/google';
import { jwtDecode } from 'jwt-decode';
import Header from './Header';
import './Header.css';
import './ReadingComprehensionTest.css';
import BASE_URL from '../config';

function LoginSignup({ setIsLoggedIn }) {
  const [isLogin, setIsLogin] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    age: '',
    gender: '',
    grade: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
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
    setLoading(true);

    try {
      const endpoint = isLogin ? '/login' : '/signup';

      const dataToSend = isLogin
        ? {
            email: formData.email,
            password: formData.password
          }
        : {
            email: formData.email,
            password: formData.password,
            confirm_password: formData.confirmPassword,
            age: parseInt(formData.age, 10),
            gender: formData.gender,
            grade: formData.grade
          };

      const response = await fetch(`${BASE_URL}${endpoint}`, {
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
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="reading-container">
      <Header />
      <main className="reading-content" style={{ alignItems: 'center', justifyContent: 'center' }}>
        <div className="reading-card" style={{ maxWidth: 350, width: '100%', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: 18, border: '2px solid blue', borderRadius: 10, padding: 20}}>
          {isLogin ? (
            <>
              <h1>Login</h1>
              <form onSubmit={handleSubmit} style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: 18 }}>
                <input type="email" name="email" value={formData.email} onChange={handleChange} placeholder="Email" required style={{ padding: 12, borderRadius: 8, border: '1px solid #ccc', fontSize: 18 }} />
                <input type="password" name="password" value={formData.password} onChange={handleChange} placeholder="Password" required style={{ padding: 12, borderRadius: 8, border: '1px solid #ccc', fontSize: 18 }} />
                {error && <p style={{ color: 'red', margin: 0 }}>{error}</p>}
                <button className="start-button get-started-button" type="submit" disabled={loading}>
                  {loading ? "Loading..." : "Login"}
                </button>
              </form>

              {/* <div style={{ marginTop: 12 }}>
                <GoogleLogin onSuccess={handleGoogleSuccess} onError={handleGoogleFailure} />
              </div> */}

              <p style={{ marginTop: 18, fontSize: 16 }}>
                Don't have an account?{' '}
                <span className='get-started-button' onClick={() => setIsLogin(false)}>
                  Sign up
                </span>
              </p>
            </>
          ) : (
            <>
              <h1>Sign Up</h1>
              <form onSubmit={handleSubmit} style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: 18 }}>
                <input type="email" name="email" value={formData.email} onChange={handleChange} placeholder="Anonymous Email" required style={{ padding: 12, borderRadius: 8, border: '1px solid #ccc', fontSize: 18 }} />
                <small style={{ color: '#555', fontSize: 14, marginTop: -10, textAlign: 'left',}}>
                ⚠️ Do not use your actual email. Please enter an anonymous one (e.g., user123@gmail.com, xyz23@gmail.com).
              </small>
                <input type="password" name="password" value={formData.password} onChange={handleChange} placeholder="Password" required style={{ padding: 12, borderRadius: 8, border: '1px solid #ccc', fontSize: 18 }} />
                <input type="password" name="confirmPassword" value={formData.confirmPassword} onChange={handleChange} placeholder="Confirm Password" required style={{ padding: 12, borderRadius: 8, border: '1px solid #ccc', fontSize: 18 }} />
                <input type="number" name="age" value={formData.age} onChange={handleChange} placeholder="Age" required min="1" style={{ padding: 12, borderRadius: 8, border: '1px solid #ccc', fontSize: 18 }} />
                <select name="gender" value={formData.gender} onChange={handleChange} required style={{ padding: 12, borderRadius: 8, border: '1px solid #ccc', fontSize: 18 }}>
                  <option value="">Select Gender</option>
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                  <option value="Other">Other</option>
                </select>
                <select name="grade" value={formData.grade} onChange={handleChange} required style={{ padding: 12, borderRadius: 8, border: '1px solid #ccc', fontSize: 18 }}>
                  <option value="">Select Grade</option>
                  <option value="UG1">UG1</option>
                  <option value="UG2">UG2</option>
                  <option value="UG3">UG3</option>
                  <option value="UG4">UG4</option>
                </select>
                {error && <p style={{ color: 'red', margin: 0 }}>{error}</p>}
                <button className="start-button get-started-button" type="submit" disabled={loading}>
                  {loading ? "Loading..." : "Sign Up"}
                </button>
              </form>
              <p style={{ marginTop: 18, fontSize: 16 }}>
                Already have an account?{' '}
                <span className='get-started-button' onClick={() => setIsLogin(true)}>
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
