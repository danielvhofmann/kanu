import { Button } from '@/components/ui/button';
import {
  Plus,
  Download,
  Upload,
  Share2,
  Save,
  Undo,
  Redo,
} from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { toast } from 'sonner';

interface EditorToolbarProps {
  onAddNode: () => void;
  onImport: () => void;
  onExport: (format: 'png' | 'svg' | 'pdf') => void;
  edgeType: string;
  onEdgeTypeChange: (type: string) => void;
  onUndo: () => void;
  onRedo: () => void;
  canUndo: boolean;
  canRedo: boolean;
}

export const EditorToolbar = ({ 
  onAddNode, 
  onImport, 
  onExport,
  edgeType,
  onEdgeTypeChange,
  onUndo,
  onRedo,
  canUndo,
  canRedo,
}: EditorToolbarProps) => {
  const handleSave = () => {
    toast.success('Map saved successfully');
  };

  const handleShare = () => {
    toast.info('Share feature coming soon');
  };

  const handleDownload = (format: 'png' | 'svg' | 'pdf') => {
    onExport(format);
  };

  return (
    <div className="flex items-center gap-2">
      <Button
        variant="default"
        size="sm"
        onClick={onAddNode}
        className="gap-2"
      >
        <Plus className="w-4 h-4" />
        Add Element
      </Button>

      <div className="h-6 w-px bg-border mx-2" />

      <div className="flex items-center gap-2">
        <span className="text-sm text-muted-foreground">Edge Type:</span>
        <Select value={edgeType} onValueChange={onEdgeTypeChange}>
          <SelectTrigger className="h-8 w-[120px]">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="straight">Straight</SelectItem>
            <SelectItem value="smoothstep">Curved</SelectItem>
            <SelectItem value="step">Step</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="h-6 w-px bg-border mx-2" />

      <Button variant="ghost" size="sm" onClick={handleSave} className="gap-2">
        <Save className="w-4 h-4" />
        Save
      </Button>

      <Button variant="ghost" size="sm" onClick={onImport}>
        <Upload className="w-4 h-4" />
      </Button>

      <Select onValueChange={(value) => handleDownload(value as 'png' | 'svg' | 'pdf')}>
        <SelectTrigger className="h-8 w-[40px] px-2 border-0">
          <Download className="w-4 h-4" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="png">PNG</SelectItem>
          <SelectItem value="svg">SVG</SelectItem>
          <SelectItem value="pdf">PDF</SelectItem>
        </SelectContent>
      </Select>

      <Button variant="ghost" size="sm" onClick={handleShare}>
        <Share2 className="w-4 h-4" />
      </Button>
    </div>
  );
};
