import React from 'react';
import { GreetingState, ImageAdjustment } from '@/types/greetings';

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

  const supportPhotos = state.supportingPhotos;
  const isBackgroundMode = state.heroMode === 'BACKGROUND';

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
      <div className="relative z-10 w-full mb-8 flex flex-col items-center text-center mt-4 shrink-0">
        {state.headline && (
          <div className="bg-white/90 backdrop-blur-sm px-6 py-2 shadow-md rounded-sm mb-4 transform -rotate-1">
            <h2 className="font-sans text-sm font-bold tracking-[0.2em] uppercase text-gray-800">
              {state.headline}
            </h2>
          </div>
        )}
        <h1 className="font-serif text-6xl italic text-gray-900 mb-2 drop-shadow-md bg-white/40 px-6 py-2 rounded-lg break-words max-w-full leading-tight">
          {state.heroName}
        </h1>
        {state.dateStr && (
          <p className="font-sans text-sm text-gray-700 tracking-wider font-semibold bg-white/60 px-4 py-1 rounded-sm mt-2">
            {state.dateStr}
          </p>
        )}
      </div>

      {/* Album Layout */}
      <div className="relative z-10 w-full flex-1 min-h-0 flex flex-col items-center justify-center">
        
        {/* Main Photo (Polaroid style) in FOREGROUND mode */}
        {!isBackgroundMode && (
          <div className="relative z-30 bg-white p-4 pb-16 shadow-2xl transform rotate-2 w-[70%] max-w-sm shrink-0">
            {/* Tape */}
            <div className="absolute -top-4 left-1/2 -translate-x-1/2 w-24 h-8 bg-white/40 backdrop-blur-md shadow-sm transform -rotate-2" />
            
            <div className="w-full aspect-square bg-gray-100 overflow-hidden relative">
              {state.heroImageUrl ? (
                 <img 
                   src={state.heroImageUrl} 
                   alt={state.heroName}
                   className="absolute inset-0"
                   style={getImageStyle(state.heroAdjustment)}
                 />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <span className="text-gray-400 font-sans text-xs uppercase tracking-widest">Main Memory</span>
                </div>
              )}
            </div>
            
            {/* Polaroid caption */}
            {state.message && (
              <div className="absolute bottom-0 left-0 right-0 h-16 flex items-center justify-center px-4">
                <p className="font-serif italic text-xl text-gray-700 text-center line-clamp-2">
                  {state.message}
                </p>
              </div>
            )}
          </div>
        )}

        {/* Supporting Circular Photos (BACKGROUND mode) */}
        {isBackgroundMode && supportPhotos.length > 0 && (
          <div className="flex flex-wrap justify-center gap-8 mt-auto mb-8 shrink-0">
            {supportPhotos.map(photo => (
              <div key={photo.id} className="relative w-36 h-36">
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 w-12 h-6 bg-white/50 backdrop-blur-sm shadow-sm transform rotate-3 z-30" />
                <div className="w-full h-full rounded-full overflow-hidden bg-white p-2 shadow-xl transform -rotate-2 even:rotate-3 relative">
                  <div className="w-full h-full rounded-full overflow-hidden relative">
                    <img src={photo.imageUrl} alt="Memory" className="absolute inset-0" style={getImageStyle(photo.adjustment, 1)} />
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Supporting Photo 1 (FOREGROUND mode) */}
        {!isBackgroundMode && supportPhotos[0] && (
          <div className="absolute top-[5%] left-[5%] z-20 bg-white p-2 pb-10 shadow-xl transform -rotate-6 w-[35%] max-w-[200px]">
             <div className="w-full aspect-square bg-gray-100 overflow-hidden relative">
               <img 
                 src={supportPhotos[0].imageUrl} 
                 alt="Memory 1"
                 className="absolute inset-0"
                 style={getImageStyle(supportPhotos[0].adjustment, 1)}
               />
             </div>
          </div>
        )}

        {/* Supporting Photo 2 (FOREGROUND mode) */}
        {!isBackgroundMode && supportPhotos[1] && (
          <div className="absolute bottom-[10%] right-[5%] z-40 bg-white p-2 pb-10 shadow-xl transform rotate-3 w-[40%] max-w-[220px]">
             <div className="absolute -top-3 right-1/2 translate-x-1/2 w-16 h-6 bg-white/40 backdrop-blur-md shadow-sm transform rotate-1" />
             <div className="w-full aspect-[4/3] bg-gray-100 overflow-hidden relative">
               <img 
                 src={supportPhotos[1].imageUrl} 
                 alt="Memory 2"
                 className="absolute inset-0"
                 style={getImageStyle(supportPhotos[1].adjustment, 1)}
               />
             </div>
          </div>
        )}
      </div>

      {/* Footer / Sign-off */}
      <div className="relative z-10 w-full mt-auto pt-8 flex justify-between items-end text-gray-800 font-sans shrink-0">
        <div className="flex flex-col bg-white/60 px-4 py-2 rounded-sm backdrop-blur-sm shadow-sm max-w-[60%]">
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

        <div className="text-right bg-white/80 px-3 py-1 rounded-sm shadow-sm shrink-0">
          <span className="text-[10px] uppercase tracking-widest font-bold text-gray-800">
            FamilyTree Album
          </span>
        </div>
      </div>
      
      {/* Fallback Message for background mode */}
      {isBackgroundMode && state.message && (
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-4/5 text-center z-10 pointer-events-none">
          <p className="font-serif italic text-3xl text-gray-900 bg-white/70 backdrop-blur-sm p-6 rounded-lg shadow-lg font-medium break-words">
            &quot;{state.message}&quot;
          </p>
        </div>
      )}

    </div>
  );
};

export default TemplateMemoryAlbum;
