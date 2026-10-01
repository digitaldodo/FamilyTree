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

export const TemplateFamilyCollage: React.FC<Props> = ({ state, scale = 1 }) => {
  const containerStyle = {
    aspectRatio: state.format === 'PORTRAIT' ? '1080/1350' : '1/1',
    transform: `scale(${scale})`,
    transformOrigin: 'top left',
  };

  const supportPhotos = state.supportingPhotos.slice(0, 3); // Max 3 for collage

  return (
    <div 
      className="relative w-full overflow-hidden bg-[#FFFFFF] flex flex-col font-sans" 
      style={containerStyle}
    >
      {/* Background texture/pattern */}
      <div className="absolute inset-0 opacity-[0.03] bg-[radial-gradient(#000_1px,transparent_1px)] [background-size:20px_20px] pointer-events-none z-0" />

      {/* Collage Grid */}
      <div className="relative w-full h-[60%] z-10 p-6 grid grid-cols-3 grid-rows-2 gap-4">
        {/* Main Hero Image */}
        <div className="col-span-2 row-span-2 relative overflow-hidden rounded-2xl shadow-lg border-4 border-white bg-gray-100">
          {state.heroImageUrl && (
            <img 
              src={state.heroImageUrl} 
              alt={state.heroName}
              style={getImageStyle(state.heroAdjustment)}
            />
          )}
        </div>

        {/* Supporting Photos */}
        {supportPhotos[0] && (
          <div className="col-span-1 row-span-1 relative overflow-hidden rounded-2xl shadow-md border-4 border-white bg-gray-100 transform rotate-2">
            <img 
              src={supportPhotos[0].imageUrl} 
              alt="Supporting 1"
              style={getImageStyle(supportPhotos[0].adjustment)}
            />
          </div>
        )}
        
        {supportPhotos[1] && (
          <div className="col-span-1 row-span-1 relative overflow-hidden rounded-2xl shadow-md border-4 border-white bg-gray-100 transform -rotate-1">
            <img 
              src={supportPhotos[1].imageUrl} 
              alt="Supporting 2"
              style={getImageStyle(supportPhotos[1].adjustment)}
            />
          </div>
        )}

        {/* If less than 2 supporting photos, fill space playfully */}
        {!supportPhotos[0] && <div className="col-span-1 row-span-1 bg-amber-50 rounded-2xl" />}
        {!supportPhotos[1] && <div className="col-span-1 row-span-1 bg-blue-50 rounded-2xl flex items-center justify-center p-4 text-center">
            <span className="font-serif italic text-sm text-gray-400">Family Moments</span>
        </div>}
      </div>

      {/* Content Area */}
      <div className="relative z-20 flex-grow flex flex-col items-center justify-center p-12 text-center text-gray-800 bg-white/90 backdrop-blur-sm shadow-[0_-10px_40px_rgba(0,0,0,0.05)] rounded-t-[3rem]">
        {state.headline && (
          <span className="inline-block px-4 py-1 mb-6 text-xs font-bold tracking-widest text-white bg-gray-900 rounded-full uppercase">
            {state.headline}
          </span>
        )}
        
        <h1 className="text-6xl font-extrabold tracking-tight mb-4 text-transparent bg-clip-text bg-gradient-to-br from-gray-900 to-gray-600">
          {state.heroName}
        </h1>
        
        {state.dateStr && (
          <p className="text-sm font-medium tracking-widest text-gray-400 uppercase mb-8">
            {state.dateStr}
          </p>
        )}

        <div className="w-16 h-1 bg-gradient-to-r from-gray-200 via-gray-400 to-gray-200 mb-8 rounded-full" />

        {state.message && (
          <p className="text-xl leading-relaxed text-gray-600 mb-8 max-w-lg">
            {state.message}
          </p>
        )}

        {state.senderName && (
          <p className="text-base font-bold text-gray-900 uppercase tracking-widest">
            {state.senderName}
          </p>
        )}
        
        {state.footer && (
          <p className="text-xs text-gray-400 mt-2 uppercase tracking-wider">
            {state.footer}
          </p>
        )}
      </div>

      {/* Floating 3rd supporting photo if exists */}
      {supportPhotos[2] && (
        <div className="absolute bottom-16 right-8 w-32 h-32 overflow-hidden rounded-full shadow-xl border-4 border-white bg-gray-100 z-30 transform -rotate-6">
          <img 
            src={supportPhotos[2].imageUrl} 
            alt="Supporting 3"
            style={getImageStyle(supportPhotos[2].adjustment)}
          />
        </div>
      )}

      {/* Logo Placeholder */}
      <div className="absolute top-6 left-6 z-30">
        <span className="text-[10px] uppercase tracking-widest opacity-60 font-bold bg-white/80 px-2 py-1 rounded">FamilyTree</span>
      </div>
    </div>
  );
};

export default TemplateFamilyCollage;
