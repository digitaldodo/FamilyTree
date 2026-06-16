import { useReactFlow } from '@xyflow/react';
import { ZoomIn, ZoomOut, Maximize, Crosshair } from 'lucide-react';
import { Button } from '@/components/ui/button';

export function TreeToolbar() {
  const { zoomIn, zoomOut, fitView, setCenter } = useReactFlow();

  return (
    <div className="absolute bottom-6 right-6 z-10 flex flex-col gap-2 p-2 glass rounded-2xl shadow-lg">
      <Button variant="ghost" size="icon" onClick={() => zoomIn({ duration: 300 })}>
        <ZoomIn className="h-5 w-5" />
      </Button>
      <Button variant="ghost" size="icon" onClick={() => zoomOut({ duration: 300 })}>
        <ZoomOut className="h-5 w-5" />
      </Button>
      <div className="w-8 h-px bg-border mx-auto my-1" />
      <Button variant="ghost" size="icon" onClick={() => fitView({ duration: 500, padding: 0.2 })}>
        <Maximize className="h-5 w-5" />
      </Button>
      <Button variant="ghost" size="icon" onClick={() => setCenter(0, 0, { duration: 500, zoom: 1 })}>
        <Crosshair className="h-5 w-5" />
      </Button>
    </div>
  );
}
