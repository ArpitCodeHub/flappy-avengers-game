import { useRef, useEffect, useState, useContext } from 'react';
import { GameContext } from '../contexts/GameContext';
import Bird from './Bird';
import Pipe from './Pipe';
// Remove this line: import audioManager from '../utils/AudioManager';

const Game = ({ selectedBird, onGameOver, setScore, fullscreen = false }) => {
  const gameRef = useRef(null);
  const [gameStarted, setGameStarted] = useState(false);
  const [gameOver, setGameOver] = useState(false);
  const [score, setScore] = useState(0);
  const [coinsCollected, setCoinsCollected] = useState(0);
  
  // Game physics state
  const [birdPosition, setBirdPosition] = useState(250);
  const [birdVelocity, setBirdVelocity] = useState(0);
  const [pipes, setPipes] = useState([]);
  const [coins, setCoins] = useState([]);
  // Add responsive game physics constants
  const getGameConstants = () => {
    const isMobile = window.innerWidth < 768;
    const isSmallScreen = window.innerWidth < 500;
    
    return {
      gravity: isMobile ? 0.4 : 0.5,
      jumpStrength: isMobile ? -8.5 : -10,
      pipeGap: isMobile ? (isSmallScreen ? 170 : 190) : 200,
      gameSpeed: isMobile ? 2.5 : 3,
      birdSize: isMobile ? (isSmallScreen ? 35 : 38) : 40,
      coinSize: isMobile ? (isSmallScreen ? 25 : 28) : 30
    };
  };
  
  // Add state for responsive constants
  const [gameConstants, setGameConstants] = useState(getGameConstants());
  
  // Update constants on window resize
  useEffect(() => {
    const handleResize = () => {
      setGameConstants(getGameConstants());
    };
    
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);
  
  // Replace hardcoded values with responsive constants
  const { gravity, jumpStrength, pipeGap, gameSpeed, birdSize, coinSize } = gameConstants;
  const pipeWidth = 80;
  const coinSpawnInterval = score < 20 ? 150 : 300; // Reduced interval for more frequent spawning (was 200/400)
  
  const { addCoins: addCoinsToTotal, updateHighScore } = useContext(GameContext);
  
  // Add new state variables for power-ups and special coins
  const [powerUps, setPowerUps] = useState([]);
  const [coinTypes, setCoinTypes] = useState({
    regular: { value: 1, color: '#F2A900', size: 30 },
    silver: { value: 5, color: '#A7A9AC', size: 25 },
    special: { value: 10, color: '#E23636', size: 35 }
  });
  
  // Remove this entire useEffect block that initializes audio
  // useEffect(() => {
  //   console.log('Initializing audio manager');
  //   audioManager.init();
  //   audioManager.unmute();
  //   audioManager.playBackgroundMusic();
  //   
  //   return () => {
  //     console.log('Cleaning up audio');
  //     audioManager.stopBackgroundMusic();
  //   };
  // }, []);
  
  // Remove this useEffect block that ensures background music continues playing
  // useEffect(() => {
  //   if (gameStarted && !gameOver) {
  //     console.log('Ensuring background music is playing');
  //     audioManager.playBackgroundMusic();
  //   } else if (gameOver) {
  //     console.log('Game over but keeping music playing');
  //   }
  // }, [gameStarted, gameOver]);
  
  // Game loop
  useEffect(() => {
    if (!gameStarted || gameOver) return;
    
    let lastTime = 0;
    let animationFrameId;
    let coinSpawnTimer = 0;
    let powerUpTimer = 0;
    
    // Add performance optimization for mobile
    // Add these at the component level with other state variables
    const [lastFrameTime, setLastFrameTime] = useState(0);
    const [fpsLimit, setFpsLimit] = useState(60); // Default 60fps
    
    // Add this as a separate useEffect
    useEffect(() => {
      const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
      setFpsLimit(isMobile ? 30 : 60); // Lower FPS on mobile for better performance
    }, []);
    
    // Then in the game loop useEffect
    useEffect(() => {
      if (!gameStarted || gameOver) return;
      
      let lastTime = 0;
      let animationFrameId;
      let coinSpawnTimer = 0;
      let powerUpTimer = 0;
      
      const gameLoop = (timestamp) => {
        // Use the state variables here
        if (!lastTime) lastTime = timestamp;
        const deltaTime = timestamp - lastTime;
        
        // Limit frame rate for mobile devices
        if (timestamp - lastFrameTime >= 1000 / fpsLimit) {
          setLastFrameTime(timestamp);
          
          // Game update logic here...
          
          // Update bird position with delta time scaling for consistent physics
          const scaledGravity = gravity * (deltaTime / 16.67); // Scale based on 60fps baseline
          setBirdVelocity(prevVel => prevVel + scaledGravity);
          
          // Scale movement speeds by delta time for consistent gameplay
          const speedFactor = deltaTime / 16.67;
          const frameSpeed = gameSpeed * speedFactor;
          
          // Update pipe positions with scaled speed
          setPipes(prevPipes => {
            const newPipes = prevPipes.map(pipe => ({
              ...pipe,
              x: pipe.x - frameSpeed
            }));
            
            // Rest of pipe logic...
          });
          
          // Similar scaling for coins and power-ups
        }
        
        animationFrameId = requestAnimationFrame(gameLoop);
      };
      
      animationFrameId = requestAnimationFrame(gameLoop);
      
      return () => {
        cancelAnimationFrame(animationFrameId);
      };
    }, [gameStarted, gameOver, birdPosition, birdVelocity, pipes, score, coinSpawnInterval, gameSpeed]);
    
    // Key press handlers
    useEffect(() => {
      const handleKeyPress = (e) => {
        if (e.code === 'Space') {
          if (!gameStarted) {
            startGame();
          } else if (!gameOver) {
            jump();
          } else {
            resetGame();
          }
        }
      };
      
      window.addEventListener('keydown', handleKeyPress);
      
      return () => {
        window.removeEventListener('keydown', handleKeyPress);
      };
    }, [gameStarted, gameOver]);
    
    const startGame = () => {
      setGameStarted(true);
      setGameOver(false);
      setBirdPosition(250);
      setBirdVelocity(0);
      setPipes([]);
      setCoins([]);
      setScore(0);
      setCoinsCollected(0);
      setGameSpeed(3); // Reset game speed
      // Remove this line: audioManager.playBackgroundMusic();
      };
    
    // Add touch event handlers with better mobile responsiveness
    useEffect(() => {
      const handleKeyDown = (e) => {
        if ((e.code === 'Space' || e.key === ' ') && !gameOver) {
          if (!gameStarted) {
            startGame();
          } else {
            jump();
          }
        }
      };
  
      const handleTouchStart = (e) => {
        // Prevent default to avoid double-tap zoom on mobile
        e.preventDefault();
        
        if (!gameOver) {
          if (!gameStarted) {
            startGame();
          } else {
            jump();
          }
        }
      };
      
      // Add passive: false to ensure preventDefault works properly on mobile
      document.addEventListener('keydown', handleKeyDown);
      gameRef.current?.addEventListener('touchstart', handleTouchStart, { passive: false });
      
      return () => {
        document.removeEventListener('keydown', handleKeyDown);
        gameRef.current?.removeEventListener('touchstart', handleTouchStart);
      };
    }, [gameStarted, gameOver]);
    
    // Optimize jump function for mobile
    const jump = () => {
      // Use a slightly weaker jump on mobile devices for better control
      const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
      const mobileJumpStrength = -8.5; // Less powerful jump for mobile
      
      setBirdVelocity(isMobile ? mobileJumpStrength : jumpStrength);
    };
    
    const resetGame = () => {
      setGameStarted(false);
      setGameOver(false);
      setBirdPosition(250);
      setBirdVelocity(0);
      setPipes([]);
      setCoins([]);
      setScore(0);
      setCoinsCollected(0);
      setGameSpeed(3); // Reset game speed
      // Remove this line: audioManager.playBackgroundMusic();
      };
      // Ensure music continues playing when game resets
      audioManager.playBackgroundMusic();
    });
    
    const endGame = () => {
      setGameOver(true);
      updateHighScore(score);
      addCoinsToTotal(coinsCollected);
      // Keep music playing even when game ends
    };
    
    // Add mobile-specific UI elements
    const renderMobileControls = () => {
      const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
      
      if (!isMobile || !gameStarted || gameOver) return null;
      
      return (
        <div className="mobile-controls">
          <div className="tap-indicator">Tap anywhere to jump</div>
        </div>
      );
    };
    
    // Add this to your JSX return statement
    return (
      <div 
        ref={gameRef} 
        className="game-container" 
        style={{ cursor: gameStarted && !gameOver ? 'pointer' : 'default' }}
        onClick={() => {
          if (gameStarted && !gameOver) {
            jump();
          } else if (!gameStarted && !gameOver) {
            startGame();
          }
        }}
      >
        {/* Existing game elements */}
        
        {renderMobileControls()}
      </div>
    );
    
    return (
      <div className="game-container">
        <div 
          ref={gameRef} 
          className="game-area"
          onClick={() => {
            if (!gameStarted) {
              startGame();
            } else if (!gameOver) {
              jump();
            } else {
              resetGame();
            }
          }}
        >
          {/* Game background */}
          <div className="game-background"></div>
          
          {/* Bird */}
          <Bird 
            position={birdPosition} 
            type={selectedBird} 
            rotation={birdVelocity * 2}
          />
          
          {/* Pipes */}
          {pipes.map((pipe, index) => (
            <Pipe 
              key={index}
              x={pipe.x}
              topHeight={pipe.topHeight}
              gap={pipeGap}
            />
          ))}
          
          {/* Coins */}
          {coins.map((coin, index) => (
            <div 
              key={`coin-${index}`}
              className={`coin coin-${coin.type}`}
              style={{
                left: `${coin.x}px`,
                top: `${coin.y}px`,
                width: `${coin.size}px`,
                height: `${coin.size}px`,
                backgroundColor: coinTypes[coin.type].color,
                transform: `rotate(${coin.rotation}deg)`
              }}
            />
          ))}
          
          {/* Render power-ups */}
          {powerUps.map((powerUp, index) => (
            <div 
              key={`powerup-${index}`}
              className={`power-up ${powerUp.type}`}
              style={{
                left: `${powerUp.x}px`,
                top: `${powerUp.y}px`
              }}
            />
          ))}
          
          {/* Game UI */}
          {!gameStarted && !gameOver && (
            <div className="start-screen">
              <h2>Flappy Avengers</h2>
              <p>Press SPACE or tap to start</p>
              <button 
                className="start-with-sound-button"
                onClick={(e) => {
                  e.stopPropagation(); // Prevent the click from bubbling
                  startGame(); // Start the game (music already playing)
                }}
              >
                Start Game
              </button>
            </div>
          )}
          
          {gameOver && (
            <div className="game-over-screen">
              <h2>Game Over</h2>
              <p>Score: {score}</p>
              <p>Coins collected: {coinsCollected}</p>
              <button onClick={resetGame}>Play Again</button>
            </div>
          )}
          
          {gameStarted && !gameOver && (
            <div className="game-ui">
              <div className="score-display">Score: {score}</div>
              <div className="coin-display">🪙 {coinsCollected}</div>
            </div>
          )}
        </div>
      </div>
    );
}
export default Game;