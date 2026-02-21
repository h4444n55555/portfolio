import React from 'react';
import CrystalContact from '../CrystalContact';

const Contact: React.FC = () => {
  return (
    <section className="py-20 pb-96 md:pl-64 flex flex-col justify-center relative" id="contact">
      <div className="max-w-6xl w-full z-20 px-6 md:px-24">
        <div className="flex flex-col md:flex-row gap-12 md:gap-24 items-start">
            
            {/* Title Column */}
            <div className="md:w-1/4 pt-3">
                <h2 className="text-xs md:text-sm font-bold tracking-[0.2em] text-slate-400 uppercase flex items-center gap-3">
                    <span className="w-12 h-[1px] bg-slate-300"></span>
                    Contact
                </h2>
            </div>

            {/* Content Column */}
            <div className="md:w-3/4">
                <div className="flex flex-col items-start gap-8">
                  <h2 className="text-4xl md:text-6xl font-bold text-slate-800 leading-tight">
                    Let's build scalable<br/>systems together.
                  </h2>
                  
                  <div className="inline-flex items-center px-4 py-2 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-700 font-semibold text-sm">
                     <span className="w-2 h-2 rounded-full bg-emerald-500 inline-block mr-2 animate-pulse"></span>
                     Status: Actively building · Open to opportunities
                  </div>
                  
                  <div className="mt-4 w-full sm:w-auto">
                    <CrystalContact />
                  </div>
                </div>
            </div>
        </div>
      </div>
    </section>
  );
};

export default Contact;