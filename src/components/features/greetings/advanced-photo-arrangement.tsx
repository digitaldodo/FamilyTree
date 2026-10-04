import React from 'react';
import { GreetingState, ImageAdjustment } from '@/types/greetings';

interface Props {
  state: GreetingState;
  frameClass?: string;
}

const getImageStyle = (adj: ImageAdjustment, overrideOpacity?: number) => ({
  objectFit: 'cover' as const,
  objectPosition: `calc(50% + ${adj.x}%) calc(50% + ${adj.y}%)`,
  transform: `scale(${adj.zoom})`,
  opacity: overrideOpacity !== undefined ? overrideOpacity : (adj.opacity / 100),
  width: '100%',
  height: '100%',
});

export const AdvancedPhotoArrangement: React.FC<Props> = ({ state, frameClass = 'border-white' }) => {
  const { arrangement, heroImageUrl, heroAdjustment, supportingPhotos, format } = state;

  if (arrangement === 'FLOATING_BACKGROUND') {
    return (
      <div className="w-full h-full relative z-20 pointer-events-none">
        <div className="absolute inset-0 flex flex-wrap justify-center content-end pb-12 gap-6">
          {supportingPhotos.map((photo, i) => (
            <div key={photo.id} className={`relative w-24 h-24 sm:w-32 sm:h-32 rounded-full overflow-hidden shadow-xl border-4 ${frameClass} transform rotate-${i % 2 === 0 ? '3' : '[-3]'} pointer-events-auto`}>
              <img src={photo.imageUrl} alt="Family" className="absolute inset-0" style={getImageStyle(photo.adjustment, 1)} />
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (arrangement === 'HERO_CIRCLE' || arrangement === 'FAMILY_ORBIT') {
    const isOrbit = arrangement === 'FAMILY_ORBIT';
    const radius = isOrbit ? (format === 'PORTRAIT' ? 180 : 220) : 150;
    const heroSize = isOrbit ? 200 : 240;
    const supportSize = isOrbit ? 90 : 80;

    return (
      <div className="relative w-full h-full flex items-center justify-center z-20 pointer-events-none">
        {heroImageUrl && (
          <div className={`absolute w-[${heroSize}px] h-[${heroSize}px] rounded-full overflow-hidden shadow-2xl border-8 ${frameClass} pointer-events-auto flex-shrink-0`} style={{ width: heroSize, height: heroSize }}>
            <img src={heroImageUrl} alt="Hero" className="absolute inset-0" style={getImageStyle(heroAdjustment, 1)} />
          </div>
        )}
        {supportingPhotos.map((photo, i) => {
          const angle = (i / supportingPhotos.length) * Math.PI * 2 - Math.PI / 2;
          const x = Math.cos(angle) * radius;
          const y = Math.sin(angle) * radius;
          return (
            <div 
              key={photo.id} 
              className={`absolute rounded-full overflow-hidden shadow-lg border-4 ${frameClass} pointer-events-auto transition-transform hover:scale-105`}
              style={{ width: supportSize, height: supportSize, transform: `translate(${x}px, ${y}px)` }}
            >
              <img src={photo.imageUrl} alt="Support" className="absolute inset-0" style={getImageStyle(photo.adjustment, 1)} />
            </div>
          );
        })}
      </div>
    );
  }

  if (arrangement === 'ELEGANT_ARC') {
    const arcRadius = format === 'PORTRAIT' ? 400 : 500;
    const heroSize = 180;
    const supportSize = 80;

    return (
      <div className="relative w-full h-full flex flex-col items-center justify-center z-20 pointer-events-none pt-20">
        <div className="relative w-full h-64 flex justify-center items-end mb-8">
          {supportingPhotos.map((photo, i) => {
            const total = supportingPhotos.length;
            const spread = Math.PI / 2; 
            const startAngle = -Math.PI / 2 - spread / 2;
            const step = total > 1 ? spread / (total - 1) : 0;
            const angle = total === 1 ? -Math.PI/2 : startAngle + i * step;
            
            const x = Math.cos(angle) * arcRadius;
            const y = Math.sin(angle) * arcRadius + arcRadius; 
            return (
              <div 
                key={photo.id} 
                className={`absolute rounded-full overflow-hidden shadow-md border-4 ${frameClass} pointer-events-auto`}
                style={{ width: supportSize, height: supportSize, transform: `translate(${x}px, ${y - arcRadius + 100}px)` }}
              >
                <img src={photo.imageUrl} alt="Support" className="absolute inset-0" style={getImageStyle(photo.adjustment, 1)} />
              </div>
            );
          })}
        </div>
        {heroImageUrl && (
          <div className={`relative rounded-full overflow-hidden shadow-2xl border-8 ${frameClass} pointer-events-auto z-30`} style={{ width: heroSize, height: heroSize }}>
            <img src={heroImageUrl} alt="Hero" className="absolute inset-0" style={getImageStyle(heroAdjustment, 1)} />
          </div>
        )}
      </div>
    );
  }

  if (arrangement === 'EDGE_PORTRAITS') {
    const positions = [
      { top: '10%', left: '10%' },
      { bottom: '10%', right: '10%' },
      { top: '10%', right: '10%' },
      { bottom: '10%', left: '10%' },
      { top: '40%', left: '5%' },
      { top: '40%', right: '5%' },
    ];
    return (
      <div className="absolute inset-0 z-20 pointer-events-none overflow-hidden">
        {heroImageUrl && (
          <div className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-48 h-48 rounded-full overflow-hidden shadow-2xl border-8 ${frameClass} pointer-events-auto`}>
            <img src={heroImageUrl} alt="Hero" className="absolute inset-0" style={getImageStyle(heroAdjustment, 1)} />
          </div>
        )}
        {supportingPhotos.map((photo, i) => (
          <div 
            key={photo.id} 
            className={`absolute w-24 h-24 rounded-full overflow-hidden shadow-lg border-4 ${frameClass} pointer-events-auto`}
            style={positions[i % positions.length]}
          >
            <img src={photo.imageUrl} alt="Support" className="absolute inset-0" style={getImageStyle(photo.adjustment, 1)} />
          </div>
        ))}
      </div>
    );
  }

  if (arrangement === 'FAMILY_GRID') {
    const photos = heroImageUrl ? [{ id: 'hero', imageUrl: heroImageUrl, adjustment: heroAdjustment }, ...supportingPhotos] : supportingPhotos;
    return (
      <div className="w-full h-full flex items-center justify-center p-8 z-20 pointer-events-none">
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 pointer-events-auto max-w-2xl w-full">
          {photos.map((photo) => (
            <div key={photo.id} className={`relative aspect-square overflow-hidden shadow-md border-4 ${frameClass}`}>
              <img src={photo.imageUrl} alt="Family" className="absolute inset-0" style={getImageStyle(photo.adjustment, 1)} />
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (arrangement === 'PHOTO_STRIP') {
    const isPortrait = format === 'PORTRAIT';
    const photos = heroImageUrl ? [{ id: 'hero', imageUrl: heroImageUrl, adjustment: heroAdjustment }, ...supportingPhotos] : supportingPhotos;
    return (
      <div className={`absolute z-20 pointer-events-none flex ${isPortrait ? 'flex-col left-8 top-1/2 -translate-y-1/2' : 'flex-row bottom-8 left-1/2 -translate-x-1/2'} gap-4`}>
        {photos.map((photo) => (
          <div key={photo.id} className={`relative ${isPortrait ? 'w-24 h-24' : 'w-28 h-28'} overflow-hidden shadow-lg border-4 ${frameClass} pointer-events-auto`}>
            <img src={photo.imageUrl} alt="Family" className="absolute inset-0" style={getImageStyle(photo.adjustment, 1)} />
          </div>
        ))}
      </div>
    );
  }

  if (arrangement === 'MEMORY_COLLAGE' || arrangement === 'POLAROID') {
    const isPolaroid = arrangement === 'POLAROID';
    const photos = heroImageUrl ? [{ id: 'hero', imageUrl: heroImageUrl, adjustment: heroAdjustment }, ...supportingPhotos] : supportingPhotos;
    return (
      <div className="w-full h-full flex items-center justify-center p-12 z-20 pointer-events-none">
        <div className="relative w-full max-w-xl h-96 pointer-events-auto">
          {photos.map((photo, i) => {
            const rotate = (i % 2 === 0 ? 1 : -1) * (3 + (i % 3) * 2);
            const left = 50 + (i % 3 - 1) * 20;
            const top = 50 + (i % 2 === 0 ? -10 : 10);
            return (
              <div 
                key={photo.id} 
                className={`absolute w-32 h-32 md:w-40 md:h-40 overflow-hidden shadow-xl ${isPolaroid ? 'bg-white p-2 pb-8' : `border-4 ${frameClass}`}`}
                style={{ left: `${left}%`, top: `${top}%`, transform: `translate(-50%, -50%) rotate(${rotate}deg)` }}
              >
                <div className="relative w-full h-full overflow-hidden bg-gray-100">
                  <img src={photo.imageUrl} alt="Memory" className="absolute inset-0" style={getImageStyle(photo.adjustment, 1)} />
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  }

  if (arrangement === 'MAIN_SIDE') {
    return (
      <div className="w-full h-full flex items-center justify-between p-12 z-20 pointer-events-none">
        <div className={`relative w-1/3 h-2/3 overflow-hidden shadow-2xl border-8 ${frameClass} pointer-events-auto`}>
          {heroImageUrl && <img src={heroImageUrl} alt="Main" className="absolute inset-0" style={getImageStyle(heroAdjustment, 1)} />}
        </div>
        <div className="w-1/4 h-2/3 flex flex-col gap-4 pointer-events-auto">
          {supportingPhotos.slice(0, 3).map((photo) => (
            <div key={photo.id} className={`relative flex-1 overflow-hidden shadow-md border-4 ${frameClass}`}>
              <img src={photo.imageUrl} alt="Support" className="absolute inset-0" style={getImageStyle(photo.adjustment, 1)} />
            </div>
          ))}
        </div>
      </div>
    );
  }

  return null;
};

export default AdvancedPhotoArrangement;
