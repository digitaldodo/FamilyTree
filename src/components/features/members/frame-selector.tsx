import * as React from 'react';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';

interface FrameSelectorProps {
  styleValue: string;
  onStyleChange: (val: string) => void;
  colorValue: string;
  onColorChange: (val: string) => void;
}

const FRAME_STYLES = [
  { value: 'default', label: 'Default' },
  { value: 'royal_ornate', label: 'Royal Ornate' },
  { value: 'heritage', label: 'Heritage' },
  { value: 'antique', label: 'Antique' },
  { value: 'classic_gold', label: 'Classic Gold' },
  { value: 'botanical', label: 'Botanical' },
  { value: 'modern_royal', label: 'Modern Royal' },
];

const CURATED_COLORS = [
  { value: '#FFD700', label: 'Gold' },
  { value: '#B8860B', label: 'Antique Gold' },
  { value: '#CD7F32', label: 'Bronze' },
  { value: '#C0C0C0', label: 'Silver' },
  { value: '#B87333', label: 'Copper' },
  { value: '#50C878', label: 'Emerald' },
  { value: '#4169E1', label: 'Royal Blue' },
  { value: '#800020', label: 'Burgundy' },
  { value: '#FFFFF0', label: 'Ivory' },
  { value: '#000000', label: 'Black' },
];

export function FrameSelector({
  styleValue,
  onStyleChange,
  colorValue,
  onColorChange,
}: FrameSelectorProps) {
  const isCustomColor = colorValue && !CURATED_COLORS.find((c) => c.value === colorValue);

  return (
    <div className="space-y-4 p-4 border rounded-lg bg-slate-50 dark:bg-slate-900/50 mt-4 mb-6">
      <h3 className="font-medium text-sm">Royal Frame Settings</h3>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label className="mb-2 block">Frame Style</Label>
          <Select value={styleValue || 'default'} onValueChange={onStyleChange}>
            <SelectTrigger>
              <SelectValue placeholder="Select frame style" />
            </SelectTrigger>
            <SelectContent>
              {FRAME_STYLES.map((style) => (
                <SelectItem key={style.value} value={style.value}>
                  {style.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div>
          <Label className="mb-2 block">Frame Color</Label>
          <div className="flex gap-2">
            <Select 
              value={isCustomColor ? 'custom' : (colorValue || '')} 
              onValueChange={(val) => {
                if (val !== 'custom') {
                  onColorChange(val);
                }
              }}
            >
              <SelectTrigger className="flex-1">
                <SelectValue placeholder="Select color" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">Default (Theme)</SelectItem>
                {CURATED_COLORS.map((color) => (
                  <SelectItem key={color.value} value={color.value}>
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full border" style={{ backgroundColor: color.value }} />
                      {color.label}
                    </div>
                  </SelectItem>
                ))}
                <SelectItem value="custom">Custom Color</SelectItem>
              </SelectContent>
            </Select>
            {(isCustomColor || colorValue) && (
              <Input
                type="color"
                className="w-10 h-10 p-1 cursor-pointer shrink-0"
                value={colorValue || '#FFD700'}
                onChange={(e) => onColorChange(e.target.value)}
                title="Choose custom color"
              />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
