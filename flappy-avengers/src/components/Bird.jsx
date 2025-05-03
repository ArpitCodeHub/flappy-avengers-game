import React from 'react';

const Bird = ({ position, type, rotation }) => {
  // Bird colors based on type
  const getBirdStyle = () => {
    switch(type) {
      case 'captain-bird':
        return {
          backgroundColor: '#E23636', // Red
          borderColor: '#518CCA', // Blue
          borderWidth: '4px',
          borderStyle: 'solid',
          boxShadow: '0 0 0 2px white'
        };
      case 'hulk-bird':
        return {
          backgroundColor: '#3C7521', // Green
          borderColor: '#2A5016', // Dark Green
          borderWidth: '2px',
          borderStyle: 'solid'
        };
      case 'thor-bird':
        return {
          backgroundColor: '#518CCA', // Blue
          borderColor: '#A7A9AC', // Silver
          borderWidth: '3px',
          borderStyle: 'solid'
        };
      case 'spider-bird':
        return {
          backgroundColor: '#E23636', // Red
          borderColor: '#23262A', // Black
          borderWidth: '3px',
          borderStyle: 'solid',
          backgroundImage: 'linear-gradient(45deg, #E23636 25%, transparent 25%, transparent 75%, #E23636 75%), linear-gradient(45deg, #E23636 25%, #23262A 25%, #23262A 75%, #E23636 75%)',
          backgroundSize: '10px 10px',
          backgroundPosition: '0 0, 5px 5px'
        };
      case 'thanos-bird':
        return {
          backgroundColor: '#7D4E9E', // Violet
          borderColor: '#23262A', // Black
          borderWidth: '3px',
          borderStyle: 'solid'
        };
      default:
        return {
          backgroundColor: '#E23636' // Default red
        };
    }
  };

  return (
    <div 
      className="bird"
      style={{
        top: `${position}px`,
        transform: `rotate(${rotation}deg)`,
        ...getBirdStyle()
      }}
    >
      {/* Bird eye */}
      <div className="bird-eye"></div>
      
      {/* Bird wing */}
      <div className="bird-wing" 
        style={{
          animation: 'flapWings 0.3s infinite alternate'
        }}
      ></div>
    </div>
  );
};

export default Bird;