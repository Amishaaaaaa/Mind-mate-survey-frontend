// import { useState, useEffect, useRef } from 'react';
// import Header from './Header';
// import './Header.css';
// import './StroopTest.css';
// import { useNavigate } from 'react-router-dom';
// import BASE_URL from '../config';

// const TEST_DURATIONS = {
//   1: 30,
//   2: 30,
//   3: 90
// };
// const FEEDBACK_DURATION = 1000;

// const words = ["RED", "GREEN", "BLUE", "YELLOW"];
// const colors = ["red", "green", "blue", "yellow"];
// const keyToColor = {
//   "KeyR": "red",
//   "KeyG": "green",
//   "KeyB": "blue",
//   "KeyY": "yellow"
// };
// const colorToWord = {
//   "red": "RED",
//   "green": "GREEN",
//   "blue": "BLUE",
//   "yellow": "YELLOW"
// };

// function StroopTest({ isLoggedIn, onLogout }) {
//   const navigate = useNavigate();
//   const [currentTest, setCurrentTest] = useState(1);
//   const [currentTrial, setCurrentTrial] = useState(0);
//   const [correctItems, setCorrectItems] = useState(0);
//   const [totalItems, setTotalItems] = useState(0);
//   const [timeLeft, setTimeLeft] = useState(TEST_DURATIONS);
//   const [currentWord, setCurrentWord] = useState('');
//   const [currentColor, setCurrentColor] = useState('');
//   const [isCongruent, setIsCongruent] = useState(false);
//   const [feedback, setFeedback] = useState('');
//   const [showStats, setShowStats] = useState(false);
//   const [intermediateScore, setIntermediateScore] = useState(null);
//   const [showIntermediateScore, setShowIntermediateScore] = useState(false);
//   const [showFinalResults, setShowFinalResults] = useState(false);
//   const [finalResults, setFinalResults] = useState(null);
//   const [testResults, setTestResults] = useState({
//     word: { correct: 0, total: 0, time: 0 },
//     color: { correct: 0, total: 0, time: 0 },
//     colorWord: { congruent: { correct: 0, total: 0, time: 0 },
//       incongruent: { correct: 0, total: 0, time: 0 }
//     }
//   });
//   const [responseTimes, setResponseTimes] = useState([[], [], { congruent: [], incongruent: [] }]);

//   const timerIntervalRef = useRef(null);
//   const startTimeRef = useRef(0);
//   const correctItemsRef = useRef(0);
//   const totalItemsRef = useRef(0);
//   const responseTimesRef = useRef([[], [], { congruent: [], incongruent: [] }]);
//   const congruentStatsRef = useRef({ correct: 0, total: 0 });
//   const incongruentStatsRef = useRef({ correct: 0, total: 0 });
//   const username = localStorage.getItem('username');
  
//   const getRandomItem = (arr) => arr[Math.floor(Math.random() * arr.length)];

//   const showStimulus = () => {
//     let newWord = '';
//     let newColor = '';
//     let congruent = false;
//     if (currentTest === 1) {
//       newWord = getRandomItem(words);
//       newColor = 'black';
//     } else if (currentTest === 2) {
//       newWord = '■■■';
//       newColor = getRandomItem(colors);
//     } else if (currentTest === 3) {
//       newWord = getRandomItem(words);

//       // Decide randomly if this trial should be congruent or incongruent
//       const makeCongruent = Math.random() < 0.5; // 50% chance

//       if (makeCongruent) {
//         // Congruent: color matches the word
//         newColor = newWord.toLowerCase();
//       } else {
//         // Incongruent: pick a color that doesn’t match
//         do {
//           newColor = getRandomItem(colors);
//         } while (newColor === newWord.toLowerCase());
//       }
//     }
//     setCurrentWord(newWord);
//     setCurrentColor(newColor);
//     setIsCongruent(congruent);
//     startTimeRef.current = performance.now();
//   };

//   const startTest = () => {
//     if (currentTrial > 0) return;
//     setShowStats(true);
//     setCurrentTrial(1);
//     setCorrectItems(0);
//     setTotalItems(0);
//     correctItemsRef.current = 0;
//     totalItemsRef.current = 0;

//     const duration = TEST_DURATIONS[currentTest];
//     setTimeLeft(duration);

//     setFeedback('');
//     setIntermediateScore(null);
//     setShowIntermediateScore(false);
//     setShowFinalResults(false);
//     setFinalResults(null);
//     responseTimesRef.current[currentTest - 1] = [];
//     setResponseTimes((prev) => {
//       const newArr = [...prev];
//       newArr[currentTest - 1] = [];
//       return newArr;
//     });
//     showStimulus();
    
//     timerIntervalRef.current = setInterval(() => {
//       setTimeLeft((prev) => {
//         if (prev <= 1) {
//           clearInterval(timerIntervalRef.current);
//           endTest();
//           return 0;
//         }
//         return prev - 1;
//       });
//     }, 1000);
//   };

//   const endTest = () => {
//     clearInterval(timerIntervalRef.current);
//     setShowStats(false);
//     const rts = responseTimesRef.current[currentTest - 1];
//     const avgRT = rts.length > 0 ? (rts.reduce((a, b) => a + b, 0) / rts.length) / 1000 : 0;
//     const testName = currentTest === 1 ? 'word' : currentTest === 2 ? 'color' : 'colorWord';
//     setTestResults((prev) => ({
//       ...prev,
//       [testName]: {
//         correct: correctItemsRef.current,
//         total: totalItemsRef.current,
//         time: avgRT
//       }
//     }));
//     setIntermediateScore({
//       testName,
//       correct: correctItemsRef.current,
//       total: totalItemsRef.current,
//       avgRT
//     });
//     setShowIntermediateScore(true);
//   };

//   const proceedToNextTest = () => {
//     setShowIntermediateScore(false);
//     setShowStats(false);
//     if (currentTest < 3) {
//       setCurrentTest(currentTest + 1);
//       setCurrentTrial(0);
//       setCurrentWord('');
//       setCurrentColor('');
//       setFeedback('');
//     }
//   };

//   const updateStroopResultsInBackend = async (email, correctItems, avgRT) => {
//     try {
//       const response = await fetch(`${BASE_URL}/update-stroop-results`, {
//         method: 'POST',
//         headers: {
//           'Content-Type': 'application/json',
//         },
//         body: JSON.stringify({
//           email,
//           stroop_score_correct_items: correctItems,
//           stroop_avg_rt: avgRT
//         })
//       });
  
//       if (!response.ok) {
//         const errorData = await response.json();
//         console.error("Failed to update stroop results:", errorData.detail);
//       } else {
//         const data = await response.json();
//         console.log("Stroop results update:", data.message);
//       }
//     } catch (error) {
//       console.error("Error updating stroop results:", error);
//     }
//   };
  
//   const calculateFinalResults = () => {
//     const { word, color, colorWord } = testResults;
//     const W = word.correct;
//     const C = color.correct;
//     const CW = colorWord.correct;
//     const WT = word.time;
//     const CT = color.time;
//     const CWT = colorWord.time;
//     const Pcw = (W * C) / (W + C);
//     const IG = CW - Pcw;
//     const Pcwt = ((WT + CT) / 2);
//     const TI = CWT - Pcwt;
//     const wordAcc = word.total > 0 ? (word.correct / word.total) * 100 : 0;
//     const colorAcc = color.total > 0 ? (color.correct / color.total) * 100 : 0;
//     const colorWordAcc = colorWord.total > 0 ? (colorWord.correct / colorWord.total) * 100 : 0;
//     setFinalResults({
//       word: { score: W, rt: WT, acc: wordAcc },
//       color: { score: C, rt: CT, acc: colorAcc },
//       colorWord: { score: CW, rt: CWT, acc: colorWordAcc }
//     });
//     setShowFinalResults(true);
//     setShowIntermediateScore(false);

//     const correctItems = {
//       color: testResults.color.correct,
//       word: testResults.word.correct,
//       color_word: testResults.colorWord.correct
//     };
//     const avgRT = {
//       color: testResults.color.time,
//       word: testResults.word.time,
//       color_word: testResults.colorWord.time
//     };
//     const userEmail = localStorage.getItem("email");
//     if (userEmail) {
//       updateStroopResultsInBackend(userEmail, correctItems, avgRT);
//     } else {
//       console.warn("User email not found. Cannot update stroop results.");
//     }
    
//   };

//   useEffect(() => {
//     const handleKeyPress = (event) => {
//       if (["KeyR", "KeyG", "KeyB", "KeyY"].includes(event.code) && currentTrial > 0 && timeLeft > 0) {
//         const rt = performance.now() - startTimeRef.current;
//         const chosenColor = keyToColor[event.code];
//         let isCorrect = false;
//         let correctAnswer = '';
//         if (currentTest === 1) {
//           correctAnswer = currentWord.toLowerCase();
//           isCorrect = chosenColor === correctAnswer;
//         } else {
//           correctAnswer = currentColor;
//           isCorrect = chosenColor === correctAnswer;
//         }
//         setTotalItems((prev) => {
//           totalItemsRef.current = prev + 1;
//           return prev + 1;
//         });
//         setCorrectItems((prev) => {
//           const newVal = isCorrect ? prev + 1 : prev;
//           correctItemsRef.current = newVal;
//           return newVal;
//         });
//         setResponseTimes((prev) => {
//           const newArr = [...prev];
//           newArr[currentTest - 1] = [...newArr[currentTest - 1], rt];
//           responseTimesRef.current = newArr;
//           return newArr;
//         });
//         setFeedback(isCorrect ? <span className="correct">Correct!</span> : <span className="wrong">Wrong! It was {colorToWord[correctAnswer]}</span>);
//         setTimeout(() => {
//           setFeedback('');
//           setCurrentWord('');
//           setCurrentColor('');  
//           setTimeout(() => {
//             showStimulus();
//           }, 100)
//         }, FEEDBACK_DURATION);
//       }
//     };
//     window.addEventListener('keydown', handleKeyPress);
//     return () => window.removeEventListener('keydown', handleKeyPress);

//   }, [currentTest, currentTrial, timeLeft, currentWord, currentColor]);

//   return (
//     <div className="stroop-container">
//       <Header isLoggedIn={isLoggedIn} onLogout={onLogout} />
//       <main className="stroop-content">
//         <div id="game-container">
//           <h1>Stroop Test</h1>
//           <div id="progress">Test {currentTest} of 3</div>

//           {/* Test 1: Word Reading */}
//           <div id="word-test" className={`test-section${currentTest === 1 ? ' active' : ''}`}>
//             {currentTrial === 0 && !showIntermediateScore && !showFinalResults && (
//               <div className="instructions-container">
//                 <div className="instructions-title">Test 1: Word Reading</div>
//                 <div className="instructions-text">
//                   In this test, you will see color words printed in black ink.<br />
//                   Your task is to read the word as quickly as possible.<br />
//                   Use the following keys to respond:<br />
//                   R = RED, G = GREEN, B = BLUE, Y = YELLOW
//                 </div>
//                 <div className="instructions-example">
//                   Example: <span style={{ color: 'black' }}>RED</span> → Press R
//                 </div>
//                 <div className="instructions-text">
//                   You will have {TEST_DURATIONS[1]} seconds to complete as many items as possible.<br />
//                   Try to be both fast and accurate!
//                 </div>
//                 <button className="start-button" onClick={startTest}>Start Test</button>
//               </div>
//             )}
//             {currentTrial > 0 && !showIntermediateScore && !showFinalResults && (
//               <>
//                 <div className="stroop-stats-row" style={{ display: showStats ? 'flex' : 'none' }}>
//                   <div className="stat" id="timer">Time: {timeLeft}s</div>
//                   <div className="stat" id="score">Items: {correctItems}</div>
//                 </div>
//                 <div id="stimulus" style={{ color: currentColor }}>{currentWord}</div>
//                 <div id="feedback">{feedback}</div>
//               </>
//             )}
//           </div>

//           {/* Test 2: Color Naming */}
//           <div id="color-test" className={`test-section${currentTest === 2 ? ' active' : ''}`}>
//             {currentTrial === 0 && !showIntermediateScore && !showFinalResults && (
//               <div className="instructions-container">
//                 <div className="instructions-title">Test 2: Color Naming</div>
//                 <div className="instructions-text">
//                   In this test, you will see colored patches.<br />
//                   Your task is to name the color of the patch as quickly as possible.<br />
//                   Use the following keys to respond:<br />
//                   R = RED, G = GREEN, B = BLUE, Y = YELLOW
//                 </div>
//                 <div className="instructions-example">
//                   Example: <span style={{ color: 'red' }}>■■■</span> → Press R
//                 </div>
//                 <div className="instructions-text">
//                   You will have {TEST_DURATIONS[2]} seconds to complete as many items as possible.<br />
//                   Try to be both fast and accurate!
//                 </div>
//                 <button className="start-button" onClick={startTest}>Start Test</button>
//               </div>
//             )}
//             {currentTrial > 0 && !showIntermediateScore && !showFinalResults && (
//               <>
//                 <div className="stroop-stats-row" style={{ display: showStats ? 'flex' : 'none' }}>
//                   <div className="stat" id="timer">Time: {timeLeft}s</div>
//                   <div className="stat" id="score">Items: {correctItems}</div>
//                 </div>
//                 <div id="stimulus" style={{ color: currentColor }}>{currentWord}</div>
//                 <div id="feedback">{feedback}</div>
//               </>
//             )}
//           </div>

//           {/* Test 3: Color-Word */}
//           <div id="color-word-test" className={`test-section${currentTest === 3 ? ' active' : ''}`}>
//             {currentTrial === 0 && !showIntermediateScore && !showFinalResults && (
//               <div className="instructions-container">
//                 <div className="instructions-title">Test 3: Color-Word</div>
//                 <div className="instructions-text">
//                   In this test, you will see color words printed in different colored ink.<br />
//                   Your task is to name the COLOR of the ink, NOT the word.<br />
//                   Use the following keys to respond:<br />
//                   R = RED, G = GREEN, B = BLUE, Y = YELLOW
//                 </div>
//                 <div className="instructions-example">
//                   Example: <span style={{ color: 'green' }}>RED</span> → Press G (because the ink is green)
//                 </div>
//                 <div className="instructions-text">
//                   This is the most challenging part of the test.<br />
//                   You will have {TEST_DURATIONS[3]} seconds to complete as many items as possible.<br />
//                   Remember: Name the COLOR of the ink, not the word!
//                 </div>
//                 <button className="start-button" onClick={startTest}>Start Test</button>
//               </div>
//             )}
//             {currentTrial > 0 && !showIntermediateScore && !showFinalResults && (
//               <>
//                 <div className="stroop-stats-row" style={{ display: showStats ? 'flex' : 'none' }}>
//                   <div className="stat" id="timer">Time: {timeLeft}s</div>
//                   <div className="stat" id="score">Items: {correctItems}</div>
//                 </div>
//                 <div id="stimulus" style={{ color: currentColor }}>{currentWord}</div>
//                 <div id="feedback">{feedback}</div>
//               </>
//             )}
//           </div>

//           {/* Intermediate Score */}
//           <div id="intermediate-score" className={`intermediate-score${showIntermediateScore ? ' show' : ''}`}>
//             {showIntermediateScore && intermediateScore && (
//               <>
//                 <h3>{intermediateScore.testName === 'word' ? 'Word Reading' : intermediateScore.testName === 'color' ? 'Color Naming' : 'Color-Word'} Test Complete!</h3>
//                 <p>Correct Items: {intermediateScore.correct}</p>
//                 <p>Total Items: {intermediateScore.total}</p>
//                 <p>Accuracy: {intermediateScore.total > 0 ? ((intermediateScore.correct/intermediateScore.total) * 100).toFixed(1) : '0.0'}%</p>
//                 <p>Avg. Reaction Time: {intermediateScore.avgRT.toFixed(2)}s</p>
//                 <button className="next-test-button" onClick={currentTest === 3 ? calculateFinalResults : proceedToNextTest}>
//                   {currentTest === 3 ? 'View Final Results' : 'Start Next Test'}
//                 </button>
//               </>
//             )}
//           </div>

//           {/* Final Results */}
//           <div id="final-results" className={`final-results${showFinalResults ? '' : ' hidden'}`} style={{ display: showFinalResults ? 'block' : 'none', textAlign: 'left' }}>
//             {showFinalResults && finalResults && (
//               <>
//                 <div style={{ textAlign: 'center', fontWeight: 'bold', fontSize: 32, marginBottom: '16px' }}>
//                   Test Complete!
//                 </div>
//                 <div style={{ marginLeft: '50px'}}>
//                 <div className="result-stat"><b>Word Reading: </b> <b>Correct: </b><span className="result-sub">{finalResults.word.score} items, <b>Avg RT:</b> {finalResults.word.rt.toFixed(2)}s, <b>Accuracy:</b> {finalResults.word.acc.toFixed(1)}%</span></div>
//                 <div className="result-stat"><b>Color Naming: </b> <b>Correct: </b><span className="result-sub">{finalResults.color.score} items, <b>Avg RT:</b> {finalResults.color.rt.toFixed(2)}s, <b>Accuracy:</b> {finalResults.color.acc.toFixed(1)}%</span></div>
//                 <div className="result-stat"><b>Color-Word: </b> <b>Correct: </b><span className="result-sub">{finalResults.colorWord.score} items, <b>Avg RT:</b> {finalResults.colorWord.rt.toFixed(2)}s, <b>Accuracy:</b> {finalResults.colorWord.acc.toFixed(1)}%</span></div>
//                 </div>
//                 <div style={{ display: 'flex', gap: '16px', justifyContent: 'center', marginTop: '24px' }}>
//                   <button className="start-button" onClick={() => navigate(`/dashboard/${username}`)}>
//                     Back to Dashboard
//                   </button>
//                 </div>
//               </>
//             )}
//           </div>
//         </div>
//       </main>
//     </div>
//   );
// }

// export default StroopTest; 

// **************************************************************************************


// import { useState, useEffect, useRef } from 'react';
// import Header from './Header';
// import './Header.css';
// import './StroopTest.css';
// import { useNavigate } from 'react-router-dom';
// import BASE_URL from '../config';

// const TEST_DURATIONS = {
//   1: 30,
//   2: 30,
//   3: 90
// };
// const FEEDBACK_DURATION = 1000;

// const words = ["RED", "GREEN", "BLUE", "YELLOW"];
// const colors = ["red", "green", "blue", "yellow"];
// const keyToColor = {
//   "KeyR": "red",
//   "KeyG": "green",
//   "KeyB": "blue",
//   "KeyY": "yellow"
// };
// const colorToWord = {
//   "red": "RED",
//   "green": "GREEN",
//   "blue": "BLUE",
//   "yellow": "YELLOW"
// };

// function StroopTest({ isLoggedIn, onLogout }) {
//   const navigate = useNavigate();
//   const [currentTest, setCurrentTest] = useState(1);
//   const [currentTrial, setCurrentTrial] = useState(0);
//   const [correctItems, setCorrectItems] = useState(0);
//   const [totalItems, setTotalItems] = useState(0);
//   const [timeLeft, setTimeLeft] = useState(TEST_DURATIONS);
//   const [currentWord, setCurrentWord] = useState('');
//   const [currentColor, setCurrentColor] = useState('');
//   const [isCongruent, setIsCongruent] = useState(false);
//   const [feedback, setFeedback] = useState('');
//   const [showStats, setShowStats] = useState(false);
//   const [intermediateScore, setIntermediateScore] = useState(null);
//   const [showIntermediateScore, setShowIntermediateScore] = useState(false);
//   const [showFinalResults, setShowFinalResults] = useState(false);
//   const [finalResults, setFinalResults] = useState(null);
//   const [testResults, setTestResults] = useState({
//     word: { correct: 0, total: 0, time: 0 },
//     color: { correct: 0, total: 0, time: 0 },
//     colorWord: { 
//       congruent: { correct: 0, total: 0, time: 0 },
//       incongruent: { correct: 0, total: 0, time: 0 }
//     }
//   });
//   const [responseTimes, setResponseTimes] = useState([[], [], { congruent: [], incongruent: [] }]);

//   const timerIntervalRef = useRef(null);
//   const startTimeRef = useRef(0);
//   const correctItemsRef = useRef(0);
//   const totalItemsRef = useRef(0);
//   const responseTimesRef = useRef([[], [], { congruent: [], incongruent: [] }]);
  
//   const congruentStatsRef = useRef({ correct: 0, total: 0 });
//   const incongruentStatsRef = useRef({ correct: 0, total: 0 });
  
//   const username = localStorage.getItem('username');
  
//   const getRandomItem = (arr) => arr[Math.floor(Math.random() * arr.length)];

//   const showStimulus = () => {
//     let newWord = '';
//     let newColor = '';
//     let congruent = false;
    
//     if (currentTest === 1) {
//       newWord = getRandomItem(words);
//       newColor = 'black';
//     } else if (currentTest === 2) {
//       newWord = '■■■';
//       newColor = getRandomItem(colors);
//     } else if (currentTest === 3) {
//       newWord = getRandomItem(words);

//       const makeCongruent = Math.random() < 0.5;
//       congruent = makeCongruent;

//       if (makeCongruent) {
//         newColor = newWord.toLowerCase();
//       } else {
//         do {
//           newColor = getRandomItem(colors);
//         } while (newColor === newWord.toLowerCase());
//       }
//     }
    
//     setCurrentWord(newWord);
//     setCurrentColor(newColor);
//     setIsCongruent(congruent);
//     startTimeRef.current = performance.now();
//   };

//   const startTest = () => {
//     if (currentTrial > 0) return;
//     setShowStats(true);
//     setCurrentTrial(1);
//     setCorrectItems(0);
//     setTotalItems(0);
//     correctItemsRef.current = 0;
//     totalItemsRef.current = 0;
    
//     congruentStatsRef.current = { correct: 0, total: 0 };
//     incongruentStatsRef.current = { correct: 0, total: 0 };

//     const duration = TEST_DURATIONS[currentTest];
//     setTimeLeft(duration);

//     setFeedback('');
//     setIntermediateScore(null);
//     setShowIntermediateScore(false);
//     setShowFinalResults(false);
//     setFinalResults(null);
    
//     if (currentTest === 3) {
//       responseTimesRef.current[currentTest - 1] = { congruent: [], incongruent: [] };
//       setResponseTimes((prev) => {
//         const newArr = [...prev];
//         newArr[currentTest - 1] = { congruent: [], incongruent: [] };
//         return newArr;
//       });
//     } else {
//       responseTimesRef.current[currentTest - 1] = [];
//       setResponseTimes((prev) => {
//         const newArr = [...prev];
//         newArr[currentTest - 1] = [];
//         return newArr;
//       });
//     }
    
//     showStimulus();
    
//     timerIntervalRef.current = setInterval(() => {
//       setTimeLeft((prev) => {
//         if (prev <= 1) {
//           clearInterval(timerIntervalRef.current);
//           endTest();
//           return 0;
//         }
//         return prev - 1;
//       });
//     }, 1000);
//   };

//   const endTest = () => {
//     clearInterval(timerIntervalRef.current);
//     setShowStats(false);
    
//     if (currentTest === 3) {
//       const congruentRTs = responseTimesRef.current[currentTest - 1].congruent;
//       const incongruentRTs = responseTimesRef.current[currentTest - 1].incongruent;
      
//       const congruentAvgRT = congruentRTs.length > 0 ? (congruentRTs.reduce((a, b) => a + b, 0) / congruentRTs.length) / 1000 : 0;
//       const incongruentAvgRT = incongruentRTs.length > 0 ? (incongruentRTs.reduce((a, b) => a + b, 0) / incongruentRTs.length) / 1000 : 0;
      
//       setTestResults((prev) => ({
//         ...prev,
//         colorWord: {
//           congruent: {
//             correct: congruentStatsRef.current.correct,
//             total: congruentStatsRef.current.total,
//             time: congruentAvgRT
//           },
//           incongruent: {
//             correct: incongruentStatsRef.current.correct,
//             total: incongruentStatsRef.current.total,
//             time: incongruentAvgRT
//           }
//         }
//       }));
      
//       setIntermediateScore({
//         testName: 'colorWord',
//         congruent: {
//           correct: congruentStatsRef.current.correct,
//           total: congruentStatsRef.current.total,
//           avgRT: congruentAvgRT
//         },
//         incongruent: {
//           correct: incongruentStatsRef.current.correct,
//           total: incongruentStatsRef.current.total,
//           avgRT: incongruentAvgRT
//         },
//         overall: {
//           correct: correctItemsRef.current,
//           total: totalItemsRef.current,
//           avgRT: (congruentAvgRT + incongruentAvgRT) / 2
//         }
//       });
//     } else {
//       const rts = responseTimesRef.current[currentTest - 1];
//       const avgRT = rts.length > 0 ? (rts.reduce((a, b) => a + b, 0) / rts.length) / 1000 : 0;
//       const testName = currentTest === 1 ? 'word' : 'color';
      
//       setTestResults((prev) => ({
//         ...prev,
//         [testName]: {
//           correct: correctItemsRef.current,
//           total: totalItemsRef.current,
//           time: avgRT
//         }
//       }));
      
//       setIntermediateScore({
//         testName,
//         correct: correctItemsRef.current,
//         total: totalItemsRef.current,
//         avgRT
//       });
//     }
    
//     setShowIntermediateScore(true);
//   };

//   const proceedToNextTest = () => {
//     setShowIntermediateScore(false);
//     setShowStats(false);
//     if (currentTest < 3) {
//       setCurrentTest(currentTest + 1);
//       setCurrentTrial(0);
//       setCurrentWord('');
//       setCurrentColor('');
//       setFeedback('');
//     }
//   };

//   const updateStroopResultsInBackend = async (email, correctItems, avgRT) => {
//     try {
//       const response = await fetch(`${BASE_URL}/update-stroop-results`, {
//         method: 'POST',
//         headers: {
//           'Content-Type': 'application/json',
//         },
//         body: JSON.stringify({
//           email,
//           stroop_score_correct_items: correctItems,
//           stroop_avg_rt: avgRT
//         })
//       });
  
//       if (!response.ok) {
//         const errorData = await response.json();
//         console.error("Failed to update stroop results:", errorData.detail);
//       } else {
//         const data = await response.json();
//         console.log("Stroop results update:", data.message);
//       }
//     } catch (error) {
//       console.error("Error updating stroop results:", error);
//     }
//   };
  
//   const calculateFinalResults = () => {
//     const { word, color, colorWord } = testResults;
//     const W = word.correct;
//     const C = color.correct;
//     const CW_congruent = colorWord.congruent.correct;
//     const CW_incongruent = colorWord.incongruent.correct;
//     const CW_total = CW_congruent + CW_incongruent;
    
//     const WT = word.time;
//     const CT = color.time;
//     const CWT_congruent = colorWord.congruent.time;
//     const CWT_incongruent = colorWord.incongruent.time;
//     const CWT_overall = (CWT_congruent + CWT_incongruent) / 2;
    
//     const Pcw = (W * C) / (W + C);
//     const IG = CW_total - Pcw;
//     const Pcwt = ((WT + CT) / 2);
//     const TI = CWT_overall - Pcwt;
    
//     const wordAcc = word.total > 0 ? (word.correct / word.total) * 100 : 0;
//     const colorAcc = color.total > 0 ? (color.correct / color.total) * 100 : 0;
//     const colorWordCongruentAcc = colorWord.congruent.total > 0 ? (colorWord.congruent.correct / colorWord.congruent.total) * 100 : 0;
//     const colorWordIncongruentAcc = colorWord.incongruent.total > 0 ? (colorWord.incongruent.correct / colorWord.incongruent.total) * 100 : 0;
    
//     setFinalResults({
//       word: { score: W, rt: WT, acc: wordAcc },
//       color: { score: C, rt: CT, acc: colorAcc },
//       colorWord: {
//         congruent: { score: CW_congruent, rt: CWT_congruent, acc: colorWordCongruentAcc },
//         incongruent: { score: CW_incongruent, rt: CWT_incongruent, acc: colorWordIncongruentAcc },
//         overall: { score: CW_total, rt: CWT_overall, acc: ((CW_total) / (colorWord.congruent.total + colorWord.incongruent.total)) * 100 }
//       }
//     });
    
//     setShowFinalResults(true);
//     setShowIntermediateScore(false);

//     const correctItems = {
//       color: testResults.color.correct,
//       word: testResults.word.correct,
//       color_word_congruent: testResults.colorWord.congruent.correct,
//       color_word_incongruent: testResults.colorWord.incongruent.correct
//     };
//     const avgRT = {
//       color: testResults.color.time,
//       word: testResults.word.time,
//       color_word_congruent: testResults.colorWord.congruent.time,
//       color_word_incongruent: testResults.colorWord.incongruent.time
//     };
    
//     const userEmail = localStorage.getItem("email");
//     if (userEmail) {
//       updateStroopResultsInBackend(userEmail, correctItems, avgRT);
//     } else {
//       console.warn("User email not found. Cannot update stroop results.");
//     }
//   };

//   useEffect(() => {
//     const handleKeyPress = (event) => {
//       if (["KeyR", "KeyG", "KeyB", "KeyY"].includes(event.code) && currentTrial > 0 && timeLeft > 0) {
//         const rt = performance.now() - startTimeRef.current;
//         const chosenColor = keyToColor[event.code];
//         let isCorrect = false;
//         let correctAnswer = '';
        
//         if (currentTest === 1) {
//           correctAnswer = currentWord.toLowerCase();
//           isCorrect = chosenColor === correctAnswer;
//         } else {
//           correctAnswer = currentColor;
//           isCorrect = chosenColor === correctAnswer;
//         }
        
//         setTotalItems((prev) => {
//           totalItemsRef.current = prev + 1;
//           return prev + 1;
//         });
        
//         setCorrectItems((prev) => {
//           const newVal = isCorrect ? prev + 1 : prev;
//           correctItemsRef.current = newVal;
//           return newVal;
//         });
        
//         if (currentTest === 3) {
//           if (isCongruent) {
//             congruentStatsRef.current.total += 1;
//             if (isCorrect) congruentStatsRef.current.correct += 1;
            
//             setResponseTimes((prev) => {
//               const newArr = [...prev];
//               newArr[currentTest - 1].congruent = [...newArr[currentTest - 1].congruent, rt];
//               responseTimesRef.current = newArr;
//               return newArr;
//             });
//           } else {
//             incongruentStatsRef.current.total += 1;
//             if (isCorrect) incongruentStatsRef.current.correct += 1;
            
//             setResponseTimes((prev) => {
//               const newArr = [...prev];
//               newArr[currentTest - 1].incongruent = [...newArr[currentTest - 1].incongruent, rt];
//               responseTimesRef.current = newArr;
//               return newArr;
//             });
//           }
//         } else {
//           setResponseTimes((prev) => {
//             const newArr = [...prev];
//             newArr[currentTest - 1] = [...newArr[currentTest - 1], rt];
//             responseTimesRef.current = newArr;
//             return newArr;
//           });
//         }
        
//         setFeedback(isCorrect ? <span className="correct">Correct!</span> : <span className="wrong">Wrong! It was {colorToWord[correctAnswer]}</span>);
        
//         setTimeout(() => {
//           setFeedback('');
//           setCurrentWord('');
//           setCurrentColor('');  
//           setTimeout(() => {
//             showStimulus();
//           }, 100)
//         }, FEEDBACK_DURATION);
//       }
//     };
    
//     window.addEventListener('keydown', handleKeyPress);
//     return () => window.removeEventListener('keydown', handleKeyPress);

//   }, [currentTest, currentTrial, timeLeft, currentWord, currentColor, isCongruent]);

//   return (
//     <div className="stroop-container">
//       <Header isLoggedIn={isLoggedIn} onLogout={onLogout} />
//       <main className="stroop-content">
//         <div id="game-container">
//           <h1>Stroop Test</h1>
//           <div id="progress">Test {currentTest} of 3</div>

//           {/* Test 1: Word Reading */}
//           <div id="word-test" className={`test-section${currentTest === 1 ? ' active' : ''}`}>
//             {currentTrial === 0 && !showIntermediateScore && !showFinalResults && (
//               <div className="instructions-container">
//                 <div className="instructions-title">Test 1: Word Reading</div>
//                 <div className="instructions-text">
//                   In this test, you will see color words printed in black ink.<br />
//                   Your task is to read the word as quickly as possible.<br />
//                   Use the following keys to respond:<br />
//                   R = RED, G = GREEN, B = BLUE, Y = YELLOW
//                 </div>
//                 <div className="instructions-example">
//                   Example: <span style={{ color: 'black' }}>RED</span> → Press R
//                 </div>
//                 <div className="instructions-text">
//                   Make sure you are taking the test at a quiet place, away from disturbances.
//                 </div>
//                 <div className="instructions-text">
//                   You will have {TEST_DURATIONS[1]} seconds to complete as many items as possible.<br />
//                   Try to be both fast and accurate!
//                 </div>
//                 <button className="start-button" onClick={startTest}>Start Test</button>
//               </div>
//             )}
//             {currentTrial > 0 && !showIntermediateScore && !showFinalResults && (
//               <>
//                 <div className="stroop-stats-row" style={{ display: showStats ? 'flex' : 'none' }}>
//                   <div className="stat" id="timer">Time: {timeLeft}s</div>
//                   <div className="stat" id="score">Items: {correctItems}</div>
//                 </div>
//                 <div id="stimulus" style={{ color: currentColor }}>{currentWord}</div>
//                 <div id="feedback">{feedback}</div>
//               </>
//             )}
//           </div>

//           {/* Test 2: Color Naming */}
//           <div id="color-test" className={`test-section${currentTest === 2 ? ' active' : ''}`}>
//             {currentTrial === 0 && !showIntermediateScore && !showFinalResults && (
//               <div className="instructions-container">
//                 <div className="instructions-title">Test 2: Color Naming</div>
//                 <div className="instructions-text">
//                   In this test, you will see colored patches.<br />
//                   Your task is to name the color of the patch as quickly as possible.<br />
//                   Use the following keys to respond:<br />
//                   R = RED, G = GREEN, B = BLUE, Y = YELLOW
//                 </div>
//                 <div className="instructions-example">
//                   Example: <span style={{ color: 'red' }}>■■■</span> → Press R
//                 </div>
//                 <div className="instructions-text">
//                   Make sure you are taking the test at a quiet place, away from disturbances.
//                 </div>
//                 <div className="instructions-text">
//                   You will have {TEST_DURATIONS[2]} seconds to complete as many items as possible.<br />
//                   Try to be both fast and accurate!
//                 </div>
//                 <button className="start-button" onClick={startTest}>Start Test</button>
//               </div>
//             )}
//             {currentTrial > 0 && !showIntermediateScore && !showFinalResults && (
//               <>
//                 <div className="stroop-stats-row" style={{ display: showStats ? 'flex' : 'none' }}>
//                   <div className="stat" id="timer">Time: {timeLeft}s</div>
//                   <div className="stat" id="score">Items: {correctItems}</div>
//                 </div>
//                 <div id="stimulus" style={{ color: currentColor }}>{currentWord}</div>
//                 <div id="feedback">{feedback}</div>
//               </>
//             )}
//           </div>

//           {/* Test 3: Color-Word */}
//           <div id="color-word-test" className={`test-section${currentTest === 3 ? ' active' : ''}`}>
//             {currentTrial === 0 && !showIntermediateScore && !showFinalResults && (
//               <div className="instructions-container">
//                 <div className="instructions-title">Test 3: Color-Word</div>
//                 <div className="instructions-text">
//                   In this test, you will see color words printed in different colored ink.<br />
//                   Your task is to name the COLOR of the ink, NOT the word.<br />
//                   Use the following keys to respond:<br />
//                   R = RED, G = GREEN, B = BLUE, Y = YELLOW
//                 </div>
//                 <div className="instructions-example">
//                   Example: <span style={{ color: 'green' }}>RED</span> → Press G (because the ink is green)
//                 </div>
//                 <div className="instructions-text">
//                   Make sure you are taking the test at a quiet place, away from disturbances.
//                 </div>
//                 <div className="instructions-text">
//                   This is the most challenging part of the test.<br />
//                   You will have {TEST_DURATIONS[3]} seconds to complete as many items as possible.<br />
//                   Remember: Name the COLOR of the ink, not the word!
//                 </div>
//                 <button className="start-button" onClick={startTest}>Start Test</button>
//               </div>
//             )}
//             {currentTrial > 0 && !showIntermediateScore && !showFinalResults && (
//               <>
//                 <div className="stroop-stats-row" style={{ display: showStats ? 'flex' : 'none' }}>
//                   <div className="stat" id="timer">Time: {timeLeft}s</div>
//                   <div className="stat" id="score">Items: {correctItems}</div>
//                 </div>
//                 <div id="stimulus" style={{ color: currentColor }}>{currentWord}</div>
//                 <div id="feedback">{feedback}</div>
//               </>
//             )}
//           </div>

//           {/* Intermediate Score */}
//           <div id="intermediate-score" className={`intermediate-score${showIntermediateScore ? ' show' : ''}`}>
//             {showIntermediateScore && intermediateScore && (
//               <>
//                 {intermediateScore.testName === 'colorWord' ? (
//                   <>
//                     <h3>Color-Word Test Complete!</h3>
//                     <div style={{ textAlign: 'left', marginBottom: '20px' }}>
//                       <h4>Congruent Trials:</h4>
//                       <p>Correct Items: {intermediateScore.congruent.correct}</p>
//                       <p>Total Items: {intermediateScore.congruent.total}</p>
//                       <p>Accuracy: {intermediateScore.congruent.total > 0 ? ((intermediateScore.congruent.correct/intermediateScore.congruent.total) * 100).toFixed(1) : '0.0'}%</p>
//                       <p>Avg. Reaction Time: {intermediateScore.congruent.avgRT.toFixed(2)}s</p>
                      
//                       <h4>Incongruent Trials:</h4>
//                       <p>Correct Items: {intermediateScore.incongruent.correct}</p>
//                       <p>Total Items: {intermediateScore.incongruent.total}</p>
//                       <p>Accuracy: {intermediateScore.incongruent.total > 0 ? ((intermediateScore.incongruent.correct/intermediateScore.incongruent.total) * 100).toFixed(1) : '0.0'}%</p>
//                       <p>Avg. Reaction Time: {intermediateScore.incongruent.avgRT.toFixed(2)}s</p>
                      
//                       {/* <h4>Overall:</h4>
//                       <p>Correct Items: {intermediateScore.overall.correct}</p>
//                       <p>Total Items: {intermediateScore.overall.total}</p>
//                       <p>Accuracy: {intermediateScore.overall.total > 0 ? ((intermediateScore.overall.correct/intermediateScore.overall.total) * 100).toFixed(1) : '0.0'}%</p> */}
//                     </div>
//                   </>
//                 ) : (
//                   <>
//                     <h3>{intermediateScore.testName === 'word' ? 'Word Reading' : 'Color Naming'} Test Complete!</h3>
//                     <p>Correct Items: {intermediateScore.correct}</p>
//                     <p>Total Items: {intermediateScore.total}</p>
//                     <p>Accuracy: {intermediateScore.total > 0 ? ((intermediateScore.correct/intermediateScore.total) * 100).toFixed(1) : '0.0'}%</p>
//                     <p>Avg. Reaction Time: {intermediateScore.avgRT.toFixed(2)}s</p>
//                   </>
//                 )}
//                 <button className="next-test-button" onClick={currentTest === 3 ? calculateFinalResults : proceedToNextTest}>
//                   {currentTest === 3 ? 'View Final Results' : 'Start Next Test'}
//                 </button>
//               </>
//             )}
//           </div>

//           {/* Final Results */}
//           <div id="final-results" className={`final-results${showFinalResults ? '' : ' hidden'}`} style={{ display: showFinalResults ? 'block' : 'none', textAlign: 'left' }}>
//             {showFinalResults && finalResults && (
//               <>
//                 <div style={{ textAlign: 'center', fontWeight: 'bold', fontSize: 32, marginBottom: '16px' }}>
//                   Test Complete!
//                 </div>
//                 <div style={{ marginLeft: '50px'}}>
//                   <div className="result-stat"><b>Word Reading: </b> <b>Correct: </b><span className="result-sub">{finalResults.word.score} items, <b>Avg RT:</b> {finalResults.word.rt.toFixed(2)}s, <b>Accuracy:</b> {finalResults.word.acc.toFixed(1)}%</span></div>
//                   <div className="result-stat"><b>Color Naming: </b> <b>Correct: </b><span className="result-sub">{finalResults.color.score} items, <b>Avg RT:</b> {finalResults.color.rt.toFixed(2)}s, <b>Accuracy:</b> {finalResults.color.acc.toFixed(1)}%</span></div>
                  
//                   <div className="result-stat"><b>Color-Word (Congruent): </b> <b>Correct: </b><span className="result-sub">{finalResults.colorWord.congruent.score} items, <b>Avg RT:</b> {finalResults.colorWord.congruent.rt.toFixed(2)}s, <b>Accuracy:</b> {finalResults.colorWord.congruent.acc.toFixed(1)}%</span></div>
//                   <div className="result-stat"><b>Color-Word (Incongruent): </b> <b>Correct: </b><span className="result-sub">{finalResults.colorWord.incongruent.score} items, <b>Avg RT:</b> {finalResults.colorWord.incongruent.rt.toFixed(2)}s, <b>Accuracy:</b> {finalResults.colorWord.incongruent.acc.toFixed(1)}%</span></div>
//                   {/* <div className="result-stat"><b>Color-Word (Overall): </b> <b>Correct: </b><span className="result-sub">{finalResults.colorWord.overall.score} items, <b>Avg RT:</b> {finalResults.colorWord.overall.rt.toFixed(2)}s, <b>Accuracy:</b> {finalResults.colorWord.overall.acc.toFixed(1)}%</span></div> */}
//                 </div>
//                 <div style={{ display: 'flex', gap: '16px', justifyContent: 'center', marginTop: '24px' }}>
//                   <button className="start-button" onClick={() => navigate(`/dashboard/${username}`)}>
//                     Back to Dashboard
//                   </button>
//                 </div>
//               </>
//             )}
//           </div>
//         </div>
//       </main>
//     </div>
//   );
// }

// export default StroopTest;

// import { useState, useEffect, useRef } from 'react';
// import Header from './Header';
// import './Header.css';
// import './StroopTest.css';
// import { useNavigate } from 'react-router-dom';
// import BASE_URL from '../config';

// const TRIAL_COUNTS = {
//   1: 5,
//   2: 5,
//   3: 10
// };

// const FEEDBACK_DURATION = 1000;

// const words = ["RED", "GREEN", "BLUE", "YELLOW"];
// const colors = ["red", "green", "blue", "yellow"];
// const keyToColor = {
//   "KeyR": "red",
//   "KeyG": "green",
//   "KeyB": "blue",
//   "KeyY": "yellow"
// };
// const colorToWord = {
//   "red": "RED",
//   "green": "GREEN",
//   "blue": "BLUE",
//   "yellow": "YELLOW"
// };

// function StroopTest({ isLoggedIn, onLogout }) {
//   const navigate = useNavigate();
//   const [currentTest, setCurrentTest] = useState(1);
//   const [currentTrial, setCurrentTrial] = useState(0);
//   const [correctItems, setCorrectItems] = useState(0);
//   const [totalItems, setTotalItems] = useState(0);
//   const [maxTrials, setMaxTrials] = useState(TRIAL_COUNTS[1]);
//   const [currentWord, setCurrentWord] = useState('');
//   const [currentColor, setCurrentColor] = useState('');
//   const [isCongruent, setIsCongruent] = useState(false);
//   const [feedback, setFeedback] = useState('');
//   const [showStats, setShowStats] = useState(false);
//   const [intermediateScore, setIntermediateScore] = useState(null);
//   const [showIntermediateScore, setShowIntermediateScore] = useState(false);
//   const [showFinalResults, setShowFinalResults] = useState(false);
//   const [finalResults, setFinalResults] = useState(null);
//   const [testResults, setTestResults] = useState({
//     word: { correct: 0, total: 0, time: 0 },
//     color: { correct: 0, total: 0, time: 0 },
//     colorWord: { 
//       congruent: { correct: 0, total: 0, time: 0 },
//       incongruent: { correct: 0, total: 0, time: 0 }
//     }
//   });
//   const [responseTimes, setResponseTimes] = useState([[], [], { congruent: [], incongruent: [] }]);

//   // For test 3: track congruent/incongruent trials separately
//   const [congruentTrialsLeft, setCongruentTrialsLeft] = useState(30);
//   const [incongruentTrialsLeft, setIncongruentTrialsLeft] = useState(30);

//   const startTimeRef = useRef(0);
//   const correctItemsRef = useRef(0);
//   const totalItemsRef = useRef(0);
//   const responseTimesRef = useRef([[], [], { congruent: [], incongruent: [] }]);
  
//   const congruentStatsRef = useRef({ correct: 0, total: 0 });
//   const incongruentStatsRef = useRef({ correct: 0, total: 0 });
  
//   const username = localStorage.getItem('username');
  
//   const getRandomItem = (arr) => arr[Math.floor(Math.random() * arr.length)];

//   const showStimulus = () => {
//     let newWord = '';
//     let newColor = '';
//     let congruent = false;
    
//     if (currentTest === 1) {
//       newWord = getRandomItem(words);
//       newColor = 'black';
//     } else if (currentTest === 2) {
//       newWord = '■■■';
//       newColor = getRandomItem(colors);
//     } else if (currentTest === 3) {
//       newWord = getRandomItem(words);

//       let shouldBeCongruent;
//       if (congruentTrialsLeft > 0 && incongruentTrialsLeft > 0) {
//         shouldBeCongruent = Math.random() < 0.5;
//       } else if (congruentTrialsLeft > 0) {
//         shouldBeCongruent = true;
//       } else {
//         shouldBeCongruent = false;
//       }

//       congruent = shouldBeCongruent;

//       if (shouldBeCongruent) {
//         newColor = newWord.toLowerCase();
//       } else {
//         do {
//           newColor = getRandomItem(colors);
//         } while (newColor === newWord.toLowerCase());
//       }
//     }
    
//     setCurrentWord(newWord);
//     setCurrentColor(newColor);
//     setIsCongruent(congruent);
//     startTimeRef.current = performance.now();
//   };

//   const startTest = () => {
//     if (currentTrial > 0) return;
//     setShowStats(true);
//     setCurrentTrial(1);
//     setCorrectItems(0);
//     setTotalItems(0);
//     correctItemsRef.current = 0;
//     totalItemsRef.current = 0;
    
//     congruentStatsRef.current = { correct: 0, total: 0 };
//     incongruentStatsRef.current = { correct: 0, total: 0 };

//     const trialCount = TRIAL_COUNTS[currentTest];
//     setMaxTrials(trialCount);

//     if (currentTest === 3) {
//       setCongruentTrialsLeft(5);
//       setIncongruentTrialsLeft(5);
//     }

//     setFeedback('');
//     setIntermediateScore(null);
//     setShowIntermediateScore(false);
//     setShowFinalResults(false);
//     setFinalResults(null);
    
//     if (currentTest === 3) {
//       responseTimesRef.current[currentTest - 1] = { congruent: [], incongruent: [] };
//       setResponseTimes((prev) => {
//         const newArr = [...prev];
//         newArr[currentTest - 1] = { congruent: [], incongruent: [] };
//         return newArr;
//       });
//     } else {
//       responseTimesRef.current[currentTest - 1] = [];
//       setResponseTimes((prev) => {
//         const newArr = [...prev];
//         newArr[currentTest - 1] = [];
//         return newArr;
//       });
//     }
    
//     showStimulus();
//   };

//   const endTest = () => {
//     setShowStats(false);
    
//     if (currentTest === 3) {
//       const congruentRTs = responseTimesRef.current[currentTest - 1].congruent;
//       const incongruentRTs = responseTimesRef.current[currentTest - 1].incongruent;
      
//       const congruentAvgRT = congruentRTs.length > 0 ? (congruentRTs.reduce((a, b) => a + b, 0) / congruentRTs.length) / 1000 : 0;
//       const incongruentAvgRT = incongruentRTs.length > 0 ? (incongruentRTs.reduce((a, b) => a + b, 0) / incongruentRTs.length) / 1000 : 0;
      
//       setTestResults((prev) => ({
//         ...prev,
//         colorWord: {
//           congruent: {
//             correct: congruentStatsRef.current.correct,
//             total: congruentStatsRef.current.total,
//             time: congruentAvgRT
//           },
//           incongruent: {
//             correct: incongruentStatsRef.current.correct,
//             total: incongruentStatsRef.current.total,
//             time: incongruentAvgRT
//           }
//         }
//       }));
      
//       setIntermediateScore({
//         testName: 'colorWord',
//         congruent: {
//           correct: congruentStatsRef.current.correct,
//           total: congruentStatsRef.current.total,
//           avgRT: congruentAvgRT
//         },
//         incongruent: {
//           correct: incongruentStatsRef.current.correct,
//           total: incongruentStatsRef.current.total,
//           avgRT: incongruentAvgRT
//         },
//         overall: {
//           correct: correctItemsRef.current,
//           total: totalItemsRef.current,
//           avgRT: (congruentAvgRT + incongruentAvgRT) / 2
//         }
//       });
//     } else {
//       const rts = responseTimesRef.current[currentTest - 1];
//       const avgRT = rts.length > 0 ? (rts.reduce((a, b) => a + b, 0) / rts.length) / 1000 : 0;
//       const testName = currentTest === 1 ? 'word' : 'color';
      
//       setTestResults((prev) => ({
//         ...prev,
//         [testName]: {
//           correct: correctItemsRef.current,
//           total: totalItemsRef.current,
//           time: avgRT
//         }
//       }));
      
//       setIntermediateScore({
//         testName,
//         correct: correctItemsRef.current,
//         total: totalItemsRef.current,
//         avgRT
//       });
//     }
    
//     setShowIntermediateScore(true);
//   };

//   const proceedToNextTest = () => {
//     setShowIntermediateScore(false);
//     setShowStats(false);
//     if (currentTest < 3) {
//       setCurrentTest(currentTest + 1);
//       setCurrentTrial(0);
//       setCurrentWord('');
//       setCurrentColor('');
//       setFeedback('');
//     }
//   };

//   const updateStroopResultsInBackend = async (email, correctItems, avgRT) => {
//     try {
//       const response = await fetch(`${BASE_URL}/update-stroop-results`, {
//         method: 'POST',
//         headers: {
//           'Content-Type': 'application/json',
//         },
//         body: JSON.stringify({
//           email,
//           stroop_score_correct_items: correctItems,
//           stroop_avg_rt: avgRT
//         })
//       });
  
//       if (!response.ok) {
//         const errorData = await response.json();
//         console.error("Failed to update stroop results:", errorData.detail);
//       } else {
//         const data = await response.json();
//         console.log("Stroop results update:", data.message);
//       }
//     } catch (error) {
//       console.error("Error updating stroop results:", error);
//     }
//   };
  
//   const calculateFinalResults = () => {
//     const { word, color, colorWord } = testResults;
//     const W = word.correct;
//     const C = color.correct;
//     const CW_congruent = colorWord.congruent.correct;
//     const CW_incongruent = colorWord.incongruent.correct;
//     const CW_total = CW_congruent + CW_incongruent;
    
//     const WT = word.time;
//     const CT = color.time;
//     const CWT_congruent = colorWord.congruent.time;
//     const CWT_incongruent = colorWord.incongruent.time;
//     const CWT_overall = (CWT_congruent + CWT_incongruent) / 2;
    
//     const Pcw = (W * C) / (W + C);
//     const IG = CW_total - Pcw;
//     const Pcwt = ((WT + CT) / 2);
//     const TI = CWT_overall - Pcwt;
    
//     const wordAcc = word.total > 0 ? (word.correct / word.total) * 100 : 0;
//     const colorAcc = color.total > 0 ? (color.correct / color.total) * 100 : 0;
//     const colorWordCongruentAcc = colorWord.congruent.total > 0 ? (colorWord.congruent.correct / colorWord.congruent.total) * 100 : 0;
//     const colorWordIncongruentAcc = colorWord.incongruent.total > 0 ? (colorWord.incongruent.correct / colorWord.incongruent.total) * 100 : 0;
    
//     setFinalResults({
//       word: { score: W, rt: WT, acc: wordAcc },
//       color: { score: C, rt: CT, acc: colorAcc },
//       colorWord: {
//         congruent: { score: CW_congruent, rt: CWT_congruent, acc: colorWordCongruentAcc },
//         incongruent: { score: CW_incongruent, rt: CWT_incongruent, acc: colorWordIncongruentAcc },
//         overall: { score: CW_total, rt: CWT_overall, acc: ((CW_total) / (colorWord.congruent.total + colorWord.incongruent.total)) * 100 }
//       }
//     });
    
//     setShowFinalResults(true);
//     setShowIntermediateScore(false);

//     const correctItems = {
//       color: testResults.color.correct,
//       word: testResults.word.correct,
//       color_word_congruent: testResults.colorWord.congruent.correct,
//       color_word_incongruent: testResults.colorWord.incongruent.correct
//     };
//     const avgRT = {
//       color: testResults.color.time,
//       word: testResults.word.time,
//       color_word_congruent: testResults.colorWord.congruent.time,
//       color_word_incongruent: testResults.colorWord.incongruent.time
//     };
    
//     const userEmail = localStorage.getItem("email");
//     if (userEmail) {
//       updateStroopResultsInBackend(userEmail, correctItems, avgRT);
//     } else {
//       console.warn("User email not found. Cannot update stroop results.");
//     }
//   };

//   useEffect(() => {
//     const handleKeyPress = (event) => {
//       if (["KeyR", "KeyG", "KeyB", "KeyY"].includes(event.code) && currentTrial > 0 && totalItems < maxTrials) {
//         const rt = performance.now() - startTimeRef.current;
//         const chosenColor = keyToColor[event.code];
//         let isCorrect = false;
//         let correctAnswer = '';
        
//         if (currentTest === 1) {
//           correctAnswer = currentWord.toLowerCase();
//           isCorrect = chosenColor === correctAnswer;
//         } else {
//           correctAnswer = currentColor;
//           isCorrect = chosenColor === correctAnswer;
//         }
        
//         setTotalItems((prev) => {
//           totalItemsRef.current = prev + 1;
//           return prev + 1;
//         });
        
//         setCorrectItems((prev) => {
//           const newVal = isCorrect ? prev + 1 : prev;
//           correctItemsRef.current = newVal;
//           return newVal;
//         });
        
//         if (currentTest === 3) {
//           if (isCongruent) {
//             congruentStatsRef.current.total += 1;
//             if (isCorrect) congruentStatsRef.current.correct += 1;
//             setCongruentTrialsLeft(prev => prev - 1);
            
//             setResponseTimes((prev) => {
//               const newArr = [...prev];
//               newArr[currentTest - 1].congruent = [...newArr[currentTest - 1].congruent, rt];
//               responseTimesRef.current = newArr;
//               return newArr;
//             });
//           } else {
//             incongruentStatsRef.current.total += 1;
//             if (isCorrect) incongruentStatsRef.current.correct += 1;
//             setIncongruentTrialsLeft(prev => prev - 1);
            
//             setResponseTimes((prev) => {
//               const newArr = [...prev];
//               newArr[currentTest - 1].incongruent = [...newArr[currentTest - 1].incongruent, rt];
//               responseTimesRef.current = newArr;
//               return newArr;
//             });
//           }
//         } else {
//           setResponseTimes((prev) => {
//             const newArr = [...prev];
//             newArr[currentTest - 1] = [...newArr[currentTest - 1], rt];
//             responseTimesRef.current = newArr;
//             return newArr;
//           });
//         }
        
//         setFeedback(isCorrect ? <span className="correct">Correct!</span> : <span className="wrong">Wrong! It was {colorToWord[correctAnswer]}</span>);
        
//         setTimeout(() => {
//           const newTotal = totalItemsRef.current;
//           if (newTotal >= maxTrials) {
//             endTest();
//           } else {
//             setFeedback('');
//             setCurrentWord('');
//             setCurrentColor('');  
//             setTimeout(() => {
//               showStimulus();
//             }, 100);
//           }
//         }, FEEDBACK_DURATION);
//       }
//     };
    
//     window.addEventListener('keydown', handleKeyPress);
//     return () => window.removeEventListener('keydown', handleKeyPress);

//   }, [currentTest, currentTrial, totalItems, maxTrials, currentWord, currentColor, isCongruent]);

//   return (
//     <div className="stroop-container">
//       <Header isLoggedIn={isLoggedIn} onLogout={onLogout} />
//       <main className="stroop-content">
//         <div id="game-container">
//           <h1>Stroop Test</h1>
//           <div id="progress">Test {currentTest} of 3</div>

//           {/* Test 1: Word Reading */}
//           <div id="word-test" className={`test-section${currentTest === 1 ? ' active' : ''}`}>
//             {currentTrial === 0 && !showIntermediateScore && !showFinalResults && (
//               <div className="instructions-container">
//                 <div className="instructions-title">Test 1: Word Reading</div>
//                 <div className="instructions-text">
//                   In this test, you will see color words printed in black ink.<br />
//                   Your task is to read the word as quickly as possible.<br />
//                   Use the following keys to respond:<br />
//                   R = RED, G = GREEN, B = BLUE, Y = YELLOW
//                 </div>
//                 <div className="instructions-example">
//                   Example: <span style={{ color: 'black' }}>RED</span> → Press R
//                 </div>
//                 <div className="instructions-text">
//                   Make sure you are taking the test at a quiet place, away from disturbances.
//                 </div>
//                 <div className="instructions-text">
//                   You will complete {TRIAL_COUNTS[1]} items in this test.<br />
//                   Try to be both fast and accurate!
//                 </div>
//                 <button className="start-button" onClick={startTest}>Start Test</button>
//               </div>
//             )}
//             {currentTrial > 0 && !showIntermediateScore && !showFinalResults && (
//               <>
//                 <div className="stroop-stats-row" style={{ display: showStats ? 'flex' : 'none' }}>
//                   <div className="stat" id="progress-stat">Progress: {totalItems}/{maxTrials}</div>
//                   <div className="stat" id="score">Correct: {correctItems}</div>
//                 </div>
//                 <div id="stimulus" style={{ color: currentColor }}>{currentWord}</div>
//                 <div id="feedback">{feedback}</div>
//               </>
//             )}
//           </div>

//           {/* Test 2: Color Naming */}
//           <div id="color-test" className={`test-section${currentTest === 2 ? ' active' : ''}`}>
//             {currentTrial === 0 && !showIntermediateScore && !showFinalResults && (
//               <div className="instructions-container">
//                 <div className="instructions-title">Test 2: Color Naming</div>
//                 <div className="instructions-text">
//                   In this test, you will see colored patches.<br />
//                   Your task is to name the color of the patch as quickly as possible.<br />
//                   Use the following keys to respond:<br />
//                   R = RED, G = GREEN, B = BLUE, Y = YELLOW
//                 </div>
//                 <div className="instructions-example">
//                   Example: <span style={{ color: 'red' }}>■■■</span> → Press R
//                 </div>
//                 <div className="instructions-text">
//                   Make sure you are taking the test at a quiet place, away from disturbances.
//                 </div>
//                 <div className="instructions-text">
//                   You will complete {TRIAL_COUNTS[2]} items in this test.<br />
//                   Try to be both fast and accurate!
//                 </div>
//                 <button className="start-button" onClick={startTest}>Start Test</button>
//               </div>
//             )}
//             {currentTrial > 0 && !showIntermediateScore && !showFinalResults && (
//               <>
//                 <div className="stroop-stats-row" style={{ display: showStats ? 'flex' : 'none' }}>
//                   <div className="stat" id="progress-stat">Progress: {totalItems}/{maxTrials}</div>
//                   <div className="stat" id="score">Correct: {correctItems}</div>
//                 </div>
//                 <div id="stimulus" style={{ color: currentColor }}>{currentWord}</div>
//                 <div id="feedback">{feedback}</div>
//               </>
//             )}
//           </div>

//           {/* Test 3: Color-Word */}
//           <div id="color-word-test" className={`test-section${currentTest === 3 ? ' active' : ''}`}>
//             {currentTrial === 0 && !showIntermediateScore && !showFinalResults && (
//               <div className="instructions-container">
//                 <div className="instructions-title">Test 3: Color-Word</div>
//                 <div className="instructions-text">
//                   In this test, you will see color words printed in different colored ink.<br />
//                   Your task is to name the COLOR of the ink, NOT the word.<br />
//                   Use the following keys to respond:<br />
//                   R = RED, G = GREEN, B = BLUE, Y = YELLOW
//                 </div>
//                 <div className="instructions-example">
//                   Example: <span style={{ color: 'green' }}>RED</span> → Press G (because the ink is green)
//                 </div>
//                 <div className="instructions-text">
//                   Make sure you are taking the test at a quiet place, away from disturbances.
//                 </div>
//                 <div className="instructions-text">
//                   This is the most challenging part of the test.<br />
//                   You will complete {TRIAL_COUNTS[3]} items in this test (30 congruent + 30 incongruent).<br />
//                   Remember: Name the COLOR of the ink, not the word!
//                 </div>
//                 <button className="start-button" onClick={startTest}>Start Test</button>
//               </div>
//             )}
//             {currentTrial > 0 && !showIntermediateScore && !showFinalResults && (
//               <>
//                 <div className="stroop-stats-row" style={{ display: showStats ? 'flex' : 'none' }}>
//                   <div className="stat" id="progress-stat">Progress: {totalItems}/{maxTrials}</div>
//                   <div className="stat" id="score">Correct: {correctItems}</div>
//                 </div>
//                 <div id="stimulus" style={{ color: currentColor }}>{currentWord}</div>
//                 <div id="feedback">{feedback}</div>
//               </>
//             )}
//           </div>

//           {/* Intermediate Score */}
//           <div id="intermediate-score" className={`intermediate-score${showIntermediateScore ? ' show' : ''}`}>
//             {showIntermediateScore && intermediateScore && (
//               <>
//                 {intermediateScore.testName === 'colorWord' ? (
//                   <>
//                     <h3>Color-Word Test Complete!</h3>
//                     <div style={{ textAlign: 'left', marginBottom: '20px' }}>
//                       <h4>Congruent Trials:</h4>
//                       <p>Correct Items: {intermediateScore.congruent.correct}</p>
//                       <p>Total Items: {intermediateScore.congruent.total}</p>
//                       <p>Accuracy: {intermediateScore.congruent.total > 0 ? ((intermediateScore.congruent.correct/intermediateScore.congruent.total) * 100).toFixed(1) : '0.0'}%</p>
//                       <p>Avg. Reaction Time: {intermediateScore.congruent.avgRT.toFixed(2)}s</p>
                      
//                       <h4>Incongruent Trials:</h4>
//                       <p>Correct Items: {intermediateScore.incongruent.correct}</p>
//                       <p>Total Items: {intermediateScore.incongruent.total}</p>
//                       <p>Accuracy: {intermediateScore.incongruent.total > 0 ? ((intermediateScore.incongruent.correct/intermediateScore.incongruent.total) * 100).toFixed(1) : '0.0'}%</p>
//                       <p>Avg. Reaction Time: {intermediateScore.incongruent.avgRT.toFixed(2)}s</p>
//                     </div>
//                   </>
//                 ) : (
//                   <>
//                     <h3>{intermediateScore.testName === 'word' ? 'Word Reading' : 'Color Naming'} Test Complete!</h3>
//                     <p>Correct Items: {intermediateScore.correct}</p>
//                     <p>Total Items: {intermediateScore.total}</p>
//                     <p>Accuracy: {intermediateScore.total > 0 ? ((intermediateScore.correct/intermediateScore.total) * 100).toFixed(1) : '0.0'}%</p>
//                     <p>Avg. Reaction Time: {intermediateScore.avgRT.toFixed(2)}s</p>
//                   </>
//                 )}
//                 <button className="next-test-button" onClick={currentTest === 3 ? calculateFinalResults : proceedToNextTest}>
//                   {currentTest === 3 ? 'View Final Results' : 'Start Next Test'}
//                 </button>
//               </>
//             )}
//           </div>

//           {/* Final Results */}
//           <div id="final-results" className={`final-results${showFinalResults ? '' : ' hidden'}`} style={{ display: showFinalResults ? 'block' : 'none', textAlign: 'left' }}>
//             {showFinalResults && finalResults && (
//               <>
//                 <div style={{ textAlign: 'center', fontWeight: 'bold', fontSize: 32, marginBottom: '16px' }}>
//                   Test Complete!
//                 </div>
//                 <div style={{ marginLeft: '50px'}}>
//                   <div className="result-stat"><b>Word Reading: </b> <b>Correct: </b><span className="result-sub">{finalResults.word.score}/{testResults.word.total} items, <b>Avg RT:</b> {finalResults.word.rt.toFixed(2)}s, <b>Accuracy:</b> {finalResults.word.acc.toFixed(1)}%</span></div>
//                   <div className="result-stat"><b>Color Naming: </b> <b>Correct: </b><span className="result-sub">{finalResults.color.score}/{testResults.color.total} items, <b>Avg RT:</b> {finalResults.color.rt.toFixed(2)}s, <b>Accuracy:</b> {finalResults.color.acc.toFixed(1)}%</span></div>
                  
//                   <div className="result-stat"><b>Color-Word (Congruent): </b> <b>Correct: </b><span className="result-sub">{finalResults.colorWord.congruent.score}/{testResults.colorWord.congruent.total} items, <b>Avg RT:</b> {finalResults.colorWord.congruent.rt.toFixed(2)}s, <b>Accuracy:</b> {finalResults.colorWord.congruent.acc.toFixed(1)}%</span></div>
//                   <div className="result-stat"><b>Color-Word (Incongruent): </b> <b>Correct: </b><span className="result-sub">{finalResults.colorWord.incongruent.score}/{testResults.colorWord.incongruent.total} items, <b>Avg RT:</b> {finalResults.colorWord.incongruent.rt.toFixed(2)}s, <b>Accuracy:</b> {finalResults.colorWord.incongruent.acc.toFixed(1)}%</span></div>
//                 </div>
//                 <div style={{ display: 'flex', gap: '16px', justifyContent: 'center', marginTop: '24px' }}>
//                   <button className="start-button" onClick={() => navigate(`/dashboard/${username}`)}>
//                     Back to Dashboard
//                   </button>
//                 </div>
//               </>
//             )}
//           </div>
//         </div>
//       </main>
//     </div>
//   );
// }

// export default StroopTest;

import { useState, useEffect, useRef } from 'react';
import Header from './Header';
import './Header.css';
import './StroopTest.css';
import { useNavigate } from 'react-router-dom';
import BASE_URL from '../config';

const TRIAL_COUNTS = {
  1: 5,
  2: 5,
  3: 10
};

const FEEDBACK_DURATION = 1000;
const ITEM_TIME_LIMIT = 2000;

const words = ["RED", "GREEN", "BLUE", "YELLOW"];
const colors = ["red", "green", "blue", "yellow"];
const keyToColor = {
  "KeyR": "red",
  "KeyG": "green",
  "KeyB": "blue",
  "KeyY": "yellow"
};
const colorToWord = {
  "red": "RED",
  "green": "GREEN",
  "blue": "BLUE",
  "yellow": "YELLOW"
};

function StroopTest({ isLoggedIn, onLogout }) {
  const navigate = useNavigate();
  const [currentTest, setCurrentTest] = useState(1);
  const [currentTrial, setCurrentTrial] = useState(0);
  const [correctItems, setCorrectItems] = useState(0);
  const [totalItems, setTotalItems] = useState(0);
  const [maxTrials, setMaxTrials] = useState(TRIAL_COUNTS[1]);
  const [currentWord, setCurrentWord] = useState('');
  const [currentColor, setCurrentColor] = useState('');
  const [isCongruent, setIsCongruent] = useState(false);
  const [feedback, setFeedback] = useState('');
  const [showStats, setShowStats] = useState(false);
  const [intermediateScore, setIntermediateScore] = useState(null);
  const [showIntermediateScore, setShowIntermediateScore] = useState(false);
  const [showFinalResults, setShowFinalResults] = useState(false);
  const [finalResults, setFinalResults] = useState(null);
  const [testResults, setTestResults] = useState({
    word: { correct: 0, total: 0, time: 0 },
    color: { correct: 0, total: 0, time: 0 },
    colorWord: { 
      congruent: { correct: 0, total: 0, time: 0 },
      incongruent: { correct: 0, total: 0, time: 0 }
    }
  });
  const [responseTimes, setResponseTimes] = useState([[], [], { congruent: [], incongruent: [] }]);

  const [congruentTrialsLeft, setCongruentTrialsLeft] = useState(30);
  const [incongruentTrialsLeft, setIncongruentTrialsLeft] = useState(30);

  const [itemTimeLeft, setItemTimeLeft] = useState(2);

  const startTimeRef = useRef(0);
  const correctItemsRef = useRef(0);
  const totalItemsRef = useRef(0);
  const responseTimesRef = useRef([[], [], { congruent: [], incongruent: [] }]);
  
  const congruentStatsRef = useRef({ correct: 0, total: 0 });
  const incongruentStatsRef = useRef({ correct: 0, total: 0 });
  
  const itemTimerRef = useRef(null);
  const itemTimeoutRef = useRef(null);
  
  const username = localStorage.getItem('username');
  
  const getRandomItem = (arr) => arr[Math.floor(Math.random() * arr.length)];

  const handleItemTimeout = () => {
    if (itemTimerRef.current) {
      clearInterval(itemTimerRef.current);
      itemTimerRef.current = null;
    }
    if (itemTimeoutRef.current) {
      clearTimeout(itemTimeoutRef.current);
      itemTimeoutRef.current = null;
    }

    const rt = ITEM_TIME_LIMIT;
    let correctAnswer = '';
    
    if (currentTest === 1) {
      correctAnswer = currentWord.toLowerCase();
    } else {
      correctAnswer = currentColor;
    }
    
    setTotalItems((prev) => {
      totalItemsRef.current = prev + 1;
      return prev + 1;
    });
    
    if (currentTest === 3) {
      if (isCongruent) {
        congruentStatsRef.current.total += 1;
        setCongruentTrialsLeft(prev => prev - 1);
        
        setResponseTimes((prev) => {
          const newArr = [...prev];
          newArr[currentTest - 1].congruent = [...newArr[currentTest - 1].congruent, rt];
          responseTimesRef.current = newArr;
          return newArr;
        });
      } else {
        incongruentStatsRef.current.total += 1;
        setIncongruentTrialsLeft(prev => prev - 1);
        
        setResponseTimes((prev) => {
          const newArr = [...prev];
          newArr[currentTest - 1].incongruent = [...newArr[currentTest - 1].incongruent, rt];
          responseTimesRef.current = newArr;
          return newArr;
        });
      }
    } else {
      setResponseTimes((prev) => {
        const newArr = [...prev];
        newArr[currentTest - 1] = [...newArr[currentTest - 1], rt];
        responseTimesRef.current = newArr;
        return newArr;
      });
    }
    
    setFeedback(<span className="wrong">Timeout</span>);
    
    setTimeout(() => {
      const newTotal = totalItemsRef.current;
      if (newTotal >= maxTrials) {
        endTest();
      } else {
        setFeedback('');
        setCurrentWord('');
        setCurrentColor('');  
        setTimeout(() => {
          showStimulus();
        }, 100);
      }
    }, FEEDBACK_DURATION);
  };

  const startItemTimer = () => {
    setItemTimeLeft(2);
    
    itemTimerRef.current = setInterval(() => {
      setItemTimeLeft((prev) => {
        const newTime = Math.max(0, prev - 0.1);
        return Math.round(newTime * 10) / 10;
      });
    }, 100);
    
    itemTimeoutRef.current = setTimeout(() => {
      handleItemTimeout();
    }, ITEM_TIME_LIMIT);
  };

  const clearItemTimers = () => {
    if (itemTimerRef.current) {
      clearInterval(itemTimerRef.current);
      itemTimerRef.current = null;
    }
    if (itemTimeoutRef.current) {
      clearTimeout(itemTimeoutRef.current);
      itemTimeoutRef.current = null;
    }
  };

  const showStimulus = () => {
    let newWord = '';
    let newColor = '';
    let congruent = false;
    
    if (currentTest === 1) {
      newWord = getRandomItem(words);
      newColor = 'black';
    } else if (currentTest === 2) {
      newWord = '■■■';
      newColor = getRandomItem(colors);
    } else if (currentTest === 3) {
      newWord = getRandomItem(words);

      let shouldBeCongruent;
      if (congruentTrialsLeft > 0 && incongruentTrialsLeft > 0) {
        shouldBeCongruent = Math.random() < 0.5;
      } else if (congruentTrialsLeft > 0) {
        shouldBeCongruent = true;
      } else {
        shouldBeCongruent = false;
      }

      congruent = shouldBeCongruent;

      if (shouldBeCongruent) {
        newColor = newWord.toLowerCase();
      } else {
        do {
          newColor = getRandomItem(colors);
        } while (newColor === newWord.toLowerCase());
      }
    }
    
    setCurrentWord(newWord);
    setCurrentColor(newColor);
    setIsCongruent(congruent);
    startTimeRef.current = performance.now();
    
    startItemTimer();
  };

  const startTest = () => {
    if (currentTrial > 0) return;
    setShowStats(true);
    setCurrentTrial(1);
    setCorrectItems(0);
    setTotalItems(0);
    correctItemsRef.current = 0;
    totalItemsRef.current = 0;
    
    congruentStatsRef.current = { correct: 0, total: 0 };
    incongruentStatsRef.current = { correct: 0, total: 0 };

    const trialCount = TRIAL_COUNTS[currentTest];
    setMaxTrials(trialCount);

    if (currentTest === 3) {
      setCongruentTrialsLeft(5);
      setIncongruentTrialsLeft(5);
    }

    setFeedback('');
    setIntermediateScore(null);
    setShowIntermediateScore(false);
    setShowFinalResults(false);
    setFinalResults(null);
    
    if (currentTest === 3) {
      responseTimesRef.current[currentTest - 1] = { congruent: [], incongruent: [] };
      setResponseTimes((prev) => {
        const newArr = [...prev];
        newArr[currentTest - 1] = { congruent: [], incongruent: [] };
        return newArr;
      });
    } else {
      responseTimesRef.current[currentTest - 1] = [];
      setResponseTimes((prev) => {
        const newArr = [...prev];
        newArr[currentTest - 1] = [];
        return newArr;
      });
    }
    
    showStimulus();
  };

  const endTest = () => {
    setShowStats(false);
    
    clearItemTimers();
    
    if (currentTest === 3) {
      const congruentRTs = responseTimesRef.current[currentTest - 1].congruent;
      const incongruentRTs = responseTimesRef.current[currentTest - 1].incongruent;
      
      const congruentAvgRT = congruentRTs.length > 0 ? (congruentRTs.reduce((a, b) => a + b, 0) / congruentRTs.length) / 1000 : 0;
      const incongruentAvgRT = incongruentRTs.length > 0 ? (incongruentRTs.reduce((a, b) => a + b, 0) / incongruentRTs.length) / 1000 : 0;
      
      setTestResults((prev) => ({
        ...prev,
        colorWord: {
          congruent: {
            correct: congruentStatsRef.current.correct,
            total: congruentStatsRef.current.total,
            time: congruentAvgRT
          },
          incongruent: {
            correct: incongruentStatsRef.current.correct,
            total: incongruentStatsRef.current.total,
            time: incongruentAvgRT
          }
        }
      }));
      
      setIntermediateScore({
        testName: 'colorWord',
        congruent: {
          correct: congruentStatsRef.current.correct,
          total: congruentStatsRef.current.total,
          avgRT: congruentAvgRT
        },
        incongruent: {
          correct: incongruentStatsRef.current.correct,
          total: incongruentStatsRef.current.total,
          avgRT: incongruentAvgRT
        },
        overall: {
          correct: correctItemsRef.current,
          total: totalItemsRef.current,
          avgRT: (congruentAvgRT + incongruentAvgRT) / 2
        }
      });
    } else {
      const rts = responseTimesRef.current[currentTest - 1];
      const avgRT = rts.length > 0 ? (rts.reduce((a, b) => a + b, 0) / rts.length) / 1000 : 0;
      const testName = currentTest === 1 ? 'word' : 'color';
      
      setTestResults((prev) => ({
        ...prev,
        [testName]: {
          correct: correctItemsRef.current,
          total: totalItemsRef.current,
          time: avgRT
        }
      }));
      
      setIntermediateScore({
        testName,
        correct: correctItemsRef.current,
        total: totalItemsRef.current,
        avgRT
      });
    }
    
    setShowIntermediateScore(true);
  };

  const proceedToNextTest = () => {
    setShowIntermediateScore(false);
    setShowStats(false);
    if (currentTest < 3) {
      setCurrentTest(currentTest + 1);
      setCurrentTrial(0);
      setCurrentWord('');
      setCurrentColor('');
      setFeedback('');
    }
  };

  const updateStroopResultsInBackend = async (email, correctItems, avgRT) => {
    try {
      const response = await fetch(`${BASE_URL}/update-stroop-results`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email,
          stroop_score_correct_items: correctItems,
          stroop_avg_rt: avgRT
        })
      });
  
      if (!response.ok) {
        const errorData = await response.json();
        console.error("Failed to update stroop results:", errorData.detail);
      } else {
        const data = await response.json();
        console.log("Stroop results update:", data.message);
      }
    } catch (error) {
      console.error("Error updating stroop results:", error);
    }
  };
  
  const calculateFinalResults = () => {
    const { word, color, colorWord } = testResults;
    const W = word.correct;
    const C = color.correct;
    const CW_congruent = colorWord.congruent.correct;
    const CW_incongruent = colorWord.incongruent.correct;
    const CW_total = CW_congruent + CW_incongruent;
    
    const WT = word.time;
    const CT = color.time;
    const CWT_congruent = colorWord.congruent.time;
    const CWT_incongruent = colorWord.incongruent.time;
    const CWT_overall = (CWT_congruent + CWT_incongruent) / 2;
    
    const Pcw = (W * C) / (W + C);
    const IG = CW_total - Pcw;
    const Pcwt = ((WT + CT) / 2);
    const TI = CWT_overall - Pcwt;
    
    const wordAcc = word.total > 0 ? (word.correct / word.total) * 100 : 0;
    const colorAcc = color.total > 0 ? (color.correct / color.total) * 100 : 0;
    const colorWordCongruentAcc = colorWord.congruent.total > 0 ? (colorWord.congruent.correct / colorWord.congruent.total) * 100 : 0;
    const colorWordIncongruentAcc = colorWord.incongruent.total > 0 ? (colorWord.incongruent.correct / colorWord.incongruent.total) * 100 : 0;
    
    setFinalResults({
      word: { score: W, rt: WT, acc: wordAcc },
      color: { score: C, rt: CT, acc: colorAcc },
      colorWord: {
        congruent: { score: CW_congruent, rt: CWT_congruent, acc: colorWordCongruentAcc },
        incongruent: { score: CW_incongruent, rt: CWT_incongruent, acc: colorWordIncongruentAcc },
        overall: { score: CW_total, rt: CWT_overall, acc: ((CW_total) / (colorWord.congruent.total + colorWord.incongruent.total)) * 100 }
      }
    });
    
    setShowFinalResults(true);
    setShowIntermediateScore(false);

    const correctItems = {
      color: testResults.color.correct,
      word: testResults.word.correct,
      color_word_congruent: testResults.colorWord.congruent.correct,
      color_word_incongruent: testResults.colorWord.incongruent.correct
    };
    const avgRT = {
      color: testResults.color.time,
      word: testResults.word.time,
      color_word_congruent: testResults.colorWord.congruent.time,
      color_word_incongruent: testResults.colorWord.incongruent.time
    };
    
    const userEmail = localStorage.getItem("email");
    if (userEmail) {
      updateStroopResultsInBackend(userEmail, correctItems, avgRT);
    } else {
      console.warn("User email not found. Cannot update stroop results.");
    }
  };

  useEffect(() => {
    const handleKeyPress = (event) => {
      if (["KeyR", "KeyG", "KeyB", "KeyY"].includes(event.code) && 
          currentTrial > 0 && 
          totalItems < maxTrials && 
          itemTimeoutRef.current !== null) {
        
        clearItemTimers();
        
        const rt = performance.now() - startTimeRef.current;
        const chosenColor = keyToColor[event.code];
        let isCorrect = false;
        let correctAnswer = '';
        
        if (currentTest === 1) {
          correctAnswer = currentWord.toLowerCase();
          isCorrect = chosenColor === correctAnswer;
        } else {
          correctAnswer = currentColor;
          isCorrect = chosenColor === correctAnswer;
        }
        
        setTotalItems((prev) => {
          totalItemsRef.current = prev + 1;
          return prev + 1;
        });
        
        setCorrectItems((prev) => {
          const newVal = isCorrect ? prev + 1 : prev;
          correctItemsRef.current = newVal;
          return newVal;
        });
        
        if (currentTest === 3) {
          if (isCongruent) {
            congruentStatsRef.current.total += 1;
            if (isCorrect) congruentStatsRef.current.correct += 1;
            setCongruentTrialsLeft(prev => prev - 1);
            
            setResponseTimes((prev) => {
              const newArr = [...prev];
              newArr[currentTest - 1].congruent = [...newArr[currentTest - 1].congruent, rt];
              responseTimesRef.current = newArr;
              return newArr;
            });
          } else {
            incongruentStatsRef.current.total += 1;
            if (isCorrect) incongruentStatsRef.current.correct += 1;
            setIncongruentTrialsLeft(prev => prev - 1);
            
            setResponseTimes((prev) => {
              const newArr = [...prev];
              newArr[currentTest - 1].incongruent = [...newArr[currentTest - 1].incongruent, rt];
              responseTimesRef.current = newArr;
              return newArr;
            });
          }
        } else {
          setResponseTimes((prev) => {
            const newArr = [...prev];
            newArr[currentTest - 1] = [...newArr[currentTest - 1], rt];
            responseTimesRef.current = newArr;
            return newArr;
          });
        }
        
        setFeedback(isCorrect ? <span className="correct">Correct!</span> : <span className="wrong">Wrong! It was {colorToWord[correctAnswer]}</span>);
        
        setTimeout(() => {
          const newTotal = totalItemsRef.current;
          if (newTotal >= maxTrials) {
            endTest();
          } else {
            setFeedback('');
            setCurrentWord('');
            setCurrentColor('');  
            setTimeout(() => {
              showStimulus();
            }, 100);
          }
        }, FEEDBACK_DURATION);
      }
    };
    
    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);

  }, [currentTest, currentTrial, totalItems, maxTrials, currentWord, currentColor, isCongruent]);

  useEffect(() => {
    return () => {
      clearItemTimers();
    };
  }, []);

  return (
    <div className="stroop-container">
      <Header isLoggedIn={isLoggedIn} onLogout={onLogout} />
      <main className="stroop-content">
        <div id="game-container">
          <h1>Stroop Test</h1>
          <div id="progress">Test {currentTest} of 3</div>

          {/* Test 1: Word Reading */}
          <div id="word-test" className={`test-section${currentTest === 1 ? ' active' : ''}`}>
            {currentTrial === 0 && !showIntermediateScore && !showFinalResults && (
              <div className="instructions-container">
                <div className="instructions-title">Test 1: Word Reading</div>
                <div className="instructions-text">
                  In this test, you will see color words printed in black ink.<br />
                  Your task is to read the word as quickly as possible.<br />
                  Use the following keys to respond:<br />
                  R = RED, G = GREEN, B = BLUE, Y = YELLOW
                </div>
                <div className="instructions-example">
                  Example: <span style={{ color: 'black' }}>RED</span> → Press R
                </div>
                <div className="instructions-text">
                  Make sure you are taking the test at a quiet place, away from disturbances.
                </div>
                <div className="instructions-text">
                  You will complete {TRIAL_COUNTS[1]} items in this test.<br />
                  <strong>You have only 2 seconds to respond to each item!</strong><br />
                  Try to be both fast and accurate!
                </div>
                <button className="start-button" onClick={startTest}>Start Test</button>
              </div>
            )}
            {currentTrial > 0 && !showIntermediateScore && !showFinalResults && (
              <>
                <div className="stroop-stats-row" style={{ display: showStats ? 'flex' : 'none' }}>
                  <div className="stat" id="progress-stat">Progress: {totalItems}/{maxTrials}</div>
                  <div className="stat" id="score">Correct: {correctItems}</div>
                </div>
                <div id="stimulus" style={{ color: currentColor }}>{currentWord}</div>
                <div id="feedback">{feedback}</div>
              </>
            )}
          </div>

          {/* Test 2: Color Naming */}
          <div id="color-test" className={`test-section${currentTest === 2 ? ' active' : ''}`}>
            {currentTrial === 0 && !showIntermediateScore && !showFinalResults && (
              <div className="instructions-container">
                <div className="instructions-title">Test 2: Color Naming</div>
                <div className="instructions-text">
                  In this test, you will see colored patches.<br />
                  Your task is to name the color of the patch as quickly as possible.<br />
                  Use the following keys to respond:<br />
                  R = RED, G = GREEN, B = BLUE, Y = YELLOW
                </div>
                <div className="instructions-example">
                  Example: <span style={{ color: 'red' }}>■■■</span> → Press R
                </div>
                <div className="instructions-text">
                  Make sure you are taking the test at a quiet place, away from disturbances.
                </div>
                <div className="instructions-text">
                  You will complete {TRIAL_COUNTS[2]} items in this test.<br />
                  <strong>You have only 2 seconds to respond to each item!</strong><br />
                  Try to be both fast and accurate!
                </div>
                <button className="start-button" onClick={startTest}>Start Test</button>
              </div>
            )}
            {currentTrial > 0 && !showIntermediateScore && !showFinalResults && (
              <>
                <div className="stroop-stats-row" style={{ display: showStats ? 'flex' : 'none' }}>
                  <div className="stat" id="progress-stat">Progress: {totalItems}/{maxTrials}</div>
                  <div className="stat" id="score">Correct: {correctItems}</div>
                </div>
                <div id="stimulus" style={{ color: currentColor }}>{currentWord}</div>
                <div id="feedback">{feedback}</div>
              </>
            )}
          </div>

          {/* Test 3: Color-Word */}
          <div id="color-word-test" className={`test-section${currentTest === 3 ? ' active' : ''}`}>
            {currentTrial === 0 && !showIntermediateScore && !showFinalResults && (
              <div className="instructions-container">
                <div className="instructions-title">Test 3: Color-Word</div>
                <div className="instructions-text">
                  In this test, you will see color words printed in different colored ink.<br />
                  Your task is to name the COLOR of the ink, NOT the word.<br />
                  Use the following keys to respond:<br />
                  R = RED, G = GREEN, B = BLUE, Y = YELLOW
                </div>
                <div className="instructions-example">
                  Example: <span style={{ color: 'green' }}>RED</span> → Press G (because the ink is green)
                </div>
                <div className="instructions-text">
                  Make sure you are taking the test at a quiet place, away from disturbances.
                </div>
                <div className="instructions-text">
                  This is the most challenging part of the test.<br />
                  You will complete {TRIAL_COUNTS[3]} items in this test (30 congruent + 30 incongruent).<br />
                  <strong>You have only 2 seconds to respond to each item!</strong><br />
                  Remember: Name the COLOR of the ink, not the word!
                </div>
                <button className="start-button" onClick={startTest}>Start Test</button>
              </div>
            )}
            {currentTrial > 0 && !showIntermediateScore && !showFinalResults && (
              <>
                <div className="stroop-stats-row" style={{ display: showStats ? 'flex' : 'none' }}>
                  <div className="stat" id="progress-stat">Progress: {totalItems}/{maxTrials}</div>
                  <div className="stat" id="score">Correct: {correctItems}</div>
                </div>
                <div id="stimulus" style={{ color: currentColor }}>{currentWord}</div>
                <div id="feedback">{feedback}</div>
              </>
            )}
          </div>

          {/* Intermediate Score */}
          <div id="intermediate-score" className={`intermediate-score${showIntermediateScore ? ' show' : ''}`} style={{ padding:'60px' }}>
            {showIntermediateScore && intermediateScore && (
              <>
                {intermediateScore.testName === 'colorWord' ? (
                  <>
                    <h3>Color-Word Test Complete!</h3>
                    <div style={{ display: 'flex', gap: '40px', justifyContent: 'center', marginBottom: '20px' }}>
                      <div style={{ textAlign: 'left' }}>
                        <h4>Congruent Trials:</h4>
                        <p>Correct Items: {intermediateScore.congruent.correct}</p>
                        <p>Total Items: {intermediateScore.congruent.total}</p>
                        <p>Accuracy: {intermediateScore.congruent.total > 0 
                          ? ((intermediateScore.congruent.correct / intermediateScore.congruent.total) * 100).toFixed(1) 
                          : '0.0'}%</p>
                        <p>Avg. Reaction Time: {intermediateScore.congruent.avgRT.toFixed(2)}s</p>
                      </div>

                      <div style={{ textAlign: 'left' }}>
                        <h4>Incongruent Trials:</h4>
                        <p>Correct Items: {intermediateScore.incongruent.correct}</p>
                        <p>Total Items: {intermediateScore.incongruent.total}</p>
                        <p>Accuracy: {intermediateScore.incongruent.total > 0 
                          ? ((intermediateScore.incongruent.correct / intermediateScore.incongruent.total) * 100).toFixed(1) 
                          : '0.0'}%</p>
                        <p>Avg. Reaction Time: {intermediateScore.incongruent.avgRT.toFixed(2)}s</p>
                      </div>
                    </div>

                  </>
                ) : (
                  <>
                    <h3>{intermediateScore.testName === 'word' ? 'Word Reading' : 'Color Naming'} Test Complete!</h3>
                     <p>Correct Items: {intermediateScore.correct}</p>
                     <p>Total Items: {intermediateScore.total}</p>
                     <p>Accuracy: {intermediateScore.total > 0 ? ((intermediateScore.correct/intermediateScore.total) * 100).toFixed(1) : '0.0'}%</p>
                     <p>Avg. Reaction Time: {intermediateScore.avgRT.toFixed(2)}s</p>
                   </>
                )}
                <button className="next-test-button" onClick={currentTest === 3 ? calculateFinalResults : proceedToNextTest}>
                  {currentTest === 3 ? 'View Final Results' : 'Start Next Test'}
                </button>
              </>
            )}
          </div>

          {/* Final Results */}
          <div id="final-results" className={`final-results${showFinalResults ? '' : ' hidden'}`} style={{ display: showFinalResults ? 'block' : 'none', textAlign: 'left' }}>
            {showFinalResults && finalResults && (
              <>
                <div style={{ textAlign: 'center', fontWeight: 'bold', fontSize: 32, marginBottom: '16px' }}>
                  Test Complete!
                </div>
                <div style={{ marginLeft: '50px'}}>
                  <div className="result-stat"><b>Word Reading: </b> <b>Correct: </b><span className="result-sub">{finalResults.word.score}/{testResults.word.total} items, <b>Avg RT:</b> {finalResults.word.rt.toFixed(2)}s, <b>Accuracy:</b> {finalResults.word.acc.toFixed(1)}%</span></div>
                  <div className="result-stat"><b>Color Naming: </b> <b>Correct: </b><span className="result-sub">{finalResults.color.score}/{testResults.color.total} items, <b>Avg RT:</b> {finalResults.color.rt.toFixed(2)}s, <b>Accuracy:</b> {finalResults.color.acc.toFixed(1)}%</span></div>
                  
                  <div className="result-stat"><b>Color-Word (Congruent): </b> <b>Correct: </b><span className="result-sub">{finalResults.colorWord.congruent.score}/{testResults.colorWord.congruent.total} items, <b>Avg RT:</b> {finalResults.colorWord.congruent.rt.toFixed(2)}s, <b>Accuracy:</b> {finalResults.colorWord.congruent.acc.toFixed(1)}%</span></div>
                  <div className="result-stat"><b>Color-Word (Incongruent): </b> <b>Correct: </b><span className="result-sub">{finalResults.colorWord.incongruent.score}/{testResults.colorWord.incongruent.total} items, <b>Avg RT:</b> {finalResults.colorWord.incongruent.rt.toFixed(2)}s, <b>Accuracy:</b> {finalResults.colorWord.incongruent.acc.toFixed(1)}%</span></div>
                </div>
                <div style={{ display: 'flex', gap: '16px', justifyContent: 'center', marginTop: '24px' }}>
                  <button className="start-button" onClick={() => navigate(`/dashboard/${username}`)}>
                    Back to Dashboard
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}

export default StroopTest;