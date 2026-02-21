import React from 'react';

const Experience: React.FC = () => {
  return (
    <section className="min-h-screen p-6 md:p-24 md:pl-[22rem] flex items-center justify-start relative" id="experience">
      <div className="max-w-6xl w-full z-20">
        <div className="flex flex-col md:flex-row gap-12 md:gap-24 items-start">
            
            {/* Title Column */}
            <div className="md:w-1/4 pt-3">
                <h2 className="text-xs md:text-sm font-bold tracking-[0.2em] text-slate-400 uppercase flex items-center gap-3">
                    <span className="w-12 h-[1px] bg-slate-300"></span>
                    Experience
                </h2>
            </div>

            {/* Content Column */}
            <div className="md:w-3/4">
                <div className="liquid-glass p-8 md:p-12 relative">
                    <div className="space-y-12">
                        {/* Experience Item 1 */}
                        <div className="relative pl-8 md:pl-12 border-l-2 border-slate-800/20 group">
                            <div className="absolute -left-[9px] top-0 w-4 h-4 rounded-full bg-slate-800 border-4 border-white group-hover:scale-125 transition-transform duration-300"></div>
                            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-baseline mb-3">
                                <h4 className="text-2xl font-bold text-slate-800">Co-Founder</h4>
                                <span className="text-sm font-mono text-slate-500 font-bold bg-white/50 px-3 py-1 rounded-full border border-slate-200">2025 — Present</span>
                            </div>
                            <h5 className="text-slate-700 font-bold text-lg mb-4">Kshetri Industries Pvt. Ltd.</h5>
                            <ul className="text-base text-slate-600 space-y-2 list-disc list-inside marker:text-slate-400">
                                <li>Founded and registered a private limited company in the F&B sector.</li>
                                <li>Overseeing product development lifecycles and operational logistics.</li>
                                <li>Integrating technology stacks for inventory and process management.</li>
                            </ul>
                        </div>

                        {/* Experience Item 2 */}
                        <div className="relative pl-8 md:pl-12 border-l-2 border-slate-800/20 group">
                            <div className="absolute -left-[9px] top-0 w-4 h-4 rounded-full bg-slate-800 border-4 border-white group-hover:scale-125 transition-transform duration-300"></div>
                            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-baseline mb-3">
                                <h4 className="text-2xl font-bold text-slate-800">Student</h4>
                                <span className="text-sm font-mono text-slate-500 font-bold bg-white/50 px-3 py-1 rounded-full border border-slate-200">2024 — Present</span>
                            </div>
                            <h5 className="text-slate-700 font-bold text-lg mb-4">Indian Institute of Technology, Ropar</h5>
                            <ul className="text-base text-slate-600 space-y-2 list-disc list-outside marker:text-slate-400">
                                <li>Majoring in Artificial Intelligence & Data Engineering.</li>
                                <li>Focused on building practical projects and applying concepts beyond the classroom.</li>
                                <li>Active member of the campus weightlifting club.</li>
                            </ul>
                        </div>
                    </div>
                </div>
            </div>
        </div>
      </div>
    </section>
  );
};

export default Experience;