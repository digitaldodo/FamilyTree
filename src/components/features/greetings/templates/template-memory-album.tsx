import React from 'react';
import { GreetingState, ImageAdjustment } from '@/types/greetings';

interface Props {
  state: GreetingState;
  scale?: number;
}

const getImageStyle = (adj: ImageAdjustment) => ({
  objectFit: 'cover' as const,
  objectPosition: `calc(50% + ${adj.x}%) calc(50% + ${adj.y}%)`,
  transform: `scale(${adj.zoom})`,
  opacity: adj.opacity / 100,
  width: '100%',
  height: '100%',
});

export const TemplateMemoryAlbum: React.FC<Props> = ({ state, scale = 1 }) => {
  const containerStyle = {
    aspectRatio: state.format === 'PORTRAIT' ? '1080/1350' : '1/1',
    transform: `scale(${scale})`,
    transformOrigin: 'top left',
  };

  const supportPhotos = state.supportingPhotos.slice(0, 2);

  return (
    <div 
      className="relative w-full overflow-hidden bg-[#E9E4DC] flex flex-col items-center p-12" 
      style={containerStyle}
    >
      {/* Background Texture (Subtle grid/paper effect) */}
      <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI0IiBoZWlnaHQ9IjQiPgo8cmVjdCB3aWR0aD0iNCIgaGVpZ2h0PSI0IiBmaWxsPSIjZmZmIiBmaWxsLW9wYWNpdHk9IjAiLz4KPHBhdGggZD0iTTAgMEg0VjRIMEoiIGZpbGw9IiMzMzMiIGZpbGwtb3BhY2l0eT0iMC4wNSIvPgo8L3N2Zz4=')] opacity-50 z-0 pointer-events-none" />

      {/* Title & Header Strip */}
      <div className="relative z-10 w-full mb-12 flex flex-col items-center text-center">
        {state.headline && (
          <div className="bg-white/80 backdrop-blur-sm px-6 py-2 shadow-sm rounded-sm mb-4 transform -rotate-1">
            <h2 className="font-sans text-sm font-bold tracking-[0.2em] uppercase text-gray-700">
              {state.headline}
            </h2>
          </div>
        )}
        <h1 className="font-serif text-6xl italic text-gray-800 mb-2">
          {state.heroName}
        </h1>
        {state.dateStr && (
          <p className="font-sans text-sm text-gray-500 tracking-wider">
            {state.dateStr}
          </p>
        )}
      </div>

      {/* Album Layout */}
      <div className="relative z-10 w-full flex-grow flex items-center justify-center">
        
        {/* Main Photo (Polaroid style) */}
        <div className="relative z-30 bg-white p-4 pb-16 shadow-2xl transform rotate-2 w-[70%] max-w-sm">
          {/* Tape */}
          <div className="absolute -top-4 left-1/2 -translate-x-1/2 w-24 h-8 bg-white/40 backdrop-blur-md shadow-sm transform -rotate-2" />
          
          <div className="w-full aspect-square bg-gray-100 overflow-hidden relative">
            {state.heroImageUrl ? (
               <img 
                 src={state.heroImageUrl} 
                 alt={state.heroName}
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

        {/* Supporting Photo 1 */}
        {supportPhotos[0] && (
          <div className="absolute top-[10%] left-[5%] z-20 bg-white p-2 pb-10 shadow-xl transform -rotate-6 w-[40%]">
             <div className="w-full aspect-square bg-gray-100 overflow-hidden">
               <img 
                 src={supportPhotos[0].imageUrl} 
                 alt="Memory 1"
                 style={getImageStyle(supportPhotos[0].adjustment)}
               />
             </div>
          </div>
        )}

        {/* Supporting Photo 2 */}
        {supportPhotos[1] && (
          <div className="absolute bottom-[15%] right-[5%] z-40 bg-white p-2 pb-10 shadow-xl transform rotate-3 w-[45%]">
             <div className="absolute -top-3 right-1/2 translate-x-1/2 w-16 h-6 bg-white/40 backdrop-blur-md shadow-sm transform rotate-1" />
             <div className="w-full aspect-[4/3] bg-gray-100 overflow-hidden">
               <img 
                 src={supportPhotos[1].imageUrl} 
                 alt="Memory 2"
                 style={getImageStyle(supportPhotos[1].adjustment)}
               />
             </div>
          </div>
        )}
      </div>

      {/* Footer / Sign-off */}
      <div className="relative z-10 w-full mt-12 flex justify-between items-end text-gray-700 font-sans">
        <div className="flex flex-col">
          {state.senderName && (
            <span className="text-lg font-serif italic font-bold">
              With love, {state.senderName}
            </span>
          )}
          {state.footer && (
            <span className="text-xs uppercase tracking-widest text-gray-500 mt-1">
              {state.footer}
            </span>
          )}
        </div>

        <div className="text-right bg-white/50 px-3 py-1 rounded-sm">
          <span className="text-[10px] uppercase tracking-widest font-bold text-gray-400">
            FamilyTree Album
          </span>
        </div>
      </div>

    </div>
  );
};

export default TemplateMemoryAlbum;
