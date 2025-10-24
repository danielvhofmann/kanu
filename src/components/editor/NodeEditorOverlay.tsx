import { useState } from 'react';
import { Node, Edge } from 'reactflow';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { X, Trash2 } from 'lucide-react';

interface NodeEditorOverlayProps {
  element: Node | Edge;
  onClose: () => void;
  onUpdateLabel?: (nodeId: string, label: string) => void;
  onUpdateColor?: (nodeId: string, color: string) => void;
  onUpdateNodeShape?: (nodeId: string, shape: string) => void;
  onUpdateTags?: (nodeId: string, tags: string[]) => void;
  onUpdateEdge?: (edgeId: string, updates: Partial<Edge>) => void;
  onDelete: (elementId: string) => void;
}

const quickColors = [
  { name: 'Sage', value: 'hsl(150, 25%, 50%)' },
  { name: 'Teal', value: 'hsl(195, 45%, 52%)' },
  { name: 'Burgundy', value: 'hsl(355, 45%, 50%)' },
  { name: 'Green', value: 'hsl(140, 45%, 45%)' },
  { name: 'Blue', value: 'hsl(210, 60%, 45%)' },
  { name: 'Purple', value: 'hsl(280, 50%, 55%)' },
];

export const NodeEditorOverlay = ({
  element,
  onClose,
  onUpdateLabel,
  onUpdateColor,
  onUpdateNodeShape,
  onDelete,
}: NodeEditorOverlayProps) => {
  const isNode = 'data' in element;
  const [label, setLabel] = useState(isNode ? element.data.label || '' : '');

  const handleLabelChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newLabel = e.target.value;
    setLabel(newLabel);
    if (onUpdateLabel && isNode) {
      onUpdateLabel(element.id, newLabel);
    }
  };

  if (!isNode) {
    // For edges, show minimal info
    return (
      <div className="absolute top-4 right-4 w-80 bg-card border border-border/50 rounded-xl shadow-xl backdrop-blur-lg p-4 space-y-4 z-50 animate-fade-in">
        <div className="flex items-center justify-between pb-2 border-b border-border/50">
          <h3 className="text-sm font-medium">Connection</h3>
          <Button variant="ghost" size="icon" onClick={onClose} className="h-6 w-6">
            <X className="w-3 h-3" />
          </Button>
        </div>
        <p className="text-xs text-muted-foreground">Use the AI Assistant to edit connections</p>
        <Button
          variant="outline"
          size="sm"
          className="w-full gap-2 text-destructive hover:text-destructive h-8 text-xs"
          onClick={() => onDelete(element.id)}
        >
          <Trash2 className="w-3 h-3" />
          Delete Connection
        </Button>
      </div>
    );
  }

  return (
    <div className="absolute top-4 right-4 w-80 bg-card border border-border/50 rounded-xl shadow-xl backdrop-blur-lg p-4 space-y-4 z-50 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between pb-2 border-b border-border/50">
        <h3 className="text-sm font-medium">Quick Edit</h3>
        <Button variant="ghost" size="icon" onClick={onClose} className="h-6 w-6">
          <X className="w-3 h-3" />
        </Button>
      </div>

      {/* Label */}
      <div className="space-y-2">
        <Label htmlFor="label" className="text-xs">
          Label
        </Label>
        <Input
          id="label"
          value={label}
          onChange={handleLabelChange}
          placeholder="Node name"
          className="h-8 text-sm"
        />
      </div>

      {/* Node Shape */}
      <div className="space-y-2">
        <Label className="text-xs">Shape</Label>
        <div className="grid grid-cols-2 gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => onUpdateNodeShape && onUpdateNodeShape(element.id, 'circle')}
            className="h-8 text-xs"
          >
            Round
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => onUpdateNodeShape && onUpdateNodeShape(element.id, 'square')}
            className="h-8 text-xs"
          >
            Square
          </Button>
        </div>
      </div>

      {/* Quick Colors */}
      <div className="space-y-2">
        <Label className="text-xs">Color</Label>
        <div className="grid grid-cols-3 gap-2">
          {quickColors.map((color) => (
            <button
              key={color.name}
              onClick={() => onUpdateColor && onUpdateColor(element.id, color.value)}
              className="h-8 rounded-md border border-border/50 hover:border-primary/50 transition-colors"
              style={{ background: color.value }}
              title={color.name}
            />
          ))}
        </div>
      </div>

      {/* Delete */}
      <Button
        variant="outline"
        size="sm"
        className="w-full gap-2 text-destructive hover:text-destructive h-8 text-xs"
        onClick={() => onDelete(element.id)}
      >
        <Trash2 className="w-3 h-3" />
        Delete Node
      </Button>
    </div>
  );
};
