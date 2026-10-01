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

export const TemplateFamilyCollage: React.FC<Props> = ({ state, scale = 1 }) => {
  const containerStyle = {
    aspectRatio: state.format === 'LANDSCAPE' ? '1200/675' : state.format === 'PORTRAIT' ? '1080/1350' : '1/1',
    transform: `scale(${scale})`,
    transformOrigin: 'top left',
  };

  const supportPhotos = state.supportingPhotos;
  const isBackgroundMode = state.heroMode === 'BACKGROUND';

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

      {/* Collage Grid (MODE B) */}
      {!isBackgroundMode && (
        <div className="relative w-full h-[55%] z-10 p-6 pb-0 flex gap-4">
          <div className="flex-[2] relative overflow-hidden rounded-2xl shadow-md border-[6px] border-white bg-slate-200">
            {state.heroImageUrl && (
              <img 
                src={state.heroImageUrl} 
                alt={state.heroName}
                className="absolute inset-0"
                style={getImageStyle(state.heroAdjustment)}
              />
            )}
          </div>
          <div className="flex-1 flex flex-col gap-4">
            {supportPhotos[0] ? (
              <div className="flex-1 relative overflow-hidden rounded-2xl shadow-sm border-[4px] border-white bg-slate-200 transform rotate-1">
                <img src={supportPhotos[0].imageUrl} alt="Supporting 1" className="absolute inset-0" style={getImageStyle(supportPhotos[0].adjustment, 1)} />
              </div>
            ) : (
              <div className="flex-1 bg-amber-50/50 rounded-2xl border-[4px] border-white/50" />
            )}
            {supportPhotos[1] ? (
              <div className="flex-1 relative overflow-hidden rounded-2xl shadow-sm border-[4px] border-white bg-slate-200 transform -rotate-2">
                <img src={supportPhotos[1].imageUrl} alt="Supporting 2" className="absolute inset-0" style={getImageStyle(supportPhotos[1].adjustment, 1)} />
              </div>
            ) : (
              <div className="flex-1 bg-blue-50/50 rounded-2xl flex items-center justify-center p-2 text-center border-[4px] border-white/50">
                <span className="font-serif italic text-xs text-slate-400">Memories</span>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Circular Supporting Photos (MODE A) */}
      {isBackgroundMode && supportPhotos.length > 0 && (
        <div className="relative z-10 flex flex-wrap justify-center gap-6 p-8 mt-12 shrink-0">
          {supportPhotos.map((photo) => (
            <div key={photo.id} className="w-40 h-40 rounded-full overflow-hidden border-[6px] border-white shadow-2xl transform rotate-3 even:-rotate-3 bg-slate-100 relative shrink-0">
              <img src={photo.imageUrl} alt="Family Member" className="absolute inset-0" style={getImageStyle(photo.adjustment, 1)} />
            </div>
          ))}
        </div>
      )}

      {/* Content Area */}
      <div className={`relative z-20 flex-1 min-h-0 flex flex-col items-center justify-center p-12 text-center text-slate-800 ${isBackgroundMode ? 'bg-white/85 mt-auto backdrop-blur-md rounded-t-[4rem]' : 'bg-white/95 backdrop-blur-sm shadow-[0_-10px_40px_rgba(0,0,0,0.03)] rounded-t-[3rem] mt-8'}`}>
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

      {/* Logo Placeholder */}
      <div className="absolute top-6 left-6 z-30">
        <span className="text-[10px] uppercase tracking-widest opacity-80 font-bold bg-white/80 px-2 py-1 rounded shadow-sm text-slate-800">FamilyTree</span>
      </div>
    </div>
  );
};

export default TemplateFamilyCollage;
