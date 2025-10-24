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
import { Upload, FileSpreadsheet, Link2, X, Check, ArrowLeft, Loader2 } from 'lucide-react';
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
import { Slider } from '@/components/ui/slider';
import { supabase } from '@/integrations/supabase/client';
import { convertCorrelationToNetwork } from '@/utils/correlationConverter';

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
  const [isProcessing, setIsProcessing] = useState(false);
  const [correlationThreshold, setCorrelationThreshold] = useState(0.3);
  const [statistics, setStatistics] = useState<any>(null);
  const [dataType, setDataType] = useState<'edgelist' | 'nodelist' | 'rawdata'>('edgelist');

  const handleFileUpload = async (file: File) => {
    const reader = new FileReader();
    reader.onload = async (e) => {
      try {
        const text = e.target?.result as string;
        const lines = text.split('\n').filter(line => line.trim());
        
        if (lines.length === 0) {
          throw new Error('File is empty');
        }

        const header = lines[0].toLowerCase();
        const headerParts = lines[0].split(',').map(s => s.trim());
        
        // Detect data type
        if (header.includes('source') && header.includes('target')) {
          // Edge list format
          setDataType('edgelist');
          handleEdgeListData(lines);
        } else if (lines.length > 2 && headerParts.length > 3) {
          // Raw dataset format - multiple variables
          setDataType('rawdata');
          await handleRawDataset(lines, headerParts);
        } else {
          // Node list format
          setDataType('nodelist');
          handleNodeListData(lines);
        }
      } catch (error) {
        toast({
          title: 'Import failed',
          description: error instanceof Error ? error.message : 'Failed to parse file',
          variant: 'destructive',
        });
        setIsProcessing(false);
      }
    };
    reader.readAsText(file);
  };

  const handleRawDataset = async (lines: string[], headerParts: string[]) => {
    setIsProcessing(true);
    
    try {
      // Parse all data rows
      const dataObjects = [];
      for (let i = 1; i < lines.length; i++) {
        const values = lines[i].split(',').map(s => s.trim());
        const obj: Record<string, string> = {};
        headerParts.forEach((header, index) => {
          if (header && index < values.length) {
            obj[header] = values[index];
          }
        });
        dataObjects.push(obj);
      }

      setTableData(dataObjects.slice(0, 20)); // Show first 20 rows in preview

      toast({
        title: 'Calculating correlations...',
        description: `Processing ${dataObjects.length} observations with ${headerParts.length} variables`,
      });

      // Call edge function to calculate correlation matrix
      const { data, error } = await supabase.functions.invoke('calculate-correlation-matrix', {
        body: {
          data: dataObjects,
          threshold: correlationThreshold,
        },
      });

      if (error) throw error;
      if (!data.success) throw new Error(data.error || 'Failed to calculate correlations');

      const correlationData = data.data;
      const variableNames = data.metadata.variableNames;

      // Convert correlation matrix to network
      const { nodes, edges } = convertCorrelationToNetwork(correlationData, variableNames);

      setPreviewNodes(nodes);
      setPreviewEdges(edges);
      setStatistics(correlationData.statistics);
      setPreviewMode(true);

      toast({
        title: 'Correlation network generated',
        description: `Created ${nodes.length} nodes and ${edges.length} connections`,
      });

    } catch (error) {
      console.error('Error processing raw dataset:', error);
      toast({
        title: 'Processing failed',
        description: error instanceof Error ? error.message : 'Failed to calculate correlations',
        variant: 'destructive',
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const handleEdgeListData = (lines: string[]) => {
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
  };

  const handleNodeListData = (lines: string[]) => {
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
    setStatistics(null);
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

            {/* Statistics Display */}
            {statistics && dataType === 'rawdata' && (
              <div className="grid grid-cols-4 gap-4 p-4 bg-muted/30 rounded-lg">
                <div>
                  <p className="text-xs text-muted-foreground">Variables</p>
                  <p className="text-lg font-semibold">{statistics.totalVariables}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Observations</p>
                  <p className="text-lg font-semibold">{statistics.totalObservations}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Missing Data</p>
                  <p className="text-lg font-semibold">{statistics.missingPercent}%</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Correlations</p>
                  <p className="text-lg font-semibold">{statistics.totalCorrelations}</p>
                </div>
              </div>
            )}

            <div className="grid grid-cols-2 gap-4 mt-4" style={{ height: '60vh' }}>
              {/* Table Preview - Left */}
              <div className="border rounded-lg overflow-hidden flex flex-col">
                <div className="bg-muted px-4 py-2 border-b flex items-center justify-between">
                  <h3 className="font-medium text-sm">
                    {dataType === 'rawdata' ? 'Sample Data (First 20 rows)' : 'Data Table'}
                  </h3>
                  {isProcessing && (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  )}
                </div>
                <ScrollArea className="flex-1">
                  <div className="w-full min-w-max">
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
                              <TableCell key={i} className="whitespace-nowrap">{value}</TableCell>
                            ))}
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                </ScrollArea>
              </div>

              {/* Network Preview - Right */}
              <div className="border rounded-lg overflow-hidden flex flex-col">
                <div className="bg-muted px-4 py-2 border-b">
                  <h3 className="font-medium text-sm">
                    {dataType === 'rawdata' ? 'Correlation Network' : 'Network Preview'}
                  </h3>
                  {dataType === 'rawdata' && (
                    <p className="text-xs text-muted-foreground mt-1">
                      Nodes = variables, Edges = correlations (|r| ≥ {correlationThreshold})
                    </p>
                  )}
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
