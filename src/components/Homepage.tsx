import React from "react";
import { Sparkles, ArrowRight } from "lucide-react";

interface HomepageProps {
  onStartCreating: () => void;
}

export const Homepage: React.FC<HomepageProps> = ({ onStartCreating }) => {
  return (
    <div className="w-full max-w-4xl mx-auto min-h-[60vh] flex flex-col items-center justify-center py-8 px-4 animate-fadeIn">
      {/* Hero Section */}
      <div className="text-center space-y-6 max-w-2xl mx-auto">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 sm:px-4 sm:py-1.5 rounded-full bg-white/5 border border-white/10 text-[9px] sm:text-[10px] font-bold text-white/80 uppercase tracking-widest mx-auto">
          <Sparkles className="w-3 h-3 sm:w-3.5 sm:h-3.5 animate-pulse" />
          SoniaStyle Academy Reference Demo
        </div>
        
        <h1 className="text-3xl sm:text-4xl md:text-5xl font-black font-display text-white tracking-tight leading-[1.15] max-w-2xl mx-auto">
          Share Your Professional Self in <span className="underline decoration-white/30 decoration-[3px] underline-offset-8">One Minute</span>
        </h1>
        
        <p className="text-xs sm:text-sm md:text-base text-white/60 max-w-xl mx-auto leading-relaxed">
          The Bio Card Generator creates clean, high-impact digital business cards. Give freelancers, job seekers, and creators an instant, beautiful landing page for their portfolio and links.
        </p>

        <div className="pt-4 flex justify-center">
          <button
            onClick={onStartCreating}
            className="group inline-flex items-center gap-2.5 px-6 py-3.5 sm:px-8 sm:py-4 bg-white hover:bg-white/90 text-black font-black font-display tracking-wider uppercase text-[10px] sm:text-xs rounded-3xl shadow-xl shadow-white/5 transition-all hover:scale-[1.02] active:scale-[0.98]"
          >
            Create Your Card
            <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-1" />
          </button>
        </div>
      </div>
    </div>
  );
};
