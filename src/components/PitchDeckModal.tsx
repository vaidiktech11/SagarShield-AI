import React, { useState, useEffect } from 'react';
import { PITCH_DECK_SLIDES } from '../data/mockData';
import { 
  X, 
  ChevronLeft, 
  ChevronRight, 
  Maximize2, 
  Award, 
  Sparkles, 
  Satellite, 
  ShieldAlert, 
  Cpu,
  BarChart3,
  Layers,
  CloudLightning,
  TrendingUp,
  Globe2
} from 'lucide-react';

interface PitchDeckModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const PitchDeckModal: React.FC<PitchDeckModalProps> = ({ isOpen, onClose }) => {
  const [currentSlideIndex, setCurrentSlideIndex] = useState(0);

  // Keyboard navigation (Left / Right / Escape)
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight' || e.key === ' ') {
        setCurrentSlideIndex((prev) => Math.min(prev + 1, PITCH_DECK_SLIDES.length - 1));
      } else if (e.key === 'ArrowLeft') {
        setCurrentSlideIndex((prev) => Math.max(prev - 1, 0));
      } else if (e.key === 'Escape') {
        onClose();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const slide = PITCH_DECK_SLIDES[currentSlideIndex];

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/95 backdrop-blur-md flex items-center justify-center p-4">
      <div className="relative w-full max-w-5xl h-[650px] bg-slate-900 border border-slate-700/80 rounded-2xl shadow-2xl flex flex-col justify-between overflow-hidden">
        {/* Top Pitch Deck Control Bar */}
        <div className="px-6 py-3.5 border-b border-slate-800 bg-slate-950/80 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="px-2.5 py-1 rounded bg-amber-500/20 text-amber-300 border border-amber-500/30 text-xs font-bold uppercase tracking-wider flex items-center gap-1.5">
              <Award className="w-3.5 h-3.5" />
              Official Hackathon Pitch Deck (12 Slides)
            </span>
            <span className="text-xs text-slate-400">
              Slide <strong className="text-white">{slide.number}</strong> of <strong>{PITCH_DECK_SLIDES.length}</strong>: {slide.category}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-400 font-mono hidden sm:inline">
              Use [←] / [→] keys to navigate
            </span>
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors"
              title="Close Deck"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Main Slide Canvas */}
        <div className="p-8 flex-1 flex flex-col justify-between overflow-y-auto">
          {/* Slide Title & Subtitle */}
          <div>
            <div className="inline-block px-3 py-1 rounded-md bg-cyan-950/80 border border-cyan-800 text-cyan-300 text-xs font-mono font-semibold uppercase tracking-wider mb-2">
              Slide {slide.number} • {slide.category}
            </div>
            <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight leading-snug">
              {slide.title}
            </h2>
            <p className="text-sm sm:text-base text-cyan-400/90 font-medium mt-1">
              {slide.subtitle}
            </p>
          </div>

          {/* Slide Content Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 my-4">
            {/* Left: Bullet Points (2 cols) */}
            <div className="md:col-span-2 space-y-3">
              {slide.bullets.map((bullet, idx) => {
                const parts = bullet.split(':');
                const head = parts.length > 1 ? parts[0] : null;
                const rest = parts.length > 1 ? parts.slice(1).join(':') : bullet;

                return (
                  <div key={idx} className="flex items-start gap-3 bg-slate-950/60 p-3.5 rounded-xl border border-slate-800/80">
                    <span className="h-6 w-6 rounded-lg bg-cyan-950 text-cyan-400 border border-cyan-800/80 flex items-center justify-center shrink-0 text-xs font-bold font-mono">
                      0{idx + 1}
                    </span>
                    <p className="text-xs sm:text-sm text-slate-200 leading-relaxed">
                      {head && <strong className="text-cyan-300 font-semibold">{head}: </strong>}
                      {rest}
                    </p>
                  </div>
                );
              })}

              {slide.quote && (
                <div className="p-3.5 rounded-xl bg-amber-950/30 border border-amber-800/60 text-amber-200 text-xs sm:text-sm italic">
                  {slide.quote}
                </div>
              )}
            </div>

            {/* Right: Key Metric Card & Architecture Badge */}
            <div className="flex flex-col justify-between gap-4">
              <div className="bg-gradient-to-br from-cyan-950/60 via-slate-900 to-indigo-950/60 border border-cyan-800/60 p-6 rounded-2xl flex flex-col items-center justify-center text-center shadow-lg">
                <div className="text-3xl sm:text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-teal-300 to-blue-400 font-mono">
                  {slide.keyMetric}
                </div>
                <div className="text-xs font-bold text-slate-300 uppercase tracking-wider mt-2">
                  {slide.metricLabel}
                </div>
              </div>

              {slide.architectureHighlight && (
                <div className="bg-slate-950/80 border border-slate-800 p-4 rounded-xl text-xs space-y-1.5">
                  <div className="text-[10px] text-slate-400 uppercase tracking-wider font-mono flex items-center gap-1 text-cyan-400">
                    <Cpu className="w-3.5 h-3.5" />
                    Stack Alignment
                  </div>
                  <div className="text-slate-300 font-medium leading-relaxed">
                    {slide.architectureHighlight}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Footer evaluation rubric badge */}
          <div className="pt-3 border-t border-slate-800 flex flex-wrap items-center justify-between text-xs text-slate-400">
            <span className="flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
              SagarShield AI • Track 05 Challenge Solution • Google AI Studio
            </span>
            <span className="font-mono text-cyan-400 font-medium">
              Rubric: AI/Technical Execution (25%) | Fit (20%) | Scalability (20%)
            </span>
          </div>
        </div>

        {/* Bottom Slide Navigation Bar */}
        <div className="px-6 py-3 border-t border-slate-800 bg-slate-950 flex items-center justify-between">
          <button
            onClick={() => setCurrentSlideIndex((prev) => Math.max(prev - 1, 0))}
            disabled={currentSlideIndex === 0}
            className="px-4 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 disabled:opacity-40 text-slate-200 text-xs font-bold flex items-center gap-1.5 transition-colors"
          >
            <ChevronLeft className="w-4 h-4" />
            <span>Previous Slide</span>
          </button>

          {/* Slide dots */}
          <div className="flex items-center gap-1.5">
            {PITCH_DECK_SLIDES.map((s, idx) => (
              <button
                key={idx}
                onClick={() => setCurrentSlideIndex(idx)}
                className={`h-2.5 rounded-full transition-all ${
                  idx === currentSlideIndex
                    ? 'w-7 bg-cyan-400'
                    : 'w-2 bg-slate-700 hover:bg-slate-600'
                }`}
                title={`Jump to Slide ${idx + 1}: ${s.category}`}
              />
            ))}
          </div>

          <button
            onClick={() => setCurrentSlideIndex((prev) => Math.min(prev + 1, PITCH_DECK_SLIDES.length - 1))}
            disabled={currentSlideIndex === PITCH_DECK_SLIDES.length - 1}
            className="px-4 py-2 rounded-lg bg-cyan-600 hover:bg-cyan-500 disabled:opacity-40 text-white text-xs font-bold flex items-center gap-1.5 shadow transition-colors"
          >
            <span>Next Slide</span>
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
