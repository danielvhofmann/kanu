import { useState } from 'react';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight, X } from 'lucide-react';
import ReactFlow, {
  Node,
  Edge,
  Background,
  BackgroundVariant,
  MarkerType,
} from 'reactflow';
import 'reactflow/dist/style.css';

const paypalMafiaNodes: Node[] = [
  { id: '1', position: { x: 400, y: 50 }, data: { label: 'Peter Thiel' }, style: { background: 'hsl(var(--primary))', color: 'white', border: '2px solid hsl(var(--primary-light))', borderRadius: '50%', padding: '20px', fontSize: '14px', fontWeight: '500', width: '120px', height: '120px', display: 'flex', alignItems: 'center', justifyContent: 'center', textAlign: 'center', boxShadow: '0 4px 16px hsl(var(--primary) / 0.3)' } },
  { id: '2', position: { x: 200, y: 180 }, data: { label: 'Elon Musk' }, style: { background: 'hsl(var(--secondary))', color: 'white', border: '2px solid hsl(var(--secondary-light))', borderRadius: '50%', padding: '20px', fontSize: '13px', fontWeight: '300', width: '100px', height: '100px', display: 'flex', alignItems: 'center', justifyContent: 'center', textAlign: 'center', boxShadow: '0 4px 12px hsl(var(--secondary) / 0.25)' } },
  { id: '3', position: { x: 600, y: 180 }, data: { label: 'Reid Hoffman' }, style: { background: 'hsl(var(--secondary))', color: 'white', border: '2px solid hsl(var(--secondary-light))', borderRadius: '50%', padding: '20px', fontSize: '13px', fontWeight: '300', width: '100px', height: '100px', display: 'flex', alignItems: 'center', justifyContent: 'center', textAlign: 'center', boxShadow: '0 4px 12px hsl(var(--secondary) / 0.25)' } },
  { id: '4', position: { x: 80, y: 320 }, data: { label: 'Max Levchin' }, style: { background: 'hsl(var(--accent))', color: 'white', border: '2px solid hsl(var(--accent-light))', borderRadius: '50%', padding: '18px', fontSize: '12px', fontWeight: '300', width: '85px', height: '85px', display: 'flex', alignItems: 'center', justifyContent: 'center', textAlign: 'center', boxShadow: '0 3px 10px hsl(var(--accent) / 0.2)' } },
  { id: '5', position: { x: 240, y: 320 }, data: { label: 'David Sacks' }, style: { background: 'hsl(var(--accent))', color: 'white', border: '2px solid hsl(var(--accent-light))', borderRadius: '50%', padding: '18px', fontSize: '12px', fontWeight: '300', width: '85px', height: '85px', display: 'flex', alignItems: 'center', justifyContent: 'center', textAlign: 'center', boxShadow: '0 3px 10px hsl(var(--accent) / 0.2)' } },
  { id: '6', position: { x: 560, y: 320 }, data: { label: 'Roelof Botha' }, style: { background: 'hsl(var(--accent))', color: 'white', border: '2px solid hsl(var(--accent-light))', borderRadius: '50%', padding: '18px', fontSize: '12px', fontWeight: '300', width: '85px', height: '85px', display: 'flex', alignItems: 'center', justifyContent: 'center', textAlign: 'center', boxShadow: '0 3px 10px hsl(var(--accent) / 0.2)' } },
  { id: '7', position: { x: 720, y: 320 }, data: { label: 'Ken Howery' }, style: { background: 'hsl(var(--accent))', color: 'white', border: '2px solid hsl(var(--accent-light))', borderRadius: '50%', padding: '18px', fontSize: '12px', fontWeight: '300', width: '85px', height: '85px', display: 'flex', alignItems: 'center', justifyContent: 'center', textAlign: 'center', boxShadow: '0 3px 10px hsl(var(--accent) / 0.2)' } },
  { id: '8', position: { x: 150, y: 460 }, data: { label: 'SpaceX' }, style: { background: 'hsl(var(--muted))', color: 'hsl(var(--foreground))', border: '2px solid hsl(var(--border))', borderRadius: '12px', padding: '14px 20px', fontSize: '13px', fontWeight: '300', boxShadow: '0 2px 8px hsl(var(--foreground) / 0.1)' } },
  { id: '9', position: { x: 550, y: 460 }, data: { label: 'LinkedIn' }, style: { background: 'hsl(var(--muted))', color: 'hsl(var(--foreground))', border: '2px solid hsl(var(--border))', borderRadius: '12px', padding: '14px 20px', fontSize: '13px', fontWeight: '300', boxShadow: '0 2px 8px hsl(var(--foreground) / 0.1)' } },
  { id: '10', position: { x: 350, y: 460 }, data: { label: 'Palantir' }, style: { background: 'hsl(var(--muted))', color: 'hsl(var(--foreground))', border: '2px solid hsl(var(--border))', borderRadius: '12px', padding: '14px 20px', fontSize: '13px', fontWeight: '300', boxShadow: '0 2px 8px hsl(var(--foreground) / 0.1)' } },
];

const paypalMafiaEdges: Edge[] = [
  { id: 'e1-2', source: '1', target: '2', type: 'smoothstep', animated: true, style: { stroke: 'hsl(var(--primary))', strokeWidth: 2 }, markerEnd: { type: MarkerType.ArrowClosed, color: 'hsl(var(--primary))' } },
  { id: 'e1-3', source: '1', target: '3', type: 'smoothstep', animated: true, style: { stroke: 'hsl(var(--primary))', strokeWidth: 2 }, markerEnd: { type: MarkerType.ArrowClosed, color: 'hsl(var(--primary))' } },
  { id: 'e1-4', source: '1', target: '4', type: 'smoothstep', style: { stroke: 'hsl(var(--border))', strokeWidth: 1.5 } },
  { id: 'e1-5', source: '1', target: '5', type: 'smoothstep', style: { stroke: 'hsl(var(--border))', strokeWidth: 1.5 } },
  { id: 'e2-8', source: '2', target: '8', type: 'smoothstep', style: { stroke: 'hsl(var(--secondary))', strokeWidth: 2 }, markerEnd: { type: MarkerType.ArrowClosed, color: 'hsl(var(--secondary))' } },
  { id: 'e3-9', source: '3', target: '9', type: 'smoothstep', style: { stroke: 'hsl(var(--secondary))', strokeWidth: 2 }, markerEnd: { type: MarkerType.ArrowClosed, color: 'hsl(var(--secondary))' } },
  { id: 'e1-10', source: '1', target: '10', type: 'smoothstep', style: { stroke: 'hsl(var(--secondary))', strokeWidth: 2 }, markerEnd: { type: MarkerType.ArrowClosed, color: 'hsl(var(--secondary))' } },
  { id: 'e4-5', source: '4', target: '5', type: 'smoothstep', style: { stroke: 'hsl(var(--border))', strokeWidth: 1 } },
  { id: 'e5-6', source: '5', target: '6', type: 'smoothstep', style: { stroke: 'hsl(var(--border))', strokeWidth: 1 } },
  { id: 'e6-7', source: '6', target: '7', type: 'smoothstep', style: { stroke: 'hsl(var(--border))', strokeWidth: 1 } },
];

const slides = [
  {
    title: 'The PayPal Mafia',
    description: 'A network of entrepreneurs who founded PayPal and went on to create some of the most influential tech companies.',
  },
  {
    title: 'Key Founders',
    description: 'Peter Thiel, Elon Musk, and Reid Hoffman were core members who later founded Palantir, SpaceX, and LinkedIn.',
  },
  {
    title: 'The Network Effect',
    description: 'Strong connections (animated arrows) show direct founding relationships, while subtle lines show collaborations.',
  },
];

interface DemoPresentationProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const DemoPresentation = ({ open, onOpenChange }: DemoPresentationProps) => {
  const [currentSlide, setCurrentSlide] = useState(0);

  const nextSlide = () => {
    if (currentSlide < slides.length - 1) {
      setCurrentSlide(currentSlide + 1);
    }
  };

  const prevSlide = () => {
    if (currentSlide > 0) {
      setCurrentSlide(currentSlide - 1);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-6xl h-[80vh] p-0 gap-0">
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-border/50">
            <div>
              <h3 className="text-2xl font-light">{slides[currentSlide].title}</h3>
              <p className="text-sm text-muted-foreground mt-1">
                {slides[currentSlide].description}
              </p>
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => onOpenChange(false)}
            >
              <X className="w-5 h-5" />
            </Button>
          </div>

          {/* Map Canvas */}
          <div className="flex-1 relative bg-background">
            <ReactFlow
              nodes={paypalMafiaNodes}
              edges={paypalMafiaEdges}
              fitView
              nodesDraggable={false}
              nodesConnectable={false}
              elementsSelectable={false}
              className="bg-gradient-subtle"
            >
              <Background
                variant={BackgroundVariant.Dots}
                gap={24}
                size={1}
                color="hsl(var(--border))"
              />
            </ReactFlow>
          </div>

          {/* Footer Controls */}
          <div className="flex items-center justify-between p-6 border-t border-border/50 bg-card/50">
            <div className="text-sm text-muted-foreground">
              Slide {currentSlide + 1} of {slides.length}
            </div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={prevSlide}
                disabled={currentSlide === 0}
              >
                <ChevronLeft className="w-4 h-4 mr-1" />
                Previous
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={nextSlide}
                disabled={currentSlide === slides.length - 1}
              >
                Next
                <ChevronRight className="w-4 h-4 ml-1" />
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
