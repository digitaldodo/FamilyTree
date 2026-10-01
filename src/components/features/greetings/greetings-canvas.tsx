import { forwardRef, useEffect, useRef, useState } from 'react';
import { GreetingState } from '@/types/greetings';
import { cn } from '@/lib/utils';
import { TemplateHeritagePortrait } from './templates/template-heritage-portrait';
import { TemplateFamilyCollage } from './templates/template-family-collage';
import { TemplateModernMinimal } from './templates/template-modern-minimal';
import { TemplateFestiveHeritage } from './templates/template-festive-heritage';
import { TemplateMemoryAlbum } from './templates/template-memory-album';

interface GreetingsCanvasProps {
  state: GreetingState;
  isExporting?: boolean;
}

export const GreetingsCanvas = forwardRef<HTMLDivElement, GreetingsCanvasProps>(
  ({ state, isExporting }, ref) => {
    const containerRef = useRef<HTMLDivElement>(null);
    const [scale, setScale] = useState(1);

    const isPortrait = state.format === 'PORTRAIT';
    const originalWidth = 1080;
    const originalHeight = isPortrait ? 1350 : 1080;

    useEffect(() => {
      const updateScale = () => {
        if (!containerRef.current) return;
        const rect = containerRef.current.getBoundingClientRect();
        // Calculate scale to fit width and height, adding some padding
        const scaleW = (rect.width - 32) / originalWidth;
        const scaleH = (rect.height - 32) / originalHeight;
        setScale(Math.min(scaleW, scaleH, 1));
      };
      
      updateScale();
      window.addEventListener('resize', updateScale);
      return () => window.removeEventListener('resize', updateScale);
    }, [originalWidth, originalHeight]);

    return (
      <div 
        ref={containerRef}
        className="relative w-full h-full flex items-center justify-center overflow-hidden"
      >
        <div
           className={cn(
             "relative bg-white shadow-2xl origin-center",
             // Remove scale during export so html-to-image captures it exactly 1:1 at 1080px
             isExporting && "shadow-none"
           )}
           style={{
             width: originalWidth,
             height: originalHeight,
             transform: isExporting ? 'scale(1)' : `scale(${scale})`,
           }}
        >
          <div ref={ref} className="absolute inset-0 bg-white overflow-hidden">
            {state.template === 'HERITAGE_PORTRAIT' && <TemplateHeritagePortrait state={state} />}
            {state.template === 'FAMILY_COLLAGE' && <TemplateFamilyCollage state={state} />}
            {state.template === 'MODERN_MINIMAL' && <TemplateModernMinimal state={state} />}
            {state.template === 'FESTIVE_HERITAGE' && <TemplateFestiveHeritage state={state} />}
            {state.template === 'MEMORY_ALBUM' && <TemplateMemoryAlbum state={state} />}
          </div>
        </div>
      </div>
    );
  }
);

GreetingsCanvas.displayName = 'GreetingsCanvas';
