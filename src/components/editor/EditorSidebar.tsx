import { useState } from 'react';
import { Node } from 'reactflow';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { X, Trash2 } from 'lucide-react';

interface EditorSidebarProps {
  element: Node;
  onClose: () => void;
  onUpdateLabel: (nodeId: string, label: string) => void;
  onUpdateColor: (nodeId: string, color: string) => void;
  onDelete: (nodeId: string) => void;
}

const colorPresets = [
  { name: 'Primary', value: 'hsl(var(--primary))' },
  { name: 'Secondary', value: 'hsl(var(--secondary))' },
  { name: 'Accent', value: 'hsl(var(--accent))' },
  { name: 'Muted', value: 'hsl(var(--muted))' },
];

export const EditorSidebar = ({
  element,
  onClose,
  onUpdateLabel,
  onUpdateColor,
  onDelete,
}: EditorSidebarProps) => {
  const [label, setLabel] = useState(element.data.label || '');

  const handleLabelChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newLabel = e.target.value;
    setLabel(newLabel);
    onUpdateLabel(element.id, newLabel);
  };

  const handleColorChange = (color: string) => {
    onUpdateColor(element.id, color);
  };

  return (
    <div className="w-80 border-l border-border/50 bg-card/50 backdrop-blur-lg p-6 space-y-6 overflow-y-auto">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-light">Element Properties</h2>
        <Button variant="ghost" size="icon" onClick={onClose}>
          <X className="w-4 h-4" />
        </Button>
      </div>

      {/* Label */}
      <div className="space-y-2">
        <Label htmlFor="label" className="text-sm font-light">
          Label
        </Label>
        <Input
          id="label"
          value={label}
          onChange={handleLabelChange}
          placeholder="Element name"
          className="bg-background/50"
        />
      </div>

      {/* Color */}
      <div className="space-y-3">
        <Label className="text-sm font-light">Color</Label>
        <div className="grid grid-cols-2 gap-2">
          {colorPresets.map((preset) => (
            <button
              key={preset.name}
              onClick={() => handleColorChange(preset.value)}
              className="h-12 rounded-lg border-2 border-border/50 hover:border-primary/50 transition-all duration-300 flex items-center justify-center text-xs font-light"
              style={{ background: preset.value, color: 'white' }}
            >
              {preset.name}
            </button>
          ))}
        </div>
      </div>

      {/* Metadata */}
      <div className="pt-6 border-t border-border/50 space-y-2 text-sm text-muted-foreground">
        <div className="flex justify-between">
          <span>Element ID</span>
          <span className="font-mono text-xs">{element.id}</span>
        </div>
        <div className="flex justify-between">
          <span>Type</span>
          <span>Node</span>
        </div>
      </div>

      {/* Actions */}
      <div className="pt-6 border-t border-border/50">
        <Button
          variant="outline"
          size="sm"
          className="w-full gap-2 text-destructive hover:text-destructive"
          onClick={() => onDelete(element.id)}
        >
          <Trash2 className="w-4 h-4" />
          Delete Element
        </Button>
      </div>
    </div>
  );
};
