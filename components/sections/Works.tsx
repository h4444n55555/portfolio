import React, { useState } from 'react';
import { PROJECTS } from '../../constants';
import { motion, useMotionValue, useSpring, useTransform } from 'motion/react';

const Works: React.FC = () => {
  const [hoveredProjectId, setHoveredProjectId] = useState<string | null>(null);

  // 1. Smooth Spring Setup for the depth effect
  // We use springs so the movement feels "organic" and heavy rather than robotic.
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  const springConfig = { damping: 25, stiffness: 150 };
  const smoothX = useSpring(mouseX, springConfig);
  const smoothY = useSpring(mouseY, springConfig);

  // 2. Parallax & Tilt transformations
  // This moves the image INSIDE the frame (Parallax)
  const innerX = useTransform(smoothX, [-0.5, 0.5], [40, -40]);
  const innerY = useTransform(smoothY, [-0.5, 0.5], [40, -40]);
  
  // This tilts the actual Preview Box (3D Tilt)
  const rotateX = useTransform(smoothY, [-0.5, 0.5], [8, -8]);
  const rotateY = useTransform(smoothX, [-0.5, 0.5], [-8, 8]);

  const handleGlobalMove = (e: React.MouseEvent) => {
    // Standardize mouse position from -0.5 (left/top) to 0.5 (right/bottom)
    const px = e.clientX / window.innerWidth - 0.5;
    const py = e.clientY / window.innerHeight - 0.5;

    mouseX.set(px);
    mouseY.set(py);

    // Maintain your original CSS variables for any global cursor effects
    document.documentElement.style.setProperty('--mouse-x', `${e.clientX}px`);
    document.documentElement.style.setProperty('--mouse-y', `${e.clientY}px`);
  };

  return (
    <section
      className="min-h-screen py-24 px-6 md:px-24 md:pl-[22rem] flex flex-col justify-center relative z-20"
      id="projects"
      onMouseMove={handleGlobalMove}
    >
      <div className="max-w-7xl w-full relative grid grid-cols-1 md:grid-cols-4 gap-12 md:gap-16">

        {/* --- TITLE COLUMN --- */}
        <div className="md:col-span-1 pt-3">
          <h2 className="text-xs md:text-sm font-bold tracking-[0.2em] text-slate-400 uppercase flex items-center gap-3 sticky top-32">
            <span className="w-12 h-[1px] bg-slate-300"></span>
            Selected Projects
          </h2>
        </div>

        {/* --- CONTENT COLUMN --- */}
        <div className="md:col-span-3 relative">
          
          {/* THE PREVIEW BOX (Desktop Only) */}
          {/* pointer-events-none allows clicking the text "through" the preview if they overlap */}
          <div className="hidden md:block absolute inset-0 pointer-events-none z-50">
            <motion.div
              className="sticky top-32 ml-auto w-[420px] h-[280px] overflow-hidden shadow-[0_30px_60px_-15px_rgba(0,0,0,0.3)] bg-white border border-slate-200 select-none"
              style={{
                opacity: hoveredProjectId ? 1 : 0,
                rotateX: rotateX,
                rotateY: rotateY,
                perspective: 1000,
                transformStyle: "preserve-3d",
                x: "15%", // Pushes it further right to clear the descriptions
                scale: hoveredProjectId ? 1 : 0.9,
              }}
              transition={{ duration: 0.4, ease: [0.23, 1, 0.32, 1] }}
            >
              <div className="relative w-full h-full bg-white overflow-hidden">
                {PROJECTS.map((project) => (
                  <div
                    key={project.id}
                    className={`absolute inset-0 transition-opacity duration-700 ease-in-out flex items-center justify-center bg-white ${
                      hoveredProjectId === project.id ? 'opacity-100 z-10' : 'opacity-0 z-0'
                    }`}
                  >
                    <motion.img
                      src={project.imageUrl}
                      alt={project.title}
                      style={{ 
                        x: innerX, 
                        y: innerY,
                        scale: 1.2 // Zoomed slightly so movement doesn't show edges
                      }}
                      className={`w-full h-full ${
                        project.imageFit === 'cover' ? 'object-contain p-10' : 'object-cover'
                      }`}
                    />
                  </div>
                ))}
              </div>
            </motion.div>
          </div>

          {/* PROJECT LIST */}
          <div className="flex flex-col w-full relative z-10">
            {PROJECTS.map((project) => {
              const isClickable = project.id === '1';

              return (
                <div
                  key={project.id}
                  className={`group relative border-t border-slate-200 py-12 md:py-20 transition-colors hover:bg-white/40
                    ${isClickable ? 'cursor-pointer' : 'cursor-default'}
                  `}
                  onMouseEnter={() => setHoveredProjectId(project.id)}
                  onMouseLeave={() => setHoveredProjectId(null)}
                  onClick={() => {
                    if (isClickable && project.url) {
                      window.open(project.url, '_blank');
                    }
                  }}
                >
                  {/* TEXT CONTENT */}
                  <div className="px-4 relative z-10 space-y-4 max-w-2xl">
                    
                    {/* Title and Meta Row */}
                    <div className="flex flex-col md:flex-row md:items-baseline justify-between gap-4">
                      <h4 className="text-3xl md:text-6xl font-display font-bold text-slate-800 group-hover:text-primary transition-all duration-500 group-hover:translate-x-4">
                        {project.title}
                      </h4>

                      <div className="flex items-center gap-4 text-slate-500 group-hover:text-slate-700 transition-colors">
                        <span className="text-sm font-bold uppercase tracking-widest">
                          {project.category}
                        </span>
                        <span className="text-xs px-2 py-1 border border-slate-300 rounded-full">
                          {project.year}
                        </span>
                      </div>
                    </div>

                    {/* Description */}
                    {project.description && (
                      <p className="text-slate-600 max-w-xl text-sm md:text-base leading-relaxed group-hover:text-slate-900 transition-colors duration-300">
                        {project.description}
                      </p>
                    )}

                    {/* Technologies */}
                    {project.technologies && (
                      <div className="flex flex-wrap gap-2 pt-2">
                        {project.technologies.map((tech) => (
                          <span
                            key={tech}
                            className="text-[10px] px-2 py-1 bg-slate-200 text-slate-700 rounded-md uppercase font-bold tracking-tight"
                          >
                            {tech}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Mobile Image (Visible only on small screens) */}
                  <div className="md:hidden mt-8 mx-4 rounded-2xl overflow-hidden shadow-lg h-64 relative">
                    <img
                      src={project.imageUrl}
                      alt={project.title}
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent"></div>
                    <div className="absolute bottom-4 left-4 text-white font-bold uppercase tracking-widest text-xs">
                      {project.category}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

      </div>
    </section>
  );
};

export default Works;