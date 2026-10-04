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

export const TemplateFestiveHeritage: React.FC<Props> = ({ state, scale = 1 }) => {
  const containerStyle = {
    aspectRatio: state.format === 'LANDSCAPE' ? '1200/675' : state.format === 'PORTRAIT' ? '1080/1350' : '1/1',
    transform: `scale(${scale})`,
    transformOrigin: 'top left',
  };

  const isBackgroundMode = state.arrangement === 'FLOATING_BACKGROUND';
  const heroNameLayer = state.textLayers?.find(l => l.id === 'heroName');

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
            alt={heroNameLayer?.content || 'Our Family'}
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
      <div className="relative z-30 flex flex-col items-center justify-between w-full h-full p-16 text-center pointer-events-none">
        
        {/* Header section */}
        <div className="w-full shrink-0 mt-4 pointer-events-auto flex flex-col items-center">
          <TextRegion state={state} region="top" />
        </div>

        {/* Middle Content */}
        <div className="flex-1 min-h-0 w-full relative pointer-events-none flex flex-col justify-center">
          <TextRegion state={state} region="middle" className="absolute inset-0 flex flex-col justify-center px-8" />
          <AdvancedPhotoArrangement state={state} frameClass="border-[#D4AF37]" />
        </div>

        {/* Bottom Content */}
        <div className="shrink-0 flex flex-col items-center mt-auto pb-4 pointer-events-auto w-full">
          <TextRegion state={state} region="bottom" />
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
