'use client';

import { useGreetingsEditor } from './use-greetings-editor';
import { GreetingsCanvas } from './greetings-canvas';
import { GreetingsControls } from './greetings-controls';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Download, Share } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useCallback, useRef, useState } from 'react';
import { toJpeg } from 'html-to-image';
import { toast } from 'sonner';

export function GreetingsStudio() {
  const editor = useGreetingsEditor();
  const router = useRouter();
  const canvasRef = useRef<HTMLDivElement>(null);
  const [isExporting, setIsExporting] = useState(false);

  const handleDownload = useCallback(async () => {
    if (!canvasRef.current) return;
    try {
      setIsExporting(true);
      const dataUrl = await toJpeg(canvasRef.current, {
        quality: 0.95,
        pixelRatio: 2,
        style: {
          transform: 'scale(1)', // Ensure no zoom affects the capture
        },
      });
      
      const link = document.createElement('a');
      link.download = `${editor.state.heroName || 'Family'}-Greeting.jpg`;
      link.href = dataUrl;
      link.click();
      toast.success('Greeting downloaded successfully!');
    } catch (err) {
      console.error(err);
      toast.error('Failed to generate JPG');
    } finally {
      setIsExporting(false);
    }
  }, [editor.state.heroName]);

  const handleShare = useCallback(async () => {
    if (!canvasRef.current) return;
    try {
      setIsExporting(true);
      const dataUrl = await toJpeg(canvasRef.current, {
        quality: 0.9,
        pixelRatio: 2,
      });
      
      const blob = await (await fetch(dataUrl)).blob();
      const file = new File([blob], 'greeting.jpg', { type: 'image/jpeg' });
      
      if (navigator.canShare && navigator.canShare({ files: [file] })) {
        await navigator.share({
          files: [file],
          title: 'Family Greeting',
          text: 'Created with FamilyTree',
        });
      } else {
        // fallback to download
        handleDownload();
      }
    } catch (err) {
      console.error(err);
      toast.error('Sharing failed.');
    } finally {
      setIsExporting(false);
    }
  }, [handleDownload]);

  return (
    <div className="flex flex-col h-[100dvh] bg-background">
      {/* Header */}
      <header className="flex-shrink-0 h-14 border-b border-border flex items-center justify-between px-4 bg-card z-10">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => router.back()}>
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <h1 className="font-semibold text-lg">Family Greetings</h1>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={handleShare} disabled={isExporting || !editor.state.heroMemberId}>
            <Share className="w-4 h-4 mr-2" /> Share
          </Button>
          <Button size="sm" onClick={handleDownload} disabled={isExporting || !editor.state.heroMemberId}>
            <Download className="w-4 h-4 mr-2" /> Download JPG
          </Button>
        </div>
      </header>

      {/* Main Content */}
      <div className="flex-1 overflow-hidden flex flex-col md:flex-row relative">
        {/* Controls - Left on Desktop, Bottom Sheet on Mobile */}
        <div className="md:w-80 lg:w-[350px] flex-shrink-0 bg-card border-r border-border h-full overflow-y-auto hidden md:block">
          <GreetingsControls editor={editor} />
        </div>

        {/* Canvas Area */}
        <div className="flex-1 bg-muted/30 overflow-y-auto flex items-center justify-center p-4 md:p-8">
          <GreetingsCanvas state={editor.state} ref={canvasRef} isExporting={isExporting} />
        </div>

        {/* Mobile Controls */}
        <div className="md:hidden flex-shrink-0 border-t border-border bg-card max-h-[50dvh] overflow-y-auto">
          <GreetingsControls editor={editor} isMobile />
        </div>
      </div>
    </div>
  );
}
