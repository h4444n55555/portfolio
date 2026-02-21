import React from 'react';
import { CERTIFICATES } from '../../constants';

const Certificates: React.FC = () => {
  // Get only the certificate that has an image (your real one)
  const cert = CERTIFICATES.find(c => c.imageUrl);

  if (!cert) return null;

  return (
    <section
      className="py-20 md:pl-64 flex flex-col justify-center"
      id="certificates"
    >
      {/* Header */}
      <div className="max-w-6xl w-full px-6 md:px-24 mb-10">
        <div className="flex flex-col md:flex-row gap-12 md:gap-24 items-start">
          <div className="md:w-1/4 pt-3">
            <h2 className="text-xs md:text-sm font-bold tracking-[0.2em] text-slate-400 uppercase flex items-center gap-3">
              <span className="w-12 h-[1px] bg-slate-300"></span>
              Certificates
            </h2>
          </div>
          <div className="md:w-3/4" />
        </div>
      </div>

      {/* Single Certificate */}
      <div className="w-full flex justify-center px-4">
        <div
          className="group relative w-[520px] max-w-full rounded-2xl overflow-hidden shadow-2xl border border-white/50 cursor-pointer"
          onClick={() => cert.url && window.open(cert.url, '_blank')}
        >
          <img
            src={cert.imageUrl}
            alt={cert.title}
            className="w-full h-auto object-cover transition-transform duration-500 group-hover:scale-105"
          />

          {/* Overlay info */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

          <div className="absolute bottom-0 left-0 right-0 p-6 text-white opacity-0 group-hover:opacity-100 transition-opacity duration-300">
            <h4 className="text-xl font-bold">{cert.title}</h4>
            <p className="text-sm opacity-90">
              {cert.issuer} • {cert.date}
            </p>
          </div>

          {/* Open icon */}
          <div className="absolute top-4 right-4 bg-black/50 rounded-full p-2 opacity-0 group-hover:opacity-100 transition">
            <span className="material-symbols-outlined text-white">
              open_in_new
            </span>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Certificates;