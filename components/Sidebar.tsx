
import React from 'react';

interface SidebarProps {
  isVisible: boolean;
  activeSection: string;
}

const Sidebar: React.FC<SidebarProps> = ({ isVisible, activeSection }) => {
  const scrollToSection = (e: React.MouseEvent<HTMLAnchorElement>, sectionId: string) => {
    e.preventDefault();
    const element = document.getElementById(sectionId);
    if (element) {
      // Force scroll using native scrollIntoView
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  const getLinkContent = (sectionId: string, label: string) => {
    const isActive = activeSection === sectionId;
    
    return (
      <a 
          href={`#${sectionId}`}
          onClick={(e) => scrollToSection(e, sectionId)}
          className={`group relative flex items-center justify-start w-full px-8 py-4 transition-all duration-500 ease-out font-bold text-xs tracking-widest uppercase z-50 pointer-events-auto cursor-pointer
            ${isActive 
              ? 'text-primary translate-x-4' 
              : 'text-slate-500 hover:text-slate-700 hover:translate-x-1'
            }`}
      >
        {/* Growing Line Behind/Left */}
        <span 
          className={`absolute left-0 top-1/2 -translate-y-1/2 h-[2px] bg-slate-800 rounded-r-full transition-all duration-500 ease-out
            ${isActive ? 'w-6 opacity-100' : 'w-0 opacity-0'}
          `}
        ></span>

        {label}
      </a>
    );
  };

  return (
    <aside 
        className={`fixed top-0 left-0 w-24 md:w-64 h-screen hidden md:flex flex-col justify-between items-center z-50 sidebar-panel py-12 transition-transform duration-700 ease-[cubic-bezier(0.76,0,0.24,1)] ${isVisible ? 'translate-x-0' : '-translate-x-full'}`}
    >
      {/* Spacer for the Logo which sits at the top when sidebar is visible */}
      <div className="h-32 w-full flex items-center justify-center pointer-events-none">
        {/* The FloatingLogo component moves into this space visually */}
      </div>

      <nav className="flex flex-col gap-2 w-full items-start justify-center flex-1">
        {getLinkContent('about', 'About')}
        {getLinkContent('experience', 'Experience')}
        {getLinkContent('projects', 'Projects')}
        {getLinkContent('certificates', 'Certificates')}
        {getLinkContent('contact', 'Contact')}
      </nav>

      <div className="flex flex-col gap-4 items-center mb-4 px-4 w-full z-50 relative">
        <div className="flex gap-4 justify-center flex-wrap">
            <a href="https://mail.google.com/mail/?view=cm&to=hansnongmaithem@gmail.com"target="_blank"rel="noopener noreferrer"title="Email"className="text-slate-400 hover:text-primary transition-colors hover:scale-110 pointer-events-auto">
                <span className="material-symbols-outlined text-xl">mail</span>
            </a>
            <a href="https://www.linkedin.com/in/hans-nongmaithem-88504a320/" target="_blank" rel="noopener noreferrer" title="LinkedIn" className="text-slate-400 hover:text-primary transition-colors hover:scale-110 pointer-events-auto">
                {/* LinkedIn SVG */}
                <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
                </svg>
            </a>
            <a href="https://github.com/h4444n55555" target="_blank" rel="noopener noreferrer" title="GitHub" className="text-slate-400 hover:text-primary transition-colors hover:scale-110 pointer-events-auto">
                {/* GitHub SVG */}
                <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
                </svg>
            </a>
            <a href="https://www.kaggle.com/hansnongmaithem" target="_blank" rel="noopener noreferrer" title="Kaggle" className="text-slate-400 hover:text-primary transition-colors hover:scale-110 w-5 h-5 fill-current pointer-events-auto">
                {/* Kaggle SVG */}
                <svg role="img" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path d="M18.825 23.859c-.022.092-.117.141-.282.141h-3.139c-.187 0-.351-.082-.493-.248l-5.178-6.589-1.513 1.513v5.028c0 .223-.129.336-.387.336H4.276c-.258 0-.387-.113-.387-.336V.336c0 .223.129-.336.387-.336h3.557c.258 0 .387.113.387.336v15.202l6.23-7.234c.129-.141.282-.211.458-.211h3.386c.152 0 .252.047.299.141.047.106.018.211-.088.317l-5.636 6.131 6.046 8.878c.117.164.129.27.035.336z"/></svg>
            </a>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;
