import React from 'react';
import { GreetingState, ImageAdjustment } from '@/types/greetings';
import { AdvancedPhotoArrangement } from '../advanced-photo-arrangement';

interface Props {
  state: GreetingState;
  scale?: number;
}

const getImageStyle = (adj: ImageAdjustment, overrideOpacity?: number) => ({
  objectFit: 'cover' as const,
  objectPosition: `calc(50% + ${adj.x}%) calc(50% + ${adj.y}%)`,
  transform: `scale(${adj.zoom})`,
  opacity: overrideOpacity !== undefined ? overrideOpacity : (adj.opacity / 100),
  width: '100%',
  height: '100%',
});

export const TemplateMemoryAlbum: React.FC<Props> = ({ state, scale = 1 }) => {
  const containerStyle = {
    aspectRatio: state.format === 'LANDSCAPE' ? '1200/675' : state.format === 'PORTRAIT' ? '1080/1350' : '1/1',
    transform: `scale(${scale})`,
    transformOrigin: 'top left',
  };

  const isBackgroundMode = state.arrangement === 'FLOATING_BACKGROUND';

  return (
    <div 
      className="relative w-full h-full overflow-hidden bg-[#E9E4DC] flex flex-col items-center p-12" 
      style={containerStyle}
    >
      {/* Background Hero Image */}
      {isBackgroundMode && state.heroImageUrl && (
        <div className="absolute inset-0 z-0">
          <img 
            src={state.heroImageUrl} 
            alt={state.heroName}
            style={getImageStyle(state.heroAdjustment)}
          />
        </div>
      )}

      {/* Background Texture (Subtle grid/paper effect) */}
      <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI0IiBoZWlnaHQ9IjQiPgo8cmVjdCB3aWR0aD0iNCIgaGVpZ2h0PSI0IiBmaWxsPSIjZmZmIiBmaWxsLW9wYWNpdHk9IjAiLz4KPHBhdGggZD0iTTAgMEg0VjRIMEoiIGZpbGw9IiMzMzMiIGZpbGwtb3BhY2l0eT0iMC4wNSIvPgo8L3N2Zz4=')] opacity-30 z-0 pointer-events-none" />

      {/* Title & Header Strip */}
      <div className="relative z-10 w-full mb-8 flex flex-col items-center text-center mt-4 shrink-0 pointer-events-none">
        {state.headline && (
          <div className="bg-white px-6 py-2 shadow-md rounded-sm mb-4 transform -rotate-1 pointer-events-auto">
            <h2 className="font-sans text-sm font-bold tracking-[0.2em] uppercase text-gray-800">
              {state.headline}
            </h2>
          </div>
        )}
        <h1 className="font-serif text-6xl italic text-gray-900 mb-2 drop-shadow-md bg-white/80 px-6 py-2 rounded-lg break-words max-w-full leading-tight pointer-events-auto shadow-sm">
          {state.heroName}
        </h1>
        {state.dateStr && (
          <p className="font-sans text-sm text-gray-700 tracking-wider font-semibold bg-white/90 px-4 py-1 rounded-sm mt-2 pointer-events-auto shadow-sm">
            {state.dateStr}
          </p>
        )}
      </div>

      {/* Album Layout spacer */}
      <div className="relative z-10 w-full flex-1 min-h-0 pointer-events-none">
        <AdvancedPhotoArrangement state={state} frameClass="border-white" />
        
        {/* Fallback Message for background mode inside the flex space so it overlaps photos if requested */}
        {isBackgroundMode && state.message && (
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-4/5 text-center pointer-events-auto z-30">
            <p className="font-serif italic text-3xl text-gray-900 bg-white/95 p-6 rounded-lg shadow-xl border border-gray-100 font-medium break-words">
              &quot;{state.message}&quot;
            </p>
          </div>
        )}
      </div>
      
      {/* Message when NOT in background mode */}
      {!isBackgroundMode && state.message && (
        <div className="relative z-10 w-full shrink-0 text-center mt-6 mb-4 pointer-events-auto">
           <p className="font-serif italic text-2xl text-gray-800 bg-white/95 p-4 rounded shadow border border-gray-100 inline-block max-w-[90%] break-words leading-relaxed">
              &quot;{state.message}&quot;
           </p>
        </div>
      )}

      {/* Footer / Sign-off */}
      <div className="relative z-10 w-full mt-auto pt-4 flex justify-between items-end text-gray-800 font-sans shrink-0 pointer-events-auto">
        <div className="flex flex-col bg-white/95 px-4 py-2 rounded shadow-sm max-w-[60%] border border-gray-100">
          {state.senderName && (
            <span className="text-lg font-serif italic font-bold truncate">
              With love, {state.senderName}
            </span>
          )}
          {state.footer && (
            <span className="text-xs uppercase tracking-widest text-gray-600 mt-1 font-semibold truncate">
              {state.footer}
            </span>
          )}
        </div>

        <div className="text-right bg-white px-3 py-1 rounded-sm shadow-sm shrink-0 border border-gray-100">
          <span className="text-[10px] uppercase tracking-widest font-bold text-gray-800">
            FamilyTree Album
          </span>
        </div>
      </div>

    </div>
  );
};

export default TemplateMemoryAlbum;
