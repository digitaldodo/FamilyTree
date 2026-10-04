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
import { ZoomIn, Upload, X } from 'lucide-react';
import { toast } from 'sonner';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';

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
const CollapsibleSection = ({ title, defaultOpen = true, children }: any) => {
  const [isOpen, setIsOpen] = useState(defaultOpen);
  return (
    <div className="border border-border rounded-lg overflow-hidden bg-card shadow-sm">
      <button 
        type="button" 
        onClick={() => setIsOpen(!isOpen)} 
        className="w-full flex items-center justify-between p-4 bg-muted/20 hover:bg-muted/40 transition-colors"
      >
        <h3 className="font-semibold text-sm tracking-wide">{title}</h3>
        <span className="text-muted-foreground text-xs">{isOpen ? '▼' : '▶'}</span>
      </button>
      {isOpen && (
        <div className="p-4 border-t border-border/50 space-y-4">
          {children}
        </div>
      )}
    </div>
  );
};

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
  const [memberPhotoPicker, setMemberPhotoPicker] = useState<string | null>(null);
  const [pickerMode, setPickerMode] = useState<'HERO' | 'SUPPORTING'>('SUPPORTING');
  const [searchQuery, setSearchQuery] = useState('');
  const [isUploading, setIsUploading] = useState(false);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>, isHero: boolean = false) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    try {
      setIsUploading(true);
      
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        if (file.size > 10 * 1024 * 1024) {
          toast.error(`File ${file.name} is too large (max 10MB)`);
          continue;
        }

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
          break; // Hero mode only handles the first image
        } else {
          editor.addSupportingPhoto({
            id: Math.random().toString(),
            imageUrl: data.url,
            adjustment: { zoom: 1, x: 0, y: 0, opacity: 100 }
          });
        }
      }
      toast.success('Upload complete');
    } catch (error) {
      console.error(error);
      toast.error('Failed to upload some photos');
    } finally {
      setIsUploading(false);
      e.target.value = ''; // Reset input
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
    <div className="p-4 space-y-4 pb-20">
      {/* Selected Hero */}
      <CollapsibleSection title="Main Photo (Hero)" defaultOpen={true}>
        <div className="flex items-center justify-end">
          <Button variant="ghost" size="sm" className="h-auto p-0 text-xs text-primary" onClick={() => setIsSelectingMember(true)}>Change Person</Button>
        </div>
        <div className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg border border-border">
           <div className="w-12 h-12 rounded-full bg-primary/10 overflow-hidden relative shrink-0">
             {state.heroImageUrl ? (
               <Image src={state.heroImageUrl} alt={selectedMember?.firstName || 'Hero'} fill className="object-cover" unoptimized />
             ) : (
               <div className="w-full h-full flex items-center justify-center text-primary font-medium">
                 {selectedMember ? `${selectedMember.firstName.charAt(0)}${selectedMember.lastName.charAt(0)}` : 'H'}
               </div>
             )}
           </div>
           <div className="flex-1">
             <p className="font-medium text-sm">{selectedMember?.firstName} {selectedMember?.lastName}</p>
             <div className="flex gap-2 mt-1">
                <Button variant="outline" size="sm" className="h-6 text-[10px] px-2" onClick={() => updateHeroAdjustment({ zoom: Math.min(state.heroAdjustment.zoom + 0.1, 3) })}><ZoomIn className="w-3 h-3 mr-1"/> Zoom</Button>
                {/* Reset adjust */}
                <Button variant="ghost" size="sm" className="h-6 text-[10px] px-2" onClick={() => updateHeroAdjustment({ zoom: 1, x: 0, y: 0 })}>Reset</Button>
                {selectedMember && (selectedMember.media?.length ?? 0) > 0 && (
                  <Button variant="ghost" size="sm" className="h-6 text-[10px] px-2 ml-auto" onClick={() => {
                    setPickerMode('HERO');
                    setMemberPhotoPicker(selectedMember.id);
                  }}>Change Photo</Button>
                )}
             </div>
           </div>
        </div>

        <div className="space-y-2 mt-4">
          <Label className="text-xs">Photo Arrangement</Label>
          <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-thin">
            {[
              { value: 'FLOATING_BACKGROUND', label: 'Floating Family', icon: <div className="relative w-8 h-8 bg-primary/20 rounded-sm"><div className="absolute bottom-1 left-1 w-2 h-2 rounded-full bg-primary"/><div className="absolute bottom-1 right-1 w-2 h-2 rounded-full bg-primary"/></div> },
              { value: 'HERO_CIRCLE', label: 'Hero Circle', icon: <div className="relative w-8 h-8"><div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-4 h-4 rounded-full bg-primary/60"/><div className="absolute top-1 left-1/2 -translate-x-1/2 w-2 h-2 rounded-full bg-primary/40"/><div className="absolute bottom-1 left-1/2 -translate-x-1/2 w-2 h-2 rounded-full bg-primary/40"/></div> },
              { value: 'FAMILY_ORBIT', label: 'Family Orbit', icon: <div className="relative w-8 h-8 rounded-full border border-primary/20"><div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-3 h-3 rounded-full bg-primary/60"/><div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 w-2 h-2 rounded-full bg-primary/40"/></div> },
              { value: 'ELEGANT_ARC', label: 'Elegant Arc', icon: <div className="relative w-8 h-8"><div className="absolute bottom-1 left-1/2 -translate-x-1/2 w-4 h-4 rounded-full bg-primary/60"/><div className="absolute top-2 left-1 w-2 h-2 rounded-full bg-primary/40"/><div className="absolute top-1 left-1/2 -translate-x-1/2 w-2 h-2 rounded-full bg-primary/40"/><div className="absolute top-2 right-1 w-2 h-2 rounded-full bg-primary/40"/></div> },
              { value: 'EDGE_PORTRAITS', label: 'Edge Portraits', icon: <div className="relative w-8 h-8 border border-primary/20"><div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-3 h-3 rounded-full bg-primary/60"/><div className="absolute top-1 left-1 w-2 h-2 rounded-full bg-primary/40"/><div className="absolute bottom-1 right-1 w-2 h-2 rounded-full bg-primary/40"/></div> },
              { value: 'FAMILY_GRID', label: 'Family Grid', icon: <div className="grid grid-cols-2 gap-1 w-8 h-8 p-1 border border-primary/20"><div className="bg-primary/40 rounded-sm"/><div className="bg-primary/40 rounded-sm"/><div className="bg-primary/40 rounded-sm"/><div className="bg-primary/40 rounded-sm"/></div> },
              { value: 'PHOTO_STRIP', label: 'Photo Strip', icon: <div className="flex flex-col gap-1 w-8 h-8 p-1 border border-primary/20"><div className="h-2 bg-primary/40 rounded-sm"/><div className="h-2 bg-primary/40 rounded-sm"/><div className="h-2 bg-primary/40 rounded-sm"/></div> },
              { value: 'MEMORY_COLLAGE', label: 'Collage', icon: <div className="relative w-8 h-8"><div className="absolute top-1 left-1 w-4 h-4 bg-primary/40 rotate-6"/><div className="absolute bottom-1 right-1 w-4 h-4 bg-primary/60 -rotate-12"/></div> },
              { value: 'POLAROID', label: 'Polaroid', icon: <div className="relative w-8 h-8 flex items-center justify-center"><div className="w-5 h-6 bg-white border shadow-sm flex flex-col p-[2px]"><div className="w-full flex-1 bg-primary/40"/><div className="h-1"/></div></div> },
              { value: 'MAIN_SIDE', label: 'Main + Side', icon: <div className="flex gap-1 w-8 h-8 p-1 border border-primary/20"><div className="w-4 bg-primary/60 rounded-sm"/><div className="flex-1 flex flex-col gap-1"><div className="flex-1 bg-primary/40 rounded-sm"/><div className="flex-1 bg-primary/40 rounded-sm"/></div></div> },
            ].map((a) => (
              <button 
                key={a.value} 
                onClick={() => editor.setArrangement(a.value as any)}
                className={`shrink-0 flex flex-col items-center justify-center gap-2 p-2 w-20 rounded-xl border-2 transition-all ${state.arrangement === a.value ? 'border-primary bg-primary/5 shadow-sm' : 'border-transparent hover:bg-muted opacity-60 hover:opacity-100'}`}
              >
                {a.icon}
                <span className="text-[9px] font-medium leading-tight text-center">{a.label}</span>
              </button>
            ))}
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
      </CollapsibleSection>

      {/* Occasion & Template */}
      <CollapsibleSection title="Layout & Occasion" defaultOpen={false}>
        <div className="space-y-4">
          <div className="space-y-2">
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
        </div>
      </CollapsibleSection>

      {/* Text Content */}
      <CollapsibleSection title="Message & Text" defaultOpen={false}>
        <div className="space-y-4">
        
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
        </div>
      </CollapsibleSection>

      {/* Supporting Photos */}
      <CollapsibleSection title={`Additional Photos (${state.supportingPhotos.length})`} defaultOpen={false}>
        <div className="space-y-4">
          
          {/* Members added to this card */}
          {state.selectedMemberIds.map(memberId => {
            const member = members?.find(m => m.id === memberId);
            if (!member) return null;
            const memberPhotos = state.supportingPhotos.filter(p => p.memberId === memberId);
            
            return (
              <div key={memberId} className="border border-border/50 bg-muted/20 p-3 rounded-lg space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium text-sm">{member.firstName} {member.lastName}</p>
                    <p className="text-[10px] text-muted-foreground">{memberPhotos.length} photo{memberPhotos.length !== 1 ? 's' : ''} selected</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button variant="outline" size="sm" className="h-7 text-xs px-2" onClick={() => {
                      setPickerMode('SUPPORTING');
                      setMemberPhotoPicker(memberId);
                    }}>
                      View All Photos
                    </Button>
                    <Button variant="ghost" size="icon" className="h-7 w-7 text-destructive" onClick={() => editor.removeMember(memberId)}>
                      <X className="w-3 h-3" />
                    </Button>
                  </div>
                </div>
                
                {memberPhotos.length > 0 && (
                  <div className="flex gap-2 overflow-x-auto pb-1">
                    {memberPhotos.map(p => (
                      <div key={p.id} className="relative w-14 h-14 rounded-md overflow-hidden shrink-0 group border border-border">
                        <Image src={p.imageUrl} alt="Selected" fill className="object-cover" unoptimized />
                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                          <button type="button" onClick={() => editor.removeSupportingPhoto(p.id)} className="text-white hover:text-red-400 p-1">
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            );
          })}

          {/* Custom photos not tied to a specific member */}
          {state.supportingPhotos.filter(p => !p.memberId || !state.selectedMemberIds.includes(p.memberId)).length > 0 && (
            <div className="border border-border/50 bg-muted/20 p-3 rounded-lg space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium text-sm">Uploaded Photos</p>
                </div>
              </div>
              <div className="flex gap-2 overflow-x-auto pb-1">
                {state.supportingPhotos.filter(p => !p.memberId || !state.selectedMemberIds.includes(p.memberId)).map(p => (
                  <div key={p.id} className="relative w-14 h-14 rounded-md overflow-hidden shrink-0 group border border-border">
                    <Image src={p.imageUrl} alt="Selected" fill className="object-cover" unoptimized />
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                      <button type="button" onClick={() => editor.removeSupportingPhoto(p.id)} className="text-white hover:text-red-400 p-1">
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
          
          <div className="flex flex-col gap-3 pt-2 border-t border-border/50">
            <Button 
              variant="outline" 
              className="w-full font-semibold border-primary/20 hover:bg-primary/5 text-primary"
              onClick={() => {
                const eligibleMembers = members?.filter(m => m.id !== state.heroMemberId && m.id !== 'CUSTOM') || [];
                if (eligibleMembers.length > 0) {
                  editor.addMembers(eligibleMembers as any[]);
                  toast.success(`Added ${eligibleMembers.length} family members`);
                }
              }}
            >
              + Add All Family Members
            </Button>
            
            <div className="flex flex-wrap gap-2">
              <div className="w-full sm:w-auto flex-1 min-w-[150px]">
                <Select 
                  value=""
                  onValueChange={(val) => {
                    if (!state.selectedMemberIds.includes(val)) {
                      const memberToAdd = members?.find(m => m.id === val);
                      if (memberToAdd) editor.addMembers([memberToAdd as any]);
                    }
                  }}
                >
                  <SelectTrigger className="w-full text-xs h-9"><SelectValue placeholder="Add Family Member..." /></SelectTrigger>
                  <SelectContent>
                    {members?.filter(m => m.id !== state.heroMemberId && !state.selectedMemberIds.includes(m.id)).map(m => (
                      <SelectItem key={m.id} value={m.id}>{m.firstName} {m.lastName}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="flex gap-2 w-full sm:w-auto">
                <div className="relative flex-1 sm:flex-none">
                  <input 
                    type="file" 
                    multiple
                    accept="image/*" 
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer disabled:cursor-not-allowed" 
                    onChange={(e) => handleFileUpload(e, false)}
                    title="Upload custom photos"
                    disabled={isUploading}
                  />
                  <Button variant="outline" className="h-9 px-3 w-full" disabled={isUploading}>
                    <Upload className="w-3 h-3 mr-2" /> Upload
                  </Button>
                </div>
                
                <div className="flex-1 sm:flex-none [&>div>button]:h-9 [&>div>button]:px-3 [&>div>button]:w-full">
                  <GooglePhotosPicker onPhotoSelected={(blob) => handleGooglePhoto(blob, false)} disabled={isUploading} />
                </div>
              </div>
            </div>
          </div>
        </div>
      </CollapsibleSection>

      <Dialog open={!!memberPhotoPicker} onOpenChange={(open) => !open && setMemberPhotoPicker(null)}>
        <DialogContent className="max-w-md w-[95vw] max-h-[90vh] flex flex-col p-4 rounded-xl">
          <DialogHeader className="flex-shrink-0">
            <DialogTitle>Select Photos</DialogTitle>
            <DialogDescription>
              Choose photos to include in the greeting.
            </DialogDescription>
          </DialogHeader>
          <div className="flex-1 overflow-y-auto">
            <div className="grid grid-cols-2 gap-3 mt-4 p-1">
              {memberPhotoPicker && members?.find(m => m.id === memberPhotoPicker) && (() => {
                const m = members.find(m => m.id === memberPhotoPicker)!;
                const allPhotos: string[] = [];
                if (m.imageUrl) allPhotos.push(m.imageUrl);
                if (m.media && m.media.length > 0) {
                  m.media.filter((media: any) => media.type === 'image' && media.url !== m.imageUrl).forEach((media: any) => allPhotos.push(media.url));
                }

                return (
                  <>
                    <div className="relative aspect-square rounded-md border-2 border-dashed border-border flex flex-col items-center justify-center text-muted-foreground hover:bg-muted/50 transition-colors cursor-pointer">
                      <input 
                        type="file" 
                        accept="image/*" 
                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer disabled:cursor-not-allowed" 
                        onChange={async (e) => {
                          const file = e.target.files?.[0];
                          if (!file) return;
                          setIsUploading(true);
                          try {
                            const formData = new FormData();
                            formData.append('file', file);
                            formData.append('folder', 'family-tree/greetings');
                            const res = await fetch('/api/upload', { method: 'POST', body: formData });
                            if (!res.ok) throw new Error('Upload failed');
                            const data = await res.json();
                            if (pickerMode === 'HERO') {
                              editor.setHeroImage(data.url);
                              setMemberPhotoPicker(null);
                            } else {
                              editor.addSupportingPhoto({
                                id: Math.random().toString(),
                                memberId: m.id,
                                imageUrl: data.url,
                                adjustment: { zoom: 1, x: 0, y: 0, opacity: 100 }
                              });
                            }
                            toast.success('Photo added');
                          } catch (err) {
                            toast.error('Upload failed');
                          } finally {
                            setIsUploading(false);
                            e.target.value = '';
                          }
                        }}
                        disabled={isUploading}
                      />
                      {isUploading ? (
                         <span className="text-xs">Uploading...</span>
                      ) : (
                        <>
                          <Upload className="w-6 h-6 mb-2 opacity-50" />
                          <span className="text-xs font-medium">Add New Photo</span>
                        </>
                      )}
                    </div>
                    {allPhotos.map((url, i) => {
                      const isSelected = state.supportingPhotos.some(p => p.imageUrl === url && p.memberId === m.id);
                      return (
                        <div key={i} className={`relative aspect-square rounded-md overflow-hidden group border-2 ${isSelected ? 'border-primary' : 'border-border'}`}>
                          <Image src={url} alt="Photo" fill className="object-cover" unoptimized />
                          {isSelected && pickerMode !== 'HERO' && (
                            <div className="absolute top-2 right-2 bg-primary text-primary-foreground rounded-full p-1 shadow-md z-10">
                              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
                            </div>
                          )}
                          <div className="absolute inset-0 bg-black/50 opacity-0 hover:opacity-100 flex items-center justify-center transition-opacity z-20 cursor-pointer"
                              onClick={() => {
                                if (pickerMode === 'HERO') {
                                  editor.setHeroImage(url);
                                  setMemberPhotoPicker(null);
                                } else {
                                  if (isSelected) {
                                    const existing = state.supportingPhotos.find(p => p.imageUrl === url && p.memberId === m.id);
                                    if (existing) editor.removeSupportingPhoto(existing.id);
                                  } else {
                                    editor.addSupportingPhoto({
                                      id: Math.random().toString(),
                                      memberId: m.id,
                                      imageUrl: url,
                                      adjustment: { zoom: 1, x: 0, y: 0, opacity: 100 }
                                    });
                                  }
                                }
                              }}>
                            <Button size="sm" variant={isSelected && pickerMode !== 'HERO' ? "destructive" : "secondary"} className="pointer-events-none">
                              {pickerMode === 'HERO' ? 'Select Hero' : isSelected ? 'Remove' : 'Select'}
                            </Button>
                          </div>
                        </div>
                      );
                    })}
                  </>
                );
              })()}
            </div>
          </div>
          {pickerMode !== 'HERO' && (
            <DialogFooter className="mt-4">
              <Button onClick={() => setMemberPhotoPicker(null)}>Done</Button>
            </DialogFooter>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
