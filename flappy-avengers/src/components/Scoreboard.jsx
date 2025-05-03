import { useContext } from 'react';
import { GameContext } from '../contexts/GameContext';

const Scoreboard = () => {
  const { highScore, coins } = useContext(GameContext);
  
  // In a real implementation, you might fetch scores from a backend
  const dummyScores = [
    { name: 'Iron Man', score: highScore > 250 ? highScore : 250 },
    { name: 'Captain America', score: highScore > 200 ? highScore : 200 },
    { name: 'Thor', score: highScore > 180 ? highScore : 180 },
    { name: 'Black Widow', score: highScore > 150 ? highScore : 150 },
    { name: 'Hulk', score: highScore > 120 ? highScore : 120 },
    { name: 'Hawkeye', score: highScore > 100 ? highScore : 100 },
    { name: 'YOU', score: highScore },
  ].sort((a, b) => b.score - a.score);
  
  return (
    <div className="scoreboard-container">
      <h2 className="scoreboard-title">High Scores</h2>
      
      <div className="scoreboard-header">
        <div className="player-best">Your Best: {highScore}</div>
        <div className="coin-balance">
          <span className="coin-icon">🪙</span> {coins}
        </div>
      </div>
      
      <div className="scores-table">
        <div className="scores-header">
          <div className="rank-column">#</div>
          <div className="name-column">Name</div>
          <div className="score-column">Score</div>
        </div>
        
        {dummyScores.map((entry, index) => (
          <div 
            key={index}
            className={`score-row ${entry.name === 'YOU' ? 'player-score' : ''}`}
          >
            <div className="rank-column">{index + 1}</div>
            <div className="name-column">{entry.name}</div>
            <div className="score-column">{entry.score}</div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Scoreboard;