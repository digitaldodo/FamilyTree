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

export const TemplateHeritagePortrait: React.FC<Props> = ({ state, scale = 1 }) => {
  const containerStyle = {
    aspectRatio: state.format === 'PORTRAIT' ? '1080/1350' : '1/1',
    transform: `scale(${scale})`,
    transformOrigin: 'top left',
  };

  return (
    <div 
      className="relative w-full overflow-hidden bg-[#F9F7F1] flex flex-col items-center justify-between font-serif" 
      style={containerStyle}
    >
      <div className="absolute inset-0 border-[20px] border-solid border-[#E2D5C3] m-6 pointer-events-none z-10" />
      <div className="absolute inset-0 border border-solid border-[#4A3B32] m-[30px] opacity-20 pointer-events-none z-10" />
      
      <div className="z-20 pt-20 px-16 text-center text-[#4A3B32] w-full">
        {state.headline && <h2 className="text-2xl tracking-[0.2em] uppercase mb-4 opacity-80">{state.headline}</h2>}
        {state.heroName && <h1 className="text-7xl font-normal mb-4">{state.heroName}</h1>}
        {state.dateStr && <p className="font-sans text-sm tracking-widest opacity-60 uppercase">{state.dateStr}</p>}
      </div>

      <div className="relative w-2/3 flex-grow my-8 mx-auto overflow-hidden shadow-xl rounded-t-[100px] border-8 border-white z-20" style={{ minHeight: '30%' }}>
        {state.heroImageUrl ? (
          <img 
            src={state.heroImageUrl} 
            alt={state.heroName}
            style={getImageStyle(state.heroAdjustment)}
          />
        ) : (
          <div className="w-full h-full bg-[#E2D5C3]/30 flex items-center justify-center">
            <span className="text-[#4A3B32]/30 text-sm tracking-widest uppercase">Portrait</span>
          </div>
        )}
      </div>

      <div className="z-20 pb-20 px-20 text-center text-[#4A3B32]">
        {state.message && <p className="text-2xl italic mb-8 leading-relaxed opacity-90">"{state.message}"</p>}
        {state.senderName && (
          <div className="flex flex-col items-center">
            <span className="w-12 h-[1px] bg-[#4A3B32] mb-4 opacity-30"></span>
            <p className="font-sans text-sm font-semibold tracking-widest uppercase">{state.senderName}</p>
          </div>
        )}
        {state.footer && <p className="font-sans text-xs opacity-50 mt-4">{state.footer}</p>}
      </div>

      <div className="absolute bottom-10 left-0 right-0 text-center z-20">
        <span className="text-[10px] uppercase tracking-widest opacity-40 font-semibold text-[#4A3B32]">FamilyTree</span>
      </div>
    </div>
  );
};

export default TemplateHeritagePortrait;
