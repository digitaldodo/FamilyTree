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
    const isLandscape = state.format === 'LANDSCAPE';
    const originalWidth = isLandscape ? 1200 : 1080;
    const originalHeight = isLandscape ? 675 : isPortrait ? 1350 : 1080;

    useEffect(() => {
      const updateScale = () => {
        if (!containerRef.current) return;
        const parent = containerRef.current.parentElement;
        if (!parent) return;
        const rect = parent.getBoundingClientRect();
        
        // On mobile (narrow width), scale primarily by width. On desktop, fit to height if needed.
        const isMobile = window.innerWidth < 768;
        const scaleW = (rect.width - 32) / originalWidth;
        const scaleH = isMobile ? scaleW : (window.innerHeight - 200) / originalHeight;
        
        setScale(Math.min(scaleW, scaleH, 1));
      };
      
      updateScale();
      window.addEventListener('resize', updateScale);
      return () => window.removeEventListener('resize', updateScale);
    }, [originalWidth, originalHeight]);

    return (
      <div 
        ref={containerRef}
        className="relative w-full flex items-center justify-center overflow-visible"
        style={{ height: isExporting ? originalHeight : originalHeight * scale + 32 }}
      >
        <div
          className="relative"
          style={{
            width: isExporting ? originalWidth : originalWidth * scale,
            height: isExporting ? originalHeight : originalHeight * scale,
          }}
        >
          <div
             className={cn(
               "absolute top-0 left-0 bg-white shadow-2xl",
               // Remove scale during export so html-to-image captures it exactly 1:1 at 1080px
               isExporting && "shadow-none"
             )}
             style={{
               width: originalWidth,
               height: originalHeight,
               transform: isExporting ? 'scale(1)' : `scale(${scale})`,
               transformOrigin: 'top left',
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
      </div>
    );
  }
);

GreetingsCanvas.displayName = 'GreetingsCanvas';
