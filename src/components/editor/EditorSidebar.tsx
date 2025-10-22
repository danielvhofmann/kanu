import { useState } from 'react';
import { Node, Edge } from 'reactflow';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { X, Trash2, Plus, Tag } from 'lucide-react';
import { EdgeEditor } from './EdgeEditor';

interface EditorSidebarProps {
  element: Node | Edge;
  onClose: () => void;
  onUpdateLabel?: (nodeId: string, label: string) => void;
  onUpdateColor?: (nodeId: string, color: string) => void;
  onUpdateTags?: (nodeId: string, tags: string[]) => void;
  onUpdateEdge?: (edgeId: string, updates: Partial<Edge>) => void;
  onDelete: (elementId: string) => void;
}

const colorPalettes = {
  'Kumu Default': [
    { name: 'Teal', value: 'hsl(195, 45%, 52%)' },
    { name: 'Burgundy', value: 'hsl(355, 45%, 50%)' },
    { name: 'Brown', value: 'hsl(30, 35%, 55%)' },
    { name: 'Sage', value: 'hsl(85, 35%, 58%)' },
    { name: 'Slate', value: 'hsl(210, 25%, 62%)' },
  ],
  'Ocean': [
    { name: 'Deep Blue', value: 'hsl(210, 60%, 45%)' },
    { name: 'Aqua', value: 'hsl(180, 50%, 50%)' },
    { name: 'Navy', value: 'hsl(220, 70%, 35%)' },
    { name: 'Turquoise', value: 'hsl(170, 55%, 48%)' },
    { name: 'Sky', value: 'hsl(200, 60%, 60%)' },
  ],
  'Sunset': [
    { name: 'Orange', value: 'hsl(25, 75%, 55%)' },
    { name: 'Pink', value: 'hsl(340, 65%, 58%)' },
    { name: 'Purple', value: 'hsl(280, 50%, 55%)' },
    { name: 'Coral', value: 'hsl(15, 70%, 60%)' },
    { name: 'Magenta', value: 'hsl(320, 60%, 52%)' },
  ],
  'Forest': [
    { name: 'Green', value: 'hsl(140, 45%, 45%)' },
    { name: 'Olive', value: 'hsl(80, 40%, 45%)' },
    { name: 'Pine', value: 'hsl(160, 50%, 40%)' },
    { name: 'Moss', value: 'hsl(100, 35%, 50%)' },
    { name: 'Lime', value: 'hsl(75, 55%, 50%)' },
  ],
  'Monochrome': [
    { name: 'Charcoal', value: 'hsl(0, 0%, 25%)' },
    { name: 'Gray', value: 'hsl(0, 0%, 50%)' },
    { name: 'Silver', value: 'hsl(0, 0%, 70%)' },
    { name: 'Ash', value: 'hsl(0, 0%, 60%)' },
    { name: 'Smoke', value: 'hsl(0, 0%, 80%)' },
  ],
};

export const EditorSidebar = ({
  element,
  onClose,
  onUpdateLabel,
  onUpdateColor,
  onUpdateTags,
  onUpdateEdge,
  onDelete,
}: EditorSidebarProps) => {
  const isNode = 'data' in element;
  const isEdge = 'source' in element && 'target' in element;
  
  const [label, setLabel] = useState(isNode ? element.data.label || '' : '');
  const [tags, setTags] = useState<string[]>(isNode ? element.data.tags || [] : []);
  const [newTag, setNewTag] = useState('');
  const [selectedPalette, setSelectedPalette] = useState<keyof typeof colorPalettes>('Kumu Default');

  const handleLabelChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newLabel = e.target.value;
    setLabel(newLabel);
    if (onUpdateLabel && isNode) {
      onUpdateLabel(element.id, newLabel);
    }
  };

  const handleColorChange = (color: string) => {
    if (onUpdateColor && isNode) {
      onUpdateColor(element.id, color);
    }
  };

  const handleAddTag = () => {
    if (newTag.trim() && !tags.includes(newTag.trim())) {
      const updatedTags = [...tags, newTag.trim()];
      setTags(updatedTags);
      setNewTag('');
      if (onUpdateTags && isNode) {
        onUpdateTags(element.id, updatedTags);
      }
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    const updatedTags = tags.filter(tag => tag !== tagToRemove);
    setTags(updatedTags);
    if (onUpdateTags && isNode) {
      onUpdateTags(element.id, updatedTags);
    }
  };

  return (
    <div className="w-96 border-r border-border/50 bg-card/50 backdrop-blur-lg p-6 space-y-6 overflow-y-auto">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-light">
          {isEdge ? 'Edge Properties' : 'Node Properties'}
        </h2>
        <Button variant="ghost" size="icon" onClick={onClose}>
          <X className="w-4 h-4" />
        </Button>
      </div>

      {isNode && (
        <>
          {/* Label */}
          <div className="space-y-2">
            <Label htmlFor="label" className="text-sm font-light">
              Label
            </Label>
            <Input
              id="label"
              value={label}
              onChange={handleLabelChange}
              placeholder="Node name"
              className="bg-background/50"
            />
          </div>

          {/* Tags */}
          <div className="space-y-3">
            <Label className="text-sm font-light flex items-center gap-2">
              <Tag className="w-4 h-4" />
              Tags
            </Label>
            <div className="flex gap-2">
              <Input
                value={newTag}
                onChange={(e) => setNewTag(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleAddTag()}
                placeholder="Add tag..."
                className="bg-background/50 flex-1"
              />
              <Button onClick={handleAddTag} size="icon" variant="outline">
                <Plus className="w-4 h-4" />
              </Button>
            </div>
            {tags.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {tags.map((tag) => (
                  <Badge
                    key={tag}
                    variant="secondary"
                    className="cursor-pointer hover:bg-destructive hover:text-destructive-foreground transition-colors"
                    onClick={() => handleRemoveTag(tag)}
                  >
                    {tag} ×
                  </Badge>
                ))}
              </div>
            )}
          </div>

          {/* Color Palettes */}
          <div className="space-y-3">
            <Label className="text-sm font-light">Color Palette</Label>
            <Select value={selectedPalette} onValueChange={(value) => setSelectedPalette(value as keyof typeof colorPalettes)}>
              <SelectTrigger className="bg-background/50">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-popover z-50">
                {Object.keys(colorPalettes).map((palette) => (
                  <SelectItem key={palette} value={palette}>
                    {palette}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <div className="grid grid-cols-2 gap-2">
              {colorPalettes[selectedPalette].map((color) => (
                <button
                  key={color.name}
                  onClick={() => handleColorChange(color.value)}
                  className="h-12 rounded-lg border-2 border-border/50 hover:border-primary/50 transition-all duration-300 flex items-center justify-center text-xs font-light"
                  style={{ background: color.value, color: 'white' }}
                >
                  {color.name}
                </button>
              ))}
            </div>
          </div>
        </>
      )}

      {isEdge && onUpdateEdge && (
        <EdgeEditor edge={element as Edge} onUpdateEdge={onUpdateEdge} />
      )}

      {/* Metadata */}
      <div className="pt-6 border-t border-border/50 space-y-2 text-sm text-muted-foreground">
        <div className="flex justify-between">
          <span>Element ID</span>
          <span className="font-mono text-xs">{element.id}</span>
        </div>
        <div className="flex justify-between">
          <span>Type</span>
          <span>{isEdge ? 'Edge' : 'Node'}</span>
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
