import React from 'react';

const Intro: React.FC = () => {
  return (
    <section className="min-h-screen flex items-center justify-center p-6 md:p-12 lg:p-20 relative" id="intro">
      <div className="max-w-4xl w-full z-20 mt-20 md:mt-0">
        <div className="clay-base p-8 md:p-16 relative overflow-hidden group">
          <div className="absolute -right-20 -top-20 w-64 h-64 bg-primary/10 rounded-full blur-3xl group-hover:bg-primary/20 transition-colors duration-700"></div>
          
          <h2 className="text-4xl md:text-6xl font-bold text-slate-800 mb-6 leading-tight">
            Hans Nongmaithem<br/>
            <span className="text-primary italic font-serif text-2xl md:text-4xl block mt-4">B.Tech AIDE Student — IIT Ropar</span>
            <span className="text-slate-600 text-xl md:text-2xl block mt-2 font-light">Co-Founder, Kshetri Industries</span>
          </h2>

          <div className="flex flex-wrap gap-3 mb-8">
             {['AI', 'Data', 'Systems', 'Startups'].map(tag => (
                <span key={tag} className="px-3 py-1 bg-white/60 rounded-full text-xs font-bold text-slate-500 uppercase tracking-wider border border-white/50">
                    {tag}
                </span>
             ))}
          </div>

          <p className="text-slate-500 text-lg md:text-xl max-w-2xl leading-relaxed">
            AI & Data Engineering student at IIT Ropar and co-founder of a food & beverage startup. Interested in building real-world systems, AI applications, and scalable products.
          </p>
          <div className="mt-10 flex gap-4">
            <a href="#works" className="clay-pressed px-8 py-4 text-slate-800 font-bold hover:text-primary transition-colors inline-flex items-center gap-2">
              View Projects <span className="material-symbols-outlined">arrow_downward</span>
            </a>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Intro;