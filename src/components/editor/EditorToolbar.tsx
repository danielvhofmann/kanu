import { Button } from '@/components/ui/button';
import {
  Plus,
  Download,
  Upload,
  Share2,
  Maximize2,
  Save,
} from 'lucide-react';
import { toast } from 'sonner';

interface EditorToolbarProps {
  onAddNode: () => void;
  onImport: () => void;
}

export const EditorToolbar = ({ onAddNode, onImport }: EditorToolbarProps) => {
  const handleSave = () => {
    toast.success('Map saved successfully');
  };

  const handleExport = () => {
    toast.info('Export feature coming soon');
  };

  const handleShare = () => {
    toast.info('Share feature coming soon');
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

      <Button variant="ghost" size="sm" onClick={handleSave} className="gap-2">
        <Save className="w-4 h-4" />
        Save
      </Button>

      <Button variant="ghost" size="sm" onClick={onImport}>
        <Upload className="w-4 h-4" />
      </Button>

      <Button variant="ghost" size="sm" onClick={handleExport}>
        <Download className="w-4 h-4" />
      </Button>

      <Button variant="ghost" size="sm" onClick={handleShare}>
        <Share2 className="w-4 h-4" />
      </Button>

      <div className="h-6 w-px bg-border mx-2" />

      <Button variant="ghost" size="sm">
        <Maximize2 className="w-4 h-4" />
      </Button>
    </div>
  );
};
