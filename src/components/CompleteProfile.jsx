import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

function CompleteProfile() {
  const [formData, setFormData] = useState({
    age: '',
    gender: '',
    grade: ''
  });
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const email = localStorage.getItem('email');
    const username = localStorage.getItem('username');

    try {
      const response = await fetch('http://localhost:8000/update-profile', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email,
          age: parseInt(formData.age, 10),
          gender: formData.gender,
          grade: formData.grade
        })
      });

      if (!response.ok) {
        const data = await response.json();
        setError(data.detail || 'Failed to update profile');
        return;
      }

      navigate(`/dashboard/${username}`);
    } catch (err) {
      setError(err.message || 'Something went wrong');
    }
  };

  return (
    <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'linear-gradient(to right, #e0eafc, #cfdef3)',
      }}>
      <main className="reading-content">
        <div className="reading-card"  
        style={{
        maxWidth: '360px',
        width: '100%',
        backgroundColor: '#ffe',
        padding: '2.5rem 2rem',
        borderRadius: '12px',
        boxShadow: '0 8px 20px rgba(0, 0, 0, 0.1)',
        marginTop: '-400px'
        }}
        >
          <h1 style={{ fontSize: '1.5rem', fontWeight: '600', marginBottom: '1.5rem', textAlign: 'center' }}>Complete Your Profile</h1>
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            
            <input type="number" name="age" value={formData.age} onChange={handleChange} placeholder="Age" required 
            style={{
                padding: '0.6rem',
                fontSize: '1rem',
                borderRadius: '8px',
                border: '1px solid #ccc',
              }}/>
            <select name="gender" value={formData.gender} onChange={handleChange} required
            style={{
                padding: '0.6rem',
                fontSize: '1rem',
                borderRadius: '8px',
                border: '1px solid #ccc',
              }}>
              <option value="">Select Gender</option>
              <option value="Male">Male</option>
              <option value="Female">Female</option>
              <option value="Other">Other</option>
            </select>
            <select name="grade" value={formData.grade} onChange={handleChange} required
            style={{
                padding: '0.6rem',
                fontSize: '1rem',
                borderRadius: '8px',
                border: '1px solid #ccc'
              }}>
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
            {error && <p style={{ color: 'red' }}>{error}</p>}
            <button className="start-button" type="submit"
            style={{
                backgroundColor: '#28a745',
                color: '#fff',
                border: 'none',
                padding: '0.7rem',
                borderRadius: '8px',
                fontWeight: 'bold',
                cursor: 'pointer',
              }}>Submit</button>
          </form>
        </div>
        </main>
      </div>
  );
}

export default CompleteProfile;
