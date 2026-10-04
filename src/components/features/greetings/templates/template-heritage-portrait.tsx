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

export const TemplateHeritagePortrait: React.FC<Props> = ({ state, scale = 1 }) => {
  const containerStyle = {
    aspectRatio: state.format === 'LANDSCAPE' ? '1200/675' : state.format === 'PORTRAIT' ? '1080/1350' : '1/1',
    transform: `scale(${scale})`,
    transformOrigin: 'top left',
  };

  const isBackgroundMode = state.arrangement === 'FLOATING_BACKGROUND';
  const heroNameLayer = state.textLayers?.find(l => l.id === 'heroName');

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
            alt={heroNameLayer?.content || 'Our Family'}
            style={getImageStyle(state.heroAdjustment)}
          />
        </div>
      )}

      {/* Decorative Borders */}
      <div className="absolute inset-0 border-[16px] border-solid border-[#E2D5C3] pointer-events-none z-10" />
      <div className="absolute inset-0 border border-solid border-[#4A3B32] m-[24px] opacity-20 pointer-events-none z-10" />
      
      <div className="z-20 relative flex flex-col w-full h-full p-12 justify-between pointer-events-none">
        {/* Top Text Content */}
        <TextRegion state={state} region="top" />

        {/* Middle Content spacer */}
        <div className="flex-1 min-h-0 w-full relative pointer-events-none">
          <TextRegion state={state} region="middle" className="absolute inset-0 flex flex-col justify-center" />
          <AdvancedPhotoArrangement state={state} frameClass="border-white" />
        </div>

        {/* Bottom Text Content */}
        <TextRegion state={state} region="bottom" />
      </div>

      
      <div className="absolute bottom-6 left-0 right-0 text-center z-20">
        <span className="text-[9px] uppercase tracking-widest font-bold text-[#4A3B32]/50 drop-shadow-sm">FamilyTree</span>
      </div>
    </div>
  );
};

export default TemplateHeritagePortrait;
