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

export const TemplateMemoryAlbum: React.FC<Props> = ({ state, scale = 1 }) => {
  const containerStyle = {
    aspectRatio: state.format === 'LANDSCAPE' ? '1200/675' : state.format === 'PORTRAIT' ? '1080/1350' : '1/1',
    transform: `scale(${scale})`,
    transformOrigin: 'top left',
  };

  const isBackgroundMode = state.arrangement === 'FLOATING_BACKGROUND';
  const heroNameLayer = state.textLayers?.find(l => l.id === 'heroName');

  return (
    <div 
      className="relative w-full h-full overflow-hidden bg-[#E9E4DC] flex flex-col items-center p-12" 
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

      {/* Background Texture (Subtle grid/paper effect) */}
      <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI0IiBoZWlnaHQ9IjQiPgo8cmVjdCB3aWR0aD0iNCIgaGVpZ2h0PSI0IiBmaWxsPSIjZmZmIiBmaWxsLW9wYWNpdHk9IjAiLz4KPHBhdGggZD0iTTAgMEg0VjRIMEoiIGZpbGw9IiMzMzMiIGZpbGwtb3BhY2l0eT0iMC4wNSIvPgo8L3N2Zz4=')] opacity-30 z-0 pointer-events-none" />

      {/* Title & Header Strip */}
      <div className="relative z-10 w-full mb-8 flex flex-col items-center text-center mt-4 shrink-0 pointer-events-auto">
        <TextRegion state={state} region="top" />
      </div>

      {/* Album Layout spacer */}
      <div className="relative z-10 w-full flex-1 min-h-0 pointer-events-none flex flex-col justify-center">
        <AdvancedPhotoArrangement state={state} frameClass="border-white" />
        <TextRegion state={state} region="middle" className="absolute inset-0 flex flex-col justify-center" />
      </div>
      
      {/* Footer / Sign-off */}
      <div className="relative z-10 w-full mt-6 pt-4 flex flex-col items-center text-gray-800 font-sans shrink-0 pointer-events-auto">
        <TextRegion state={state} region="bottom" />

        <div className="w-full text-right bg-white px-3 py-1 rounded-sm shadow-sm shrink-0 border border-gray-100 mt-6 max-w-[120px] self-end">
          <span className="text-[10px] uppercase tracking-widest font-bold text-gray-800">
            FamilyTree Album
          </span>
        </div>
      </div>

    </div>
  );
};

export default TemplateMemoryAlbum;
