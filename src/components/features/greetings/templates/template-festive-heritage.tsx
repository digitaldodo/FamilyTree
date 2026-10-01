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

export const TemplateFestiveHeritage: React.FC<Props> = ({ state, scale = 1 }) => {
  const containerStyle = {
    aspectRatio: state.format === 'PORTRAIT' ? '1080/1350' : '1/1',
    transform: `scale(${scale})`,
    transformOrigin: 'top left',
  };

  const isBackgroundMode = state.heroMode === 'BACKGROUND';

  return (
    <div 
      className="relative w-full overflow-hidden bg-[#800020] flex flex-col items-center justify-center font-serif text-[#F3E5AB]" 
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
          <div className="absolute inset-0 bg-[#800020]/60 mix-blend-multiply" />
        </div>
      )}

      {/* Decorative corners & borders */}
      <div className="absolute inset-0 border-[3px] border-[#D4AF37] m-8 z-10 pointer-events-none" />
      <div className="absolute inset-0 border-[1px] border-[#D4AF37] m-10 z-10 pointer-events-none opacity-50" />
      
      {/* Corner Ornaments */}
      <div className="absolute top-8 left-8 w-16 h-16 border-t-4 border-l-4 border-[#D4AF37] z-20 pointer-events-none" />
      <div className="absolute top-8 right-8 w-16 h-16 border-t-4 border-r-4 border-[#D4AF37] z-20 pointer-events-none" />
      <div className="absolute bottom-8 left-8 w-16 h-16 border-b-4 border-l-4 border-[#D4AF37] z-20 pointer-events-none" />
      <div className="absolute bottom-8 right-8 w-16 h-16 border-b-4 border-r-4 border-[#D4AF37] z-20 pointer-events-none" />

      {/* Main Content Container */}
      <div className="relative z-30 flex flex-col items-center justify-center w-full h-full p-16 text-center">
        
        {/* Header section */}
        <div className="mb-10">
          {state.headline && (
            <h2 className="text-xl tracking-[0.25em] uppercase text-[#D4AF37] mb-4 font-semibold drop-shadow-md">
              ✧ {state.headline} ✧
            </h2>
          )}
          {state.dateStr && (
            <p className="text-xs font-sans tracking-[0.2em] text-[#F3E5AB]/90 uppercase font-bold drop-shadow-md">
              {state.dateStr}
            </p>
          )}
        </div>

        {/* Hero Image (Ornate Frame) when FOREGROUND mode */}
        {!isBackgroundMode && (
          <div className="relative w-3/4 max-w-sm aspect-square mb-10 mx-auto">
            <div className="absolute inset-0 rounded-full border-[8px] border-[#D4AF37] shadow-[0_0_30px_rgba(212,175,55,0.3)] z-20 pointer-events-none transform scale-105" />
            <div className="absolute inset-0 rounded-full border-[2px] border-[#F3E5AB] z-20 pointer-events-none transform scale-100" />
            
            <div className="w-full h-full rounded-full overflow-hidden bg-[#5a0016]">
              {state.heroImageUrl ? (
                <img 
                  src={state.heroImageUrl} 
                  alt={state.heroName}
                  style={getImageStyle(state.heroAdjustment)}
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <span className="text-[#D4AF37]/50 text-sm tracking-widest uppercase">Photo</span>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Circular Supporting Photos */}
        {state.supportingPhotos.length > 0 && (
          <div className="flex flex-wrap justify-center gap-6 mb-8 mt-4">
            {state.supportingPhotos.map(photo => (
              <div key={photo.id} className="relative w-32 h-32">
                <div className="absolute inset-0 rounded-full border-[4px] border-[#D4AF37] z-20 pointer-events-none transform scale-105" />
                <div className="w-full h-full rounded-full overflow-hidden bg-[#5a0016] border-[2px] border-[#F3E5AB]">
                  <img src={photo.imageUrl} alt="Supporting" style={getImageStyle(photo.adjustment, 1)} />
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Hero Name */}
        <h1 className="text-6xl font-normal tracking-wide text-[#F3E5AB] mb-8" style={{ textShadow: '0 4px 8px rgba(0,0,0,0.8)' }}>
          {state.heroName}
        </h1>

        {/* Message */}
        {state.message && (
          <p className="text-xl italic leading-relaxed text-[#F3E5AB] max-w-md mb-12 drop-shadow-md font-medium">
            {state.message}
          </p>
        )}

        {/* Footer/Sender */}
        <div className="mt-auto flex flex-col items-center">
          <div className="w-24 h-[1px] bg-[#D4AF37] mb-6 opacity-80" />
          {state.senderName && (
            <p className="font-sans text-sm font-bold tracking-[0.2em] uppercase text-[#D4AF37] drop-shadow-sm">
              {state.senderName}
            </p>
          )}
          {state.footer && (
            <p className="font-sans text-[10px] text-[#F3E5AB]/80 mt-3 uppercase tracking-widest font-semibold">
              {state.footer}
            </p>
          )}
        </div>
      </div>

      {/* Logo */}
      <div className="absolute bottom-4 right-4 z-40">
        <span className="text-[9px] uppercase tracking-[0.3em] text-[#D4AF37]/70 font-sans font-bold">
          FamilyTree
        </span>
      </div>
    </div>
  );
};

export default TemplateFestiveHeritage;
