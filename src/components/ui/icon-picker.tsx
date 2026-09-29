import * as React from 'react';
import {
  Baby,
  Cake,
  Heart,
  Users,
  PartyPopper,
  GraduationCap,
  Plane,
  Trophy,
  Flower2,
  Home,
  Briefcase,
  Star
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent } from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';

export const MEMORY_ICONS = [
  { id: 'baby', icon: Baby, label: 'Birth & New Family' },
  { id: 'cake', icon: Cake, label: 'Birthday & Anniversary' },
  { id: 'heart', icon: Heart, label: 'Wedding & Engagement' },
  { id: 'users', icon: Users, label: 'Family Reunion' },
  { id: 'party', icon: PartyPopper, label: 'Festival & Celebration' },
  { id: 'graduation', icon: GraduationCap, label: 'Education & Graduation' },
  { id: 'plane', icon: Plane, label: 'Travel & Vacations' },
  { id: 'trophy', icon: Trophy, label: 'Achievement & Milestones' },
  { id: 'flower', icon: Flower2, label: 'Memorials & Remembrance' },
  { id: 'home', icon: Home, label: 'Home & Life Events' },
  { id: 'briefcase', icon: Briefcase, label: 'Career' },
  { id: 'star', icon: Star, label: 'Other/Default' },
];

export const MEMORY_COLORS = [
  { id: 'blue', value: 'bg-blue-500' },
  { id: 'purple', value: 'bg-purple-500' },
  { id: 'pink', value: 'bg-pink-500' },
  { id: 'red', value: 'bg-red-500' },
  { id: 'orange', value: 'bg-orange-500' },
  { id: 'green', value: 'bg-emerald-500' },
  { id: 'teal', value: 'bg-teal-500' },
];

interface IconPickerProps {
  iconId: string;
  colorId: string;
  onIconChange: (id: string) => void;
  onColorChange: (id: string) => void;
}

export function IconPicker({ iconId, colorId, onIconChange, onColorChange }: IconPickerProps) {
  const selectedIcon = MEMORY_ICONS.find(i => i.id === iconId) || MEMORY_ICONS[11];
  const selectedColor = MEMORY_COLORS.find(c => c.id === colorId) || MEMORY_COLORS[0];
  const IconComponent = selectedIcon.icon;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" className="w-[200px] justify-start gap-3 h-12">
          <div className={cn("p-1.5 rounded-md text-white", selectedColor.value)}>
            <IconComponent className="w-4 h-4" />
          </div>
          <span className="truncate">{selectedIcon.label}</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-72 p-4" align="start">
        <div className="space-y-4">
          <div>
            <h4 className="text-sm font-medium mb-2">Select Icon</h4>
            <div className="grid grid-cols-4 gap-2">
              {MEMORY_ICONS.map(item => {
                const Icon = item.icon;
                const isSelected = item.id === (iconId || 'star');
                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => onIconChange(item.id)}
                    title={item.label}
                    className={cn(
                      "p-2 rounded-lg flex items-center justify-center transition-colors",
                      isSelected ? "bg-muted shadow-sm" : "hover:bg-muted/50"
                    )}
                  >
                    <Icon className={cn("w-5 h-5", isSelected ? "text-foreground" : "text-muted-foreground")} />
                  </button>
                );
              })}
            </div>
          </div>
          <div>
            <h4 className="text-sm font-medium mb-2">Accent Color</h4>
            <div className="flex flex-wrap gap-2">
              {MEMORY_COLORS.map(color => (
                <button
                  key={color.id}
                  type="button"
                  onClick={() => onColorChange(color.id)}
                  className={cn(
                    "w-6 h-6 rounded-full transition-transform",
                    color.value,
                    (colorId || 'blue') === color.id ? "ring-2 ring-offset-2 ring-foreground scale-110" : ""
                  )}
                />
              ))}
            </div>
          </div>
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
