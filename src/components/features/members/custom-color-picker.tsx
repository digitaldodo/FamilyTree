import React from 'react';
import { HexColorPicker, HexColorInput } from 'react-colorful';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';

export function CustomColorPicker({ color, onChange }: { color: string, onChange: (color: string) => void }) {
  const safeColor = color || '#FFD700';

  const handleRgbChange = (e: React.ChangeEvent<HTMLInputElement>, channel: 'r' | 'g' | 'b') => {
    const val = parseInt(e.target.value) || 0;
    const clamped = Math.min(255, Math.max(0, val));
    
    // convert current hex to rgb
    const hex = safeColor.replace('#', '');
    const r = parseInt(hex.substring(0, 2), 16) || 0;
    const g = parseInt(hex.substring(2, 4), 16) || 0;
    const b = parseInt(hex.substring(4, 6), 16) || 0;

    let newR = r; let newG = g; let newB = b;
    if (channel === 'r') newR = clamped;
    if (channel === 'g') newG = clamped;
    if (channel === 'b') newB = clamped;

    const toHex = (n: number) => {
      const h = n.toString(16);
      return h.length === 1 ? '0' + h : h;
    };
    
    onChange(`#${toHex(newR)}${toHex(newG)}${toHex(newB)}`);
  };

  const getRgb = () => {
    const hex = safeColor.replace('#', '');
    return {
      r: parseInt(hex.substring(0, 2), 16) || 0,
      g: parseInt(hex.substring(2, 4), 16) || 0,
      b: parseInt(hex.substring(4, 6), 16) || 0,
    };
  };

  const { r, g, b } = getRgb();

  return (
    <div className="flex flex-col gap-5 p-5 border rounded-xl bg-card shadow-sm mt-3 w-full">
      <div className="flex justify-center w-full">
        <HexColorPicker color={safeColor} onChange={onChange} style={{ width: '100%', height: '200px' }} />
      </div>
      
      <div className="grid grid-cols-2 gap-4 w-full">
        <div className="flex flex-col gap-2">
          <Label className="text-xs text-muted-foreground uppercase tracking-wider">HEX</Label>
          <div className="flex items-center gap-2 relative">
            <div className="w-8 h-8 rounded-md border absolute left-1 shadow-sm" style={{ backgroundColor: safeColor }} />
            <HexColorInput
              color={safeColor}
              onChange={onChange}
              className="flex h-10 w-full rounded-md border border-input bg-background pl-11 pr-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
              prefixed
            />
          </div>
        </div>
        
        <div className="flex flex-col gap-2">
          <Label className="text-xs text-muted-foreground uppercase tracking-wider">RGB</Label>
          <div className="flex items-center gap-1">
            <Input type="number" min="0" max="255" value={r} onChange={(e) => handleRgbChange(e, 'r')} className="h-10 px-2 text-center" title="Red" />
            <Input type="number" min="0" max="255" value={g} onChange={(e) => handleRgbChange(e, 'g')} className="h-10 px-2 text-center" title="Green" />
            <Input type="number" min="0" max="255" value={b} onChange={(e) => handleRgbChange(e, 'b')} className="h-10 px-2 text-center" title="Blue" />
          </div>
        </div>
      </div>
    </div>
  );
}
