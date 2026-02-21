import React from 'react';

const About: React.FC = () => {
  return (
    <section className="min-h-screen flex items-center justify-start p-6 md:p-24 md:pl-[22rem] relative" id="about">
      <div className="max-w-6xl w-full z-20">
        <div className="flex flex-col md:flex-row gap-12 md:gap-24 items-start">
            
            {/* Minimal Title Column */}
            <div className="md:w-1/4 pt-3">
                <h2 className="text-xs md:text-sm font-bold tracking-[0.2em] text-slate-400 uppercase flex items-center gap-3">
                    <span className="w-12 h-[1px] bg-slate-300"></span>
                    About Me
                </h2>
            </div>

            {/* Content Column */}
            <div className="md:w-3/4">
                {/* Simplified, less clustered headline */}
                <div className="text-3xl md:text-5xl font-display font-semibold text-slate-800 leading-tight mb-16">
                    <div className="mb-6">
                        AI & Data Engineering at <span className="text-slate-400 whitespace-nowrap">IIT Ropar</span>.
                    </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                    <div className="space-y-6">
                        <p className="text-slate-600 text-lg leading-relaxed font-light">
                            I am interested in solving real-world problems by building scalable software, designing clean and intuitive user interfaces, and applying machine learning in practical ways to turn ideas into useful products.
                        </p>
                    </div>

                    <div className="space-y-4">
                        <h3 className="text-xs font-bold tracking-widest text-slate-400 uppercase mb-4">Core Competencies</h3>
                        <ul className="grid grid-cols-2 gap-y-3 gap-x-4 text-sm md:text-base text-slate-800 font-medium">
                            <li className="flex items-center gap-2"><span className="w-1 h-1 bg-slate-400 rounded-full"></span>Python & C</li>
                            <li className="flex items-center gap-2"><span className="w-1 h-1 bg-slate-400 rounded-full"></span>System Design</li>
                            <li className="flex items-center gap-2"><span className="w-1 h-1 bg-slate-400 rounded-full"></span>Data Structures & Algorithms</li>
                            <li className="flex items-center gap-2"><span className="w-1 h-1 bg-slate-400 rounded-full"></span>Machine Learning</li>
                            <li className="flex items-center gap-2"><span className="w-1 h-1 bg-slate-400 rounded-full"></span>Data Analysis</li>
                            <li className="flex items-center gap-2"><span className="w-1 h-1 bg-slate-400 rounded-full"></span>AI Tools</li>
                        </ul>
                    </div>
                </div>
            </div>
        </div>
      </div>
    </section>
  );
};

export default About;