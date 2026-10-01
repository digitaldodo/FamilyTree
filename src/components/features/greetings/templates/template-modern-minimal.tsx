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

export const TemplateModernMinimal: React.FC<Props> = ({ state, scale = 1 }) => {
  const containerStyle = {
    aspectRatio: state.format === 'LANDSCAPE' ? '1200/675' : state.format === 'PORTRAIT' ? '1080/1350' : '1/1',
    transform: `scale(${scale})`,
    transformOrigin: 'top left',
  };

  const isBackgroundMode = state.heroMode === 'BACKGROUND';

  return (
    <div 
      className="relative w-full overflow-hidden bg-[#FAFAFA] flex flex-col font-sans" 
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

      {/* Structural layout: 50% image, 50% text (when FOREGROUND mode) */}
      <div className={`flex-1 w-full relative z-10 flex flex-col ${isBackgroundMode ? 'bg-white/40 backdrop-blur-[2px]' : ''}`}>
        
        {/* Top half: The main hero image */}
        {!isBackgroundMode && (
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
        )}

        {/* Circular Supporting Photos */}
        {state.supportingPhotos.length > 0 && (
          <div className={`flex justify-end gap-3 px-16 ${isBackgroundMode ? 'mt-24' : '-mt-12 z-20'}`}>
            {state.supportingPhotos.map((photo) => (
              <div key={photo.id} className="w-24 h-24 rounded-full overflow-hidden border-[3px] border-white shadow-lg bg-gray-100">
                <img src={photo.imageUrl} alt="Supporting" style={getImageStyle(photo.adjustment, 1)} />
              </div>
            ))}
          </div>
        )}

        {/* Bottom half: Minimal typography */}
        <div className="relative flex-1 w-full flex flex-col justify-center px-16 pb-12 mt-auto">
          
          {/* Date & Headline block */}
          <div className="flex justify-between items-end mb-8 border-b border-gray-900/10 pb-4">
            {state.headline && (
              <h2 className="text-sm font-bold tracking-[0.3em] uppercase text-gray-900">
                {state.headline}
              </h2>
            )}
            {state.dateStr && (
              <p className="text-xs font-semibold tracking-widest text-gray-600 uppercase">
                {state.dateStr}
              </p>
            )}
          </div>
          
          {/* Main Name */}
          <h1 className="text-7xl font-light tracking-tighter text-gray-900 mb-6 leading-none drop-shadow-sm">
            {state.heroName}
          </h1>

          {/* Message */}
          {state.message && (
            <p className="text-lg leading-relaxed text-gray-700 font-medium max-w-md mb-12">
              {state.message}
            </p>
          )}

          {/* Sender & Footer */}
          <div className="mt-auto flex justify-between items-end">
            <div>
              {state.senderName && (
                <p className="text-sm font-bold tracking-wider text-gray-900 uppercase">
                  {state.senderName}
                </p>
              )}
              {state.footer && (
                <p className="text-[10px] text-gray-500 mt-1 uppercase tracking-widest font-semibold">
                  {state.footer}
                </p>
              )}
            </div>
            
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
      <div className="absolute top-8 left-8 w-12 h-[2px] bg-gray-900 z-20 opacity-50" />
      <div className="absolute top-8 left-8 w-[2px] h-12 bg-gray-900 z-20 opacity-50" />
    </div>
  );
};

export default TemplateModernMinimal;
