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

export const TemplateModernMinimal: React.FC<Props> = ({ state, scale = 1 }) => {
  const containerStyle = {
    aspectRatio: state.format === 'LANDSCAPE' ? '1200/675' : state.format === 'PORTRAIT' ? '1080/1350' : '1/1',
    transform: `scale(${scale})`,
    transformOrigin: 'top left',
  };

  const isBackgroundMode = state.arrangement === 'FLOATING_BACKGROUND';
  const heroNameLayer = state.textLayers?.find(l => l.id === 'heroName');

  return (
    <div 
      className="relative w-full h-full overflow-hidden bg-[#FAFAFA] flex flex-col font-sans" 
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

      <div className={`w-full h-full relative z-10 flex flex-col pointer-events-none ${isBackgroundMode ? 'bg-white/60' : ''}`}>
        
        <div className="w-full flex flex-col px-16 pt-12 z-20 pointer-events-auto shrink-0">
          <TextRegion state={state} region="top" />
        </div>

        <div className="flex-1 min-h-0 w-full relative pointer-events-none">
          <TextRegion state={state} region="middle" className="absolute inset-0 flex flex-col justify-center px-16" />
          <AdvancedPhotoArrangement state={state} frameClass="border-white" />
        </div>

        {/* Bottom half: Minimal typography */}
        <div className="shrink-0 w-full flex flex-col px-16 py-12 pointer-events-auto bg-white shadow-[0_-20px_40px_rgba(0,0,0,0.02)] border-t border-gray-100 min-h-[200px]">
          <TextRegion state={state} region="bottom" />
          
          <div className="mt-auto flex justify-end shrink-0 pt-8">
            {/* Logo */}
            <div className="text-right">
              <span className="text-[10px] uppercase tracking-widest text-gray-900 font-bold bg-white/50 px-2 py-1 rounded">
                FamilyTree
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Decorative accent lines */}
      <div className="absolute top-8 left-8 w-12 h-[2px] bg-gray-900 z-20 opacity-40" />
      <div className="absolute top-8 left-8 w-[2px] h-12 bg-gray-900 z-20 opacity-40" />
    </div>
  );
};

export default TemplateModernMinimal;
