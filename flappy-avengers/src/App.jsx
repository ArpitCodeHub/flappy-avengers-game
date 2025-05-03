import { useState, useEffect } from 'react'
import './App.css'
import { AuthProvider } from './contexts/AuthContext'
import { GameProvider } from './contexts/GameContext'
import Login from './components/Login'
import Signup from './components/Signup'

function App() {
  const [gameState, setGameState] = useState('login') // login, signup, menu, game, store, gameover
  const [selectedBird, setSelectedBird] = useState('captain-bird')
  const [coins, setCoins] = useState(0)
  const [unlockedBirds, setUnlockedBirds] = useState(['captain-bird'])
  const [score, setScore] = useState(0)
  const [highScore, setHighScore] = useState(0)
  const [user, setUser] = useState(null)

  // Load saved data from localStorage or user account
  useEffect(() => {
    if (user) {
      // If user is logged in, load from their account data
      const userData = JSON.parse(localStorage.getItem(`avengersFlappy_${user.id}`) || '{}')
      if (userData.coins) setCoins(userData.coins)
      if (userData.highScore) setHighScore(userData.highScore)
      if (userData.unlockedBirds) setUnlockedBirds(userData.unlockedBirds)
      if (userData.selectedBird) setSelectedBird(userData.selectedBird)
    } else {
      // Otherwise load from general localStorage
      const savedCoins = localStorage.getItem('avengersFlappyCoins')
      const savedHighScore = localStorage.getItem('avengersFlappyHighScore')
      const savedUnlockedBirds = localStorage.getItem('avengersFlappyUnlockedBirds')
      const savedSelectedBird = localStorage.getItem('avengersFlappySelectedBird')
      
      if (savedCoins) setCoins(parseInt(savedCoins))
      if (savedHighScore) setHighScore(parseInt(savedHighScore))
      if (savedUnlockedBirds) setUnlockedBirds(JSON.parse(savedUnlockedBirds))
      if (savedSelectedBird) setSelectedBird(savedSelectedBird)
    }
  }, [user])

  // Save data when it changes
  useEffect(() => {
    if (!gameState || gameState === 'login' || gameState === 'signup') return
    
    if (user) {
      // Save to user account
      localStorage.setItem(`avengersFlappy_${user.id}`, JSON.stringify({
        coins,
        highScore,
        unlockedBirds,
        selectedBird
      }))
    } else {
      // Save to general localStorage
      localStorage.setItem('avengersFlappyCoins', coins)
      localStorage.setItem('avengersFlappyHighScore', highScore)
      localStorage.setItem('avengersFlappyUnlockedBirds', JSON.stringify(unlockedBirds))
      localStorage.setItem('avengersFlappySelectedBird', selectedBird)
    }
  }, [coins, highScore, unlockedBirds, selectedBird, user, gameState])

  // Handle game over
  const handleGameOver = (finalScore, coinsCollected) => {
    setGameState('gameover')
    setCoins(prev => prev + coinsCollected)
    if (finalScore > highScore) {
      setHighScore(finalScore)
    }
  }

  // Purchase a bird
  const purchaseBird = (birdId, price) => {
    if (coins >= price && !unlockedBirds.includes(birdId)) {
      setCoins(prev => prev - price)
      setUnlockedBirds(prev => [...prev, birdId])
      return true
    }
    return false
  }

  // Handle login
  const handleLogin = (userData) => {
    setUser(userData)
    setGameState('menu')
  }

  // Handle signup
  const handleSignup = (userData) => {
    setUser(userData)
    setGameState('menu')
  }

  // Handle logout
  const handleLogout = () => {
    setUser(null)
    setGameState('login')
  }

  return (
    <AuthProvider>
      <GameProvider>
        <div className="app-container">
          {gameState === 'login' && (
            <Login 
              onLogin={handleLogin} 
              onSwitchToSignup={() => setGameState('signup')}
              onPlayAsGuest={() => setGameState('menu')}
            />
          )}
          
          {gameState === 'signup' && (
            <Signup 
              onSignup={handleSignup} 
              onSwitchToLogin={() => setGameState('login')}
            />
          )}
          
          {gameState === 'menu' && (
            <Menu 
              onPlayClick={() => setGameState('game')} 
              onStoreClick={() => setGameState('store')}
              onLogoutClick={handleLogout}
              user={user}
            />
          )}
          
          {gameState === 'game' && (
            <Game 
              selectedBird={selectedBird} 
              onGameOver={handleGameOver} 
              setScore={setScore}
              onBackClick={() => setGameState('menu')}
            />
          )}
          
          {gameState === 'store' && (
            <Store 
              coins={coins} 
              unlockedBirds={unlockedBirds} 
              selectedBird={selectedBird} 
              onSelectBird={setSelectedBird} 
              onPurchaseBird={purchaseBird} 
              onBackClick={() => setGameState('menu')} 
            />
          )}
          
          {gameState === 'gameover' && (
            <GameOver 
              score={score} 
              highScore={highScore} 
              onPlayAgainClick={() => setGameState('game')} 
              onMenuClick={() => setGameState('menu')} 
            />
          )}
        </div>
      </GameProvider>
    </AuthProvider>
  )
}

// Menu Component
function Menu({ onPlayClick, onStoreClick, onLogoutClick, user }) {
  return (
    <div className="menu">
      <h1 className="game-title">Flappy Avengers</h1>
      {user && <p className="welcome-message">Welcome, {user.username}!</p>}
      <button className="menu-button play-button" onClick={onPlayClick}>Play Game</button>
      <button className="menu-button store-button" onClick={onStoreClick}>Character Store</button>
      {user && <button className="menu-button logout-button" onClick={onLogoutClick}>Logout</button>}
    </div>
  )
}

// Game Component
function Game({ selectedBird, onGameOver, setScore }) {
  const [gameStarted, setGameStarted] = useState(false)
  const [birdPosition, setBirdPosition] = useState(250)
  const [birdVelocity, setBirdVelocity] = useState(0)
  const [pipePosition, setPipePosition] = useState(400)
  const [pipeGap, setPipeGap] = useState(200)
  const [pipeHeight, setPipeHeight] = useState(150)
  const [currentScore, setCurrentScore] = useState(0)
  const [coinPosition, setCoinPosition] = useState({ x: 600, y: 250, visible: false })
  const [coinsCollected, setCoinsCollected] = useState(0)
  
  const gravity = 0.5
  const jumpStrength = -10
  const pipeSpeed = 3
  
  // Game loop
  useEffect(() => {
    if (!gameStarted) return
    
    const gameLoop = setInterval(() => {
      // Update bird position based on velocity
      setBirdPosition(prev => prev + birdVelocity)
      // Apply gravity to velocity
      setBirdVelocity(prev => prev + gravity)
      
      // Move pipe
      setPipePosition(prev => {
        // If pipe moves off screen, reset position and randomize height
        if (prev <= -60) {
          setCurrentScore(prev => prev + 1)
          setPipeHeight(Math.floor(Math.random() * 200) + 50)
          // Randomly spawn a coin
          const shouldSpawnCoin = Math.random() > 0.5
          if (shouldSpawnCoin) {
            setCoinPosition({
              x: 400,
              y: Math.floor(Math.random() * 300) + 100,
              visible: true
            })
          }
          return 400
        }
        return prev - pipeSpeed
      })
      
      // Move coin if visible
      if (coinPosition.visible) {
        setCoinPosition(prev => {
          if (prev.x <= -30) {
            return { ...prev, visible: false }
          }
          return { ...prev, x: prev.x - pipeSpeed }
        })
      }
      
      // Check for collisions
      // Bird hits the ground or ceiling
      if (birdPosition <= 0 || birdPosition >= 500) {
        clearInterval(gameLoop)
        onGameOver(currentScore, coinsCollected)
      }
      
      // Bird hits the pipe
      const birdRect = { x: 100, y: birdPosition, width: 40, height: 30 }
      const topPipeRect = { x: pipePosition, y: 0, width: 60, height: pipeHeight }
      const bottomPipeRect = { 
        x: pipePosition, 
        y: pipeHeight + pipeGap, 
        width: 60, 
        height: 500 - (pipeHeight + pipeGap) 
      }
      
      if (checkCollision(birdRect, topPipeRect) || checkCollision(birdRect, bottomPipeRect)) {
        clearInterval(gameLoop)
        onGameOver(currentScore, coinsCollected)
      }
      
      // Bird collects coin
      if (coinPosition.visible) {
        const coinRect = { x: coinPosition.x, y: coinPosition.y, width: 30, height: 30 }
        if (checkCollision(birdRect, coinRect)) {
          setCoinPosition(prev => ({ ...prev, visible: false }))
          setCoinsCollected(prev => prev + 1)
        }
      }
      
      // Update score in parent component
      setScore(currentScore)
      
    }, 20)
    
    return () => clearInterval(gameLoop)
  }, [gameStarted, birdPosition, birdVelocity, pipePosition, coinPosition])
  
  // Handle jump
  const handleJump = () => {
    if (!gameStarted) {
      setGameStarted(true)
      return
    }
    setBirdVelocity(jumpStrength)
  }
  
  // Handle keyboard input
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.code === 'Space') {
        handleJump()
      }
    }
    
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [gameStarted])
  
  // Check collision between two rectangles
  const checkCollision = (rect1, rect2) => {
    return (
      rect1.x < rect2.x + rect2.width &&
      rect1.x + rect1.width > rect2.x &&
      rect1.y < rect2.y + rect2.height &&
      rect1.y + rect1.height > rect2.y
    )
  }
  
  return (
    <div className="game-container" onClick={handleJump}>
      {!gameStarted && (
        <div className="game-start-prompt">
          <p>Click or press SPACE to start</p>
        </div>
      )}
      
      <div 
        className={`bird ${selectedBird}`} 
        style={{ top: `${birdPosition}px` }}
      />
      
      <div 
        className="pipe top-pipe" 
        style={{ 
          left: `${pipePosition}px`,
          height: `${pipeHeight}px`
        }}
      />
      
      <div 
        className="pipe bottom-pipe" 
        style={{ 
          left: `${pipePosition}px`,
          top: `${pipeHeight + pipeGap}px`
        }}
      />
      
      {coinPosition.visible && (
        <div 
          className="coin" 
          style={{ 
            left: `${coinPosition.x}px`,
            top: `${coinPosition.y}px`
          }}
        />
      )}
      
      <div className="score-display">
        <div className="score">Score: {currentScore}</div>
        <div className="coins">Coins: {coinsCollected}</div>
      </div>
    </div>
  )
}

// Store Component
function Store({ coins, unlockedBirds, selectedBird, onSelectBird, onPurchaseBird, onBackClick }) {
  const birds = [
    { id: 'captain-bird', name: 'Captain Bird', price: 0, colors: 'Red, Blue & White', description: 'The First Avenger' },
    { id: 'hulk-bird', name: 'Hulk Bird', price: 100, colors: 'Dark Green', description: 'Smashing through pipes!' },
    { id: 'thor-bird', name: 'Thor Bird', price: 200, colors: 'Blue & Silver', description: 'God of Thunder' },
    { id: 'spider-bird', name: 'Spider Bird', price: 300, colors: 'Red & Black', description: 'Your friendly neighborhood bird' },
    { id: 'thanos-bird', name: 'Thanos Bird', price: 500, colors: 'Violet & Black', description: 'Inevitable' }
  ]
  
  return (
    <div className="store-container">
      <h2>Avengers Character Store</h2>
      <div className="coins-display">Coins: {coins}</div>
      
      <div className="birds-grid">
        {birds.map(bird => {
          const isUnlocked = unlockedBirds.includes(bird.id)
          const isSelected = selectedBird === bird.id
          
          return (
            <div key={bird.id} className={`bird-card ${isSelected ? 'selected' : ''}`}>
              <div className={`bird-preview ${bird.id}`}></div>
              <h3>{bird.name}</h3>
              <p className="bird-colors">{bird.colors}</p>
              <p className="bird-description">{bird.description}</p>
              
              {isUnlocked ? (
                <button 
                  className={`select-button ${isSelected ? 'selected' : ''}`}
                  onClick={() => onSelectBird(bird.id)}
                  disabled={isSelected}
                >
                  {isSelected ? 'Selected' : 'Select'}
                </button>
              ) : (
                <button 
                  className="purchase-button"
                  onClick={() => onPurchaseBird(bird.id, bird.price)}
                  disabled={coins < bird.price}
                >
                  Unlock for {bird.price} coins
                </button>
              )}
            </div>
          )
        })}
      </div>
      
      <button className="back-button" onClick={onBackClick}>Back to Menu</button>
    </div>
  )
}

// Game Over Component
function GameOver({ score, highScore, onPlayAgainClick, onMenuClick }) {
  return (
    <div className="game-over">
      <h2>Game Over</h2>
      <p className="final-score">Score: {score}</p>
      <p className="high-score">High Score: {highScore}</p>
      <button className="play-again-button" onClick={onPlayAgainClick}>Play Again</button>
      <button className="menu-button" onClick={onMenuClick}>Back to Menu</button>
    </div>
  )
}

export default App;