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

export const TemplateHeritagePortrait: React.FC<Props> = ({ state, scale = 1 }) => {
  const containerStyle = {
    aspectRatio: state.format === 'LANDSCAPE' ? '1200/675' : state.format === 'PORTRAIT' ? '1080/1350' : '1/1',
    transform: `scale(${scale})`,
    transformOrigin: 'top left',
  };

  const isBackgroundMode = state.arrangement === 'FLOATING_BACKGROUND';

  return (
    <div 
      className="relative w-full h-full overflow-hidden bg-[#F9F7F1] font-serif flex flex-col" 
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

      {/* Decorative Borders */}
      <div className="absolute inset-0 border-[16px] border-solid border-[#E2D5C3] pointer-events-none z-10" />
      <div className="absolute inset-0 border border-solid border-[#4A3B32] m-[24px] opacity-20 pointer-events-none z-10" />
      
      {/* Advanced Arrangement Overlay */}
      <AdvancedPhotoArrangement state={state} frameClass="border-white" />

      <div className="z-20 relative flex flex-col w-full h-full p-12 justify-between pointer-events-none">
        {/* Top Text Content */}
        <div className="text-center text-[#4A3B32] w-full shrink-0 pointer-events-auto">
          {state.headline && <h2 className="text-2xl tracking-[0.2em] uppercase mb-2 opacity-80">{state.headline}</h2>}
          {state.heroName && <h1 className="text-6xl font-medium mb-3 text-[#4A3B32] drop-shadow-sm leading-tight break-words">{state.heroName}</h1>}
          {state.dateStr && <p className="font-sans text-sm tracking-widest opacity-80 uppercase font-semibold">{state.dateStr}</p>}
        </div>

        {/* Middle Content spacer */}
        <div className="flex-1 min-h-0 w-full" />

        {/* Bottom Text Content */}
        <div className="text-center text-[#4A3B32] shrink-0 mt-auto bg-[#F9F7F1]/80 p-6 rounded-xl backdrop-blur-sm shadow-sm border border-[#E2D5C3]/30 pointer-events-auto">
          {state.message && <p className="text-2xl italic mb-6 leading-relaxed font-medium drop-shadow-sm opacity-90 break-words">{state.message}</p>}
          {(state.senderName || state.footer) && (
            <div className="flex flex-col items-center">
              <span className="w-12 h-[1px] bg-[#4A3B32] mb-3 opacity-50"></span>
              {state.senderName && <p className="font-sans text-sm font-bold tracking-widest uppercase">{state.senderName}</p>}
              {state.footer && <p className="font-sans text-xs opacity-70 mt-2 font-semibold">{state.footer}</p>}
            </div>
          )}
        </div>
      </div>
      
      <div className="absolute bottom-6 left-0 right-0 text-center z-20">
        <span className="text-[9px] uppercase tracking-widest font-bold text-[#4A3B32]/50 drop-shadow-sm">FamilyTree</span>
      </div>
    </div>
  );
};

export default TemplateHeritagePortrait;
