'use client';

import { useGreetingsEditor } from './use-greetings-editor';
import { useAppStore } from '@/store/use-app-store';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { OccasionType, TemplateType } from '@/types/greetings';
import { useMembers } from '@/hooks/use-members';
import { GooglePhotosPicker } from '@/components/features/members/google-photos-picker';
import { useEffect, useState } from 'react';
import Image from 'next/image';
import { ZoomIn, ImagePlus, Upload } from 'lucide-react';
import { toast } from 'sonner';

const OCCASIONS: { value: OccasionType; label: string }[] = [
  { value: 'BIRTHDAY', label: 'Birthday' },
  { value: 'ANNIVERSARY', label: 'Anniversary' },
  { value: 'WEDDING', label: 'Wedding' },
  { value: 'ENGAGEMENT', label: 'Engagement' },
  { value: 'GRADUATION', label: 'Graduation' },
  { value: 'NEW_BABY', label: 'New Baby' },
  { value: 'FAMILY_CELEBRATION', label: 'Family Celebration' },
  { value: 'THANK_YOU', label: 'Thank You' },
  { value: 'CUSTOM', label: 'Custom Message' },
];

const TEMPLATES: { value: TemplateType; label: string; desc: string }[] = [
  { value: 'HERITAGE_PORTRAIT', label: 'Heritage Portrait', desc: 'Editorial with soft background' },
  { value: 'FAMILY_COLLAGE', label: 'Family Collage', desc: 'Hero surrounded by family' },
  { value: 'MODERN_MINIMAL', label: 'Modern Minimal', desc: 'Clean, elegant, premium' },
  { value: 'FESTIVE_HERITAGE', label: 'Festive Heritage', desc: 'Subtle gold and botanical' },
  { value: 'MEMORY_ALBUM', label: 'Memory Album', desc: 'Like a page from an album' },
];

interface ControlsProps {
  editor: ReturnType<typeof useGreetingsEditor>;
  isMobile?: boolean;
}

export function GreetingsControls({ editor }: ControlsProps) {
  const { state, setHeroMember, setOccasion, setTemplate, setFormat, updateText, updateHeroAdjustment } = editor;
  const activeTreeId = useAppStore((s) => s.activeTreeId);
  const { members } = useMembers(activeTreeId || '');
  
  // A temporary state to handle member selection through the existing member search or a custom one
  // For simplicity, we can just render a list or use a custom select
  const [isChoosingCardType, setIsChoosingCardType] = useState(!state.heroMemberId);
  const [isSelectingMember, setIsSelectingMember] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [isUploading, setIsUploading] = useState(false);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>, isHero: boolean = false) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 10 * 1024 * 1024) {
      toast.error('File too large (max 10MB)');
      return;
    }

    try {
      setIsUploading(true);
      const formData = new FormData();
      formData.append('file', file);
      formData.append('folder', 'family-tree/greetings');

      const res = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });

      if (!res.ok) throw new Error('Upload failed');
      
      const data = await res.json();
      
      if (isHero) {
        editor.setCustomHero(data.url, 'THANK_YOU');
        setIsSelectingMember(false);
      } else {
        editor.addSupportingPhoto({
          id: Math.random().toString(),
          imageUrl: data.url,
          adjustment: { zoom: 1, x: 0, y: 0, opacity: 100 }
        });
      }
      toast.success('Photo uploaded successfully');
    } catch (error) {
      console.error(error);
      toast.error('Failed to upload photo');
    } finally {
      setIsUploading(false);
    }
  };

  const handleGooglePhoto = async (blob: Blob, isHero: boolean = false) => {
    if (blob.size > 10 * 1024 * 1024) {
      toast.error('File too large (max 10MB)');
      return;
    }
    try {
      setIsUploading(true);
      const formData = new FormData();
      formData.append('file', blob, 'google-photo.jpg');
      formData.append('folder', 'family-tree/greetings');

      const res = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });

      if (!res.ok) throw new Error('Upload failed');
      
      const data = await res.json();
      
      if (isHero) {
        editor.setCustomHero(data.url, 'THANK_YOU');
        setIsSelectingMember(false);
      } else {
        editor.addSupportingPhoto({
          id: Math.random().toString(),
          imageUrl: data.url,
          adjustment: { zoom: 1, x: 0, y: 0, opacity: 100 }
        });
      }
      toast.success('Photo imported successfully');
    } catch (error) {
      console.error(error);
      toast.error('Failed to import photo');
    } finally {
      setIsUploading(false);
    }
  };

  useEffect(() => {
    if (!state.heroMemberId && !isChoosingCardType) setIsSelectingMember(true);
  }, [state.heroMemberId, isChoosingCardType]);

  if (isChoosingCardType) {
    return (
      <div className="p-4 space-y-6">
        <div>
          <h2 className="text-lg font-semibold">1. Choose Card Type</h2>
          <p className="text-sm text-muted-foreground mt-1">What kind of card would you like to create?</p>
        </div>

        <div className="space-y-3">
          <Button 
            className="w-full h-auto py-4 flex flex-col items-start gap-1"
            variant="outline"
            onClick={() => {
              setOccasion('BIRTHDAY');
              setIsChoosingCardType(false);
              setIsSelectingMember(true);
            }}
          >
            <span className="font-semibold">Family Greeting</span>
            <span className="text-xs text-muted-foreground font-normal">Birthdays, Anniversaries, Celebrations</span>
          </Button>

          <Button 
            className="w-full h-auto py-4 flex flex-col items-start gap-1"
            variant="outline"
            onClick={() => {
              setOccasion('THANK_YOU');
              setIsChoosingCardType(false);
              setIsSelectingMember(true);
            }}
          >
            <span className="font-semibold">Thank You Card</span>
            <span className="text-xs text-muted-foreground font-normal">Express gratitude with custom family photos</span>
          </Button>
        </div>
      </div>
    );
  }

  if (isSelectingMember) {
    const filteredMembers = members?.filter(m => 
      `${m.firstName} ${m.lastName}`.toLowerCase().includes(searchQuery.toLowerCase())
    ) || [];

    return (
      <div className="p-4 space-y-6">
        <div>
          <h2 className="text-lg font-semibold">2. Who is this card for?</h2>
          <p className="text-sm text-muted-foreground mt-1">Select the main person (Hero) for this card.</p>
        </div>

        <div>
          <Input 
            placeholder="Search family members..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full"
          />
        </div>
        
        <div className="pt-4 border-t border-border">
          <Label className="text-sm font-semibold mb-2 block text-muted-foreground">Or use a custom photo</Label>
          <div className="relative">
            <input 
              type="file" 
              accept="image/*" 
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer disabled:cursor-not-allowed" 
              onChange={(e) => {
                 handleFileUpload(e, true);
              }}
              title="Upload custom photo"
              disabled={isUploading}
            />
            <Button variant="outline" className="w-full flex gap-2" disabled={isUploading}>
              <Upload className="w-4 h-4" />
              {isUploading ? 'Uploading...' : 'Upload from Device'}
            </Button>
          </div>
          <div className="mt-2 w-full [&>div>button]:w-full [&>div>button]:justify-center">
            <GooglePhotosPicker onPhotoSelected={(blob) => handleGooglePhoto(blob, true)} disabled={isUploading} />
          </div>
        </div>

        <div className="space-y-2 max-h-[50vh] overflow-y-auto pr-2">
          {filteredMembers.map(m => (
            <button
              key={m.id}
              onClick={() => {
                setHeroMember(m);
                setIsSelectingMember(false);
              }}
              className="w-full flex items-center gap-3 p-2 rounded-md hover:bg-muted transition-colors text-left border border-transparent hover:border-border"
            >
              <div className="w-10 h-10 rounded-full bg-primary/10 overflow-hidden relative shrink-0">
                {m.imageUrl ? (
                  <Image src={m.imageUrl} alt={m.firstName} fill className="object-cover" unoptimized />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-primary text-xs font-medium">
                    {m.firstName.charAt(0)}{m.lastName.charAt(0)}
                  </div>
                )}
              </div>
              <div className="overflow-hidden">
                <p className="font-medium text-sm truncate">{m.firstName} {m.lastName}</p>
                {m.birthDate && (
                   <p className="text-xs text-muted-foreground truncate">{new Date(m.birthDate).getFullYear()}</p>
                )}
              </div>
            </button>
          ))}
          {filteredMembers.length === 0 && (
            <p className="text-sm text-muted-foreground">No members found.</p>
          )}
        </div>
      </div>
    );
  }

  const selectedMember = members?.find(m => m.id === state.heroMemberId);

  return (
    <div className="p-4 space-y-8 pb-20">
      {/* Selected Hero */}
      <section className="space-y-3">
        <div className="flex items-center justify-between">
          <Label className="text-xs font-semibold uppercase text-muted-foreground tracking-wider">Hero Person</Label>
          <Button variant="ghost" size="sm" className="h-auto p-0 text-xs" onClick={() => setIsSelectingMember(true)}>Change</Button>
        </div>
        <div className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg border border-border">
           <div className="w-12 h-12 rounded-full bg-primary/10 overflow-hidden relative shrink-0">
             {selectedMember?.imageUrl ? (
               <Image src={selectedMember.imageUrl} alt={selectedMember.firstName} fill className="object-cover" unoptimized />
             ) : (
               <div className="w-full h-full flex items-center justify-center text-primary font-medium">
                 {selectedMember?.firstName.charAt(0)}{selectedMember?.lastName.charAt(0)}
               </div>
             )}
           </div>
           <div>
             <p className="font-medium text-sm">{selectedMember?.firstName} {selectedMember?.lastName}</p>
             <div className="flex gap-2 mt-1">
                <Button variant="outline" size="sm" className="h-6 text-[10px] px-2" onClick={() => updateHeroAdjustment({ zoom: Math.min(state.heroAdjustment.zoom + 0.1, 3) })}><ZoomIn className="w-3 h-3 mr-1"/> Zoom</Button>
                {/* Reset adjust */}
                <Button variant="ghost" size="sm" className="h-6 text-[10px] px-2" onClick={() => updateHeroAdjustment({ zoom: 1, x: 0, y: 0 })}>Reset</Button>
             </div>
           </div>
        </div>

        <div className="space-y-2 mt-4">
          <Label className="text-xs">Composition Mode</Label>
          <div className="flex gap-2">
            <Button 
              variant={state.heroMode === 'BACKGROUND' ? 'default' : 'outline'} 
              size="sm"
              className="flex-1 text-xs" 
              onClick={() => editor.setHeroMode('BACKGROUND')}
            >
              Background
            </Button>
            <Button 
              variant={state.heroMode === 'FOREGROUND' ? 'default' : 'outline'} 
              size="sm"
              className="flex-1 text-xs" 
              onClick={() => editor.setHeroMode('FOREGROUND')}
            >
              Foreground
            </Button>
          </div>
        </div>

        <div className="space-y-2 mt-4">
          <Label className="text-xs">Opacity ({state.heroAdjustment.opacity}%)</Label>
          <input 
            type="range" 
            min="5" 
            max="100" 
            value={state.heroAdjustment.opacity}
            onChange={(e) => updateHeroAdjustment({ opacity: parseInt(e.target.value) })}
            className="w-full accent-primary"
          />
        </div>
      </section>

      {/* Occasion & Template */}
      <section className="space-y-4">
        <div className="space-y-2">
          <Label>Occasion</Label>
          <Select value={state.occasion} onValueChange={(v) => setOccasion(v as OccasionType)}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              {OCCASIONS.map(o => <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>
        
        <div className="space-y-2">
          <Label>Format</Label>
          <div className="flex gap-2">
            <Button 
              variant={state.format === 'PORTRAIT' ? 'default' : 'outline'} 
              className="flex-1 text-xs px-2" 
              onClick={() => setFormat('PORTRAIT')}
            >
              Portrait
            </Button>
            <Button 
              variant={state.format === 'SQUARE' ? 'default' : 'outline'} 
              className="flex-1 text-xs px-2" 
              onClick={() => setFormat('SQUARE')}
            >
              Square
            </Button>
            <Button 
              variant={state.format === 'LANDSCAPE' ? 'default' : 'outline'} 
              className="flex-1 text-xs px-2" 
              onClick={() => setFormat('LANDSCAPE')}
            >
              Landscape
            </Button>
          </div>
        </div>

        <div className="space-y-2">
          <Label>Template</Label>
          <Select value={state.template} onValueChange={(v) => setTemplate(v as TemplateType)}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              {TEMPLATES.map(t => (
                <SelectItem key={t.value} value={t.value}>
                  <div>
                    <div className="font-medium">{t.label}</div>
                    <div className="text-[10px] text-muted-foreground">{t.desc}</div>
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </section>

      {/* Text Content */}
      <section className="space-y-4">
        <Label className="text-xs font-semibold uppercase text-muted-foreground tracking-wider">Text Customization</Label>
        
        <div className="space-y-2">
          <Label className="text-xs">Headline</Label>
          <Input value={state.headline} onChange={(e) => updateText({ headline: e.target.value })} />
        </div>
        
        <div className="space-y-2">
          <Label className="text-xs">Person&apos;s Name</Label>
          <Input value={state.heroName} onChange={(e) => updateText({ heroName: e.target.value })} />
        </div>
        
        <div className="space-y-2">
          <Label className="text-xs">Date (Optional)</Label>
          <Input value={state.dateStr} onChange={(e) => updateText({ dateStr: e.target.value })} placeholder="e.g. 24 October 2026" />
        </div>

        <div className="space-y-2">
          <Label className="text-xs">Message</Label>
          <Textarea 
            value={state.message} 
            onChange={(e) => updateText({ message: e.target.value })}
            className="resize-none h-20"
          />
        </div>
        
        <div className="grid grid-cols-2 gap-2">
          <div className="space-y-2">
            <Label className="text-xs">Footer</Label>
            <Input value={state.footer} onChange={(e) => updateText({ footer: e.target.value })} placeholder="With love," />
          </div>
          <div className="space-y-2">
            <Label className="text-xs">Sender Name</Label>
            <Input value={state.senderName} onChange={(e) => updateText({ senderName: e.target.value })} />
          </div>
        </div>
      </section>

      {/* Supporting Photos */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <Label className="text-xs font-semibold uppercase text-muted-foreground tracking-wider">Supporting Photos</Label>
        </div>
        <div className="space-y-3">
          {state.supportingPhotos.map((p) => {
            const member = members?.find(m => m.id === p.memberId);
            return (
              <div key={p.id} className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg border border-border">
                 <div className="w-10 h-10 rounded-sm bg-primary/10 overflow-hidden relative shrink-0">
                   <Image src={p.imageUrl} alt="Supporting" fill className="object-cover" unoptimized />
                 </div>
                 <div className="flex-1">
                   <p className="font-medium text-xs truncate">{member ? `${member.firstName} ${member.lastName}` : 'Custom Photo'}</p>
                 </div>
                 <Button variant="ghost" size="icon" onClick={() => editor.removeSupportingPhoto(p.id)} className="h-6 w-6 text-destructive hover:text-destructive">
                   &times;
                 </Button>
              </div>
            );
          })}
          
          <div className="flex gap-2">
            <Select 
              onValueChange={(val) => {
                const m = members?.find(x => x.id === val);
                if (m && m.imageUrl) {
                  editor.addSupportingPhoto({
                    id: Math.random().toString(),
                    memberId: m.id,
                    imageUrl: m.imageUrl,
                    adjustment: { zoom: 1, x: 0, y: 0, opacity: 100 }
                  });
                }
              }}
            >
              <SelectTrigger className="w-full text-xs h-8"><SelectValue placeholder="Add Family Member" /></SelectTrigger>
              <SelectContent>
                {members?.filter(m => m.imageUrl && m.id !== state.heroMemberId).map(m => (
                  <SelectItem key={m.id} value={m.id}>{m.firstName} {m.lastName}</SelectItem>
                ))}
              </SelectContent>
            </Select>

            <div className="relative">
              <input 
                type="file" 
                accept="image/*" 
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer disabled:cursor-not-allowed" 
                onChange={(e) => handleFileUpload(e, false)}
                title="Upload custom photo"
                disabled={isUploading}
              />
              <Button variant="outline" className="h-8 px-3" disabled={isUploading}>
                <ImagePlus className="w-4 h-4" />
              </Button>
            </div>
            
            <div className="[&>div>button]:h-8 [&>div>button]:px-3">
              <GooglePhotosPicker onPhotoSelected={(blob) => handleGooglePhoto(blob, false)} disabled={isUploading} />
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
