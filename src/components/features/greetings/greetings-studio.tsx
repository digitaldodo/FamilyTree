'use client';

import { useGreetingsEditor } from './use-greetings-editor';
import { GreetingsCanvas } from './greetings-canvas';
import { GreetingsControls } from './greetings-controls';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Download, Share, Save } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useCallback, useRef, useState } from 'react';
import { toJpeg } from 'html-to-image';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useAppStore } from '@/store/use-app-store';
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

  const activeTreeId = useAppStore((s) => s.activeTreeId);
  const [isMemoryModalOpen, setIsMemoryModalOpen] = useState(false);
  const [memoryTitle, setMemoryTitle] = useState('');
  const [memoryDate, setMemoryDate] = useState(new Date().toISOString().split('T')[0]);
  const [isSavingMemory, setIsSavingMemory] = useState(false);

  const handleSaveMemory = async () => {
    if (!canvasRef.current || !activeTreeId) return;
    try {
      setIsSavingMemory(true);
      setIsExporting(true);
      
      const dataUrl = await toJpeg(canvasRef.current, { quality: 0.9, pixelRatio: 2 });
      const blob = await (await fetch(dataUrl)).blob();
      
      // Upload image
      const formData = new FormData();
      formData.append('file', blob, 'greeting.jpg');
      formData.append('folder', 'family-tree/memories');
      const uploadRes = await fetch('/api/upload', { method: 'POST', body: formData });
      if (!uploadRes.ok) throw new Error('Upload failed');
      const uploadData = await uploadRes.json();
      
      // Create memory
      const memRes = await fetch('/api/memories', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: memoryTitle || 'Family Greeting',
          date: new Date(memoryDate).toISOString(),
          description: editor.state.message || '',
          type: 'MEMORY',
          treeId: activeTreeId,
          memberIds: editor.state.heroMemberId && editor.state.heroMemberId !== 'CUSTOM' ? [editor.state.heroMemberId] : [],
          media: [{ url: uploadData.url, type: 'image' }]
        }),
      });
      
      if (!memRes.ok) throw new Error('Failed to save memory');
      toast.success('Saved as Memory successfully!');
      setIsMemoryModalOpen(false);
    } catch (err) {
      console.error(err);
      toast.error('Failed to save memory');
    } finally {
      setIsSavingMemory(false);
      setIsExporting(false);
    }
  };

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
          <Button variant="outline" size="sm" onClick={() => setIsMemoryModalOpen(true)} disabled={isExporting || !editor.state.heroMemberId}>
            <Save className="w-4 h-4 mr-2" /> Save as Memory
          </Button>
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

      <Dialog open={isMemoryModalOpen} onOpenChange={setIsMemoryModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Save as Memory</DialogTitle>
            <DialogDescription>Save this greeting as a memory in your family tree.</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Title</Label>
              <Input value={memoryTitle} onChange={(e) => setMemoryTitle(e.target.value)} placeholder="e.g. Grandma's 80th Birthday Greeting" />
            </div>
            <div className="space-y-2">
              <Label>Date</Label>
              <Input type="date" value={memoryDate} onChange={(e) => setMemoryDate(e.target.value)} />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsMemoryModalOpen(false)}>Cancel</Button>
            <Button onClick={handleSaveMemory} disabled={isSavingMemory}>
              {isSavingMemory ? 'Saving...' : 'Save Memory'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
