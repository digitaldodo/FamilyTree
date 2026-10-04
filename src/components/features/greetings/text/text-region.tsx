import React from 'react';
import { GreetingState, TextLayer } from '@/types/greetings';
import { cn } from '@/lib/utils';

interface Props {
  state: GreetingState;
  region: 'top' | 'middle' | 'bottom';
  className?: string;
}

export const TextRegion: React.FC<Props> = ({ state, region, className }) => {
  const layers = (state.textLayers || []).filter(l => l.region === region).sort((a, b) => a.zIndex - b.zIndex);
  
  if (layers.length === 0) return null;

  return (
    <div className={cn("flex flex-col gap-4 w-full relative z-30 pointer-events-auto", className)}>
      {layers.map(layer => (
        <TextLayerRenderer key={layer.id} layer={layer} />
      ))}
    </div>
  );
};

export const TextLayerRenderer: React.FC<{ layer: TextLayer }> = ({ layer }) => {
  const alignClass = layer.alignment === 'center' ? 'text-center' : layer.alignment === 'right' ? 'text-right' : 'text-left';
  const flexAlignClass = layer.alignment === 'center' ? 'items-center' : layer.alignment === 'right' ? 'items-end' : 'items-start';

  let bgClass = '';
  if (layer.background === 'plate') bgClass = 'bg-white/95 px-6 py-4 rounded-xl shadow-sm border border-black/10';
  else if (layer.background === 'translucent') bgClass = 'bg-black/40 text-white px-4 py-2 rounded-lg backdrop-blur-md';
  else if (layer.background === 'shadow') bgClass = 'drop-shadow-[0_4px_4px_rgba(0,0,0,0.5)]';

  return (
    <div className={cn("flex flex-col w-full break-words shrink-0", flexAlignClass)}>
      <div 
        className={cn(
          "max-w-full whitespace-pre-wrap leading-tight",
          layer.fontFamily,
          alignClass,
          bgClass,
          layer.isBold && "font-bold",
          layer.isItalic && "italic",
          layer.isUppercase && "uppercase"
        )}
        style={{
          fontSize: `${layer.fontSize}em`,
          color: layer.background === 'translucent' ? 'white' : layer.color,
        }}
      >
        {layer.content}
      </div>
    </div>
  );
};
