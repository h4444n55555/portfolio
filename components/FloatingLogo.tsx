import React from 'react';

interface FloatingLogoProps {
  showSidebar: boolean;
}

const FloatingLogo: React.FC<FloatingLogoProps> = ({ showSidebar }) => {
  return (
    <div 
        className={`hidden md:flex fixed z-[60] flex-col items-start justify-center transition-all duration-700 ease-[cubic-bezier(0.76,0,0.24,1)] pointer-events-none`}
        style={{
            // Position: Top-left in Hero.
            // In Sidebar: left is 8rem (center of 16rem sidebar). 
            top: showSidebar ? '3.5rem' : '20vh', 
            left: showSidebar ? '8rem' : '6rem', 
            // Transform logic:
            // Hero: No transform. Origin left top.
            // Sidebar: TranslateX -50% to center on 'left' anchor. Scale down. Origin center top ensures scaling is symmetrical.
            transform: showSidebar ? 'translate(-50%, 0) scale(0.45)' : 'translate(0, 0) scale(1)',
            transformOrigin: showSidebar ? 'center top' : 'left top'
        }}
    >
      <div className="relative flex flex-col items-start">
        {/* 
            Name Animation Logic:
            1. Hero State: Full name.
            2. Sidebar State: "Nongmaithem" collapses width/opacity to 0.
        */}
        <h1 className={`font-sans font-extrabold text-7xl xl:text-8xl text-slate-900 tracking-tighter whitespace-nowrap transition-colors duration-700 flex items-center
            ${showSidebar ? 'text-slate-800' : 'text-slate-900'}
        `}>
             <div className="flex">
                <span>Hans</span>
                {/* Collapsible Last Name */}
                <span className={`transition-all duration-700 ease-[cubic-bezier(0.76,0,0.24,1)] overflow-hidden origin-left
                    ${showSidebar ? 'w-0 opacity-0 scale-x-0' : 'w-auto opacity-100 scale-x-100'}
                `}>
                    <span className="pl-4">Nongmaithem</span>
                </span>
             </div>
        </h1>

        {/* Subtitle - Fades out when moving to sidebar */}
        <div className={`mt-2 overflow-hidden transition-all duration-500 ease-out pl-1 ${showSidebar ? 'opacity-0 h-0 translate-y-[-10px]' : 'opacity-100 h-auto translate-y-0'}`}>
            <p className="font-sans text-3xl text-slate-400 font-light tracking-tight">
                Aspiring ML Engineer
            </p>
        </div>
      </div>
    </div>
  );
};

export default FloatingLogo;