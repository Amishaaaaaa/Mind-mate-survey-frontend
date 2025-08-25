import { useState, useEffect } from 'react';
import Header from './Header';
import './Header.css';
import './ReadingComprehensionTest.css';
import CardNavigator from './CardNavigator';
import { Card, CardContent, Typography, Button, Box } from '@mui/material';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import BASE_URL from '../config';

function Dashboard({ isLoggedIn, onLogout }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [segments, setSegments] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [level, setLevel] = useState('');
  const { username } = useParams();
  const navigate = useNavigate();

  const [userData, setUserData] = useState(null);
  const [stroopCompleted, setStroopCompleted] = useState(false);
  const [comprehensionCompleted, setComprehensionCompleted] = useState(false);
  const [surveyCompleted, setSurveyCompleted] = useState(false);
  const [subjectChosen, setSubjectChosen] = useState(null);

  useEffect(() => {
    const fetchUserData = async (username) => {
      try {
        const res = await axios.get(`${BASE_URL}/get-user-data/${username}`);
        const fetched = res.data.user_data;
        setUserData(fetched);

        localStorage.setItem('username', fetched.username);

        const stroop = fetched.stroop_score_correct_items &&
          (fetched.stroop_score_correct_items.color > 0 ||
            fetched.stroop_score_correct_items.word > 0 ||
            fetched.stroop_score_correct_items.color_word > 0);

        const comprehension = fetched.comprehension_test &&
          fetched.comprehension_test.num_questions > 0;

        setStroopCompleted(stroop);
        setComprehensionCompleted(comprehension);
      } catch (err) {
        console.error("Error fetching user data:", err);
      }
    };

    const fetchSubjectChosen = async (username) => {
      try {
        const res = await axios.get(`${BASE_URL}/get-passage-data/${username}`);
        if (res.data.status === "success") {
          const passageData = res.data.passage_data;
          console.log("Passage data:", passageData);
          setSubjectChosen(passageData.subject_chosen);
        }
      } catch (err) {
        console.error("Error fetching passage data:", err);
      }
    };

    async function fetchSurveyStatus() {
      try {
        const res = await axios.get(`${BASE_URL}/survey-completed/${username}`);
        setSurveyCompleted(!!(res.data && res.data.completed));
      } catch (err) {
        setSurveyCompleted(false);
      }
    }

    if (username) {
      fetchSurveyStatus();
      fetchUserData(username);
      fetchSubjectChosen(username); 
    }
  }, [username]);


useEffect(() => {
  const callmodel = async () => {
    try {
      await axios.get(`${BASE_URL}/analyze-scores/${username}`);
      console.log("Model response added successfully.");
    } catch (err) {
      console.error("Model call failed:", err);
    }
  };

  if (
    stroopCompleted &&
    comprehensionCompleted &&
    userData &&
    (!userData.model_response || userData.model_response === "NA")
  )
   {
    callmodel();
  }
}, [stroopCompleted, comprehensionCompleted, userData, username]);

  const handleNext = () => {
    if (currentIndex < segments.length - 1) {
      setCurrentIndex(currentIndex + 1);
    }
  };

  const handlePrevious = () => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
    }
  };


  if (surveyCompleted) {
    return (
      <div style={{ minHeight: '100vh', background: '#f5f7fa' }}>
        <Header isLoggedIn={isLoggedIn} onLogout={onLogout} />
        <main className="reading-content" style={{ alignItems: 'center', justifyContent: 'center', marginTop: '70px' }}>
          <div className="reading-card"
            style={{
              maxWidth: 1000,
              width: '100%',
              margin: '0 auto',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              background: '#ffffff',
              padding: '32px',
              borderRadius: '12px',
              boxShadow: '0 4px 16px rgba(0,0,0,0.05)',
            }}
          >
            <Typography variant="h4" sx={{ color: '#2c3e50', marginTop: 4 }}>
              Survey Completed! Thank you!
            </Typography>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div style={{ minHeight: '100vh', background: '#f5f7fa' }}>
      <Header isLoggedIn={isLoggedIn} onLogout={onLogout} />
      <main className="reading-content" style={{ alignItems: 'center', justifyContent: 'center', marginTop: '70px' }}>
        <div
          className="reading-card"
          style={{
            maxWidth: 1000,
            width: '100%',
            margin: '0 auto',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            background: '#ffffff',
            padding: '32px',
            borderRadius: '12px',
            boxShadow: '0 4px 16px rgba(0,0,0,0.05)',
          }}
        >
          {/* {userData && (
            <Typography variant="h6" sx={{ alignSelf: 'flex-start', mb: 2, color: '#2c3e50' }}>
              Welcome {userData.name}
            </Typography>
          )} */}

          {stroopCompleted && comprehensionCompleted ? (
            <>
              <Typography variant="h5" sx={{ mb: 2, color: '#2c3e50' }}>
                <h3>Choose Content to Read:</h3> 
                <p>(Subject can only be chosen once!)</p>
              </Typography>
              <Box
                sx={{
                  display: 'flex',
                  flexDirection: 'row',
                  justifyContent: 'space-evenly',
                  alignItems: 'center',
                  padding: 4,
                  width: '100%',
                  gap: 3,
                  flexWrap: 'wrap',
                }}
              >
                <Button
                  variant="contained"
                  sx={{
                    minWidth: 180,
                    padding: 2,
                    backgroundColor: '#4a90e2',
                    color: '#fff',
                    '&:hover': { backgroundColor: '#357ABD' },
                  }}
                  onClick={() => navigate('/content/english')}
                  disabled={subjectChosen && subjectChosen !== 'english'} // ✅ disable if another chosen
                >
                  English
                </Button>

                <Button
                  variant="contained"
                  sx={{
                    minWidth: 180,
                    padding: 2,
                    backgroundColor: '#a259ff',
                    color: '#fff',
                    '&:hover': { backgroundColor: '#8e44ec' },
                  }}
                  onClick={() => navigate('/content/history')}
                  disabled={subjectChosen && subjectChosen !== 'history'} // ✅
                >
                  History
                </Button>

                <Button
                  variant="contained"
                  sx={{
                    minWidth: 180,
                    padding: 2,
                    backgroundColor: '#28a745',
                    color: '#fff',
                    '&:hover': { backgroundColor: '#218838' },
                  }}
                  onClick={() => navigate('/content/computer')}
                  disabled={subjectChosen && subjectChosen !== 'computer'} // ✅
                >
                  Computer
                </Button>

              </Box>

              {loading && <div style={{ marginTop: 18 }}>Loading...</div>}
              {error && <div style={{ color: '#e74c3c', marginTop: 18 }}>{error}</div>}
              {segments.length > 0 && (
                <>
                  <Typography variant="h5" sx={{ mt: 4, color: '#2c3e50' }}>
                    Model's Response ({level.charAt(0).toUpperCase() + level.slice(1)})
                  </Typography>
                  <Card sx={{ mt: 2, width: '100%', maxWidth: 600 }}>
                    <CardContent>
                      <Typography variant="body1" style={{ whiteSpace: 'pre-line' }}>
                        {segments[currentIndex]}
                      </Typography>
                    </CardContent>
                  </Card>
                  <CardNavigator
                    currentIndex={currentIndex}
                    total={segments.length}
                    onPrevious={handlePrevious}
                    onNext={handleNext}
                  />
                </>
              )}
            </>
          ) : (
            <>
              <Typography variant="h5" sx={{ mb: 3, color: '#2c3e50' }}>
                Please complete the required tests to proceed
              </Typography>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                {!stroopCompleted && (
                  <Button
                    variant="contained"
                    sx={{
                      backgroundColor: '#4a90e2',
                      color: '#fff',
                      '&:hover': { backgroundColor: '#357ABD' },
                    }}
                    onClick={() => navigate('/stroop')}
                  >
                    Take Stroop Test
                  </Button>
                )}
                {!comprehensionCompleted && (
                  <Button
                    variant="contained"
                    sx={{
                      backgroundColor: '#a259ff',
                      color: '#fff',
                      '&:hover': { backgroundColor: '#8e44ec' },
                    }}
                    onClick={() => navigate('/comprehension')}
                  >
                    Take Reading Comprehension Test
                  </Button>
                )}
              </Box>
              {error && <div style={{ color: '#e74c3c', marginTop: 18 }}>{error}</div>}
            </>
          )}
        </div>
      </main>
    </div>
  );
}

export default Dashboard;