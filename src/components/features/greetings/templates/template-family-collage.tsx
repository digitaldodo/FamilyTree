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

export const TemplateFamilyCollage: React.FC<Props> = ({ state, scale = 1 }) => {
  const containerStyle = {
    aspectRatio: state.format === 'LANDSCAPE' ? '1200/675' : state.format === 'PORTRAIT' ? '1080/1350' : '1/1',
    transform: `scale(${scale})`,
    transformOrigin: 'top left',
  };

  const isBackgroundMode = state.arrangement === 'FLOATING_BACKGROUND';

  return (
    <div 
      className="relative w-full h-full overflow-hidden bg-slate-50 flex flex-col font-sans" 
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

      {/* Advanced Arrangement Overlay */}
      <AdvancedPhotoArrangement state={state} frameClass="border-white" />

      {/* Content Area */}
      <div className={`relative z-20 flex-1 min-h-0 flex flex-col items-center justify-end p-12 text-center text-slate-800 ${isBackgroundMode ? 'bg-white/85 mt-auto backdrop-blur-md rounded-t-[4rem]' : 'bg-white/95 backdrop-blur-sm shadow-[0_-10px_40px_rgba(0,0,0,0.03)] rounded-t-[3rem] mt-auto pointer-events-auto'} pointer-events-none`}>
        <div className="pointer-events-auto">
        {state.headline && (
          <span className="inline-block px-4 py-1 mb-6 text-xs font-bold tracking-widest text-white bg-slate-800 rounded-full uppercase shrink-0">
            {state.headline}
          </span>
        )}
        
        <h1 className="text-6xl font-extrabold tracking-tight mb-4 text-slate-800 drop-shadow-sm shrink-0 break-words leading-tight">
          {state.heroName}
        </h1>
        
        {state.dateStr && (
          <p className="text-sm font-medium tracking-widest text-slate-500 uppercase mb-6 shrink-0">
            {state.dateStr}
          </p>
        )}

        <div className="w-16 h-1 bg-slate-300 mb-6 rounded-full shrink-0" />

        {state.message && (
          <p className="text-xl leading-relaxed text-slate-600 mb-8 w-full max-w-[80%] font-medium break-words line-clamp-4">
            {state.message}
          </p>
        )}

        {state.senderName && (
          <p className="text-base font-bold text-slate-800 uppercase tracking-widest shrink-0">
            {state.senderName}
          </p>
        )}
        
        {state.footer && (
          <p className="text-xs text-slate-400 mt-2 uppercase tracking-wider font-semibold shrink-0">
            {state.footer}
          </p>
        )}
        </div>
      </div>

      {/* Logo Placeholder */}
      <div className="absolute top-6 left-6 z-30">
        <span className="text-[10px] uppercase tracking-widest opacity-80 font-bold bg-white/80 px-2 py-1 rounded shadow-sm text-slate-800">FamilyTree</span>
      </div>
    </div>
  );
};

export default TemplateFamilyCollage;
