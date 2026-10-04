import React from 'react';
import { GreetingState, ImageAdjustment } from '@/types/greetings';
import { AdvancedPhotoArrangement } from '../advanced-photo-arrangement';
import { TextRegion } from '../text/text-region';

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
  const heroNameLayer = state.textLayers?.find(l => l.id === 'heroName');

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
            alt={heroNameLayer?.content || 'Our Family'}
            style={getImageStyle(state.heroAdjustment)}
          />
        </div>
      )}

      <div className="z-20 relative flex flex-col w-full h-full justify-between pointer-events-none">
        
        <div className="w-full flex flex-col p-12 z-20 pointer-events-auto shrink-0 pt-16">
          <TextRegion state={state} region="top" />
        </div>

        <div className="flex-1 min-h-0 w-full relative pointer-events-none flex flex-col justify-center">
          <TextRegion state={state} region="middle" className="absolute inset-0 flex flex-col justify-center px-12" />
          {/* Advanced Arrangement Overlay */}
          <AdvancedPhotoArrangement state={state} frameClass="border-white" />
        </div>

        {/* Content Area */}
        <div className={`relative z-20 shrink-0 flex flex-col items-center justify-end p-12 text-center text-slate-800 ${isBackgroundMode ? 'bg-white/95 mt-auto rounded-t-[4rem]' : 'bg-white shadow-[0_-10px_40px_rgba(0,0,0,0.05)] rounded-t-[3rem] mt-auto pointer-events-auto'} pointer-events-none border-t border-slate-100 min-h-[250px]`}>
          <div className="pointer-events-auto flex flex-col items-center w-full">
            <TextRegion state={state} region="bottom" />
          </div>
        </div>
      </div>

      {/* Logo Placeholder */}
      <div className="absolute top-6 left-6 z-30 pointer-events-none">
        <span className="text-[10px] uppercase tracking-widest opacity-80 font-bold bg-white/90 px-2 py-1 rounded shadow-sm text-slate-800">FamilyTree</span>
      </div>
    </div>
  );
};

export default TemplateFamilyCollage;
