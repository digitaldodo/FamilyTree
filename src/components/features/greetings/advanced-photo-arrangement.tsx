import React, { useEffect, useRef, useState } from 'react';
import { GreetingState, ImageAdjustment } from '@/types/greetings';
import { layoutCluster } from './photo-layout';

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

function useMeasure() {
  const ref = useRef<HTMLDivElement>(null);
  const [bounds, setBounds] = useState({ width: 0, height: 0 });
  useEffect(() => {
    if (!ref.current) return;
    const observer = new ResizeObserver(([entry]) => {
      setBounds({ width: entry.contentRect.width, height: entry.contentRect.height });
    });
    observer.observe(ref.current);
    return () => observer.disconnect();
  }, []);
  return [ref, bounds] as const;
}

export const AdvancedPhotoArrangement: React.FC<Props> = ({ state, frameClass = 'border-white' }) => {
  const { arrangement, heroImageUrl, heroAdjustment, supportingPhotos, format } = state;
  const [ref, { width, height }] = useMeasure();
  
  // Wait until we have container dimensions
  if (width === 0 || height === 0) {
    return <div ref={ref} className="w-full h-full relative z-20 pointer-events-none" />;
  }

  const minDim = Math.min(width, height);
  const totalPhotos = supportingPhotos.length + (heroImageUrl ? 1 : 0);
  
  if (arrangement === 'FLOATING_BACKGROUND') {
    return (
      <div ref={ref} className="w-full h-full relative z-20 pointer-events-none flex flex-col justify-end pb-8">
        <div className="flex flex-wrap justify-center gap-4 px-4 w-full">
          {supportingPhotos.map((photo, i) => {
            const sizeClass = totalPhotos > 8 ? "w-16 h-16 sm:w-20 sm:h-20" : "w-24 h-24 sm:w-32 sm:h-32";
            return (
              <div key={photo.id} className={`relative ${sizeClass} rounded-full overflow-hidden shadow-xl border-4 ${frameClass} transform rotate-${i % 2 === 0 ? '3' : '[-3]'} pointer-events-auto`}>
                <img src={photo.imageUrl} alt="Family" className="absolute inset-0" style={getImageStyle(photo.adjustment, 1)} />
              </div>
            );
          })}
        </div>
      </div>
    );
  }

  if (arrangement === 'HERO_CIRCLE' || arrangement === 'FAMILY_ORBIT') {
    const isOrbit = arrangement === 'FAMILY_ORBIT';
    const heroSize = Math.max(120, Math.min(minDim * (isOrbit ? 0.35 : 0.45), 320));
    const radius = Math.min(width, height) * 0.35 + (isOrbit ? 20 : 0);
    const supportSize = Math.max(60, Math.min(minDim * 0.2, 120));

    return (
      <div ref={ref} className="relative w-full h-full flex items-center justify-center z-20 pointer-events-none">
        {heroImageUrl && (
          <div className={`absolute rounded-full overflow-hidden shadow-2xl border-4 md:border-8 ${frameClass} pointer-events-auto flex-shrink-0`} style={{ width: heroSize, height: heroSize }}>
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
              className={`absolute rounded-full overflow-hidden shadow-lg border-2 md:border-4 ${frameClass} pointer-events-auto transition-transform hover:scale-105`}
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
    const arcRadius = width * 0.8;
    const heroSize = Math.min(minDim * 0.4, 240);
    const supportSize = Math.max(50, Math.min(width / (supportingPhotos.length + 2), 100));

    return (
      <div ref={ref} className="relative w-full h-full flex flex-col items-center justify-end z-20 pointer-events-none pb-4">
        <div className="relative w-full flex justify-center items-end" style={{ height: heroSize * 0.8 }}>
          {supportingPhotos.map((photo, i) => {
            const total = supportingPhotos.length;
            const spread = Math.min(Math.PI * 0.6, total * 0.25); 
            const startAngle = -Math.PI / 2 - spread / 2;
            const step = total > 1 ? spread / (total - 1) : 0;
            const angle = total === 1 ? -Math.PI/2 : startAngle + i * step;
            
            const x = Math.cos(angle) * arcRadius;
            const y = Math.sin(angle) * arcRadius + arcRadius; 
            return (
              <div 
                key={photo.id} 
                className={`absolute rounded-full overflow-hidden shadow-md border-2 md:border-4 ${frameClass} pointer-events-auto`}
                style={{ width: supportSize, height: supportSize, transform: `translate(${x}px, ${y - arcRadius + heroSize * 0.6}px)` }}
              >
                <img src={photo.imageUrl} alt="Support" className="absolute inset-0" style={getImageStyle(photo.adjustment, 1)} />
              </div>
            );
          })}
        </div>
        {heroImageUrl && (
          <div className={`relative rounded-full overflow-hidden shadow-2xl border-4 md:border-8 ${frameClass} pointer-events-auto z-30`} style={{ width: heroSize, height: heroSize, marginTop: -heroSize * 0.3 }}>
            <img src={heroImageUrl} alt="Hero" className="absolute inset-0" style={getImageStyle(heroAdjustment, 1)} />
          </div>
        )}
      </div>
    );
  }

  if (arrangement === 'EDGE_PORTRAITS') {
    const positions = [
      { top: '5%', left: '5%' },
      { bottom: '5%', right: '5%' },
      { top: '5%', right: '5%' },
      { bottom: '5%', left: '5%' },
      { top: '40%', left: '0%' },
      { top: '40%', right: '0%' },
    ];
    const heroSize = Math.min(minDim * 0.45, 260);
    const supportSize = Math.max(60, Math.min(minDim * 0.18, 110));
    
    return (
      <div ref={ref} className="absolute inset-0 z-20 pointer-events-none">
        {heroImageUrl && (
          <div className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full overflow-hidden shadow-2xl border-4 md:border-8 ${frameClass} pointer-events-auto`} style={{ width: heroSize, height: heroSize }}>
            <img src={heroImageUrl} alt="Hero" className="absolute inset-0" style={getImageStyle(heroAdjustment, 1)} />
          </div>
        )}
        {supportingPhotos.map((photo, i) => (
          <div 
            key={photo.id} 
            className={`absolute rounded-full overflow-hidden shadow-lg border-2 md:border-4 ${frameClass} pointer-events-auto`}
            style={{ ...positions[i % positions.length], width: supportSize, height: supportSize }}
          >
            <img src={photo.imageUrl} alt="Support" className="absolute inset-0" style={getImageStyle(photo.adjustment, 1)} />
          </div>
        ))}
      </div>
    );
  }

  if (arrangement === 'FAMILY_GRID') {
    const photos = heroImageUrl ? [{ id: 'hero', imageUrl: heroImageUrl, adjustment: heroAdjustment }, ...supportingPhotos] : supportingPhotos;
    const layout = layoutCluster(photos.length, width - 32, height - 32, { maxSize: Math.min(minDim * 0.4, 250), gap: 16 });
    
    return (
      <div ref={ref} className="w-full h-full flex items-center justify-center p-4 z-20 pointer-events-none">
        <div 
          className="grid gap-4 pointer-events-auto"
          style={{ gridTemplateColumns: `repeat(${layout.cols}, ${layout.size}px)`, gridTemplateRows: `repeat(${layout.rows}, ${layout.size}px)` }}
        >
          {photos.map((photo) => (
            <div key={photo.id} className={`relative w-full h-full overflow-hidden shadow-md border-2 md:border-4 ${frameClass} rounded-xl`}>
              <img src={photo.imageUrl} alt="Family" className="absolute inset-0" style={getImageStyle(photo.adjustment, 1)} />
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (arrangement === 'PHOTO_STRIP') {
    const isPortrait = format === 'PORTRAIT' || height > width;
    const photos = heroImageUrl ? [{ id: 'hero', imageUrl: heroImageUrl, adjustment: heroAdjustment }, ...supportingPhotos] : supportingPhotos;
    const size = Math.max(60, Math.min((isPortrait ? height / (photos.length + 1) : width / (photos.length + 1)) - 16, 120));
    
    return (
      <div ref={ref} className={`absolute inset-0 z-20 pointer-events-none flex items-center justify-center`}>
        <div className={`flex ${isPortrait ? 'flex-col' : 'flex-row'} gap-4 pointer-events-auto`}>
          {photos.map((photo) => (
            <div key={photo.id} className={`relative overflow-hidden shadow-lg border-2 md:border-4 ${frameClass} rounded-lg`} style={{ width: size, height: size }}>
              <img src={photo.imageUrl} alt="Family" className="absolute inset-0" style={getImageStyle(photo.adjustment, 1)} />
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (arrangement === 'MEMORY_COLLAGE' || arrangement === 'POLAROID') {
    const isPolaroid = arrangement === 'POLAROID';
    const photos = heroImageUrl ? [{ id: 'hero', imageUrl: heroImageUrl, adjustment: heroAdjustment }, ...supportingPhotos] : supportingPhotos;
    const size = Math.max(80, Math.min(minDim * 0.35, 180));
    
    return (
      <div ref={ref} className="w-full h-full flex items-center justify-center p-4 z-20 pointer-events-none overflow-visible">
        <div className="relative w-full h-full max-w-xl max-h-xl flex items-center justify-center pointer-events-auto">
          {photos.map((photo, i) => {
            const rotate = (i % 2 === 0 ? 1 : -1) * (3 + (i % 3) * 2);
            const offsetX = (i % 3 - 1) * (size * 0.5);
            const offsetY = (i % 2 === 0 ? -size * 0.1 : size * 0.1);
            return (
              <div 
                key={photo.id} 
                className={`absolute overflow-hidden shadow-xl ${isPolaroid ? 'bg-white p-2 pb-6 md:p-3 md:pb-10' : `border-4 ${frameClass} rounded-lg`}`}
                style={{ width: size, height: size, transform: `translate(${offsetX}px, ${offsetY}px) rotate(${rotate}deg)`, zIndex: i }}
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
      <div ref={ref} className="w-full h-full flex flex-row items-center justify-center gap-6 p-4 z-20 pointer-events-none">
        <div className={`relative w-[60%] h-[80%] max-h-96 overflow-hidden shadow-2xl border-4 md:border-8 ${frameClass} pointer-events-auto rounded-2xl`}>
          {heroImageUrl && <img src={heroImageUrl} alt="Main" className="absolute inset-0" style={getImageStyle(heroAdjustment, 1)} />}
        </div>
        <div className="w-[30%] h-[80%] max-h-96 flex flex-col gap-4 pointer-events-auto">
          {supportingPhotos.slice(0, 3).map((photo) => (
            <div key={photo.id} className={`relative flex-1 overflow-hidden shadow-md border-2 md:border-4 ${frameClass} rounded-xl`}>
              <img src={photo.imageUrl} alt="Support" className="absolute inset-0" style={getImageStyle(photo.adjustment, 1)} />
            </div>
          ))}
        </div>
      </div>
    );
  }

  return <div ref={ref} className="w-full h-full relative" />;
};

export default AdvancedPhotoArrangement;

