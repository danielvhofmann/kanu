import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Upload, FileSpreadsheet, Link2, X } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Node, Edge } from 'reactflow';

interface ImportDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onImport: (nodes: Node[], edges: Edge[]) => void;
}

export const ImportDialog = ({ open, onOpenChange, onImport }: ImportDialogProps) => {
  const { toast } = useToast();
  const [isDragging, setIsDragging] = useState(false);

  const handleFileUpload = (file: File) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const text = e.target?.result as string;
        const lines = text.split('\n').filter(line => line.trim());
        
        if (lines.length === 0) {
          throw new Error('File is empty');
        }

        // Parse CSV/Excel - expect format: source,target,label (for edges) or id,label,type (for nodes)
        const header = lines[0].toLowerCase();
        
        if (header.includes('source') && header.includes('target')) {
          // Edge list format
          const newNodes = new Map<string, Node>();
          const newEdges: Edge[] = [];
          
          for (let i = 1; i < lines.length; i++) {
            const [source, target, label] = lines[i].split(',').map(s => s.trim());
            
            if (!source || !target) continue;
            
            // Create nodes if they don't exist
            if (!newNodes.has(source)) {
              newNodes.set(source, {
                id: source,
                type: 'default',
                position: { 
                  x: Math.random() * 600 + 100, 
                  y: Math.random() * 400 + 100 
                },
                data: { label: source },
                style: {
                  background: 'hsl(var(--primary))',
                  color: 'white',
                  border: '2px solid hsl(var(--primary-light))',
                  borderRadius: '50%',
                  padding: '20px',
                  fontSize: '13px',
                  fontWeight: '300',
                  width: '100px',
                  height: '100px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  textAlign: 'center',
                  boxShadow: '0 4px 12px hsl(var(--primary) / 0.2)',
                },
              });
            }
            
            if (!newNodes.has(target)) {
              newNodes.set(target, {
                id: target,
                type: 'default',
                position: { 
                  x: Math.random() * 600 + 100, 
                  y: Math.random() * 400 + 100 
                },
                data: { label: target },
                style: {
                  background: 'hsl(var(--secondary))',
                  color: 'white',
                  border: '2px solid hsl(var(--secondary-light))',
                  borderRadius: '50%',
                  padding: '20px',
                  fontSize: '13px',
                  fontWeight: '300',
                  width: '100px',
                  height: '100px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  textAlign: 'center',
                  boxShadow: '0 4px 12px hsl(var(--secondary) / 0.2)',
                },
              });
            }
            
            newEdges.push({
              id: `e${source}-${target}`,
              source,
              target,
              type: 'smoothstep',
              label: label || '',
              style: { 
                stroke: 'hsl(var(--border))', 
                strokeWidth: 2,
              },
            });
          }
          
          onImport(Array.from(newNodes.values()), newEdges);
          toast({
            title: 'Import successful',
            description: `Imported ${newNodes.size} nodes and ${newEdges.length} connections`,
          });
          onOpenChange(false);
        } else {
          // Node list format
          const newNodes: Node[] = [];
          
          for (let i = 1; i < lines.length; i++) {
            const [id, label, type] = lines[i].split(',').map(s => s.trim());
            
            if (!id) continue;
            
            const colors = ['primary', 'secondary', 'accent', 'primary-light'];
            const color = colors[i % colors.length];
            
            newNodes.push({
              id,
              type: 'default',
              position: { 
                x: Math.random() * 600 + 100, 
                y: Math.random() * 400 + 100 
              },
              data: { label: label || id, type: type || '' },
              style: {
                background: `hsl(var(--${color}))`,
                color: 'white',
                border: `2px solid hsl(var(--${color}-light))`,
                borderRadius: '50%',
                padding: '20px',
                fontSize: '13px',
                fontWeight: '300',
                width: '100px',
                height: '100px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                textAlign: 'center',
                boxShadow: `0 4px 12px hsl(var(--${color}) / 0.2)`,
              },
            });
          }
          
          onImport(newNodes, []);
          toast({
            title: 'Import successful',
            description: `Imported ${newNodes.length} nodes`,
          });
          onOpenChange(false);
        }
      } catch (error) {
        toast({
          title: 'Import failed',
          description: error instanceof Error ? error.message : 'Failed to parse file',
          variant: 'destructive',
        });
      }
    };
    reader.readAsText(file);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    
    const file = e.dataTransfer.files[0];
    if (file && (file.name.endsWith('.csv') || file.name.endsWith('.xlsx'))) {
      handleFileUpload(file);
    } else {
      toast({
        title: 'Invalid file',
        description: 'Please upload a CSV or XLSX file',
        variant: 'destructive',
      });
    }
  };

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleFileUpload(file);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="text-2xl font-light">Import Your Data</DialogTitle>
          <DialogDescription>
            Start by importing data from a file or connecting to Google Sheets
          </DialogDescription>
        </DialogHeader>

        <Tabs defaultValue="upload" className="mt-4">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="upload">
              <Upload className="w-4 h-4 mr-2" />
              Upload File
            </TabsTrigger>
            <TabsTrigger value="sheets">
              <Link2 className="w-4 h-4 mr-2" />
              Google Sheets
            </TabsTrigger>
          </TabsList>

          <TabsContent value="upload" className="space-y-4 mt-6">
            <div
              className={`border-2 border-dashed rounded-xl p-12 text-center transition-colors ${
                isDragging
                  ? 'border-primary bg-primary/5'
                  : 'border-border hover:border-primary/50'
              }`}
              onDragOver={(e) => {
                e.preventDefault();
                setIsDragging(true);
              }}
              onDragLeave={() => setIsDragging(false)}
              onDrop={handleDrop}
            >
              <FileSpreadsheet className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
              <h3 className="text-lg font-light mb-2">Drop your file here</h3>
              <p className="text-sm text-muted-foreground mb-4">
                CSV or XLSX files accepted
              </p>
              <Button asChild variant="outline">
                <label className="cursor-pointer">
                  Browse Files
                  <input
                    type="file"
                    accept=".csv,.xlsx"
                    className="hidden"
                    onChange={handleFileInput}
                  />
                </label>
              </Button>
            </div>

            <div className="bg-muted/50 rounded-lg p-4 text-sm">
              <p className="font-medium mb-2">Expected Format:</p>
              <div className="space-y-2 text-muted-foreground">
                <p><strong>Edge list:</strong> source,target,label</p>
                <p><strong>Node list:</strong> id,label,type</p>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="sheets" className="space-y-4 mt-6">
            <div className="border rounded-xl p-8 text-center">
              <Link2 className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
              <h3 className="text-lg font-light mb-2">Connect Google Sheets</h3>
              <p className="text-sm text-muted-foreground mb-4">
                Live sync your data from Google Sheets
              </p>
              <Button variant="outline" disabled>
                Connect Google Sheets
                <span className="ml-2 text-xs text-muted-foreground">(Coming Soon)</span>
              </Button>
            </div>

            <div className="bg-muted/50 rounded-lg p-4 text-sm text-muted-foreground">
              <p>
                Google Sheets integration will allow you to keep your map in sync
                with a live spreadsheet, perfect for collaborative data collection.
              </p>
            </div>
          </TabsContent>
        </Tabs>

        <div className="flex justify-between items-center pt-4 border-t">
          <Button variant="ghost" onClick={() => onOpenChange(false)}>
            Skip for now
          </Button>
          <p className="text-xs text-muted-foreground">
            You can import data later from the toolbar
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
};
