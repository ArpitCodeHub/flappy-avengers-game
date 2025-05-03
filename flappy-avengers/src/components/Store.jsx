import { useContext } from 'react';
import { GameContext } from '../contexts/GameContext';

const Store = () => {
  const { coins, birds, unlockedBirds, selectedBird, unlockBird, selectBird } = useContext(GameContext);
  
  return (
    <div className="store-container">
      <h2 className="store-title">Avengers Character Store</h2>
      
      <div className="store-header">
        <div className="coin-balance">
          <span className="coin-icon">🪙</span> {coins} Coins
        </div>
      </div>
      
      <div className="bird-grid">
        {birds.map(bird => {
          const isUnlocked = unlockedBirds.includes(bird.id);
          const isSelected = selectedBird === bird.id;
          
          return (
            <div 
              key={bird.id}
              className={`bird-card ${isSelected ? 'selected' : ''}`}
            >
              <div className="bird-preview">
                <div className={`bird-avatar ${bird.id}`}></div>
              </div>
              <div className="bird-info">
                <h3>{bird.name}</h3>
                <p className="bird-colors">{bird.colors}</p>
                <p className="bird-description">{bird.description}</p>
              </div>
              
              {isUnlocked ? (
                <button 
                  onClick={() => selectBird(bird.id)}
                  className={`bird-action-button ${isSelected ? 'selected-button' : 'select-button'}`}
                >
                  {isSelected ? 'Selected' : 'Select'}
                </button>
              ) : (
                <button 
                  onClick={() => unlockBird(bird.id)}
                  disabled={coins < bird.price}
                  className={`bird-action-button unlock-button ${coins < bird.price ? 'disabled' : ''}`}
                >
                  Unlock for {bird.price} 🪙
                </button>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default Store;