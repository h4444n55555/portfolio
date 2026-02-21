import React, { useState, useRef } from 'react';

const CrystalContact: React.FC = () => {
  const [rotation, setRotation] = useState({ x: 0, y: 0 });
  const containerRef = useRef<HTMLDivElement>(null);

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const centerX = rect.width / 2;
    const centerY = rect.height / 2;
    
    const rotateX = (y - centerY) / 10;
    const rotateY = (centerX - x) / 10;

    setRotation({ x: rotateX, y: rotateY });
  };

  const handleMouseLeave = () => {
    setRotation({ x: 0, y: 0 });
  };

  const socials = [
    { platform: 'LINKEDIN', handle: 'hans-nongmaithem', url: 'https://www.linkedin.com/in/hans-nongmaithem-88504a320/' },
    { platform: 'GITHUB', handle: 'h4444n55555', url: 'https://github.com/h4444n55555' },
    { platform: 'KAGGLE', handle: 'hansnongmaithem', url: 'https://www.kaggle.com/hansnongmaithem' },
    { platform: 'EMAIL', handle: 'hansnongmaithem@gmail.com', url: 'https://mail.google.com/mail/?view=cm&to=hansnongmaithem@gmail.com' },
  ];

  return (
    <div 
      ref={containerRef}
      className="crystal-container relative w-full max-w-[320px] group"
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
    >
      <div 
        className="crystal-stack relative w-full"
        style={{ 
          transform: `rotateX(${rotation.x}deg) rotateY(${rotation.y}deg)` 
        }}
      >
        {/* Main Button */}
        <div className="crystal-trigger relative w-full h-20 flex items-center justify-center px-6 cursor-pointer z-10 transition-all duration-400 group-hover:translate-z-[20px] group-hover:shadow-[8px_8px_30px_rgba(0,0,0,0.1)]">
          <span className="font-['Outfit'] font-extrabold text-xl tracking-tighter text-slate-900 uppercase">Contact</span>
        </div>

        {/* Social Links Grid */}
        <div className="social-grid-crystal absolute top-full left-0 w-full flex flex-col gap-1 pt-3 opacity-0 pointer-events-none">
          {socials.map((social, index) => (
            <a 
              key={social.platform}
              href={social.url}
              target="_blank"
              rel="noopener noreferrer"
              className="crystal-item relative h-14 flex items-center px-6 text-slate-800 no-underline transition-all duration-300 hover:bg-white/50 hover:translate-x-2 hover:border-l-4 hover:border-slate-900 group/item"
              style={{ transitionDelay: `${index * 0.05}s` }}
            >
              <span className="font-['Outfit'] font-bold text-sm tracking-tight">{social.platform}</span>
            </a>
          ))}
        </div>
      </div>
    </div>
  );
};

export default CrystalContact;
