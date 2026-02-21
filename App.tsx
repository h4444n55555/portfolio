
import React, { useState, useEffect } from 'react';
import Sidebar from './components/Sidebar';
import Background from './components/Background';
import Hero from './components/sections/Hero';
import Experience from './components/sections/Experience';
import Works from './components/sections/Works';
import About from './components/sections/About';
import Contact from './components/sections/Contact';
import Certificates from './components/sections/Certificates';
import FloatingLogo from './components/FloatingLogo';

const App: React.FC = () => {
  const [showSidebar, setShowSidebar] = useState(false);
  const [activeSection, setActiveSection] = useState('about');
  const [scrollY, setScrollY] = useState(0);

  useEffect(() => {
    const handleScroll = () => {
      setScrollY(window.scrollY);
      // Show sidebar and fly logo immediately after scrolling a bit (50px)
      if (window.scrollY > 50) {
        setShowSidebar(true);
      } else {
        setShowSidebar(false);
      }
    };

    window.addEventListener('scroll', handleScroll);
    
    return () => {
        window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  useEffect(() => {
    const sections = document.querySelectorAll('section[id]');
    
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                // Determine which section is predominantly in view
                setActiveSection(entry.target.id);
            }
        });
    }, { 
        threshold: 0.3, 
        rootMargin: "-10% 0px -40% 0px" 
    });

    sections.forEach(section => observer.observe(section));
    return () => observer.disconnect();
  }, []);

  return (
    <>
        <Background isVisible={showSidebar} />
        <FloatingLogo showSidebar={showSidebar} />
        
        {/* Sidebar moved here to ensure it is above Hero in stacking context */}
        <Sidebar isVisible={showSidebar} activeSection={activeSection} />

        <div className="relative z-10 flex w-full">
            <main className="flex-1 w-full relative flex flex-col min-h-screen">
                <header className="fixed top-0 right-0 p-8 md:p-12 z-50 pointer-events-none mix-blend-darken">
                    {/* Header content if needed in future */}
                </header>
                
                <Hero showSidebar={showSidebar} />
                <About />
                <Experience />
                <Works />
                <Certificates />
                <Contact />
            </main>
        </div>
    </>
  );
};

export default App;
