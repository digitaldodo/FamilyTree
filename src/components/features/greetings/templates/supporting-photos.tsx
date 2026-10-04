import React from 'react';
import type { CanvasFormat, SupportingPhoto } from '@/types/greetings';
import { chooseClusterStyle, getClusterBudget, layoutCluster } from '../photo-layout';

interface Props {
  photos: SupportingPhoto[];
  format: CanvasFormat;
  className?: string;
  /** True when a foreground hero shares the card, so the band must stay shorter. */
  compact?: boolean;
  /** Tailwind border colour class for the photo frame. */
  frameClass?: string;
}

/**
 * Shared supporting-photo composition used by every template.
 * The grid is computed from the number of photos and the card format so that
 * faces stay large for small groups and nothing becomes microscopic for a
 * whole family. One person with many photos gets an album-style tile layout;
 * several people get circular family portraits.
 */
export const SupportingPhotos: React.FC<Props> = ({
  photos,
  format,
  className = '',
  compact = false,
  frameClass = 'border-white',
}) => {
  if (photos.length === 0) return null;

  const style = chooseClusterStyle(photos);
  const budget = getClusterBudget(format, compact);
  const layout = layoutCluster(photos.length, budget.maxW, budget.maxH, {
    maxSize: budget.maxSize,
    gap: photos.length > 6 ? 12 : 20,
  });
  const frame = Math.max(3, Math.min(8, Math.round(layout.size * 0.035)));

  return (
    <div
      className={`flex flex-wrap justify-center content-center shrink-0 ${className}`}
      style={{ width: layout.width + 2, maxWidth: '100%', gap: layout.gap }}
      data-photo-count={photos.length}
      data-cluster-style={style}
    >
      {photos.map((photo, i) => (
        <div
          key={photo.id}
          className={`relative shrink-0 overflow-hidden bg-slate-100 shadow-xl border-solid ${frameClass} ${
            style === 'portraits' ? 'rounded-full' : 'rounded-xl'
          }`}
          style={{
            width: layout.size,
            height: layout.size,
            borderWidth: frame,
            transform: style === 'album' && photos.length <= 6 ? `rotate(${i % 2 ? 2 : -2}deg)` : undefined,
          }}
        >
          <img
            src={photo.imageUrl}
            alt="Family"
            className="absolute inset-0"
            style={{
              objectFit: 'cover',
              objectPosition: `calc(50% + ${photo.adjustment.x}%) calc(50% + ${photo.adjustment.y}%)`,
              transform: `scale(${photo.adjustment.zoom})`,
              width: '100%',
              height: '100%',
            }}
          />
        </div>
      ))}
    </div>
  );
};

export default SupportingPhotos;
