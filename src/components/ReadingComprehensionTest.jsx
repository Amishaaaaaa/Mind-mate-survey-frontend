// import { useState, useRef, useEffect } from 'react';
// import Header from './Header';
// import './Header.css';
// import './ReadingComprehensionTest.css';
// import { useNavigate } from 'react-router-dom';
// import { TailSpin } from "react-loader-spinner";
// import BASE_URL from '../config';

// const READING_TIME_LIMIT = 150; 
// const FEEDBACK_DELAY = 3000; 

// function ReadingComprehensionTest({ isLoggedIn, onLogout }) {
//   const navigate = useNavigate();
//   const [stage, setStage] = useState('instructions');
//   const [readingStart, setReadingStart] = useState(null);
//   const [readingEnd, setReadingEnd] = useState(null);
//   const [currentQ, setCurrentQ] = useState(-1);
//   const [answers, setAnswers] = useState([]);
//   const [questionTimes, setQuestionTimes] = useState([]);
//   const [questionStart, setQuestionStart] = useState(null);
//   const [passageViewCount, setPassageViewCount] = useState(0);
//   const [passageViewStartTime, setPassageViewStartTime] = useState(null);
//   const [passageViewsDuringQuestions, setPassageViewsDuringQuestions] = useState([]);
//   const [showPassageFromQuestion, setShowPassageFromQuestion] = useState(false);
//   const [timer, setTimer] = useState(READING_TIME_LIMIT);
//   const timerRef = useRef(null);
//   const [selectedIdx, setSelectedIdx] = useState(null);
//   const username = localStorage.getItem('username');
//   const [passage, setPassage] = useState('');
//   const [passageTitle, setPassageTitle] = useState('');
//   const [questions, setQuestions] = useState([]);
//   const [loading, setLoading] = useState(false);
//   const [priorKnowledge, setPriorKnowledge] = useState(null);

//   useEffect(() => {
//     if (stage === 'results') {
//       const email = localStorage.getItem('email');
//       fetch(`${BASE_URL}/comprehension-results`, {
//         method: 'POST',
//         headers: { 'Content-Type': 'application/json' },
//         body: JSON.stringify({
//           email,
//           passage_title: passageTitle,
//           passage: passage,
//           questions: questions,
//           user_answers: answers.slice(1),
//           passage_time_given: READING_TIME_LIMIT,
//           user_reading_time: parseFloat(readingTime),
//           num_questions: questions.length,
//           num_correct_answers: numCorrect,
//           passage_visited: passageViewCount,
//           question_times: questionTimes.slice(1),
//           passage_views_during_questions: passageViewsDuringQuestions,
//           prior_knowledge: priorKnowledge
//         })
//       }).catch((err) => console.error('Error sending comprehension results:', err));
//     }
//   }, [stage]);

//   const handleReadPassage = () => {
//     setLoading(true);
//     fetch(`${BASE_URL}/get-standard-passage`)
//       .then((res) => res.json())
//       .then((data) => {
//         setPassage(data.passage);
//         setPassageTitle(data.title);
//         setQuestions(data.questions);
//         setStage('reading');
//         setReadingStart(performance.now());
//         setTimer(READING_TIME_LIMIT);
//         timerRef.current = setInterval(() => {
//           setTimer((prev) => {
//             if (prev <= 1) {
//               clearInterval(timerRef.current);
//               setStage('questions');
//               setReadingEnd(performance.now());
//               setQuestionStart(performance.now());
//               return 0;
//             }
//             return prev - 1;
//           });
//         }, 1000);
//       })
//       .catch((err) => {
//         console.error('Error fetching passage/questions:', err);
//         setLoading(false);
//       })
//       .finally(() => setLoading(false));
//   };

//   const handleStartQuestions = () => {
//     setReadingEnd(performance.now());
//     setStage('questions');
//     setQuestionStart(performance.now());
//     clearInterval(timerRef.current);
//   };

//   const handleAnswer = (idx) => {
//     if (selectedIdx !== null) return;
//     const now = performance.now();
//     setAnswers([...answers, idx]);
//     setQuestionTimes([...questionTimes, (now - questionStart) / 1000]);
//     setSelectedIdx(idx);

//     if (currentQ === -1) {
//       setPriorKnowledge(idx === 0 ? 'yes' : 'no'); // 0 = yes, 1 = no
//     }

//     setTimeout(() => {
//       if (currentQ < questions.length - 1) {
//         setCurrentQ(currentQ + 1);
//         setQuestionStart(performance.now());
//         setSelectedIdx(null);
//       } else {
//         setStage('results');
//       }
//     }, FEEDBACK_DELAY);
//   };

//   const handleViewPassage = () => {
//     setStage('viewing-passage');
//     setPassageViewCount(passageViewCount + 1);
//     setPassageViewStartTime(performance.now());
//   };

//   const handleClosePassage = () => {
//     const now = performance.now();
//     const duration = (now - passageViewStartTime) / 1000;
//     setPassageViewsDuringQuestions([
//       ...passageViewsDuringQuestions,
//       { questionIndex: currentQ, duration: parseFloat(duration.toFixed(2)) }
//     ]);
//     setPassageViewStartTime(null);
//     setStage('questions');
//   };

//   const readingTime =
//     readingEnd && readingStart
//       ? ((readingEnd - readingStart) / 1000).toFixed(2)
//       : null;
//   const numCorrect =
//     answers.slice(1).filter((a, i) => a === questions[i]?.answer).length;

//   const getCurrentQuestionData = () => {
//     if (currentQ === -1) {
//       return {
//         question: "Have you read about this topic before?",
//         options: ["Yes", "No"],
//         answer: null // No correct answer for preliminary question
//       };
//     }
//     return questions[currentQ];
//   };

//   const currentQuestionData = getCurrentQuestionData();

//   return (
//     <div className="reading-container">
//       <Header isLoggedIn={isLoggedIn} onLogout={onLogout} />
//       <main className="reading-content">
//         <div className="reading-card">
//           {loading ? (
//             <div style={{ textAlign: 'center', margin: '32px 0' }}>
//               <TailSpin color="#2980b9" height={50} width={50} />
//             </div>
//           ) : (
//             <>
//               {stage === 'instructions' && (
//                 <>
//                   <h1>Reading Comprehension Test</h1>
//                   <h2>Instructions</h2>
//                   <ul className="reading-list">
//                     <li>
//                       You will be shown a passage to read. Read it carefully. You will have {READING_TIME_LIMIT} seconds to read the passage. This given time will be enough to read the entire passage at a normal pace.
//                     </li>
//                     <li>
//                       After reading, click "Start Questions" to begin answering questions about the passage. There will be 5 questions for you to answer, all related to the passage.
//                     </li>
//                     <li>
//                       Questions will appear one at a time. Try to answer them without referring back, but you may click "View Passage" if needed.
//                     </li>
//                     <li>
//                       The number of times you visit the passage in between shall be recorded. So visit only if you need to.
//                     </li>
//                     <li>
//                       Your reading time, time taken to answer each question, number of correct answers, and number of times you viewed the passage will be recorded.
//                     </li>
//                     <center>
//                       <b>All the best!</b>
//                     </center>
//                   </ul>
//                   <button
//                     className="start-button"
//                     style={{ fontSize: 18, marginTop: 16 }}
//                     onClick={handleReadPassage}
//                   >
//                     Read Passage
//                   </button>
//                 </>
//               )}
//               {stage === 'reading' && (
//                 <>
//                   <div
//                     style={{
//                       marginBottom: 12,
//                       display: 'flex',
//                       alignItems: 'center',
//                       justifyContent: 'space-between',
//                       width: '100%',
//                     }}
//                   >
//                     <h2 style={{ margin: 0, fontWeight: 700 }}>Passage</h2>
//                     <span style={{ fontWeight: 600, color: '#2980b9', fontSize: 18 }}>
//                       Time left: {timer}s
//                     </span>
//                   </div>
//                   <div
//                     style={{
//                       background: '#f5f5f5',
//                       padding: 20,
//                       borderRadius: 8,
//                       fontSize: 18,
//                       lineHeight: 1.6,
//                       maxWidth: 600,
//                       margin: '0 auto',
//                       textAlign: 'justify',
//                       whiteSpace: 'pre-wrap',
//                       wordWrap: 'break-word',
//                       overflowY: 'auto',
//                       maxHeight: '70vh'
//                     }} className="no-select"
//                   >
//                     <h3 style={{ marginTop: 0, marginBottom: 18, fontWeight: 700 }} >
//                       {passageTitle}
//                     </h3>
//                     {passage}
//                   </div>

//                   <button
//                     className="start-button"
//                     style={{ fontSize: 18, marginTop: 32 }}
//                     onClick={handleStartQuestions}
//                   >
//                     Start Questions
//                   </button>
//                 </>
//               )}
//               {stage === 'questions' && (
//                 <>
//                 <div 
//                   style={{ 
//                     display: 'flex', 
//                     justifyContent: 'flex-start', 
//                     marginBottom: 16,
//                     width: '100%'
//                   }}
//                 >
//                   <button
//                     className="next-test-button"
//                     style={{
//                       marginRight: 12,padding: '16px 16px',fontSize: 18,minWidth: 'auto',width: 'auto', marginTop: 30
//                      }}
//                     onClick={handleViewPassage}
//                     disabled={selectedIdx !== null}
//                   >
//                     View Passage
//                   </button>
//                 </div>
//                   <h2>
//                     Question {currentQ + 1} of {questions.length}
//                   </h2>
//                   <div style={{ fontSize: 20, margin: '24px 0' }}>
//                     {questions[currentQ]?.question}
//                   </div>
//                   <div style={{ marginBottom: 24 }}>
//                     {questions[currentQ]?.options.map((opt, idx) => {
//                       let btnStyle = {
//                         display: 'block',
//                         width: '100%',
//                         margin: '8px 0',
//                         fontSize: 18,
//                         transition: 'background 0.2s, color 0.2s',
//                         background: selectedIdx === null ? '#cfd8dc' : undefined,
//                       };
//                       if (selectedIdx !== null) {
//                         if (idx === questions[currentQ].answer) {
//                           btnStyle.background = '#4caf50';
//                           btnStyle.color = 'white';
//                         } else if (
//                           idx === selectedIdx &&
//                           selectedIdx !== questions[currentQ].answer
//                         ) {
//                           btnStyle.background = '#e74c3c';
//                           btnStyle.color = 'white';
//                         } else {
//                           btnStyle.opacity = 0.7;
//                         }
//                       }
//                       return (
//                         <button
//                           key={idx}
//                           className="start-button"
//                           style={btnStyle}
//                           onClick={() => handleAnswer(idx)}
//                           disabled={selectedIdx !== null}
//                         >
//                           {opt}
//                         </button>
//                       );
//                     })}
//                   </div>
//                 </>
//               )}
//               {stage === 'viewing-passage' && (
//                 <div
//                   style={{
//                     background: '#f5f5f5',
//                     padding: 20,
//                     borderRadius: 8,
//                     fontSize: 18,
//                     lineHeight: 1.6,
//                     margin: '0 auto',
//                     maxWidth: 600,
//                     minHeight: 300,
//                     display: 'flex',
//                     flexDirection: 'column',
//                     justifyContent: 'center',
//                     alignItems: 'center',
//                   }}
//                 >
//                   {passage}
//                   <button
//                     className="start-button"
//                     style={{ fontSize: 18, marginTop: 32 }}
//                     onClick={handleClosePassage}
//                   >
//                     Back to Question
//                   </button>
//                 </div>
//               )}
//               {stage === 'results' && (
//                 <div style={{ textAlign: 'center' }}>
//                   <h2>Test Complete!</h2>
//                   {/* <p>
//                     <b>Passage Reading Time:</b> {readingTime} seconds
//                   </p>
//                   <p>
//                     <b>Number of times passage viewed during questions:</b> {passageViewCount}
//                   </p> */}
//                   <p>
//                     <b>Number of correct answers:</b> {numCorrect} / {questions.length}
//                   </p>
//                   {/* <div style={{ margin: '24px 0', textAlign: 'left' }}>
//                     <b>Time taken for each question:</b>
//                     <ul>
//                       {questionTimes.map((t, i) => (
//                         <li key={i}>
//                           Question {i + 1}: {t.toFixed(2)} seconds
//                         </li>
//                       ))}
//                     </ul>
//                   </div> */}
//                   {/* {passageViewsDuringQuestions.length > 0 && (
//                     <div style={{ margin: '24px 0', textAlign: 'left' }}>
//                       <b>Passage views during questions:</b>
//                       <ul>
//                         {passageViewsDuringQuestions.map((view, i) => (
//                           <li key={i}>
//                             View during Question {view.questionIndex + 1}: {view.duration} seconds
//                           </li>
//                         ))}
//                       </ul>
//                     </div>
//                   )} */}
//                   <div style={{ display: 'flex', gap: '16px', justifyContent: 'center' }}>
//                     <button
//                       className="start-button"
//                       onClick={() => navigate(`/dashboard/${username}`)}
//                     >
//                       Back to Dashboard
//                     </button>
//                   </div>
//                 </div>
//               )}
//             </>
//           )}
//         </div>
//       </main>
//     </div>
//   );
// }

// export default ReadingComprehensionTest;


import { useState, useRef, useEffect } from 'react';
import Header from './Header';
import './Header.css';
import './ReadingComprehensionTest.css';
import { useNavigate } from 'react-router-dom';
import { TailSpin } from "react-loader-spinner";
import BASE_URL from '../config';

const READING_TIME_LIMIT = 150; 
const FEEDBACK_DELAY = 3000; 

function ReadingComprehensionTest({ isLoggedIn, onLogout }) {
  const navigate = useNavigate();
  const [stage, setStage] = useState('instructions');
  const [readingStart, setReadingStart] = useState(null);
  const [readingEnd, setReadingEnd] = useState(null);
  const [currentQ, setCurrentQ] = useState(-1); // Changed: Start at -1 for preliminary question
  const [answers, setAnswers] = useState([]);
  const [questionTimes, setQuestionTimes] = useState([]);
  const [questionStart, setQuestionStart] = useState(null);
  const [passageViewCount, setPassageViewCount] = useState(0);
  const [passageViewStartTime, setPassageViewStartTime] = useState(null);
  const [passageViewsDuringQuestions, setPassageViewsDuringQuestions] = useState([]);
  const [showPassageFromQuestion, setShowPassageFromQuestion] = useState(false);
  const [timer, setTimer] = useState(READING_TIME_LIMIT);
  const timerRef = useRef(null);
  const [selectedIdx, setSelectedIdx] = useState(null);
  const username = localStorage.getItem('username');
  const [passage, setPassage] = useState('');
  const [passageTitle, setPassageTitle] = useState('');
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [priorKnowledge, setPriorKnowledge] = useState(null); // New state for preliminary question

  useEffect(() => {
    if (stage === 'results') {
      const email = localStorage.getItem('email');
      fetch(`${BASE_URL}/comprehension-results`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email,
          passage_title: passageTitle,
          passage: passage,
          questions: questions,
          user_answers: answers.slice(1), // Exclude the preliminary question answer
          passage_time_given: READING_TIME_LIMIT,
          user_reading_time: parseFloat(readingTime),
          num_questions: questions.length,
          num_correct_answers: numCorrect,
          passage_visited: passageViewCount,
          question_times: questionTimes.slice(1), // Exclude the preliminary question time
          passage_views_during_questions: passageViewsDuringQuestions,
          prior_knowledge: priorKnowledge // New field for preliminary question
        })
      }).catch((err) => console.error('Error sending comprehension results:', err));
    }
  }, [stage]);

  const handleReadPassage = () => {
    setLoading(true);
    fetch(`${BASE_URL}/get-standard-passage`)
      .then((res) => res.json())
      .then((data) => {
        setPassage(data.passage);
        setPassageTitle(data.title);
        setQuestions(data.questions);
        setStage('reading');
        setReadingStart(performance.now());
        setTimer(READING_TIME_LIMIT);
        timerRef.current = setInterval(() => {
          setTimer((prev) => {
            if (prev <= 1) {
              clearInterval(timerRef.current);
              setStage('questions');
              setReadingEnd(performance.now());
              setQuestionStart(performance.now());
              return 0;
            }
            return prev - 1;
          });
        }, 1000);
      })
      .catch((err) => {
        console.error('Error fetching passage/questions:', err);
        setLoading(false);
      })
      .finally(() => setLoading(false));
  };

  const handleStartQuestions = () => {
    setReadingEnd(performance.now());
    setStage('questions');
    setQuestionStart(performance.now());
    clearInterval(timerRef.current);
  };

  const handleAnswer = (idx) => {
    if (selectedIdx !== null) return;
    const now = performance.now();
    setAnswers([...answers, idx]);
    setQuestionTimes([...questionTimes, (now - questionStart) / 1000]);
    setSelectedIdx(idx);
    
    // Handle preliminary question
    if (currentQ === -1) {
      setPriorKnowledge(idx === 0 ? 'yes' : 'no'); // 0 = yes, 1 = no
    }
    
    setTimeout(() => {
      if (currentQ < questions.length - 1) {
        setCurrentQ(currentQ + 1);
        setQuestionStart(performance.now());
        setSelectedIdx(null);
      } else {
        setStage('results');
      }
    }, FEEDBACK_DELAY);
  };

  const handleViewPassage = () => {
    setStage('viewing-passage');
    setPassageViewCount(passageViewCount + 1);
    setPassageViewStartTime(performance.now());
  };

  const handleClosePassage = () => {
    const now = performance.now();
    const duration = (now - passageViewStartTime) / 1000;
    setPassageViewsDuringQuestions([
      ...passageViewsDuringQuestions,
      { questionIndex: currentQ, duration: parseFloat(duration.toFixed(2)) }
    ]);
    setPassageViewStartTime(null);
    setStage('questions');
  };

  const readingTime =
    readingEnd && readingStart
      ? ((readingEnd - readingStart) / 1000).toFixed(2)
      : null;
  const numCorrect =
    answers.slice(1).filter((a, i) => a === questions[i]?.answer).length; // Exclude preliminary question from scoring

  // Get current question data (preliminary or regular question)
  const getCurrentQuestionData = () => {
    if (currentQ === -1) {
      return {
        question: "Have you read about this topic before?",
        options: ["Yes", "No"],
        answer: null // No correct answer for preliminary question
      };
    }
    return questions[currentQ];
  };

  const currentQuestionData = getCurrentQuestionData();

  return (
    <div className="reading-container">
      <Header isLoggedIn={isLoggedIn} onLogout={onLogout} />
      <main className="reading-content">
        <div className="reading-card">
          {loading ? (
            <div style={{ textAlign: 'center', margin: '32px 0' }}>
              <TailSpin color="#2980b9" height={50} width={50} />
            </div>
          ) : (
            <>
              {stage === 'instructions' && (
                <>
                  <h1>Reading Comprehension Test</h1>
                  <h2>Instructions</h2>
                  <ul className="reading-list">
                    <li>
                      You will be shown a passage to read. Read it carefully. You will have <strong>{READING_TIME_LIMIT} seconds</strong> to read the passage. This given time will be enough to read the entire passage at a normal pace.
                    </li>
                    <li>
                      After reading, click <strong>"Start Questions"</strong> to begin answering questions about the passage. There will be <strong>6 questions</strong> for you to answer (1 preliminary question + 5 questions related to the passage).
                    </li>
                    <li>
                      Questions will appear one at a time. Try to answer them without referring back, but you may click <strong>"View Passage" if needed</strong>.
                    </li>
                    <li>
                      The number of times you visit the passage in between shall be recorded. So visit only if you need to.
                    </li>
                    <li>
                      Your reading time, time taken to answer each question, number of correct answers, and number of times you viewed the passage will be recorded.
                    </li>
                    <center>
                      <b>All the best!</b>
                    </center>
                  </ul>
                  <button
                    className="start-button"
                    style={{ fontSize: 18, marginTop: 16 }}
                    onClick={handleReadPassage}
                  >
                    Read Passage
                  </button>
                </>
              )}
              {stage === 'reading' && (
                <>
                  <div
                    style={{
                      marginBottom: 12,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      width: '100%',
                    }}
                  >
                    <h2 style={{ margin: 0, fontWeight: 700 }}>Passage</h2>
                    <span style={{ fontWeight: 600, color: '#2980b9', fontSize: 18 }}>
                      Time left: {timer}s
                    </span>
                  </div>
                  <div
                    style={{
                      background: '#f5f5f5',
                      padding: 20,
                      borderRadius: 8,
                      fontSize: 18,
                      lineHeight: 1.6,
                      maxWidth: 600,
                      margin: '0 auto',
                      textAlign: 'justify',
                      whiteSpace: 'pre-wrap',
                      wordWrap: 'break-word',
                      overflowY: 'auto',
                      maxHeight: '70vh'
                    }} className="no-select"
                  >
                    <h3 style={{ marginTop: 0, marginBottom: 18, fontWeight: 700 }} >
                      {passageTitle}
                    </h3>
                    {passage}
                  </div>

                  <button
                    className="start-button"
                    style={{ fontSize: 18, marginTop: 32 }}
                    onClick={handleStartQuestions}
                  >
                    Start Questions
                  </button>
                </>
              )}
              {stage === 'questions' && (
                <>
                {/* Hide View Passage button for preliminary question */}
                {currentQ >= 0 && (
                  <div 
                    style={{ 
                      display: 'flex', 
                      justifyContent: 'flex-start', 
                      marginBottom: 16,
                      width: '100%'
                    }}
                  >
                    <button
                      className="next-test-button"
                      style={{
                        marginRight: 12,padding: '16px 16px',fontSize: 18,minWidth: 'auto',width: 'auto', marginTop: 30
                       }}
                      onClick={handleViewPassage}
                      disabled={selectedIdx !== null}
                    >
                      View Passage
                    </button>
                  </div>
                )}
                  <h2>
                    {currentQ === -1 
                      ? "Preliminary Question" 
                      : `Question ${currentQ + 1} of ${questions.length}`}
                  </h2>
                  <div style={{ fontSize: 20, margin: '24px 0' }}>
                    {currentQuestionData?.question}
                  </div>
                  <div style={{ marginBottom: 24 }}>
                    {currentQuestionData?.options.map((opt, idx) => {
                      let btnStyle = {
                        display: 'block',
                        width: '100%',
                        margin: '8px 0',
                        fontSize: 18,
                        transition: 'background 0.2s, color 0.2s',
                        background: selectedIdx === null ? '#cfd8dc' : undefined,
                      };
                      
                      // Only show correct/incorrect feedback for regular questions, not preliminary
                      if (selectedIdx !== null && currentQ >= 0) {
                        if (idx === questions[currentQ].answer) {
                          btnStyle.background = '#4caf50';
                          btnStyle.color = 'white';
                        } else if (
                          idx === selectedIdx &&
                          selectedIdx !== questions[currentQ].answer
                        ) {
                          btnStyle.background = '#e74c3c';
                          btnStyle.color = 'white';
                        } else {
                          btnStyle.opacity = 0.7;
                        }
                      } else if (selectedIdx !== null && currentQ === -1) {
                        // For preliminary question, just highlight selected answer
                        if (idx === selectedIdx) {
                          btnStyle.background = '#2980b9';
                          btnStyle.color = 'white';
                        } else {
                          btnStyle.opacity = 0.7;
                        }
                      }
                      
                      return (
                        <button
                          key={idx}
                          className="start-button"
                          style={btnStyle}
                          onClick={() => handleAnswer(idx)}
                          disabled={selectedIdx !== null}
                        >
                          {opt}
                        </button>
                      );
                    })}
                  </div>
                </>
              )}
              {stage === 'viewing-passage' && (
                <div
                  style={{
                    background: '#f5f5f5',
                    padding: 20,
                    borderRadius: 8,
                    fontSize: 18,
                    lineHeight: 1.6,
                    margin: '0 auto',
                    maxWidth: 600,
                    minHeight: 300,
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'center',
                    alignItems: 'center',
                  }}
                >
                  {passage}
                  <button
                    className="start-button"
                    style={{ fontSize: 18, marginTop: 32 }}
                    onClick={handleClosePassage}
                  >
                    Back to Question
                  </button>
                </div>
              )}
              {stage === 'results' && (
                <div style={{ textAlign: 'center' }}>
                  <h2>Test Complete!</h2>
                  {/* <p>
                    <b>Passage Reading Time:</b> {readingTime} seconds
                  </p>
                  <p>
                    <b>Number of times passage viewed during questions:</b> {passageViewCount}
                  </p> */}
                  <p>
                    <b>Number of correct answers:</b> {numCorrect} / {questions.length}
                  </p>
                  {/* <div style={{ margin: '24px 0', textAlign: 'left' }}>
                    <b>Time taken for each question:</b>
                    <ul>
                      {questionTimes.map((t, i) => (
                        <li key={i}>
                          Question {i + 1}: {t.toFixed(2)} seconds
                        </li>
                      ))}
                    </ul>
                  </div> */}
                  {/* {passageViewsDuringQuestions.length > 0 && (
                    <div style={{ margin: '24px 0', textAlign: 'left' }}>
                      <b>Passage views during questions:</b>
                      <ul>
                        {passageViewsDuringQuestions.map((view, i) => (
                          <li key={i}>
                            View during Question {view.questionIndex + 1}: {view.duration} seconds
                          </li>
                        ))}
                      </ul>
                    </div>
                  )} */}
                  <div style={{ display: 'flex', gap: '16px', justifyContent: 'center' }}>
                    <button
                      className="start-button"
                      onClick={() => navigate(`/dashboard/${username}`)}
                    >
                      Back to Dashboard
                    </button>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </main>
    </div>
  );
}

export default ReadingComprehensionTest;