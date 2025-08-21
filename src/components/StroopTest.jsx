import { useState, useEffect, useRef } from 'react';
import Header from './Header';
import './Header.css';
import './StroopTest.css';
import { useNavigate } from 'react-router-dom';

const TEST_DURATION = 5;
const FEEDBACK_DURATION = 200;

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
  const [timeLeft, setTimeLeft] = useState(TEST_DURATION);
  const [currentWord, setCurrentWord] = useState('');
  const [currentColor, setCurrentColor] = useState('');
  const [feedback, setFeedback] = useState('');
  const [showStats, setShowStats] = useState(false);
  const [intermediateScore, setIntermediateScore] = useState(null);
  const [showIntermediateScore, setShowIntermediateScore] = useState(false);
  const [showFinalResults, setShowFinalResults] = useState(false);
  const [finalResults, setFinalResults] = useState(null);
  const [testResults, setTestResults] = useState({
    word: { correct: 0, total: 0, time: 0 },
    color: { correct: 0, total: 0, time: 0 },
    colorWord: { correct: 0, total: 0, time: 0 }
  });
  const [responseTimes, setResponseTimes] = useState([[], [], []]);

  const timerIntervalRef = useRef(null);
  const startTimeRef = useRef(0);
  const correctItemsRef = useRef(0);
  const totalItemsRef = useRef(0);
  const responseTimesRef = useRef([[], [], []]);
  const username = localStorage.getItem('username');

  const getRandomItem = (arr) => arr[Math.floor(Math.random() * arr.length)];

  const showStimulus = () => {
    let newWord = '';
    let newColor = '';
    if (currentTest === 1) {
      newWord = getRandomItem(words);
      newColor = 'black';
    } else if (currentTest === 2) {
      newWord = '■■■';
      newColor = getRandomItem(colors);
    } else if (currentTest === 3) {
      newWord = getRandomItem(words);
      do {
        newColor = getRandomItem(colors);
      } while (newWord.toLowerCase() === newColor);
    }
    setCurrentWord(newWord);
    setCurrentColor(newColor);
    startTimeRef.current = performance.now();
  };

  const startTest = () => {
    if (currentTrial > 0) return;
    setShowStats(true);
    setCurrentTrial(1);
    setCorrectItems(0);
    setTotalItems(0);
    correctItemsRef.current = 0;
    totalItemsRef.current = 0;
    setTimeLeft(TEST_DURATION);
    setFeedback('');
    setIntermediateScore(null);
    setShowIntermediateScore(false);
    setShowFinalResults(false);
    setFinalResults(null);
    responseTimesRef.current[currentTest - 1] = [];
    setResponseTimes((prev) => {
      const newArr = [...prev];
      newArr[currentTest - 1] = [];
      return newArr;
    });
    showStimulus();
    timerIntervalRef.current = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timerIntervalRef.current);
          endTest();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  const endTest = () => {
    clearInterval(timerIntervalRef.current);
    setShowStats(false);
    const rts = responseTimesRef.current[currentTest - 1];
    const avgRT = rts.length > 0 ? (rts.reduce((a, b) => a + b, 0) / rts.length) / 1000 : 0;
    const testName = currentTest === 1 ? 'word' : currentTest === 2 ? 'color' : 'colorWord';
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
      const response = await fetch('http://127.0.0.1:8000/update-stroop-results', {
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
    const CW = colorWord.correct;
    const WT = word.time;
    const CT = color.time;
    const CWT = colorWord.time;
    const Pcw = (W * C) / (W + C);
    const IG = CW - Pcw;
    const Pcwt = ((WT + CT) / 2);
    const TI = CWT - Pcwt;
    const wordAcc = word.total > 0 ? (word.correct / word.total) * 100 : 0;
    const colorAcc = color.total > 0 ? (color.correct / color.total) * 100 : 0;
    const colorWordAcc = colorWord.total > 0 ? (colorWord.correct / colorWord.total) * 100 : 0;
    setFinalResults({
      word: { score: W, rt: WT, acc: wordAcc },
      color: { score: C, rt: CT, acc: colorAcc },
      colorWord: { score: CW, rt: CWT, acc: colorWordAcc }
    });
    setShowFinalResults(true);
    setShowIntermediateScore(false);

    const correctItems = {
      color: testResults.color.correct,
      word: testResults.word.correct,
      color_word: testResults.colorWord.correct
    };
    const avgRT = {
      color: testResults.color.time,
      word: testResults.word.time,
      color_word: testResults.colorWord.time
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
      if (["KeyR", "KeyG", "KeyB", "KeyY"].includes(event.code) && currentTrial > 0 && timeLeft > 0) {
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
        setResponseTimes((prev) => {
          const newArr = [...prev];
          newArr[currentTest - 1] = [...newArr[currentTest - 1], rt];
          responseTimesRef.current = newArr;
          return newArr;
        });
        setFeedback(isCorrect ? <span className="correct">Correct!</span> : <span className="wrong">Wrong! It was {colorToWord[correctAnswer]}</span>);
        setTimeout(() => {
          setFeedback('');
          showStimulus();
        }, FEEDBACK_DURATION);
      }
    };
    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);

  }, [currentTest, currentTrial, timeLeft, currentWord, currentColor]);

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
                  You will have 45 seconds to complete as many items as possible.<br />
                  Try to be both fast and accurate!
                </div>
                <button className="start-button" onClick={startTest}>Start Test</button>
              </div>
            )}
            {currentTrial > 0 && !showIntermediateScore && !showFinalResults && (
              <>
                <div className="stroop-stats-row" style={{ display: showStats ? 'flex' : 'none' }}>
                  <div className="stat" id="timer">Time: {timeLeft}s</div>
                  <div className="stat" id="score">Items: {correctItems}</div>
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
                  You will have 45 seconds to complete as many items as possible.<br />
                  Try to be both fast and accurate!
                </div>
                <button className="start-button" onClick={startTest}>Start Test</button>
              </div>
            )}
            {currentTrial > 0 && !showIntermediateScore && !showFinalResults && (
              <>
                <div className="stroop-stats-row" style={{ display: showStats ? 'flex' : 'none' }}>
                  <div className="stat" id="timer">Time: {timeLeft}s</div>
                  <div className="stat" id="score">Items: {correctItems}</div>
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
                  This is the most challenging part of the test.<br />
                  You will have 45 seconds to complete as many items as possible.<br />
                  Remember: Name the COLOR of the ink, not the word!
                </div>
                <button className="start-button" onClick={startTest}>Start Test</button>
              </div>
            )}
            {currentTrial > 0 && !showIntermediateScore && !showFinalResults && (
              <>
                <div className="stroop-stats-row" style={{ display: showStats ? 'flex' : 'none' }}>
                  <div className="stat" id="timer">Time: {timeLeft}s</div>
                  <div className="stat" id="score">Items: {correctItems}</div>
                </div>
                <div id="stimulus" style={{ color: currentColor }}>{currentWord}</div>
                <div id="feedback">{feedback}</div>
              </>
            )}
          </div>

          {/* Intermediate Score */}
          <div id="intermediate-score" className={`intermediate-score${showIntermediateScore ? ' show' : ''}`}>
            {showIntermediateScore && intermediateScore && (
              <>
                <h3>{intermediateScore.testName === 'word' ? 'Word Reading' : intermediateScore.testName === 'color' ? 'Color Naming' : 'Color-Word'} Test Complete!</h3>
                <p>Correct Items: {intermediateScore.correct}</p>
                <p>Total Items: {intermediateScore.total}</p>
                <p>Accuracy: {intermediateScore.total > 0 ? ((intermediateScore.correct/intermediateScore.total) * 100).toFixed(1) : '0.0'}%</p>
                <p>Avg. Reaction Time: {intermediateScore.avgRT.toFixed(2)}s</p>
                <button className="next-test-button" onClick={currentTest === 3 ? calculateFinalResults : proceedToNextTest}>
                  {currentTest === 3 ? 'View Final Results' : 'Start Next Test'}
                </button>
              </>
            )}
          </div>

          {/* Final Results */}
          <div id="final-results" className={`final-results${showFinalResults ? '' : ' hidden'}`} style={{ display: showFinalResults ? 'block' : 'none' }}>
            {showFinalResults && finalResults && (
              <>
                <div className="main-heading">Test Complete!</div>
                <div className="result-stat"><b>Word Reading: </b> <b>Correct:</b><span className="result-sub">{finalResults.word.score} items, <b>Avg RT:</b> {finalResults.word.rt.toFixed(2)}s, <b>Accuracy:</b> {finalResults.word.acc.toFixed(1)}%</span></div>
                <div className="result-stat"><b>Color Naming: </b> <b>Correct:</b><span className="result-sub">{finalResults.color.score} items, <b>Avg RT:</b> {finalResults.color.rt.toFixed(2)}s, <b>Accuracy:</b> {finalResults.color.acc.toFixed(1)}%</span></div>
                <div className="result-stat"><b>Color-Word: </b> <b>Correct:</b><span className="result-sub">{finalResults.colorWord.score} items, <b>Avg RT:</b> {finalResults.colorWord.rt.toFixed(2)}s, <b>Accuracy:</b> {finalResults.colorWord.acc.toFixed(1)}%</span></div>
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