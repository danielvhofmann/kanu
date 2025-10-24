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
import { Upload, FileSpreadsheet, Link2, X, Check, ArrowLeft } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Node, Edge } from 'reactflow';
import ReactFlow, { Background, Controls } from 'reactflow';
import 'reactflow/dist/style.css';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { ScrollArea } from '@/components/ui/scroll-area';

interface ImportDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onImport: (nodes: Node[], edges: Edge[]) => void;
}

export const ImportDialog = ({ open, onOpenChange, onImport }: ImportDialogProps) => {
  const { toast } = useToast();
  const [isDragging, setIsDragging] = useState(false);
  const [previewMode, setPreviewMode] = useState(false);
  const [previewNodes, setPreviewNodes] = useState<Node[]>([]);
  const [previewEdges, setPreviewEdges] = useState<Edge[]>([]);
  const [tableData, setTableData] = useState<Array<Record<string, string>>>([]);

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
        const headerParts = lines[0].split(',').map(s => s.trim());
        
        if (header.includes('source') && header.includes('target')) {
          // Edge list format
          const newNodes = new Map<string, Node>();
          const newEdges: Edge[] = [];
          const rawData: Array<Record<string, string>> = [];
          
          for (let i = 1; i < lines.length; i++) {
            const [source, target, label] = lines[i].split(',').map(s => s.trim());
            
            if (!source || !target) continue;
            
            rawData.push({
              source,
              target,
              label: label || '',
            });
            
            const colors = [
              { bg: 'hsl(195, 45%, 52%)', border: 'hsl(195, 50%, 68%)' },
              { bg: 'hsl(355, 45%, 50%)', border: 'hsl(355, 50%, 65%)' },
              { bg: 'hsl(30, 35%, 55%)', border: 'hsl(30, 40%, 68%)' },
              { bg: 'hsl(85, 35%, 58%)', border: 'hsl(85, 40%, 70%)' },
              { bg: 'hsl(210, 25%, 62%)', border: 'hsl(210, 30%, 75%)' },
            ];
            
            // Create nodes if they don't exist
            if (!newNodes.has(source)) {
              const color = colors[newNodes.size % colors.length];
              newNodes.set(source, {
                id: source,
                type: 'default',
                position: { 
                  x: Math.random() * 600 + 100, 
                  y: Math.random() * 400 + 100 
                },
                data: { label: source },
                style: {
                  background: color.bg,
                  color: 'white',
                  border: `2px solid ${color.border}`,
                  borderRadius: '50%',
                  padding: '0',
                  fontSize: '12px',
                  fontWeight: '400',
                  width: '90px',
                  height: '90px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  textAlign: 'center',
                  boxShadow: `0 3px 12px ${color.bg}33`,
                },
              });
            }
            
            if (!newNodes.has(target)) {
              const color = colors[newNodes.size % colors.length];
              newNodes.set(target, {
                id: target,
                type: 'default',
                position: { 
                  x: Math.random() * 600 + 100, 
                  y: Math.random() * 400 + 100 
                },
                data: { label: target },
                style: {
                  background: color.bg,
                  color: 'white',
                  border: `2px solid ${color.border}`,
                  borderRadius: '50%',
                  padding: '0',
                  fontSize: '12px',
                  fontWeight: '400',
                  width: '90px',
                  height: '90px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  textAlign: 'center',
                  boxShadow: `0 3px 12px ${color.bg}33`,
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
          
          setPreviewNodes(Array.from(newNodes.values()));
          setPreviewEdges(newEdges);
          setTableData(rawData);
          setPreviewMode(true);
        } else {
          // Node list format
          const newNodes: Node[] = [];
          const rawData: Array<Record<string, string>> = [];
          
          const colors = [
            { bg: 'hsl(195, 45%, 52%)', border: 'hsl(195, 50%, 68%)' },
            { bg: 'hsl(355, 45%, 50%)', border: 'hsl(355, 50%, 65%)' },
            { bg: 'hsl(30, 35%, 55%)', border: 'hsl(30, 40%, 68%)' },
            { bg: 'hsl(85, 35%, 58%)', border: 'hsl(85, 40%, 70%)' },
            { bg: 'hsl(210, 25%, 62%)', border: 'hsl(210, 30%, 75%)' },
          ];
          
          for (let i = 1; i < lines.length; i++) {
            const [id, label, type] = lines[i].split(',').map(s => s.trim());
            
            if (!id) continue;
            
            rawData.push({
              id,
              label: label || id,
              type: type || '',
            });
            
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
                background: color.bg,
                color: 'white',
                border: `2px solid ${color.border}`,
                borderRadius: '50%',
                padding: '0',
                fontSize: '12px',
                fontWeight: '400',
                width: '90px',
                height: '90px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                textAlign: 'center',
                boxShadow: `0 3px 12px ${color.bg}33`,
              },
            });
          }
          
          setPreviewNodes(newNodes);
          setPreviewEdges([]);
          setTableData(rawData);
          setPreviewMode(true);
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

  const handleConfirmImport = () => {
    onImport(previewNodes, previewEdges);
    toast({
      title: 'Import successful',
      description: `Imported ${previewNodes.length} nodes${previewEdges.length > 0 ? ` and ${previewEdges.length} connections` : ''}`,
    });
    setPreviewMode(false);
    setPreviewNodes([]);
    setPreviewEdges([]);
    setTableData([]);
    onOpenChange(false);
  };

  const handleBackToUpload = () => {
    setPreviewMode(false);
    setPreviewNodes([]);
    setPreviewEdges([]);
    setTableData([]);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-6xl max-h-[90vh]">
        {!previewMode ? (
          <>
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
          </>
        ) : (
          <>
            <DialogHeader>
              <DialogTitle className="text-2xl font-light">Preview Import</DialogTitle>
              <DialogDescription>
                Review your data before importing
              </DialogDescription>
            </DialogHeader>

            <div className="grid grid-cols-2 gap-4 mt-4" style={{ height: '60vh' }}>
              {/* Table Preview - Left */}
              <div className="border rounded-lg overflow-hidden flex flex-col">
                <div className="bg-muted px-4 py-2 border-b">
                  <h3 className="font-medium text-sm">Data Table</h3>
                </div>
                <ScrollArea className="flex-1">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        {tableData.length > 0 && Object.keys(tableData[0]).map((key) => {
                          const labelMap: Record<string, string> = {
                            source: 'From Node',
                            target: 'To Node',
                            label: 'Connection Label',
                            id: 'Node ID',
                            type: 'Node Type'
                          };
                          return (
                            <TableHead key={key} className="font-medium">
                              {labelMap[key] || key.charAt(0).toUpperCase() + key.slice(1)}
                            </TableHead>
                          );
                        })}
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {tableData.map((row, index) => (
                        <TableRow key={index}>
                          {Object.values(row).map((value, i) => (
                            <TableCell key={i}>{value}</TableCell>
                          ))}
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </ScrollArea>
              </div>

              {/* Network Preview - Right */}
              <div className="border rounded-lg overflow-hidden flex flex-col">
                <div className="bg-muted px-4 py-2 border-b">
                  <h3 className="font-medium text-sm">Network Preview</h3>
                </div>
                <div className="flex-1 bg-background">
                  <ReactFlow
                    nodes={previewNodes}
                    edges={previewEdges}
                    fitView
                    attributionPosition="bottom-left"
                  >
                    <Background />
                    <Controls />
                  </ReactFlow>
                </div>
              </div>
            </div>

            <div className="flex justify-between items-center pt-4 border-t">
              <Button variant="ghost" onClick={handleBackToUpload}>
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back
              </Button>
              <div className="flex gap-2">
                <Button variant="outline" onClick={() => onOpenChange(false)}>
                  Cancel
                </Button>
                <Button onClick={handleConfirmImport}>
                  <Check className="w-4 h-4 mr-2" />
                  Confirm Import
                </Button>
              </div>
            </div>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
};
