import React from 'react';
import { GreetingState, ImageAdjustment } from '@/types/greetings';
import { SupportingPhotos } from './supporting-photos';

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
    aspectRatio: state.format === 'LANDSCAPE' ? '1200/675' : state.format === 'PORTRAIT' ? '1080/1350' : '1/1',
    transform: `scale(${scale})`,
    transformOrigin: 'top left',
  };

  const isBackgroundMode = state.heroMode === 'BACKGROUND';

  return (
    <div 
      className="relative w-full h-full overflow-hidden bg-[#800020] flex flex-col items-center justify-center font-serif text-[#F3E5AB]" 
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
          <div className="absolute inset-0 bg-[#800020]/70 mix-blend-multiply" />
        </div>
      )}

      {/* Decorative corners & borders */}
      <div className="absolute inset-0 border-[3px] border-[#D4AF37] m-8 z-10 pointer-events-none" />
      <div className="absolute inset-0 border-[1px] border-[#D4AF37] m-10 z-10 pointer-events-none opacity-50" />
      
      {/* Corner Ornaments */}
      <div className="absolute top-8 left-8 w-16 h-16 border-t-[4px] border-l-[4px] border-[#D4AF37] z-20 pointer-events-none" />
      <div className="absolute top-8 right-8 w-16 h-16 border-t-[4px] border-r-[4px] border-[#D4AF37] z-20 pointer-events-none" />
      <div className="absolute bottom-8 left-8 w-16 h-16 border-b-[4px] border-l-[4px] border-[#D4AF37] z-20 pointer-events-none" />
      <div className="absolute bottom-8 right-8 w-16 h-16 border-b-[4px] border-r-[4px] border-[#D4AF37] z-20 pointer-events-none" />

      {/* Main Content Container */}
      <div className="relative z-30 flex flex-col items-center justify-between w-full h-full p-16 text-center">
        
        {/* Header section */}
        <div className="mb-8 shrink-0 mt-4">
          {state.headline && (
            <h2 className="text-xl tracking-[0.25em] uppercase text-[#D4AF37] mb-2 font-semibold drop-shadow-md">
              ✧ {state.headline} ✧
            </h2>
          )}
          {state.dateStr && (
            <p className="text-xs font-sans tracking-[0.2em] text-[#F3E5AB]/90 uppercase font-bold drop-shadow-md">
              {state.dateStr}
            </p>
          )}
        </div>

        {/* Middle Content */}
        <div className="flex-1 min-h-0 flex flex-col items-center justify-center w-full py-4">
          {/* Hero Image (Ornate Frame) when FOREGROUND mode */}
          {!isBackgroundMode && (
            <div className="relative w-3/4 max-w-sm aspect-square mb-6 shrink-0">
              <div className="absolute inset-0 rounded-full border-[8px] border-[#D4AF37] shadow-[0_0_30px_rgba(212,175,55,0.3)] z-20 pointer-events-none transform scale-105" />
              <div className="absolute inset-0 rounded-full border-[2px] border-[#F3E5AB] z-20 pointer-events-none transform scale-100" />
              
              <div className="w-full h-full rounded-full overflow-hidden bg-[#5a0016] relative">
                {state.heroImageUrl ? (
                  <img 
                    src={state.heroImageUrl} 
                    alt={state.heroName}
                    className="absolute inset-0"
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

          {/* Supporting photos — composition adapts to the number of photos */}
          <SupportingPhotos
            photos={state.supportingPhotos}
            format={state.format}
            compact={!isBackgroundMode}
            className="mt-4"
            frameClass="border-[#D4AF37]"
          />
        </div>

        {/* Bottom Content */}
        <div className="shrink-0 flex flex-col items-center mt-auto pb-4">
          {/* Hero Name */}
          <h1 className="text-6xl font-normal tracking-wide text-[#F3E5AB] mb-6 break-words" style={{ textShadow: '0 4px 8px rgba(0,0,0,0.8)' }}>
            {state.heroName}
          </h1>

          {/* Message */}
          {state.message && (
            <p className="text-xl italic leading-relaxed text-[#F3E5AB] max-w-sm mb-8 drop-shadow-md font-medium break-words line-clamp-4">
              {state.message}
            </p>
          )}

          {/* Footer/Sender */}
          <div className="flex flex-col items-center">
            <div className="w-24 h-[1px] bg-[#D4AF37] mb-6 opacity-80" />
            {state.senderName && (
              <p className="font-sans text-sm font-bold tracking-[0.2em] uppercase text-[#D4AF37] drop-shadow-sm">
                {state.senderName}
              </p>
            )}
            {state.footer && (
              <p className="font-sans text-[10px] text-[#F3E5AB]/80 mt-2 uppercase tracking-widest font-semibold">
                {state.footer}
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Logo */}
      <div className="absolute bottom-6 right-6 z-40">
        <span className="text-[9px] uppercase tracking-[0.3em] text-[#D4AF37]/70 font-sans font-bold">
          FamilyTree
        </span>
      </div>
    </div>
  );
};

export default TemplateFestiveHeritage;
