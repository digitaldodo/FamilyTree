import React, { useState } from 'react';
import { GreetingsEditor } from '../use-greetings-editor';
import { TextLayer } from '@/types/greetings';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { AlignLeft, AlignCenter, AlignRight, Bold, Italic, Type, Plus, Trash2, Settings, ArrowUp, ArrowDown } from 'lucide-react';
import { cn } from '@/lib/utils';

export const TextLayersEditor: React.FC<{ editor: GreetingsEditor }> = ({ editor }) => {
  const layers = editor.state.textLayers?.sort((a, b) => a.zIndex - b.zIndex) || [];
  const [editingId, setEditingId] = useState<string | null>(null);

  const handleAdd = () => {
    const newLayer: TextLayer = {
      id: Math.random().toString(),
      content: 'New Text',
      fontFamily: 'font-sans',
      fontSize: 1,
      color: '#000000',
      isBold: false,
      isItalic: false,
      isUppercase: false,
      alignment: 'center',
      region: 'middle',
      background: 'none',
      zIndex: layers.length + 1
    };
    editor.addTextLayer(newLayer);
    setEditingId(newLayer.id);
  };

  return (
    <div className="space-y-4">
      {layers.map((layer, index) => (
        <div key={layer.id} className="border border-border/50 rounded-lg bg-card overflow-hidden">
          {editingId === layer.id ? (
            <div className="p-3 space-y-4 bg-muted/20">
              <div className="flex items-center justify-between">
                <Label className="font-semibold text-xs text-muted-foreground">Editing Layer</Label>
                <Button variant="ghost" size="sm" className="h-6 text-xs px-2" onClick={() => setEditingId(null)}>Done</Button>
              </div>
              
              <Textarea 
                value={layer.content}
                onChange={e => editor.updateTextLayer(layer.id, { content: e.target.value })}
                className="resize-none min-h-[60px] text-sm"
              />

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label className="text-[10px]">Font</Label>
                  <Select value={layer.fontFamily} onValueChange={(v) => editor.updateTextLayer(layer.id, { fontFamily: v })}>
                    <SelectTrigger className="h-8 text-xs"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="font-sans">Modern (Sans)</SelectItem>
                      <SelectItem value="font-serif">Elegant (Serif)</SelectItem>
                      <SelectItem value="font-mono">Typewriter (Mono)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1.5">
                  <Label className="text-[10px]">Region</Label>
                  <Select value={layer.region} onValueChange={(v: any) => editor.updateTextLayer(layer.id, { region: v })}>
                    <SelectTrigger className="h-8 text-xs"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="top">Top</SelectItem>
                      <SelectItem value="middle">Middle</SelectItem>
                      <SelectItem value="bottom">Bottom</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                 <div className="space-y-1.5">
                  <Label className="text-[10px]">Background</Label>
                  <Select value={layer.background || 'none'} onValueChange={(v: any) => editor.updateTextLayer(layer.id, { background: v })}>
                    <SelectTrigger className="h-8 text-xs"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">None</SelectItem>
                      <SelectItem value="shadow">Drop Shadow</SelectItem>
                      <SelectItem value="plate">Solid Plate</SelectItem>
                      <SelectItem value="translucent">Translucent Overlay</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                 <div className="space-y-1.5">
                  <Label className="text-[10px]">Color</Label>
                  <div className="flex items-center gap-2">
                    <input type="color" value={layer.color} onChange={e => editor.updateTextLayer(layer.id, { color: e.target.value })} className="w-8 h-8 rounded cursor-pointer" />
                    <Input value={layer.color} onChange={e => editor.updateTextLayer(layer.id, { color: e.target.value })} className="h-8 text-xs flex-1" />
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between pt-2 border-t border-border/50">
                <div className="flex gap-1 bg-background rounded-md border border-input p-0.5">
                  <Button variant="ghost" size="icon" className={cn("h-7 w-7 rounded-sm", layer.alignment === 'left' && "bg-muted")} onClick={() => editor.updateTextLayer(layer.id, { alignment: 'left' })}><AlignLeft className="w-3 h-3" /></Button>
                  <Button variant="ghost" size="icon" className={cn("h-7 w-7 rounded-sm", layer.alignment === 'center' && "bg-muted")} onClick={() => editor.updateTextLayer(layer.id, { alignment: 'center' })}><AlignCenter className="w-3 h-3" /></Button>
                  <Button variant="ghost" size="icon" className={cn("h-7 w-7 rounded-sm", layer.alignment === 'right' && "bg-muted")} onClick={() => editor.updateTextLayer(layer.id, { alignment: 'right' })}><AlignRight className="w-3 h-3" /></Button>
                </div>

                <div className="flex gap-1 bg-background rounded-md border border-input p-0.5">
                  <Button variant="ghost" size="icon" className={cn("h-7 w-7 rounded-sm", layer.isBold && "bg-muted")} onClick={() => editor.updateTextLayer(layer.id, { isBold: !layer.isBold })}><Bold className="w-3 h-3" /></Button>
                  <Button variant="ghost" size="icon" className={cn("h-7 w-7 rounded-sm", layer.isItalic && "bg-muted")} onClick={() => editor.updateTextLayer(layer.id, { isItalic: !layer.isItalic })}><Italic className="w-3 h-3" /></Button>
                  <Button variant="ghost" size="icon" className={cn("h-7 w-7 rounded-sm", layer.isUppercase && "bg-muted")} onClick={() => editor.updateTextLayer(layer.id, { isUppercase: !layer.isUppercase })}><Type className="w-3 h-3" /></Button>
                </div>

                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-medium text-muted-foreground w-8">Size</span>
                  <input type="range" min="0.5" max="5" step="0.1" value={layer.fontSize} onChange={e => editor.updateTextLayer(layer.id, { fontSize: parseFloat(e.target.value) })} className="w-20" />
                </div>
              </div>
            </div>
          ) : (
            <div className="flex items-center justify-between p-3 cursor-pointer hover:bg-muted/50 transition-colors" onClick={() => setEditingId(layer.id)}>
              <div className="truncate flex-1 min-w-0 pr-4">
                <p className="text-sm font-medium truncate">{layer.content || '(Empty Layer)'}</p>
                <div className="flex items-center gap-2 mt-1">
                  <span className="text-[10px] text-muted-foreground uppercase">{layer.region}</span>
                  <div className="w-2 h-2 rounded-full border border-border" style={{ backgroundColor: layer.color }} />
                </div>
              </div>
              
              <div className="flex items-center gap-1 shrink-0" onClick={e => e.stopPropagation()}>
                <div className="flex flex-col gap-0.5 mr-2">
                  <Button variant="ghost" size="icon" className="h-4 w-5" disabled={index === 0} onClick={() => {
                    const ids = layers.map(l => l.id);
                    [ids[index-1], ids[index]] = [ids[index], ids[index-1]];
                    editor.reorderTextLayers(ids);
                  }}><ArrowUp className="w-3 h-3 text-muted-foreground" /></Button>
                  <Button variant="ghost" size="icon" className="h-4 w-5" disabled={index === layers.length - 1} onClick={() => {
                    const ids = layers.map(l => l.id);
                    [ids[index], ids[index+1]] = [ids[index+1], ids[index]];
                    editor.reorderTextLayers(ids);
                  }}><ArrowDown className="w-3 h-3 text-muted-foreground" /></Button>
                </div>
                <Button variant="ghost" size="icon" className="h-7 w-7 text-muted-foreground hover:text-primary" onClick={() => setEditingId(layer.id)}>
                  <Settings className="w-3.5 h-3.5" />
                </Button>
                <Button variant="ghost" size="icon" className="h-7 w-7 text-muted-foreground hover:text-destructive" onClick={() => editor.removeTextLayer(layer.id)}>
                  <Trash2 className="w-3.5 h-3.5" />
                </Button>
              </div>
            </div>
          )}
        </div>
      ))}
      <Button variant="outline" className="w-full text-xs h-9 border-dashed" onClick={handleAdd}>
        <Plus className="w-3 h-3 mr-2" /> Add Text Layer
      </Button>
    </div>
  );
};
