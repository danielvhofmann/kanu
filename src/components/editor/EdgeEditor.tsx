import { useState } from 'react';
import { Edge } from 'reactflow';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';

interface EdgeEditorProps {
  edge: Edge;
  onUpdateEdge: (edgeId: string, updates: Partial<Edge>) => void;
}

export const EdgeEditor = ({ edge, onUpdateEdge }: EdgeEditorProps) => {
  const [edgeType, setEdgeType] = useState(edge.type || 'straight');
  const [animated, setAnimated] = useState(edge.animated || false);
  const [hasArrow, setHasArrow] = useState(!!edge.markerEnd);
  const [isDashed, setIsDashed] = useState(edge.style?.strokeDasharray ? true : false);

  const handleTypeChange = (type: string) => {
    setEdgeType(type);
    onUpdateEdge(edge.id, { type: type as any });
  };

  const handleAnimatedChange = (checked: boolean) => {
    setAnimated(checked);
    onUpdateEdge(edge.id, { animated: checked });
  };

  const handleArrowChange = (checked: boolean) => {
    setHasArrow(checked);
    console.log('[EDGE EDITOR] Arrow change:', checked, 'Edge ID:', edge.id);
    onUpdateEdge(edge.id, {
      markerEnd: checked ? { type: 'arrowClosed' as any } : undefined,
    });
  };

  const handleDashedChange = (checked: boolean) => {
    setIsDashed(checked);
    onUpdateEdge(edge.id, {
      style: {
        ...edge.style,
        strokeDasharray: checked ? '5,5' : undefined,
      },
    });
  };

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label className="text-sm font-light">Edge Type</Label>
        <Select value={edgeType} onValueChange={handleTypeChange}>
          <SelectTrigger className="bg-background/50">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="straight">Straight</SelectItem>
            <SelectItem value="smoothstep">Curved</SelectItem>
            <SelectItem value="step">Step</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <Label className="text-sm font-light">Animated</Label>
          <Switch checked={animated} onCheckedChange={handleAnimatedChange} />
        </div>

        <div className="flex items-center justify-between">
          <Label className="text-sm font-light">Arrow (Directed)</Label>
          <Switch checked={hasArrow} onCheckedChange={handleArrowChange} />
        </div>

        <div className="flex items-center justify-between">
          <Label className="text-sm font-light">Dashed Line</Label>
          <Switch checked={isDashed} onCheckedChange={handleDashedChange} />
        </div>
      </div>
    </div>
  );
};
