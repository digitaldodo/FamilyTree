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

export const TemplateModernMinimal: React.FC<Props> = ({ state, scale = 1 }) => {
  const containerStyle = {
    aspectRatio: state.format === 'PORTRAIT' ? '1080/1350' : '1/1',
    transform: `scale(${scale})`,
    transformOrigin: 'top left',
  };

  return (
    <div 
      className="relative w-full overflow-hidden bg-[#FAFAFA] flex flex-col font-sans" 
      style={containerStyle}
    >
      {/* Structural layout: 50% image, 50% text */}
      <div className="flex-1 w-full relative z-10 flex flex-col">
        
        {/* Top half: The main hero image */}
        <div className="relative w-full h-[55%]">
          {state.heroImageUrl ? (
            <img 
              src={state.heroImageUrl} 
              alt={state.heroName}
              style={getImageStyle(state.heroAdjustment)}
            />
          ) : (
            <div className="w-full h-full bg-gray-200 flex items-center justify-center">
              <span className="text-gray-400 text-sm tracking-widest uppercase">Hero Image</span>
            </div>
          )}
          
          {/* Subtle overlay gradient */}
          <div className="absolute inset-0 bg-gradient-to-t from-[#FAFAFA] to-transparent h-32 bottom-0 top-auto" />
        </div>

        {/* Bottom half: Minimal typography */}
        <div className="relative flex-1 w-full flex flex-col justify-center px-16 pb-12">
          
          {/* Date & Headline block */}
          <div className="flex justify-between items-end mb-8 border-b border-gray-200 pb-4">
            {state.headline && (
              <h2 className="text-sm font-semibold tracking-[0.3em] uppercase text-gray-900">
                {state.headline}
              </h2>
            )}
            {state.dateStr && (
              <p className="text-xs font-medium tracking-widest text-gray-400 uppercase">
                {state.dateStr}
              </p>
            )}
          </div>
          
          {/* Main Name */}
          <h1 className="text-7xl font-light tracking-tighter text-gray-900 mb-6 leading-none">
            {state.heroName}
          </h1>

          {/* Message */}
          {state.message && (
            <p className="text-lg leading-relaxed text-gray-500 font-light max-w-md mb-12">
              {state.message}
            </p>
          )}

          {/* Sender & Footer */}
          <div className="mt-auto flex justify-between items-end">
            <div>
              {state.senderName && (
                <p className="text-sm font-medium tracking-wider text-gray-900 uppercase">
                  {state.senderName}
                </p>
              )}
              {state.footer && (
                <p className="text-[10px] text-gray-400 mt-1 uppercase tracking-widest">
                  {state.footer}
                </p>
              )}
            </div>
            
            {/* Logo */}
            <div className="text-right">
              <span className="text-[10px] uppercase tracking-widest text-gray-300 font-bold">
                FamilyTree
              </span>
            </div>
          </div>

        </div>
      </div>

      {/* Decorative accent lines */}
      <div className="absolute top-8 left-8 w-12 h-[2px] bg-white z-20 mix-blend-difference" />
      <div className="absolute top-8 left-8 w-[2px] h-12 bg-white z-20 mix-blend-difference" />
    </div>
  );
};

export default TemplateModernMinimal;
