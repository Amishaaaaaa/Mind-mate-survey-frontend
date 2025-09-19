// import { useState, useEffect } from 'react';
// import Header from './Header';
// import { Card, CardContent, Typography, Button, Box, Radio, RadioGroup, FormControlLabel, FormControl, FormLabel } from '@mui/material';
// import { useNavigate, useLocation } from 'react-router-dom';
// import { TailSpin } from "react-loader-spinner";
// import ReactMarkdown from 'react-markdown';
// import BASE_URL from '../config';

// const initialSectionLabels = [
//   { key: 'low', label: 'Low' },
//   { key: 'medium', label: 'Medium' },
//   { key: 'high', label: 'High' }
// ];

// function shuffleArray(array) {
//   const shuffled = [...array];
//   for (let i = shuffled.length - 1; i > 0; i--) {
//     const j = Math.floor(Math.random() * (i + 1));
//     [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
//   }
//   return shuffled;
// }

// function Content({ isLoggedIn, onLogout }) {
//   const [currentSection, setCurrentSection] = useState(0);
//   const [sectionOrder, setSectionOrder] = useState(() => shuffleArray(initialSectionLabels));
//   const [showTest, setShowTest] = useState(false);
//   const [testCompleted, setTestCompleted] = useState([false, false, false]);
//   const [content, setContent] = useState(['', '', '']);
//   const [loadingContent, setLoadingContent] = useState(false);
//   const [questions, setQuestions] = useState([]);
//   const [loadingQuestions, setLoadingQuestions] = useState(false);
//   const [userAnswers, setUserAnswers] = useState([]);
//   const [testResult, setTestResult] = useState('');
//   const [showAnswers, setShowAnswers] = useState(false);
//   const [scores, setScores] = useState([-1, -1, -1]); 
//   const navigate = useNavigate();
//   const username = localStorage.getItem('username');
//   const [validationMessage, setValidationMessage] = useState('');

//   const location = useLocation();
//   const subject = location.pathname.split('/').pop();
//   const [passageStartTime, setPassageStartTime] = useState(null);
//   const [readingTimeTaken, setReadingTimeTaken] = useState(null);
//   const [questionStartTime, setQuestionStartTime] = useState(null);


//   useEffect(() => {
//     let isCancelled = false;
  
//     async function fetchContentAndQuestions() {
//       setLoadingContent(true);
//       setLoadingQuestions(true);
//       setShowTest(false);
//       try {
//         const res = await fetch(`${BASE_URL}/get-passage-and-questions?type=${subject}&level=${sectionOrder[currentSection].key}&username=${username}`);
//         if (!res.ok) throw new Error('Failed to fetch passage and questions');
//         const data = await res.json();
  
//         if (!isCancelled) {
//           if (data.content) {
//             setContent(prev => {
//               const updated = [...prev];
//               updated[currentSection] = data.content;
//               return updated;
//             });
//           }
        
//           if (typeof data.score === 'number' && data.score >= 0) {
//             setScores(prev => {
//               const updated = [...prev];
//               updated[currentSection] = data.score;
//               return updated;
//             });
//             setTestCompleted(prev => {
//               const updated = [...prev];
//               updated[currentSection] = true;
//               return updated;
//             });
//             setShowTest(false);        
//             setQuestions([]);          
//             setUserAnswers([]);   
//           } else if (data.questions) {
//             const arr = Array.isArray(data.questions) ? data.questions : [];
//             setQuestions(arr);
//             setUserAnswers(Array(arr.length).fill(''));
//           }
//         }
        
//       } catch (err) {
//         if (!isCancelled) {
//           setContent(prev => {
//             const updated = [...prev];
//             updated[currentSection] = 'Failed to load content.';
//             return updated;
//           });
//           setQuestions([]);
//           setValidationMessage('Failed to load content and questions. Please try again.');
//         }
//       }
//       if (!isCancelled) {
//         setLoadingContent(false);
//         setLoadingQuestions(false);
//       }
//     }
  
//     fetchContentAndQuestions();
  
//     return () => {
//       isCancelled = true;
//     };
//   }, [currentSection, username]);
  
//   useEffect(() => {
//   if (content[currentSection]) {
//     setPassageStartTime(Date.now());
//   }
// }, [content[currentSection]]);

//   const handleStartTest = () => {
//     if (testCompleted[currentSection]) return;

//     const readingEndTime = Date.now();
//     const readingTime = Math.floor((readingEndTime - passageStartTime) / 1000);
//     setReadingTimeTaken(readingTime);
//     localStorage.setItem(`timeTaken_${sectionOrder[currentSection].key}_level_reading`, readingTime);

//     setQuestionStartTime(Date.now());
//     setShowTest(true);
//     setTestResult('');
//     setShowAnswers(false);
//   };  
  

//   const handleAnswerChange = (qIdx, value) => {
//     setUserAnswers(prev => {
//       const updated = [...prev];
//       updated[qIdx] = value;
//       return updated;
//     });
//   };

//   const handleSubmitTest = async () => {
//     const unanswered = userAnswers.some(ans => ans === '');
//     if (unanswered) {
//       setValidationMessage('Please answer all questions before submitting the test.');
//       return;
//     }
    

//     const questionsendTime = Date.now();
//     const answeringTime = Math.floor((questionsendTime - questionStartTime) / 1000); // in seconds
//     localStorage.setItem(`timeTaken_${sectionOrder[currentSection].key}_level_answering`, answeringTime);
//     setValidationMessage('');
    
//     let correct = 0;
//     questions.forEach((q, idx) => {
//       if (userAnswers[idx] === q.answer) correct++;
//     });
  
//     setScores(prev => {
//       const updated = [...prev];
//       updated[currentSection] = correct;
//       return updated;
//     });

//     try {
//       const res = await fetch(`${BASE_URL}/save-test-score`, {
//         method: 'POST',
//         headers: { 'Content-Type': 'application/json' },
//         body: JSON.stringify({
//           username,
//           level: sectionOrder[currentSection].key,
//           score: correct,
//           total_questions: questions.length,
//           reading_time_taken: readingTimeTaken ? parseInt(readingTimeTaken, 10) : null,
//           questions_time_taken: answeringTime
//         })
//       });
//       if (!res.ok) {
//         console.error('Failed to save score:', await res.text());
//         setValidationMessage('Failed to save score. Please try again.');
//         return;
//       }
//     } catch (err) {
//       console.error('Error saving score:', err);
//       setValidationMessage('Error saving score. Please try again.');
//       return;
//     }
  
//     setShowAnswers(true);
//     const updated = [...testCompleted];
//     updated[currentSection] = true;
//     setTestCompleted(updated);
//     setShowTest(false);

//     if (currentSection < 2) {
//       handleNextSection();
//     }
//   };

//   const handleNextSection = () => {
//     setCurrentSection(currentSection + 1);
//     setShowTest(false);
//     setTestResult('');
//     setShowAnswers(false);
//     setQuestions([]);
//     setUserAnswers([]);
//     setValidationMessage('');
//   };

//   return (
//     <div className="no-select" style={{ minHeight: '100vh', background: '#fff' }}>
//       <Header isLoggedIn={isLoggedIn} onLogout={onLogout} />
//       <main className="reading-content" style={{ alignItems: 'center', justifyContent: 'center' }}>
//         <div className="reading-card" style={{ maxWidth: 700, width: '100%', margin: '0 auto', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
//           <Typography variant="h5" sx={{ mb: 2 }} textAlign='center'>
//           {subject.charAt(0).toUpperCase() + subject.slice(1)} Content
//           </Typography>
//           {!showTest && (
//             <>
//               {!loadingContent && (
//                 <Typography sx={{ mt: 1, fontStyle: 'italic', color: 'gray', textAlign: 'center' }}>
//                   Read the passage thoroughly. You won't be allowed to read again while answering questions.
//                 </Typography>
//               )}
//               <Card sx={{ mt: 2, width: '100%', maxWidth: 600, textAlign: 'left' }}>
//                 <CardContent>
//                   {loadingContent ? (
//                     <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: 120 }}>
//                       <TailSpin color="#2980b9" height={40} width={40} />
//                     </div>
//                   ) : (
//                     <>
//                       {(() => {
//                         const rawContent = content[currentSection];
//                         const match = rawContent.match(/^##\s*(.+?)\s*\n/);
//                         const title = match ? match[1] : '';
//                         const body = match ? rawContent.slice(match[0].length) : rawContent;

//                         return (
//                           <>
//                             {title && (
//                               <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 2, textAlign: 'center' }}>
//                                 {title}
//                               </Typography>
//                             )}
//                             <ReactMarkdown
//                               components={{
//                                 h1: ({ node, ...props }) => <Typography variant="h4" gutterBottom {...props} className="no-select" />,
//                                 h2: ({ node, ...props }) => <Typography variant="h5" gutterBottom {...props} className="no-select" />,
//                                 p: ({ node, ...props }) => <Typography variant="body1" paragraph {...props} className="no-select" />,
//                                 strong: ({ node, ...props }) => <strong style={{ fontWeight: 600 }} {...props} className="no-select" />,
//                                 em: ({ node, ...props }) => <em style={{ fontStyle: 'italic' }} {...props} className="no-select" />,
//                               }}
//                             >
//                               {body}
//                             </ReactMarkdown>
//                           </>
//                         );
//                       })()}
//                     </>
//                   )}
//                 </CardContent>
//               </Card>
//               {!showTest && testCompleted[currentSection] && (
//                 <Typography sx={{ mt: 3, color: 'green', textAlign: 'center' }}>
//                   Test completed
//                 </Typography>
//               )}
//               {!testCompleted[currentSection] && !loadingContent && (
//                 <Button variant="contained" sx={{ mt: 3 }} onClick={handleStartTest}>
//                   Take Test
//                 </Button>
//               )}
//             </>
//           )}

//           {showTest && !testCompleted[currentSection] && !loadingQuestions && questions.length > 0 && (
//             <Box sx={{ mt: 3, width: '100%' }}>
//               <form onSubmit={e => { e.preventDefault(); handleSubmitTest(); }}>
//                 {questions.map((q, idx) => (
//                   <Box
//                     key={idx}
//                     sx={{
//                       mb: 4,
//                       p: 3,
//                       background: '#fafafa',
//                       borderRadius: 2,
//                       boxShadow: 1,
//                       width: '100%',
//                       maxWidth: 600,
//                       mx: 'auto'
//                     }}
//                   >
//                     <FormControl component="fieldset" sx={{ width: '100%' }}>
//                       <FormLabel
//                         component="legend"
//                         sx={{ mb: 2, fontWeight: 'bold', textAlign: 'left' }}
//                       >
//                         {q.question}
//                       </FormLabel>
//                       <RadioGroup
//                         value={userAnswers[idx]}
//                         onChange={e => handleAnswerChange(idx, e.target.value)}
//                       >
//                         {q.options.map((opt, oidx) => (
//                           <FormControlLabel
//                             key={oidx}
//                             value={opt}
//                             control={<Radio />}
//                             label={opt}
//                             disabled={showAnswers}
//                             sx={{
//                               alignItems: 'flex-start',
//                               mb: 1,
//                               '& .MuiFormControlLabel-label': {
//                                 textAlign: 'left',
//                                 width: '100%',
//                                 whiteSpace: 'normal'
//                               }
//                             }}
//                           />
//                         ))}
//                       </RadioGroup>
//                       {showAnswers && (
//                         <Typography color={userAnswers[idx] === q.answer ? 'green' : 'red'} sx={{ mt: 1 }}>
//                           Correct answer: {q.answer}
//                         </Typography>
//                       )}
//                     </FormControl>
//                   </Box>
//                 ))}
//                 {validationMessage && (
//                   <Typography color="error" sx={{ mt: 2 }}>
//                     {validationMessage}
//                   </Typography>
//                 )}
//                 <Button type="submit" variant="contained" color="success" sx={{ mt: 2 }}>
//                   Submit Test
//                 </Button>
//               </form>
//             </Box>
//           )}

//           {testCompleted[currentSection] && currentSection < 2 && (
//             <Button variant="contained" sx={{ mt: 3 }} onClick={handleNextSection}>
//               Next
//             </Button>
//           )}
//           {testCompleted[2] && (
//             <>
//               <Typography sx={{ mt: 3, color: 'blue' }}>All sections completed!</Typography>
//               <Button
//                 variant="contained"
//                 color="primary"
//                 sx={{ mt: 2 }}
//                 onClick={async () => {
//                   const viewedOrder = sectionOrder.map(sec => sec.label).join(',');
//                   const payload = {
//                     username,
//                     content_type: subject.charAt(0).toUpperCase() + subject.slice(1),
//                     order: `${viewedOrder}`
//                   };
//                   try {
//                     const res = await fetch(`${BASE_URL}/save-content-view-order`, {
//                       method: 'POST',
//                       headers: { 'Content-Type': 'application/json' },
//                       body: JSON.stringify(payload)
//                     });
//                     if (res.ok) {
//                       const levelToTitle = {};
//                       const levelToScore = {};
//                       sectionOrder.forEach((sec, idx) => {
//                         const passage = content[idx];
//                         const match = passage.match(/^##\s*(.*)/);
//                         levelToTitle[sec.key] = match ? match[1] : `Untitled (${sec.label})`;
//                         levelToScore[sec.key] = {
//                           score: scores[idx],
//                           totalQuestions: questions.length
//                         };
//                       });

//                       navigate(`/self-assess/${subject}`, {
//                         state: { 
//                           levelToTitle,
//                           passages: content,
//                           scores: levelToScore
//                         } 
//                       });
//                     } else {
//                       alert('Failed to save order');
//                     }
//                   } catch (err) {
//                     alert('Error while saving order');
//                   }
//                 }}
//               >
//                 Self Assess
//               </Button>
//             </>
//           )}
//             {!showTest && (
//             <Button variant="text" sx={{ mt: 4 }} onClick={() => navigate(`/dashboard/${username}`)}>
//               Back to Dashboard
//             </Button>
//           )}
//         </div>
//       </main>
//     </div>
//   );
// }

// export default Content;


// import { useState, useEffect } from 'react';
// import Header from './Header';
// import { Card, CardContent, Typography, Button, Box, Radio, RadioGroup, FormControlLabel, FormControl, FormLabel } from '@mui/material';
// import { useNavigate, useLocation } from 'react-router-dom';
// import { TailSpin } from "react-loader-spinner";
// import ReactMarkdown from 'react-markdown';
// import BASE_URL from '../config';

// const initialSectionLabels = [
//   { key: 'low', label: 'Low' },
//   { key: 'medium', label: 'Medium' },
//   { key: 'high', label: 'High' }
// ];

// function shuffleArray(array) {
//   const shuffled = [...array];
//   for (let i = shuffled.length - 1; i > 0; i--) {
//     const j = Math.floor(Math.random() * (i + 1));
//     [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
//   }
//   return shuffled;
// }

// function Content({ isLoggedIn, onLogout }) {
//   const [currentSection, setCurrentSection] = useState(0);
//   const [sectionOrder, setSectionOrder] = useState(() => shuffleArray(initialSectionLabels));
//   const [showTest, setShowTest] = useState(false);
//   const [showPreTestQuestion, setShowPreTestQuestion] = useState(false); // NEW STATE
//   const [preTestAnswer, setPreTestAnswer] = useState(''); // NEW STATE
//   const [testCompleted, setTestCompleted] = useState([false, false, false]);
//   const [content, setContent] = useState(['', '', '']);
//   const [loadingContent, setLoadingContent] = useState(false);
//   const [questions, setQuestions] = useState([]);
//   const [loadingQuestions, setLoadingQuestions] = useState(false);
//   const [userAnswers, setUserAnswers] = useState([]);
//   const [testResult, setTestResult] = useState('');
//   const [showAnswers, setShowAnswers] = useState(false);
//   const [scores, setScores] = useState([-1, -1, -1]);
//   const navigate = useNavigate();
//   const username = localStorage.getItem('username');
//   const [validationMessage, setValidationMessage] = useState('');

//   const location = useLocation();
//   const subject = location.pathname.split('/').pop();
//   const [passageStartTime, setPassageStartTime] = useState(null);
//   const [readingTimeTaken, setReadingTimeTaken] = useState(null);
//   const [questionStartTime, setQuestionStartTime] = useState(null);

//   useEffect(() => {
//     let isCancelled = false;
  
//     async function fetchContentAndQuestions() {
//       setLoadingContent(true);
//       setLoadingQuestions(true);
//       setShowTest(false);
//       setShowPreTestQuestion(false);
//       try {
//         const res = await fetch(`${BASE_URL}/get-passage-and-questions?type=${subject}&level=${sectionOrder[currentSection].key}&username=${username}`);
//         if (!res.ok) throw new Error('Failed to fetch passage and questions');
//         const data = await res.json();
  
//         if (!isCancelled) {
//           if (data.content) {
//             setContent(prev => {
//               const updated = [...prev];
//               updated[currentSection] = data.content;
//               return updated;
//             });
//           }
        
//           if (typeof data.score === 'number' && data.score >= 0) {
//             setScores(prev => {
//               const updated = [...prev];
//               updated[currentSection] = data.score;
//               return updated;
//             });
//             setTestCompleted(prev => {
//               const updated = [...prev];
//               updated[currentSection] = true;
//               return updated;
//             });
//             setShowTest(false);        
//             setQuestions([]);          
//             setUserAnswers([]);   
//           } else if (data.questions) {
//             const arr = Array.isArray(data.questions) ? data.questions : [];
//             setQuestions(arr);
//             setUserAnswers(Array(arr.length).fill(''));
//           }
//         }
        
//       } catch (err) {
//         if (!isCancelled) {
//           setContent(prev => {
//             const updated = [...prev];
//             updated[currentSection] = 'Failed to load content.';
//             return updated;
//           });
//           setQuestions([]);
//           setValidationMessage('Failed to load content and questions. Please try again.');
//         }
//       }
//       if (!isCancelled) {
//         setLoadingContent(false);
//         setLoadingQuestions(false);
//       }
//     }
  
//     fetchContentAndQuestions();
  
//     return () => {
//       isCancelled = true;
//     };
//   }, [currentSection, username]);
  
//   useEffect(() => {
//     if (content[currentSection]) {
//       setPassageStartTime(Date.now());
//     }
//   }, [content[currentSection]]);

//   const handleStartTest = () => {
//     if (testCompleted[currentSection]) return;

//     const readingEndTime = Date.now();
//     const readingTime = Math.floor((readingEndTime - passageStartTime) / 1000);
//     setReadingTimeTaken(readingTime);
//     localStorage.setItem(`timeTaken_${sectionOrder[currentSection].key}_level_reading`, readingTime);

//     setShowPreTestQuestion(true);
//     setPreTestAnswer(''); 
//     setTestResult('');
//     setShowAnswers(false);
//   };  

//   const handlePreTestSubmit = () => {
//     if (!preTestAnswer) {
//       setValidationMessage('Please answer the question before proceeding.');
//       return;
//     }
    
//     setValidationMessage('');
//     setShowPreTestQuestion(false);
//     setShowTest(true);
//     setQuestionStartTime(Date.now());
//   };

//   const handleAnswerChange = (qIdx, value) => {
//     setUserAnswers(prev => {
//       const updated = [...prev];
//       updated[qIdx] = value;
//       return updated;
//     });
//   };

//   const handleSubmitTest = async () => {
//     const unanswered = userAnswers.some(ans => ans === '');
//     if (unanswered) {
//       setValidationMessage('Please answer all questions before submitting the test.');
//       return;
//     }
    
//     const questionsendTime = Date.now();
//     const answeringTime = Math.floor((questionsendTime - questionStartTime) / 1000); // in seconds
//     localStorage.setItem(`timeTaken_${sectionOrder[currentSection].key}_level_answering`, answeringTime);
//     setValidationMessage('');
    
//     let correct = 0;
//     questions.forEach((q, idx) => {
//       if (userAnswers[idx] === q.answer) correct++;
//     });
  
//     setScores(prev => {
//       const updated = [...prev];
//       updated[currentSection] = correct;
//       return updated;
//     });

//     try {
//       const res = await fetch(`${BASE_URL}/save-test-score`, {
//         method: 'POST',
//         headers: { 'Content-Type': 'application/json' },
//         body: JSON.stringify({
//           username,
//           level: sectionOrder[currentSection].key,
//           score: correct,
//           total_questions: questions.length,
//           reading_time_taken: readingTimeTaken ? parseInt(readingTimeTaken, 10) : null,
//           questions_time_taken: answeringTime,
//           pre_test_answer: preTestAnswer 
//         })
//       });
//       if (!res.ok) {
//         console.error('Failed to save score:', await res.text());
//         setValidationMessage('Failed to save score. Please try again.');
//         return;
//       }
//     } catch (err) {
//       console.error('Error saving score:', err);
//       setValidationMessage('Error saving score. Please try again.');
//       return;
//     }
  
//     setShowAnswers(true);
//     const updated = [...testCompleted];
//     updated[currentSection] = true;
//     setTestCompleted(updated);
//     setShowTest(false);

//     if (currentSection < 2) {
//       handleNextSection();
//     }
//   };

//   const handleNextSection = () => {
//     window.scrollTo(0, 0);
//     setCurrentSection(currentSection + 1);
//     setShowTest(false);
//     setShowPreTestQuestion(false); 
//     setPreTestAnswer(''); 
//     setTestResult('');
//     setShowAnswers(false);
//     setQuestions([]);
//     setUserAnswers([]);
//     setValidationMessage('');
//   };

//   useEffect(() => {
//   window.scrollTo(0, 0);
// }, []);

//   return (
//     <div className="no-select" style={{ minHeight: '100vh', background: '#fff' }}>
//       <Header isLoggedIn={isLoggedIn} onLogout={onLogout} />
//       <main className="reading-content" style={{ alignItems: 'center', justifyContent: 'center' }}>
//         <div className="reading-card" style={{ maxWidth: 700, width: '100%', margin: '0 auto', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
//           <Typography variant="h5" sx={{ mb: 2 }} textAlign='center'>
//           {subject.charAt(0).toUpperCase() + subject.slice(1)} Content
//           </Typography>
          
//           {showPreTestQuestion && (
//             <Box sx={{ mt: 3, width: '100%', maxWidth: 600 }}>
//               <Card sx={{ p: 3 }}>
//                 <CardContent>
//                   <FormControl component="fieldset" sx={{ width: '100%' }}>
//                     <FormLabel component="legend" sx={{ mb: 2, fontWeight: 'bold', fontSize: '1.1rem' }}>
//                       Have you read about this topic before?
//                     </FormLabel>
//                     <RadioGroup
//                       value={preTestAnswer}
//                       onChange={(e) => setPreTestAnswer(e.target.value)}
//                     >
//                       <FormControlLabel
//                         value="Yes"
//                         control={<Radio />}
//                         label="Yes"
//                         sx={{ mb: 1 }}
//                       />
//                       <FormControlLabel
//                         value="No"
//                         control={<Radio />}
//                         label="No"
//                         sx={{ mb: 1 }}
//                       />
//                     </RadioGroup>
//                   </FormControl>
//                   {validationMessage && (
//                     <Typography color="error" sx={{ mt: 2 }}>
//                       {validationMessage}
//                     </Typography>
//                   )}
//                   <Button 
//                     variant="contained" 
//                     sx={{ mt: 3 }} 
//                     onClick={handlePreTestSubmit}
//                   >
//                     Continue to Test
//                   </Button>
//                 </CardContent>
//               </Card>
//             </Box>
//           )}

//           {!showTest && !showPreTestQuestion && (
//             <>
//               {!loadingContent && (
//                 <Typography sx={{ mt: 1, fontStyle: 'italic', color: 'gray', textAlign: 'center' }}>
//                   Read the passage thoroughly. You won't be allowed to read again while answering questions.
//                 </Typography>
//               )}
//               <Card sx={{ mt: 2, width: '100%', maxWidth: 600, textAlign: 'left' }}>
//                 <CardContent>
//                   {loadingContent ? (
//                     <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: 120 }}>
//                       <TailSpin color="#2980b9" height={40} width={40} />
//                     </div>
//                   ) : (
//                     <>
//                       {(() => {
//                         const rawContent = content[currentSection];
//                         const match = rawContent.match(/^##\s*(.+?)\s*\n/);
//                         const title = match ? match[1] : '';
//                         const body = match ? rawContent.slice(match[0].length) : rawContent;

//                         return (
//                           <>
//                             {title && (
//                               <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 2, textAlign: 'center' }}>
//                                 {title}
//                               </Typography>
//                             )}
//                             <ReactMarkdown
//                               components={{
//                                 h1: ({ node, ...props }) => <Typography variant="h4" gutterBottom {...props} className="no-select" />,
//                                 h2: ({ node, ...props }) => <Typography variant="h5" gutterBottom {...props} className="no-select" />,
//                                 p: ({ node, ...props }) => <Typography variant="body1" paragraph {...props} className="no-select" />,
//                                 strong: ({ node, ...props }) => <strong style={{ fontWeight: 600 }} {...props} className="no-select" />,
//                                 em: ({ node, ...props }) => <em style={{ fontStyle: 'italic' }} {...props} className="no-select" />,
//                               }}
//                             >
//                               {body}
//                             </ReactMarkdown>
//                           </>
//                         );
//                       })()}
//                     </>
//                   )}
//                 </CardContent>
//               </Card>
//               {!showTest && testCompleted[currentSection] && (
//                 <Typography sx={{ mt: 3, color: 'green', textAlign: 'center' }}>
//                   Test completed
//                 </Typography>
//               )}
//               {!testCompleted[currentSection] && !loadingContent && (
//                 <Button variant="contained" sx={{ mt: 3 }} onClick={handleStartTest}>
//                   Take Test
//                 </Button>
//               )}
//             </>
//           )}

//           {showTest && !testCompleted[currentSection] && !loadingQuestions && questions.length > 0 && (
//             <Box sx={{ mt: 3, width: '100%' }}>
//               <form onSubmit={e => { e.preventDefault(); handleSubmitTest(); }}>
//                 {questions.map((q, idx) => (
//                   <Box
//                     key={idx}
//                     sx={{
//                       mb: 4,
//                       p: 3,
//                       background: '#fafafa',
//                       borderRadius: 2,
//                       boxShadow: 1,
//                       width: '100%',
//                       maxWidth: 600,
//                       mx: 'auto'
//                     }}
//                   >
//                     <FormControl component="fieldset" sx={{ width: '100%' }}>
//                       <FormLabel
//                         component="legend"
//                         sx={{ mb: 2, fontWeight: 'bold', textAlign: 'left' }}
//                       >
//                         {q.question}
//                       </FormLabel>
//                       <RadioGroup
//                         value={userAnswers[idx]}
//                         onChange={e => handleAnswerChange(idx, e.target.value)}
//                       >
//                         {q.options.map((opt, oidx) => (
//                           <FormControlLabel
//                             key={oidx}
//                             value={opt}
//                             control={<Radio />}
//                             label={opt}
//                             disabled={showAnswers}
//                             sx={{
//                               alignItems: 'flex-start',
//                               mb: 1,
//                               '& .MuiFormControlLabel-label': {
//                                 textAlign: 'left',
//                                 width: '100%',
//                                 whiteSpace: 'normal'
//                               }
//                             }}
//                           />
//                         ))}
//                       </RadioGroup>
//                       {showAnswers && (
//                         <Typography color={userAnswers[idx] === q.answer ? 'green' : 'red'} sx={{ mt: 1 }}>
//                           Correct answer: {q.answer}
//                         </Typography>
//                       )}
//                     </FormControl>
//                   </Box>
//                 ))}
//                 {validationMessage && (
//                   <Typography color="error" sx={{ mt: 2 }}>
//                     {validationMessage}
//                   </Typography>
//                 )}
//                 <Button type="submit" variant="contained" color="success" sx={{ mt: 2 }}>
//                   Submit Test
//                 </Button>
//               </form>
//             </Box>
//           )}

//           {testCompleted[currentSection] && currentSection < 2 && (
//             <Button variant="contained" sx={{ mt: 3 }} onClick={handleNextSection}>
//               Next
//             </Button>
//           )}
//           {testCompleted[2] && (
//             <>
//               <Typography sx={{ mt: 3, color: 'blue' }}>All sections completed!</Typography>
//               <Button
//                 variant="contained"
//                 color="primary"
//                 sx={{ mt: 2 }}
//                 onClick={async () => {
//                   const viewedOrder = sectionOrder.map(sec => sec.label).join(',');
//                   const payload = {
//                     username,
//                     content_type: subject.charAt(0).toUpperCase() + subject.slice(1),
//                     order: `${viewedOrder}`
//                   };
//                   try {
//                     const res = await fetch(`${BASE_URL}/save-content-view-order`, {
//                       method: 'POST',
//                       headers: { 'Content-Type': 'application/json' },
//                       body: JSON.stringify(payload)
//                     });
//                     if (res.ok) {
//                       const levelToTitle = {};
//                       const levelToScore = {};
//                       sectionOrder.forEach((sec, idx) => {
//                         const passage = content[idx];
//                         const match = passage.match(/^##\s*(.*)/);
//                         levelToTitle[sec.key] = match ? match[1] : `Untitled (${sec.label})`;
//                         levelToScore[sec.key] = {
//                           score: scores[idx],
//                           totalQuestions: questions.length
//                         };
//                       });

//                       navigate(`/self-assess/${subject}`, {
//                         state: { 
//                           levelToTitle,
//                           passages: content,
//                           scores: levelToScore
//                         } 
//                       });
//                     } else {
//                       alert('Failed to save order');
//                     }
//                   } catch (err) {
//                     alert('Error while saving order');
//                   }
//                 }}
//               >
//                 Self Assess
//               </Button>
//             </>
//           )}
//           {!showTest && !showPreTestQuestion && (
//             <Button variant="text" sx={{ mt: 4 }} onClick={() => navigate(`/dashboard/${username}`)}>
//               Back to Dashboard
//             </Button>
//           )}
//         </div>
//       </main>
//     </div>
//   );
// }

// export default Content;

// import { useState, useEffect } from 'react';
// import Header from './Header';
// import { Card, CardContent, Typography, Button, Box, Radio, RadioGroup, FormControlLabel, FormControl, FormLabel } from '@mui/material';
// import { useNavigate, useLocation } from 'react-router-dom';
// import { TailSpin } from "react-loader-spinner";
// import ReactMarkdown from 'react-markdown';
// import BASE_URL from '../config';

// const initialSectionLabels = [
//   { key: 'low', label: 'Low' },
//   { key: 'medium', label: 'Medium' },
//   { key: 'high', label: 'High' }
// ];

// function shuffleArray(array) {
//   const shuffled = [...array];
//   for (let i = shuffled.length - 1; i > 0; i--) {
//     const j = Math.floor(Math.random() * (i + 1));
//     [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
//   }
//   return shuffled;
// }

// function Content({ isLoggedIn, onLogout }) {
//   const [currentSection, setCurrentSection] = useState(0);
//   const [sectionOrder, setSectionOrder] = useState(() => shuffleArray(initialSectionLabels));
//   const [showTest, setShowTest] = useState(false);
//   const [showPreTestQuestion, setShowPreTestQuestion] = useState(false); // NEW STATE
//   const [preTestAnswer, setPreTestAnswer] = useState(''); // NEW STATE
//   const [testCompleted, setTestCompleted] = useState([false, false, false]);
//   const [content, setContent] = useState(['', '', '']);
//   const [loadingContent, setLoadingContent] = useState(false);
//   const [questions, setQuestions] = useState([]);
//   const [loadingQuestions, setLoadingQuestions] = useState(false);
//   const [userAnswers, setUserAnswers] = useState([]);
//   const [testResult, setTestResult] = useState('');
//   const [showAnswers, setShowAnswers] = useState(false);
//   const [scores, setScores] = useState([-1, -1, -1]);
//   const navigate = useNavigate();
//   const username = localStorage.getItem('username');
//   const [validationMessage, setValidationMessage] = useState('');

//   const location = useLocation();
//   const subject = location.pathname.split('/').pop();
//   const [passageStartTime, setPassageStartTime] = useState(null);
//   const [readingTimeTaken, setReadingTimeTaken] = useState(null);
//   const [questionStartTime, setQuestionStartTime] = useState(null);

//   // ADDED: Check if all tests are completed
//   const allTestsCompleted = testCompleted.every(completed => completed);

//   useEffect(() => {
//     let isCancelled = false;
  
//     async function fetchContentAndQuestions() {
//       // ADDED: Don't fetch content if all tests are completed
//       if (allTestsCompleted) {
//         return;
//       }

//       setLoadingContent(true);
//       setLoadingQuestions(true);
//       setShowTest(false);
//       setShowPreTestQuestion(false); // RESET PRE-TEST QUESTION STATE
//       try {
//         const res = await fetch(`${BASE_URL}/get-passage-and-questions?type=${subject}&level=${sectionOrder[currentSection].key}&username=${username}`);
//         if (!res.ok) throw new Error('Failed to fetch passage and questions');
//         const data = await res.json();
  
//         if (!isCancelled) {
//           if (data.content) {
//             setContent(prev => {
//               const updated = [...prev];
//               updated[currentSection] = data.content;
//               return updated;
//             });
//           }
        
//           if (typeof data.score === 'number' && data.score >= 0) {
//             setScores(prev => {
//               const updated = [...prev];
//               updated[currentSection] = data.score;
//               return updated;
//             });
//             setTestCompleted(prev => {
//               const updated = [...prev];
//               updated[currentSection] = true;
//               return updated;
//             });
//             setShowTest(false);        
//             setQuestions([]);          
//             setUserAnswers([]);   
//           } else if (data.questions) {
//             const arr = Array.isArray(data.questions) ? data.questions : [];
//             setQuestions(arr);
//             setUserAnswers(Array(arr.length).fill(''));
//           }
//         }
        
//       } catch (err) {
//         if (!isCancelled) {
//           setContent(prev => {
//             const updated = [...prev];
//             updated[currentSection] = 'Failed to load content.';
//             return updated;
//           });
//           setQuestions([]);
//           setValidationMessage('Failed to load content and questions. Please try again.');
//         }
//       }
//       if (!isCancelled) {
//         setLoadingContent(false);
//         setLoadingQuestions(false);
//       }
//     }
  
//     fetchContentAndQuestions();
  
//     return () => {
//       isCancelled = true;
//     };
//   }, [currentSection, username, allTestsCompleted]); // ADDED: allTestsCompleted dependency
  
//   useEffect(() => {
//     if (content[currentSection] && !allTestsCompleted) { // ADDED: Check if not all tests completed
//       setPassageStartTime(Date.now());
//     }
//   }, [content[currentSection], allTestsCompleted]); // ADDED: allTestsCompleted dependency

//   const handleStartTest = () => {
//     if (testCompleted[currentSection]) return;

//     const readingEndTime = Date.now();
//     const readingTime = Math.floor((readingEndTime - passageStartTime) / 1000);
//     setReadingTimeTaken(readingTime);
//     localStorage.setItem(`timeTaken_${sectionOrder[currentSection].key}_level_reading`, readingTime);

//     // SHOW PRE-TEST QUESTION FIRST
//     setShowPreTestQuestion(true);
//     setPreTestAnswer(''); // RESET PRE-TEST ANSWER
//     setTestResult('');
//     setShowAnswers(false);
//   };  

//   // NEW FUNCTION TO HANDLE PRE-TEST QUESTION SUBMISSION
//   const handlePreTestSubmit = () => {
//     if (!preTestAnswer) {
//       setValidationMessage('Please answer the question before proceeding.');
//       return;
//     }
    
//     setValidationMessage('');
//     setShowPreTestQuestion(false);
//     setShowTest(true);
//     setQuestionStartTime(Date.now());
//   };

//   const handleAnswerChange = (qIdx, value) => {
//     setUserAnswers(prev => {
//       const updated = [...prev];
//       updated[qIdx] = value;
//       return updated;
//     });
//   };

//   const handleSubmitTest = async () => {
//     const unanswered = userAnswers.some(ans => ans === '');
//     if (unanswered) {
//       setValidationMessage('Please answer all questions before submitting the test.');
//       return;
//     }
    
//     const questionsendTime = Date.now();
//     const answeringTime = Math.floor((questionsendTime - questionStartTime) / 1000); // in seconds
//     localStorage.setItem(`timeTaken_${sectionOrder[currentSection].key}_level_answering`, answeringTime);
//     setValidationMessage('');
    
//     let correct = 0;
//     questions.forEach((q, idx) => {
//       if (userAnswers[idx] === q.answer) correct++;
//     });
  
//     setScores(prev => {
//       const updated = [...prev];
//       updated[currentSection] = correct;
//       return updated;
//     });

//     try {
//       const res = await fetch(`${BASE_URL}/save-test-score`, {
//         method: 'POST',
//         headers: { 'Content-Type': 'application/json' },
//         body: JSON.stringify({
//           username,
//           level: sectionOrder[currentSection].key,
//           score: correct,
//           total_questions: questions.length,
//           reading_time_taken: readingTimeTaken ? parseInt(readingTimeTaken, 10) : null,
//           questions_time_taken: answeringTime,
//           pre_test_answer: preTestAnswer // INCLUDE PRE-TEST ANSWER IN SUBMISSION
//         })
//       });
//       if (!res.ok) {
//         console.error('Failed to save score:', await res.text());
//         setValidationMessage('Failed to save score. Please try again.');
//         return;
//       }
//     } catch (err) {
//       console.error('Error saving score:', err);
//       setValidationMessage('Error saving score. Please try again.');
//       return;
//     }
  
//     setShowAnswers(true);
//     const updated = [...testCompleted];
//     updated[currentSection] = true;
//     setTestCompleted(updated);
//     setShowTest(false);

//     if (currentSection < 2) {
//       handleNextSection();
//     }
//   };

//   const handleNextSection = () => {
//     setCurrentSection(currentSection + 1);
//     setShowTest(false);
//     setShowPreTestQuestion(false); // RESET PRE-TEST QUESTION STATE
//     setPreTestAnswer(''); // RESET PRE-TEST ANSWER
//     setTestResult('');
//     setShowAnswers(false);
//     setQuestions([]);
//     setUserAnswers([]);
//     setValidationMessage('');
//   };

//   return (
//     <div className="no-select" style={{ minHeight: '100vh', background: '#fff' }}>
//       <Header isLoggedIn={isLoggedIn} onLogout={onLogout} />
//       <main className="reading-content" style={{ alignItems: 'center', justifyContent: 'center' }}>
//         <div className="reading-card" style={{ maxWidth: 700, width: '100%', margin: '0 auto', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
//           <Typography variant="h5" sx={{ mb: 2 }} textAlign='center'>
//           {subject.charAt(0).toUpperCase() + subject.slice(1)} Content
//           </Typography>
          
//           {/* ADDED: Show completion message and self-assess button when all tests are completed */}
//           {allTestsCompleted && (
//             <Box sx={{ mt: 4, textAlign: 'center' }}>
//               <Typography sx={{ mb: 3, color: 'blue', fontSize: '1.2rem' }}>
//                 All sections completed!
//               </Typography>
//               <Button
//                 variant="contained"
//                 color="primary"
//                 sx={{ mt: 2 }}
//                 onClick={async () => {
//                   const viewedOrder = sectionOrder.map(sec => sec.label).join(',');
//                   const payload = {
//                     username,
//                     content_type: subject.charAt(0).toUpperCase() + subject.slice(1),
//                     order: `${viewedOrder}`
//                   };
//                   try {
//                     const res = await fetch(`${BASE_URL}/save-content-view-order`, {
//                       method: 'POST',
//                       headers: { 'Content-Type': 'application/json' },
//                       body: JSON.stringify(payload)
//                     });
//                     if (res.ok) {
//                       const levelToTitle = {};
//                       const levelToScore = {};
//                       sectionOrder.forEach((sec, idx) => {
//                         const passage = content[idx];
//                         const match = passage.match(/^##\s*(.*)/);
//                         levelToTitle[sec.key] = match ? match[1] : `Untitled (${sec.label})`;
//                         levelToScore[sec.key] = {
//                           score: scores[idx],
//                           totalQuestions: questions.length
//                         };
//                       });

//                       navigate(`/self-assess/${subject}`, {
//                         state: { 
//                           levelToTitle,
//                           passages: content,
//                           scores: levelToScore
//                         } 
//                       });
//                     } else {
//                       alert('Failed to save order');
//                     }
//                   } catch (err) {
//                     alert('Error while saving order');
//                   }
//                 }}
//               >
//                 Self Assess
//               </Button>
//               <br />
//               <Button variant="text" sx={{ mt: 2 }} onClick={() => navigate(`/dashboard/${username}`)}>
//                 Back to Dashboard
//               </Button>
//             </Box>
//           )}
          
//           {/* MODIFIED: Only show content sections if not all tests are completed */}
//           {!allTestsCompleted && (
//             <>
//               {/* PRE-TEST QUESTION DISPLAY */}
//               {showPreTestQuestion && (
//                 <Box sx={{ mt: 3, width: '100%', maxWidth: 600 }}>
//                   <Card sx={{ p: 3 }}>
//                     <CardContent>
//                       <FormControl component="fieldset" sx={{ width: '100%' }}>
//                         <FormLabel component="legend" sx={{ mb: 2, fontWeight: 'bold', fontSize: '1.1rem' }}>
//                           Have you read about this topic before?
//                         </FormLabel>
//                         <RadioGroup
//                           value={preTestAnswer}
//                           onChange={(e) => setPreTestAnswer(e.target.value)}
//                         >
//                           <FormControlLabel
//                             value="Yes"
//                             control={<Radio />}
//                             label="Yes"
//                             sx={{ mb: 1 }}
//                           />
//                           <FormControlLabel
//                             value="No"
//                             control={<Radio />}
//                             label="No"
//                             sx={{ mb: 1 }}
//                           />
//                         </RadioGroup>
//                       </FormControl>
//                       {validationMessage && (
//                         <Typography color="error" sx={{ mt: 2 }}>
//                           {validationMessage}
//                         </Typography>
//                       )}
//                       <Button 
//                         variant="contained" 
//                         sx={{ mt: 3 }} 
//                         onClick={handlePreTestSubmit}
//                       >
//                         Continue to Test
//                       </Button>
//                     </CardContent>
//                   </Card>
//                 </Box>
//               )}

//               {!showTest && !showPreTestQuestion && (
//                 <>
//                   {!loadingContent && (
//                     <Typography sx={{ mt: 1, fontStyle: 'italic', color: 'gray', textAlign: 'center' }}>
//                       Read the passage thoroughly. You won't be allowed to read again while answering questions.
//                     </Typography>
//                   )}
//                   <Card sx={{ mt: 2, width: '100%', maxWidth: 600, textAlign: 'left' }}>
//                     <CardContent>
//                       {loadingContent ? (
//                         <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: 120 }}>
//                           <TailSpin color="#2980b9" height={40} width={40} />
//                         </div>
//                       ) : (
//                         <>
//                           {(() => {
//                             const rawContent = content[currentSection];
//                             const match = rawContent.match(/^##\s*(.+?)\s*\n/);
//                             const title = match ? match[1] : '';
//                             const body = match ? rawContent.slice(match[0].length) : rawContent;

//                             return (
//                               <>
//                                 {title && (
//                                   <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 2, textAlign: 'center' }}>
//                                     {title}
//                                   </Typography>
//                                 )}
//                                 <ReactMarkdown
//                                   components={{
//                                     h1: ({ node, ...props }) => <Typography variant="h4" gutterBottom {...props} className="no-select" />,
//                                     h2: ({ node, ...props }) => <Typography variant="h5" gutterBottom {...props} className="no-select" />,
//                                     p: ({ node, ...props }) => <Typography variant="body1" paragraph {...props} className="no-select" />,
//                                     strong: ({ node, ...props }) => <strong style={{ fontWeight: 600 }} {...props} className="no-select" />,
//                                     em: ({ node, ...props }) => <em style={{ fontStyle: 'italic' }} {...props} className="no-select" />,
//                                   }}
//                                 >
//                                   {body}
//                                 </ReactMarkdown>
//                               </>
//                             );
//                           })()}
//                         </>
//                       )}
//                     </CardContent>
//                   </Card>
//                   {!showTest && testCompleted[currentSection] && (
//                     <Typography sx={{ mt: 3, color: 'green', textAlign: 'center' }}>
//                       Test completed
//                     </Typography>
//                   )}
//                   {!testCompleted[currentSection] && !loadingContent && (
//                     <Button variant="contained" sx={{ mt: 3 }} onClick={handleStartTest}>
//                       Take Test
//                     </Button>
//                   )}
//                 </>
//               )}

//               {showTest && !testCompleted[currentSection] && !loadingQuestions && questions.length > 0 && (
//                 <Box sx={{ mt: 3, width: '100%' }}>
//                   <form onSubmit={e => { e.preventDefault(); handleSubmitTest(); }}>
//                     {questions.map((q, idx) => (
//                       <Box
//                         key={idx}
//                         sx={{
//                           mb: 4,
//                           p: 3,
//                           background: '#fafafa',
//                           borderRadius: 2,
//                           boxShadow: 1,
//                           width: '100%',
//                           maxWidth: 600,
//                           mx: 'auto'
//                         }}
//                       >
//                         <FormControl component="fieldset" sx={{ width: '100%' }}>
//                           <FormLabel
//                             component="legend"
//                             sx={{ mb: 2, fontWeight: 'bold', textAlign: 'left' }}
//                           >
//                             {q.question}
//                           </FormLabel>
//                           <RadioGroup
//                             value={userAnswers[idx]}
//                             onChange={e => handleAnswerChange(idx, e.target.value)}
//                           >
//                             {q.options.map((opt, oidx) => (
//                               <FormControlLabel
//                                 key={oidx}
//                                 value={opt}
//                                 control={<Radio />}
//                                 label={opt}
//                                 disabled={showAnswers}
//                                 sx={{
//                                   alignItems: 'flex-start',
//                                   mb: 1,
//                                   '& .MuiFormControlLabel-label': {
//                                     textAlign: 'left',
//                                     width: '100%',
//                                     whiteSpace: 'normal'
//                                   }
//                                 }}
//                               />
//                             ))}
//                           </RadioGroup>
//                           {showAnswers && (
//                             <Typography color={userAnswers[idx] === q.answer ? 'green' : 'red'} sx={{ mt: 1 }}>
//                               Correct answer: {q.answer}
//                             </Typography>
//                           )}
//                         </FormControl>
//                       </Box>
//                     ))}
//                     {validationMessage && (
//                       <Typography color="error" sx={{ mt: 2 }}>
//                         {validationMessage}
//                       </Typography>
//                     )}
//                     <Button type="submit" variant="contained" color="success" sx={{ mt: 2 }}>
//                       Submit Test
//                     </Button>
//                   </form>
//                 </Box>
//               )}

//               {testCompleted[currentSection] && currentSection < 2 && (
//                 <Button variant="contained" sx={{ mt: 3 }} onClick={handleNextSection}>
//                   Next
//                 </Button>
//               )}

//               {/* REMOVED: The old completion logic that was duplicated */}
              
//               {!showTest && !showPreTestQuestion && (
//                 <Button variant="text" sx={{ mt: 4 }} onClick={() => navigate(`/dashboard/${username}`)}>
//                   Back to Dashboard
//                 </Button>
//               )}
//             </>
//           )}
//         </div>
//       </main>
//     </div>
//   );
// }

// export default Content;

import { useState, useEffect } from 'react';
import Header from './Header';
import { Card, CardContent, Typography, Button, Box, Radio, RadioGroup, FormControlLabel, FormControl, FormLabel } from '@mui/material';
import { useNavigate, useLocation } from 'react-router-dom';
import { TailSpin } from "react-loader-spinner";
import ReactMarkdown from 'react-markdown';
import BASE_URL from '../config';

const initialSectionLabels = [
  { key: 'low', label: 'Low' },
  { key: 'medium', label: 'Medium' },
  { key: 'high', label: 'High' }
];

function shuffleArray(array) {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

function Content({ isLoggedIn, onLogout }) {
  const [currentSection, setCurrentSection] = useState(0);
  const [sectionOrder, setSectionOrder] = useState(() => shuffleArray(initialSectionLabels));
  const [showTest, setShowTest] = useState(false);
  const [showPreTestQuestion, setShowPreTestQuestion] = useState(false);
  const [preTestAnswer, setPreTestAnswer] = useState('');
  const [testCompleted, setTestCompleted] = useState([false, false, false]);
  const [content, setContent] = useState(['', '', '']);
  const [loadingContent, setLoadingContent] = useState(false);
  const [questions, setQuestions] = useState([]);
  const [loadingQuestions, setLoadingQuestions] = useState(false);
  const [userAnswers, setUserAnswers] = useState([]);
  const [testResult, setTestResult] = useState('');
  const [showAnswers, setShowAnswers] = useState(false);
  const [scores, setScores] = useState([-1, -1, -1]);
  const navigate = useNavigate();
  const username = localStorage.getItem('username');
  const [validationMessage, setValidationMessage] = useState('');

  const location = useLocation();
  const subject = location.pathname.split('/').pop();
  const [passageStartTime, setPassageStartTime] = useState(null);
  const [readingTimeTaken, setReadingTimeTaken] = useState(null);
  const [questionStartTime, setQuestionStartTime] = useState(null);

  useEffect(() => {
    let isCancelled = false;
  
    async function fetchContentAndQuestions() {
      // Don't fetch if test is already completed for this section
      if (testCompleted[currentSection]) {
        return;
      }

      setLoadingContent(true);
      setLoadingQuestions(true);
      setShowTest(false);
      setShowPreTestQuestion(false);
      
      try {
        const res = await fetch(`${BASE_URL}/get-passage-and-questions?type=${subject}&level=${sectionOrder[currentSection].key}&username=${username}`);
        if (!res.ok) throw new Error('Failed to fetch passage and questions');
        const data = await res.json();
  
        if (!isCancelled) {
          if (data.content) {
            setContent(prev => {
              const updated = [...prev];
              updated[currentSection] = data.content;
              return updated;
            });
          }
        
          if (typeof data.score === 'number' && data.score >= 0) {
            setScores(prev => {
              const updated = [...prev];
              updated[currentSection] = data.score;
              return updated;
            });
            setTestCompleted(prev => {
              const updated = [...prev];
              updated[currentSection] = true;
              return updated;
            });
            setShowTest(false);        
            setQuestions([]);          
            setUserAnswers([]);   
          } else if (data.questions) {
            const arr = Array.isArray(data.questions) ? data.questions : [];
            setQuestions(arr);
            setUserAnswers(Array(arr.length).fill(''));
          }
        }
        
      } catch (err) {
        if (!isCancelled) {
          setContent(prev => {
            const updated = [...prev];
            updated[currentSection] = 'Failed to load content.';
            return updated;
          });
          setQuestions([]);
          setValidationMessage('Failed to load content and questions. Please try again.');
        }
      }
      if (!isCancelled) {
        setLoadingContent(false);
        setLoadingQuestions(false);
      }
    }
  
    fetchContentAndQuestions();
  
    return () => {
      isCancelled = true;
    };
  }, [currentSection, username, testCompleted]); // Added testCompleted to dependencies
  
  useEffect(() => {
    if (content[currentSection]) {
      setPassageStartTime(Date.now());
    }
  }, [content[currentSection]]);

  const handleStartTest = () => {
    if (testCompleted[currentSection]) return;

    const readingEndTime = Date.now();
    const readingTime = Math.floor((readingEndTime - passageStartTime) / 1000);
    setReadingTimeTaken(readingTime);
    localStorage.setItem(`timeTaken_${sectionOrder[currentSection].key}_level_reading`, readingTime);

    setShowPreTestQuestion(true);
    setPreTestAnswer(''); 
    setTestResult('');
    setShowAnswers(false);
  };  

  const handlePreTestSubmit = () => {
    if (!preTestAnswer) {
      setValidationMessage('Please answer the question before proceeding.');
      return;
    }
    
    setValidationMessage('');
    setShowPreTestQuestion(false);
    setShowTest(true);
    setQuestionStartTime(Date.now());
  };

  const handleAnswerChange = (qIdx, value) => {
    setUserAnswers(prev => {
      const updated = [...prev];
      updated[qIdx] = value;
      return updated;
    });
  };

  const handleSubmitTest = async () => {
    const unanswered = userAnswers.some(ans => ans === '');
    if (unanswered) {
      setValidationMessage('Please answer all questions before submitting the test.');
      return;
    }
    
    const questionsendTime = Date.now();
    const answeringTime = Math.floor((questionsendTime - questionStartTime) / 1000);
    localStorage.setItem(`timeTaken_${sectionOrder[currentSection].key}_level_answering`, answeringTime);
    setValidationMessage('');
    
    let correct = 0;
    questions.forEach((q, idx) => {
      if (userAnswers[idx] === q.answer) correct++;
    });
  
    setScores(prev => {
      const updated = [...prev];
      updated[currentSection] = correct;
      return updated;
    });

    try {
      const res = await fetch(`${BASE_URL}/save-test-score`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          username,
          level: sectionOrder[currentSection].key,
          score: correct,
          total_questions: questions.length,
          reading_time_taken: readingTimeTaken ? parseInt(readingTimeTaken, 10) : null,
          questions_time_taken: answeringTime,
          pre_test_answer: preTestAnswer 
        })
      });
      if (!res.ok) {
        console.error('Failed to save score:', await res.text());
        setValidationMessage('Failed to save score. Please try again.');
        return;
      }
    } catch (err) {
      console.error('Error saving score:', err);
      setValidationMessage('Error saving score. Please try again.');
      return;
    }
  
    setShowAnswers(true);
    const updated = [...testCompleted];
    updated[currentSection] = true;
    setTestCompleted(updated);
    setShowTest(false);

    // Auto-advance to next section if not the last one
    if (currentSection < 2) {
      // setTimeout(() => {
      //   handleNextSection();
      // }, 1500); // Give user a moment to see the completion message
    }
  };

  const handleNextSection = () => {
    window.scrollTo(0, 0);
    setCurrentSection(currentSection + 1);
    setShowTest(false);
    setShowPreTestQuestion(false); 
    setPreTestAnswer(''); 
    setTestResult('');
    setShowAnswers(false);
    setQuestions([]);
    setUserAnswers([]);
    setValidationMessage('');
  };

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <div className="no-select" style={{ minHeight: '100vh', background: '#fff' }}>
      <Header isLoggedIn={isLoggedIn} onLogout={onLogout} />
      <main className="reading-content" style={{ alignItems: 'center', justifyContent: 'center' }}>
        <div className="reading-card" style={{ maxWidth: 700, width: '100%', margin: '0 auto', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          <Typography variant="h5" sx={{ mb: 2 }} textAlign='center'>
            {subject.charAt(0).toUpperCase() + subject.slice(1)} Content - Section {currentSection + 1} of 3
          </Typography>
          
          {showPreTestQuestion && (
            <Box sx={{ mt: 3, width: '100%', maxWidth: 600 }}>
              <Card sx={{ p: 3 }}>
                <CardContent>
                  <FormControl component="fieldset" sx={{ width: '100%' }}>
                    <FormLabel component="legend" sx={{ mb: 2, fontWeight: 'bold', fontSize: '1.1rem' }}>
                      Have you read about this topic before?
                    </FormLabel>
                    <RadioGroup
                      value={preTestAnswer}
                      onChange={(e) => setPreTestAnswer(e.target.value)}
                    >
                      <FormControlLabel
                        value="Yes"
                        control={<Radio />}
                        label="Yes"
                        sx={{ mb: 1 }}
                      />
                      <FormControlLabel
                        value="No"
                        control={<Radio />}
                        label="No"
                        sx={{ mb: 1 }}
                      />
                    </RadioGroup>
                  </FormControl>
                  {validationMessage && (
                    <Typography color="error" sx={{ mt: 2 }}>
                      {validationMessage}
                    </Typography>
                  )}
                  <Button 
                    variant="contained" 
                    sx={{ mt: 3 }} 
                    onClick={handlePreTestSubmit}
                  >
                    Continue to Test
                  </Button>
                </CardContent>
              </Card>
            </Box>
          )}

          {!showTest && !showPreTestQuestion && (
            <>
              {!loadingContent && !testCompleted[currentSection] && (
                <Typography sx={{ mt: 1, fontStyle: 'italic', color: 'gray', textAlign: 'center' }}>
                  Read the passage thoroughly. You won't be allowed to read again while answering questions.
                </Typography>
              )}
              
              <Card sx={{ mt: 2, width: '100%', maxWidth: 600, textAlign: 'left' }}>
                <CardContent>
                  {loadingContent ? (
                    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: 120 }}>
                      <TailSpin color="#2980b9" height={40} width={40} />
                    </div>
                  ) : (
                    <>
                      {(() => {
                        const rawContent = content[currentSection];
                        const match = rawContent.match(/^##\s*(.+?)\s*\n/);
                        const title = match ? match[1] : '';
                        const body = match ? rawContent.slice(match[0].length) : rawContent;

                        return (
                          <>
                            {title && (
                              <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 2, textAlign: 'center' }}>
                                {title}
                              </Typography>
                            )}
                            <ReactMarkdown
                              components={{
                                h1: ({ node, ...props }) => <Typography variant="h4" gutterBottom {...props} className="no-select" />,
                                h2: ({ node, ...props }) => <Typography variant="h5" gutterBottom {...props} className="no-select" />,
                                p: ({ node, ...props }) => <Typography variant="body1" paragraph {...props} className="no-select" />,
                                strong: ({ node, ...props }) => <strong style={{ fontWeight: 600 }} {...props} className="no-select" />,
                                em: ({ node, ...props }) => <em style={{ fontStyle: 'italic' }} {...props} className="no-select" />,
                              }}
                            >
                              {body}
                            </ReactMarkdown>
                          </>
                        );
                      })()}
                    </>
                  )}
                </CardContent>
              </Card>

              {testCompleted[currentSection] && (
                <Box sx={{ mt: 3, textAlign: 'center' }}>
                  <Typography sx={{ color: 'green', mb: 2 }}>
                    ✓ Test completed for this section
                  </Typography>
                  {/* <Typography variant="body2" sx={{ color: 'gray' }}>
                    Score: {scores[currentSection]} / {questions.length || 'N/A'}
                  </Typography> */}
                </Box>
              )}

              {!testCompleted[currentSection] && !loadingContent && content[currentSection] && (
                <Button variant="contained" sx={{ mt: 3 }} onClick={handleStartTest}>
                  Take Test
                </Button>
              )}
            </>
          )}

          {showTest && !testCompleted[currentSection] && !loadingQuestions && questions.length > 0 && (
            <Box sx={{ mt: 3, width: '100%' }}>
              <form onSubmit={e => { e.preventDefault(); handleSubmitTest(); }}>
                {questions.map((q, idx) => (
                  <Box
                    key={idx}
                    sx={{
                      mb: 4,
                      p: 3,
                      background: '#fafafa',
                      borderRadius: 2,
                      boxShadow: 1,
                      width: '100%',
                      maxWidth: 600,
                      mx: 'auto'
                    }}
                  >
                    <FormControl component="fieldset" sx={{ width: '100%' }}>
                      <FormLabel
                        component="legend"
                        sx={{ mb: 2, fontWeight: 'bold', textAlign: 'left' }}
                      >
                        {q.question}
                      </FormLabel>
                      <RadioGroup
                        value={userAnswers[idx]}
                        onChange={e => handleAnswerChange(idx, e.target.value)}
                      >
                        {q.options.map((opt, oidx) => (
                          <FormControlLabel
                            key={oidx}
                            value={opt}
                            control={<Radio />}
                            label={opt}
                            disabled={showAnswers}
                            sx={{
                              alignItems: 'flex-start',
                              mb: 1,
                              '& .MuiFormControlLabel-label': {
                                textAlign: 'left',
                                width: '100%',
                                whiteSpace: 'normal'
                              }
                            }}
                          />
                        ))}
                      </RadioGroup>
                      {showAnswers && (
                        <Typography color={userAnswers[idx] === q.answer ? 'green' : 'red'} sx={{ mt: 1 }}>
                          Correct answer: {q.answer}
                        </Typography>
                      )}
                    </FormControl>
                  </Box>
                ))}
                {validationMessage && (
                  <Typography color="error" sx={{ mt: 2, textAlign: 'center' }}>
                    {validationMessage}
                  </Typography>
                )}
                <Box sx={{ textAlign: 'center' }}>
                  <Button type="submit" variant="contained" color="success" sx={{ mt: 2 }}>
                    Submit Test
                  </Button>
                </Box>
              </form>
            </Box>
          )}

          {testCompleted[currentSection] && currentSection < 2 && (
            <Button variant="contained" sx={{ mt: 3 }} onClick={handleNextSection}>
              Next Section
            </Button>
          )}

          {testCompleted[2] && (
            <>
              <Typography sx={{ mt: 3, color: 'blue', textAlign: 'center' }}>
                All sections completed!
              </Typography>
              <Button
                variant="contained"
                color="primary"
                sx={{ mt: 2 }}
                onClick={async () => {
                  const viewedOrder = sectionOrder.map(sec => sec.label).join(',');
                  const payload = {
                    username,
                    content_type: subject.charAt(0).toUpperCase() + subject.slice(1),
                    order: `${viewedOrder}`
                  };
                  try {
                    const res = await fetch(`${BASE_URL}/save-content-view-order`, {
                      method: 'POST',
                      headers: { 'Content-Type': 'application/json' },
                      body: JSON.stringify(payload)
                    });
                    if (res.ok) {
                      const levelToTitle = {};
                      const levelToScore = {};
                      sectionOrder.forEach((sec, idx) => {
                        const passage = content[idx];
                        const match = passage.match(/^##\s*(.*)/);
                        levelToTitle[sec.key] = match ? match[1] : `Untitled (${sec.label})`;
                        levelToScore[sec.key] = {
                          score: scores[idx],
                          totalQuestions: questions.length
                        };
                      });

                      navigate(`/self-assess/${subject}`, {
                        state: { 
                          levelToTitle,
                          passages: content,
                          scores: levelToScore
                        } 
                      });
                    } else {
                      alert('Failed to save order');
                    }
                  } catch (err) {
                    alert('Error while saving order');
                  }
                }}
              >
                Proceed to Self Assessment
              </Button>
            </>
          )}

          {!showTest && !showPreTestQuestion && (
            <Button variant="text" sx={{ mt: 4 }} onClick={() => navigate(`/dashboard/${username}`)}>
              Back to Dashboard
            </Button>
          )}
        </div>
      </main>
    </div>
  );
}

export default Content;