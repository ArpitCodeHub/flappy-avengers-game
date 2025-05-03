import React from 'react';

const Pipe = ({ x, topHeight, gap }) => {
  return (
    <>
      {/* Top pipe */}
      <div 
        className="pipe pipe-top"
        style={{
          left: `${x}px`,
          height: `${topHeight}px`,
          top: 0
        }}
      ></div>
      
      {/* Bottom pipe */}
      <div 
        className="pipe pipe-bottom"
        style={{
          left: `${x}px`,
          top: `${topHeight + gap}px`,
          height: `${600 - topHeight - gap}px`
        }}
      ></div>
    </>
  );
};

export default Pipe;