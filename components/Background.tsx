
import React from 'react';

interface BackgroundProps {
  isVisible: boolean;
}

const Background: React.FC<BackgroundProps> = ({ isVisible }) => {
  return (
    <div className={`transition-opacity duration-1000 ${isVisible ? 'opacity-100' : 'opacity-0'}`}>
      <div className="absolute inset-0 z-0 w-full h-full pointer-events-none">
        <div className="grid-bg-container h-full w-full"></div>
      </div>
    </div>
  );
};

export default Background;
