
import React, { useEffect, useRef } from 'react';

interface HeroProps {
  showSidebar: boolean;
}

const Hero: React.FC<HeroProps> = ({ showSidebar }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let width: number, height: number, rows: number, cols: number;
    const spacing = 40;
    const points: any[] = [];
    const mouse = { x: -1000, y: -1000 };

    class Point {
      x: number;
      y: number;
      baseX: number;
      baseY: number;
      vx: number;
      vy: number;

      constructor(x: number, y: number) {
        this.x = x;
        this.y = y;
        this.baseX = x;
        this.baseY = y;
        this.vx = 0;
        this.vy = 0;
      }

      update() {
        const dx = mouse.x - this.x;
        const dy = mouse.y - this.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        
        if (dist < 250) {
          const angle = Math.atan2(dy, dx);
          const tx = mouse.x - Math.cos(angle) * 60;
          const ty = mouse.y - Math.sin(angle) * 60;
          this.vx += (tx - this.x) * 0.08;
          this.vy += (ty - this.y) * 0.08;
        }

        // Spring back to home
        const dxHome = this.baseX - this.x;
        const dyHome = this.baseY - this.y;
        this.vx += dxHome * 0.05;
        this.vy += dyHome * 0.05;

        // Friction
        this.vx *= 0.85;
        this.vy *= 0.85;

        this.x += this.vx;
        this.y += this.vy;
      }
    }

    const init = () => {
      const rect = canvas.getBoundingClientRect();
      width = rect.width;
      height = rect.height;
      canvas.width = width;
      canvas.height = height;

      points.length = 0;
      cols = Math.ceil(width / spacing) + 1;
      rows = Math.ceil(height / spacing) + 1;

      for (let i = 0; i < rows; i++) {
        for (let j = 0; j < cols; j++) {
          points.push(new Point(j * spacing, i * spacing));
        }
      }
    };

    const draw = () => {
      ctx.clearRect(0, 0, width, height);
      
      ctx.beginPath();
      ctx.strokeStyle = '#94a3b8'; 
      ctx.lineWidth = 1;

      for (let i = 0; i < rows; i++) {
        for (let j = 0; j < cols; j++) {
          const p = points[i * cols + j];
          p.update();

          if (j < cols - 1) {
            const nextH = points[i * cols + (j + 1)];
            ctx.moveTo(p.x, p.y);
            ctx.lineTo(nextH.x, nextH.y);
          }

          if (i < rows - 1) {
            const nextV = points[(i + 1) * cols + j];
            ctx.moveTo(p.x, p.y);
            ctx.lineTo(nextV.x, nextV.y);
          }
          
          const s = Math.sqrt(p.vx * p.vx + p.vy * p.vy);
          if (s > 1.2) {
              ctx.fillStyle = `rgba(148, 163, 184, ${Math.min(s/12, 0.3)})`;
              ctx.fillRect(p.x - 1, p.y - 1, 2, 2);
          }
        }
      }
      ctx.stroke();
      requestAnimationFrame(draw);
    };

    const handleMouseMove = (e: MouseEvent) => {
      const rect = canvas.getBoundingClientRect();
      mouse.x = e.clientX - rect.left;
      mouse.y = e.clientY - rect.top;
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('resize', init);

    init();
    draw();

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('resize', init);
    };
  }, []);

  const scrollToContact = (e: React.MouseEvent) => {
    e.preventDefault();
    document.getElementById('contact')?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <section className="h-screen w-full flex flex-col justify-center relative z-20 overflow-hidden" id="hero">
        
        {/* Interactive Mesh Background */}
        <div className="absolute inset-0 z-0 opacity-100 pointer-events-none">
            <canvas 
                ref={canvasRef} 
                className="block w-full h-full"
                style={{ 
                    maskImage: 'linear-gradient(to bottom, black 0%, black 70%, transparent 100%)', 
                    WebkitMaskImage: 'linear-gradient(to bottom, black 0%, black 70%, transparent 100%)' 
                }}
            />
        </div>

        <div className="w-full px-6 md:px-24 relative z-30">
            {/* 
                Desktop Content 
                Fades out when sidebar shows.
            */}
            <div 
                className={`hidden md:flex flex-col items-start transition-all duration-500 ease-out
                    ${showSidebar ? 'opacity-0 translate-y-[-20px] pointer-events-none blur-sm' : 'opacity-100 translate-y-0 blur-0 delay-300'}
                `}
            >
                <h2 className="text-slate-500 text-xl md:text-2xl font-light tracking-wide mb-8 leading-relaxed animate-fade-in-up" style={{animationDelay: '1.2s'}}>
                   Co-Founder at <a href="https://kshetriindustries.com" target="_blank" rel="noopener noreferrer" className="text-slate-900 font-medium border-b border-slate-300 pb-0.5 hover:text-slate-600 transition-colors">Kshetri Industries</a>.
                </h2>
                
                <button 
                    onClick={scrollToContact}
                    className="group flex items-center gap-3 text-sm font-semibold uppercase tracking-widest text-slate-900 transition-all hover:text-slate-600 animate-fade-in-up"
                    style={{animationDelay: '1.4s'}}
                >
                    Get in touch
                    {/* Line with initial grow animation and hover expansion */}
                    <div className="h-[1px] bg-slate-900 w-12 group-hover:w-24 transition-all duration-500 ease-[cubic-bezier(0.76,0,0.24,1)] relative">
                        <div className="absolute inset-0 bg-slate-400 w-full h-full animate-pulse"></div>
                    </div>
                </button>
            </div>

            {/* Mobile View Content */}
            <div className="flex md:hidden flex-col items-start justify-center w-full relative">
                 <h1 className="text-6xl font-sans font-bold text-slate-900 tracking-tighter mb-4 leading-[0.9] animate-fade-in-up">
                    Hans<br/>Nongmaithem
                </h1>
                <p className="text-lg text-slate-500 font-medium tracking-tight mb-8 animate-fade-in-up" style={{animationDelay: '0.2s'}}>
                    Aspiring ML Engineer
                </p>
                 <div className="h-[1px] w-12 bg-slate-300 mb-8 animate-fade-in-up" style={{animationDelay: '0.3s'}}></div>
                 <p className="text-slate-600 text-base leading-relaxed mb-10 max-w-[80%] animate-fade-in-up" style={{animationDelay: '0.4s'}}>
                    Co-Founder at <a href="https://kshetriindustries.com" target="_blank" rel="noopener noreferrer" className="text-slate-900 font-medium border-b border-slate-300 pb-0.5">Kshetri Industries</a>.
                </p>
                <button 
                    onClick={scrollToContact}
                    className="group flex items-center gap-4 text-xs font-bold uppercase tracking-widest text-slate-900 animate-fade-in-up"
                    style={{animationDelay: '0.5s'}}
                >
                    Contact Me
                    <div className="h-[1px] bg-slate-900 w-8 group-hover:w-16 transition-all duration-300"></div>
                </button>
            </div>
        </div>
        
        {/* Minimal Scroll Indicator - Centered */}
        <div 
            className={`absolute bottom-12 left-1/2 -translate-x-1/2 animate-bounce text-slate-300 md:text-slate-400/50 transition-opacity duration-300
                ${showSidebar ? 'opacity-0' : 'opacity-100'}
            `}
        >
            <span className="material-symbols-outlined text-2xl md:text-3xl">arrow_downward</span>
        </div>
    </section>
  );
};

export default Hero;
