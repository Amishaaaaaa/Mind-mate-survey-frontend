import { useState, useEffect } from 'react';
import Header from './Header';
import './Header.css';
import './ReadingComprehensionTest.css';
import CardNavigator from './CardNavigator';
import { Card, CardContent, Typography, Button, Box, CircularProgress } from '@mui/material';
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
  
  // New loading states for different operations
  const [initialLoading, setInitialLoading] = useState(true);
  const [modelLoading, setModelLoading] = useState(false);
  const [subjectLoading, setSubjectLoading] = useState({
    english: false,
    history: false,
    information_technology: false
  });

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
        setError("Failed to load user data. Please try again.");
      }
    };

    const fetchSubjectChosen = async (username) => {
      try {
        const res = await axios.get(`${BASE_URL}/get-passage-data/${username}`);
        if (res.data.status === "success") {
          const passageData = res.data.passage_data;
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
    };

    const loadInitialData = async () => {
      if (username) {
        setInitialLoading(true);
        try {
          await Promise.all([
            fetchSurveyStatus(),
            fetchUserData(username),
            fetchSubjectChosen(username)
          ]);
        } catch (err) {
          setError("Failed to load initial data. Please refresh the page.");
        } finally {
          setInitialLoading(false);
        }
      }
    };

    loadInitialData();
  }, [username]);

  useEffect(() => {
    const callmodel = async () => {
      setModelLoading(true);
      try {
        await axios.get(`${BASE_URL}/analyze-scores/${username}`);
        console.log("Model response added successfully.");
      } catch (err) {
        console.error("Model call failed:", err);
      } finally {
        setModelLoading(false);
      }
    };

    if (
      stroopCompleted &&
      comprehensionCompleted &&
      userData &&
      (!userData.model_response || userData.model_response === "NA")
    ) {
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

  const handleSubjectNavigation = (subject) => {
    setSubjectLoading(prev => ({ ...prev, [subject]: true }));
    // Add small delay to show loading state
    setTimeout(() => {
      navigate(`/content/${subject}`);
      setSubjectLoading(prev => ({ ...prev, [subject]: false }));
    }, 500);
  };

  // Show loading screen during initial data fetch
  if (initialLoading) {
    return (
      <div style={{ minHeight: '100vh', background: '#f5f7fa' }}>
        <Header isLoggedIn={isLoggedIn} onLogout={onLogout} />
        <main className="reading-content" style={{ 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'center', 
          marginTop: '70px',
          height: 'calc(100vh - 70px)'
        }}>
          <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2 }}>
            <CircularProgress size={50} sx={{ color: '#4a90e2' }} />
            <Typography variant="h6" sx={{ color: '#2c3e50' }}>
              Loading dashboard...
            </Typography>
          </Box>
        </main>
      </div>
    );
  }

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
          {stroopCompleted && comprehensionCompleted ? (
            <>
              {/* Model loading indicator */}
              {modelLoading && (
                <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', mb: 3 }}>
                  <CircularProgress size={30} sx={{ color: '#4a90e2', mb: 1 }} />
                  {/* <Typography variant="body2" sx={{ color: '#666' }}>
                    Analyzing your test scores...
                  </Typography> */}
                </Box>
              )}

              <Typography variant="h5" sx={{ mb: 2, color: '#2c3e50' }}>
                <h3>Choose Content to Read</h3> 
                <ul className="reading-list">
                  <li>Subject can only be chosen once!</li>
                    <li>
                      You will be shown <strong>3 passages</strong> based on the subject you chose. Read them carefully.
                      </li>
                    <li>
                      After reading each passage, click <strong>"Take Test"</strong> to begin answering questions related to that particular content. There will be <strong>5 questions</strong> for you to answer, all related to the passage.
                    </li>
                    <li>
                      Once you click on "Take Test" after reading the passage, you <strong>cannot</strong> go back to reading that passage again.
                    </li>
                    <li>
                      After submitting a particular Test, you <strong>can take a break if needed, but not when you are taking tests.</strong>
                    </li>
                    <center>
                      <b>All the best!</b>
                    </center>
                  </ul>
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
                    minHeight: 48,
                    padding: 2,
                    backgroundColor: '#4a90e2',
                    color: '#fff',
                    '&:hover': { backgroundColor: '#357ABD' },
                    '&:disabled': { backgroundColor: '#ccc' },
                    position: 'relative'
                  }}
                  onClick={() => handleSubjectNavigation('english')}
                  disabled={(subjectChosen && subjectChosen !== 'english') || subjectLoading.english}
                >
                  {subjectLoading.english ? (
                    <CircularProgress size={20} sx={{ color: '#fff' }} />
                  ) : (
                    'English'
                  )}
                </Button>

                <Button
                  variant="contained"
                  sx={{
                    minWidth: 180,
                    minHeight: 48,
                    padding: 2,
                    backgroundColor: '#a259ff',
                    color: '#fff',
                    '&:hover': { backgroundColor: '#8e44ec' },
                    '&:disabled': { backgroundColor: '#ccc' },
                    position: 'relative'
                  }}
                  onClick={() => handleSubjectNavigation('history')}
                  disabled={(subjectChosen && subjectChosen !== 'history') || subjectLoading.history}
                >
                  {subjectLoading.history ? (
                    <CircularProgress size={20} sx={{ color: '#fff' }} />
                  ) : (
                    'History'
                  )}
                </Button>

                <Button
                  variant="contained"
                  sx={{
                    minWidth: 180,
                    minHeight: 48,
                    padding: 2,
                    backgroundColor: '#28a745',
                    color: '#fff',
                    '&:hover': { backgroundColor: '#218838' },
                    '&:disabled': { backgroundColor: '#ccc' },
                    position: 'relative'
                  }}
                  onClick={() => handleSubjectNavigation('information_technology')}
                  disabled={(subjectChosen && subjectChosen !== 'information_technology') || subjectLoading.information_technology}
                >
                  {subjectLoading.information_technology ? (
                    <CircularProgress size={20} sx={{ color: '#fff' }} />
                  ) : (
                    'Information Technology'
                  )}
                </Button>
              </Box>

              {loading && (
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mt: 2 }}>
                  <CircularProgress size={20} sx={{ color: '#4a90e2' }} />
                  <Typography variant="body2">Loading...</Typography>
                </Box>
              )}
              
              {error && (
                <Box sx={{ 
                  color: '#e74c3c', 
                  mt: 2, 
                  p: 2, 
                  backgroundColor: '#ffebee', 
                  borderRadius: 1,
                  border: '1px solid #ffcdd2'
                }}>
                  {error}
                </Box>
              )}
              
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
                      minHeight: 48
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
                      minHeight: 48
                    }}
                    onClick={() => navigate('/comprehension')}
                  >
                    Take Reading Comprehension Test
                  </Button>
                )}
              </Box>
              {error && (
                <Box sx={{ 
                  color: '#e74c3c', 
                  mt: 2, 
                  p: 2, 
                  backgroundColor: '#ffebee', 
                  borderRadius: 1,
                  border: '1px solid #ffcdd2'
                }}>
                  {error}
                </Box>
              )}
            </>
          )}
        </div>
      </main>
    </div>
  );
}

export default Dashboard;