import { createContext, useState, useEffect, useContext } from 'react';
import db from '../utils/db';
import { AuthContext } from './AuthContext';

export const GameContext = createContext();

export const GameProvider = ({ children }) => {
  const [coins, setCoins] = useState(0);
  const [highScore, setHighScore] = useState(0);
  const [unlockedBirds, setUnlockedBirds] = useState(['captain-bird']);
  const [selectedBird, setSelectedBird] = useState('captain-bird');
  const [loading, setLoading] = useState(true);
  
  // Get current user from AuthContext
  const { currentUser } = useContext(AuthContext);
  
  const birds = [
    { id: 'captain-bird', name: 'Captain Bird', price: 0, colors: 'Red, Blue & White', description: 'The First Avenger' },
    { id: 'hulk-bird', name: 'Hulk Bird', price: 100, colors: 'Dark Green', description: 'Smashing through pipes!' },
    { id: 'thor-bird', name: 'Thor Bird', price: 200, colors: 'Blue & Silver', description: 'God of Thunder' },
    { id: 'spider-bird', name: 'Spider Bird', price: 300, colors: 'Red & Black', description: 'Your friendly neighborhood bird' },
    { id: 'thanos-bird', name: 'Thanos Bird', price: 500, colors: 'Violet & Black', description: 'Inevitable' }
  ];
  
  // Load game data when component mounts or user changes
  useEffect(() => {
    const loadGameData = async () => {
      setLoading(true);
      
      try {
        if (currentUser && !currentUser.isGuest) {
          // Load from database for logged-in users
          const progress = await db.gameProgress.get(currentUser.id);
          
          if (progress) {
            setCoins(progress.coins || 0);
            setHighScore(progress.highScore || 0);
            setUnlockedBirds(progress.unlockedBirds || ['captain-bird']);
            setSelectedBird(progress.selectedBird || 'captain-bird');
          } else {
            // Initialize if no progress exists
            await db.gameProgress.put({
              userId: currentUser.id,
              coins: 0,
              highScore: 0,
              unlockedBirds: ['captain-bird'],
              selectedBird: 'captain-bird'
            });
          }
        } else {
          // For guests, use localStorage
          const savedCoins = localStorage.getItem('avengersFlappyCoins');
          const savedScore = localStorage.getItem('avengersFlappyHighScore');
          const savedBirds = localStorage.getItem('avengersFlappyUnlockedBirds');
          const savedBird = localStorage.getItem('avengersFlappySelectedBird');
          
          setCoins(savedCoins ? parseInt(savedCoins) : 0);
          setHighScore(savedScore ? parseInt(savedScore) : 0);
          setUnlockedBirds(savedBirds ? JSON.parse(savedBirds) : ['captain-bird']);
          setSelectedBird(savedBird || 'captain-bird');
        }
      } catch (error) {
        console.error('Error loading game data:', error);
        // Fallback to defaults
        setCoins(0);
        setHighScore(0);
        setUnlockedBirds(['captain-bird']);
        setSelectedBird('captain-bird');
      }
      
      setLoading(false);
    };
    
    loadGameData();
  }, [currentUser]);
  
  // Save game data when it changes
  useEffect(() => {
    if (loading) return; // Don't save during initial load
    
    const saveGameData = async () => {
      try {
        if (currentUser && !currentUser.isGuest) {
          // Save to database for logged-in users
          await db.gameProgress.put({
            userId: currentUser.id,
            coins,
            highScore,
            unlockedBirds,
            selectedBird
          });
        } else {
          // For guests, use localStorage
          localStorage.setItem('avengersFlappyCoins', coins);
          localStorage.setItem('avengersFlappyHighScore', highScore);
          localStorage.setItem('avengersFlappyUnlockedBirds', JSON.stringify(unlockedBirds));
          localStorage.setItem('avengersFlappySelectedBird', selectedBird);
        }
      } catch (error) {
        console.error('Error saving game data:', error);
      }
    };
    
    saveGameData();
  }, [coins, highScore, unlockedBirds, selectedBird, currentUser, loading]);
  
  const addCoins = (amount) => {
    setCoins(prev => prev + amount);
  };
  
  const updateHighScore = (score) => {
    if (score > highScore) {
      setHighScore(score);
    }
  };
  
  const unlockBird = (birdId) => {
    if (!unlockedBirds.includes(birdId)) {
      const bird = birds.find(b => b.id === birdId);
      if (bird && coins >= bird.price) {
        setCoins(prev => prev - bird.price);
        setUnlockedBirds(prev => [...prev, birdId]);
        return true;
      }
    }
    return false;
  };
  
  const selectBird = (birdId) => {
    if (unlockedBirds.includes(birdId)) {
      setSelectedBird(birdId);
      return true;
    }
    return false;
  };
  
  return (
    <GameContext.Provider value={{
      coins,
      highScore,
      unlockedBirds,
      selectedBird,
      birds,
      addCoins,
      updateHighScore,
      unlockBird,
      selectBird,
      loading
    }}>
      {!loading && children}
    </GameContext.Provider>
  );
};