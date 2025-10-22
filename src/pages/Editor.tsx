import { useState, useCallback, useEffect, useRef } from 'react';
import { Node, Edge, Connection, MarkerType } from 'reactflow';
import { EditorToolbar } from '@/components/editor/EditorToolbar';
import { EditorSidebar } from '@/components/editor/EditorSidebar';
import { ImportDialog } from '@/components/editor/ImportDialog';
import { D3Canvas } from '@/components/editor/D3Canvas';
import { ColorControls } from '@/components/editor/ColorControls';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ArrowLeft, Pencil, Undo, Redo } from 'lucide-react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { getTemplate, type TemplateType } from '@/lib/templates';
import { toast } from 'sonner';
import * as d3 from 'd3';

const initialNodes: Node[] = [];
const initialEdges: Edge[] = [];

interface HistoryState {
  nodes: Node[];
  edges: Edge[];
}

const Editor = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [nodes, setNodes] = useState<Node[]>(initialNodes);
  const [edges, setEdges] = useState<Edge[]>(initialEdges);
  const [selectedElement, setSelectedElement] = useState<Node | Edge | null>(null);
  const [showImportDialog, setShowImportDialog] = useState(false);
  const [isSketchMode, setIsSketchMode] = useState(false);
  const [backgroundColor, setBackgroundColor] = useState('hsl(0, 0%, 99%)');
  const [selectedPalette, setSelectedPalette] = useState('default');
  const [defaultEdgeType, setDefaultEdgeType] = useState('straight');
  const [mapTitle, setMapTitle] = useState('Untitled Map');
  const templateType = searchParams.get('template') as TemplateType;
  
  // History management for undo/redo
  const [history, setHistory] = useState<HistoryState[]>([{ nodes: [], edges: [] }]);
  const [historyIndex, setHistoryIndex] = useState(0);
  const canvasRef = useRef<HTMLDivElement>(null);
  const isUndoRedoAction = useRef(false);

  // Color palettes
  const paletteColors: Record<string, string[]> = {
    default: [
      'hsl(195, 45%, 52%)',
      'hsl(355, 45%, 50%)',
      'hsl(30, 35%, 55%)',
      'hsl(85, 35%, 58%)',
      'hsl(210, 25%, 62%)',
    ],
    ocean: [
      'hsl(200, 70%, 45%)',
      'hsl(190, 65%, 50%)',
      'hsl(210, 60%, 55%)',
      'hsl(220, 55%, 60%)',
      'hsl(230, 50%, 65%)',
    ],
    sunset: [
      'hsl(25, 75%, 55%)',
      'hsl(10, 70%, 50%)',
      'hsl(340, 65%, 55%)',
      'hsl(280, 60%, 60%)',
      'hsl(260, 55%, 65%)',
    ],
    forest: [
      'hsl(120, 35%, 45%)',
      'hsl(140, 40%, 50%)',
      'hsl(160, 35%, 55%)',
      'hsl(80, 40%, 50%)',
      'hsl(100, 35%, 55%)',
    ],
    monochrome: [
      'hsl(220, 10%, 30%)',
      'hsl(220, 10%, 45%)',
      'hsl(220, 10%, 60%)',
      'hsl(220, 10%, 75%)',
      'hsl(220, 10%, 85%)',
    ],
  };

  // Load template if specified in URL, otherwise show import dialog
  useEffect(() => {
    if (templateType) {
      const template = getTemplate(templateType);
      if (template) {
        setNodes(template.nodes);
        setEdges(template.edges);
      }
    } else if (nodes.length === 0) {
      setShowImportDialog(true);
    }
  }, [searchParams, nodes.length, templateType]);

  const onConnect = useCallback(
    (connection: Connection) => {
      const newEdge: Edge = {
        id: `${connection.source}-${connection.target}`,
        source: connection.source!,
        target: connection.target!,
        type: 'smoothstep',
        animated: true,
        style: { stroke: 'hsl(var(--primary))', strokeWidth: 2 },
        markerEnd: {
          type: MarkerType.ArrowClosed,
          color: 'hsl(var(--primary))',
        },
      };
      setEdges((eds) => [...eds, newEdge]);
    },
    []
  );

  const addNode = useCallback(() => {
    const colors = [
      { bg: 'hsl(195, 45%, 52%)', border: 'hsl(195, 50%, 68%)' },
      { bg: 'hsl(355, 45%, 50%)', border: 'hsl(355, 50%, 65%)' },
      { bg: 'hsl(30, 35%, 55%)', border: 'hsl(30, 40%, 68%)' },
      { bg: 'hsl(85, 35%, 58%)', border: 'hsl(85, 40%, 70%)' },
      { bg: 'hsl(210, 25%, 62%)', border: 'hsl(210, 30%, 75%)' },
    ];
    const color = colors[nodes.length % colors.length];
    
    const newNode: Node = {
      id: `${Date.now()}`,
      type: 'default',
      position: { x: Math.random() * 500 + 100, y: Math.random() * 300 + 100 },
      data: { label: `Node ${nodes.length + 1}` },
      style: {
        background: color.bg,
        color: 'white',
        border: `2px solid ${color.border}`,
        borderRadius: '50%',
        padding: '0',
        fontSize: '12px',
        fontWeight: '400',
        width: '85px',
        height: '85px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        textAlign: 'center',
        boxShadow: `0 3px 12px ${color.bg}33`,
      },
    };
    setNodes((nds) => [...nds, newNode]);
  }, [nodes.length]);

  const handleImport = useCallback((importedNodes: Node[], importedEdges: Edge[]) => {
    setNodes(importedNodes);
    setEdges(importedEdges);
  }, []);

  const onNodeClick = useCallback((node: Node) => {
    setSelectedElement(node);
  }, []);

  const onEdgeClick = useCallback((edge: Edge) => {
    setSelectedElement(edge);
  }, []);

  const updateNodeLabel = useCallback(
    (nodeId: string, newLabel: string) => {
      setNodes((nds) =>
        nds.map((node) =>
          node.id === nodeId
            ? { ...node, data: { ...node.data, label: newLabel } }
            : node
        )
      );
    },
    []
  );

  const updateNodeColor = useCallback(
    (nodeId: string, color: string) => {
      setNodes((nds) =>
        nds.map((node) =>
          node.id === nodeId
            ? {
                ...node,
                style: {
                  ...node.style,
                  background: color,
                },
              }
            : node
        )
      );
    },
    []
  );

  const updateNodeTags = useCallback(
    (nodeId: string, tags: string[]) => {
      setNodes((nds) =>
        nds.map((node) =>
          node.id === nodeId
            ? {
                ...node,
                data: {
                  ...node.data,
                  tags,
                },
              }
            : node
        )
      );
    },
    []
  );

  const updateEdge = useCallback(
    (edgeId: string, updates: Partial<Edge>) => {
      setEdges((eds) =>
        eds.map((edge) =>
          edge.id === edgeId
            ? { ...edge, ...updates }
            : edge
        )
      );
    },
    []
  );

  const deleteNode = useCallback(
    (nodeId: string) => {
      setNodes((nds) => nds.filter((node) => node.id !== nodeId));
      setEdges((eds) =>
        eds.filter((edge) => edge.source !== nodeId && edge.target !== nodeId)
      );
      setSelectedElement(null);
    },
    []
  );

  const toggleSketchMode = useCallback(() => {
    setIsSketchMode((prev) => {
      const newMode = !prev;
      toast.success(newMode ? 'Sketch mode enabled' : 'Sketch mode disabled');
      return newMode;
    });
  }, []);

  const applyPalette = useCallback(
    (palette: string) => {
      const colors = paletteColors[palette];
      if (!colors) return;

      setNodes((nds) =>
        nds.map((node, index) => ({
          ...node,
          style: {
            ...node.style,
            background: colors[index % colors.length],
          },
        }))
      );

      setEdges((eds) =>
        eds.map((edge, index) => ({
          ...edge,
          style: {
            ...edge.style,
            stroke: colors[index % colors.length],
          },
        }))
      );

      setSelectedPalette(palette);
      toast.success(`Applied ${palette} palette`);
    },
    [paletteColors]
  );

  // Save to history when nodes or edges change (but not during undo/redo)
  useEffect(() => {
    if (isUndoRedoAction.current) {
      isUndoRedoAction.current = false;
      return;
    }
    
    if (nodes.length > 0 || edges.length > 0) {
      setHistory(prev => {
        const newState = { nodes, edges };
        const newHistory = prev.slice(0, historyIndex + 1);
        
        // Don't add if it's the same as current state
        const current = newHistory[newHistory.length - 1];
        if (current && JSON.stringify(current) === JSON.stringify(newState)) {
          return prev;
        }
        
        newHistory.push(newState);
        // Keep history limited to 50 states
        if (newHistory.length > 50) newHistory.shift();
        return newHistory;
      });
      setHistoryIndex(prev => prev + 1);
    }
  }, [nodes, edges, historyIndex]);

  const handleUndo = useCallback(() => {
    if (historyIndex > 0) {
      isUndoRedoAction.current = true;
      const newIndex = historyIndex - 1;
      const state = history[newIndex];
      setNodes(state.nodes);
      setEdges(state.edges);
      setHistoryIndex(newIndex);
      toast.success('Undo');
    }
  }, [historyIndex, history]);

  const handleRedo = useCallback(() => {
    if (historyIndex < history.length - 1) {
      isUndoRedoAction.current = true;
      const newIndex = historyIndex + 1;
      const state = history[newIndex];
      setNodes(state.nodes);
      setEdges(state.edges);
      setHistoryIndex(newIndex);
      toast.success('Redo');
    }
  }, [historyIndex, history]);

  const handleExport = useCallback((format: 'png' | 'svg' | 'pdf') => {
    const canvas = canvasRef.current?.querySelector('svg');
    if (!canvas) {
      toast.error('Canvas not found');
      return;
    }

    if (format === 'svg') {
      const svgData = new XMLSerializer().serializeToString(canvas);
      const blob = new Blob([svgData], { type: 'image/svg+xml' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `${mapTitle}.svg`;
      link.click();
      URL.revokeObjectURL(url);
      toast.success('SVG exported');
    } else if (format === 'png') {
      const svgData = new XMLSerializer().serializeToString(canvas);
      const img = new Image();
      const blob = new Blob([svgData], { type: 'image/svg+xml;charset=utf-8' });
      const url = URL.createObjectURL(blob);
      
      img.onload = () => {
        const canvas = document.createElement('canvas');
        canvas.width = img.width;
        canvas.height = img.height;
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.fillStyle = backgroundColor;
          ctx.fillRect(0, 0, canvas.width, canvas.height);
          ctx.drawImage(img, 0, 0);
          canvas.toBlob((blob) => {
            if (blob) {
              const url = URL.createObjectURL(blob);
              const link = document.createElement('a');
              link.href = url;
              link.download = `${mapTitle}.png`;
              link.click();
              URL.revokeObjectURL(url);
              toast.success('PNG exported');
            }
          });
        }
        URL.revokeObjectURL(url);
      };
      img.src = url;
    } else if (format === 'pdf') {
      toast.info('PDF export coming soon');
    }
  }, [mapTitle, backgroundColor]);

  return (
    <div className="h-screen flex flex-col bg-background">
      {/* Top navigation */}
      <div className="h-16 border-b border-border/50 flex items-center justify-between px-6 bg-card/50 backdrop-blur-lg">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate('/')}
            className="gap-2"
          >
            <ArrowLeft className="w-4 h-4" />
            Back
          </Button>
          <div className="h-6 w-px bg-border" />
          <Input
            value={mapTitle}
            onChange={(e) => setMapTitle(e.target.value)}
            className="h-8 w-64 bg-background/50 text-muted-foreground focus:text-foreground border-none"
            placeholder="Untitled Map"
          />
          <div className="h-6 w-px bg-border" />
          <Button
            variant="ghost"
            size="sm"
            onClick={handleUndo}
            disabled={historyIndex <= 0}
            className="gap-2"
          >
            <Undo className="w-4 h-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleRedo}
            disabled={historyIndex >= history.length - 1}
            className="gap-2"
          >
            <Redo className="w-4 h-4" />
          </Button>
          <div className="h-6 w-px bg-border" />
          <Button
            variant={isSketchMode ? "default" : "ghost"}
            size="sm"
            onClick={toggleSketchMode}
            className="gap-2"
          >
            <Pencil className="w-4 h-4" />
            Sketch Mode
          </Button>
          <ColorControls
            backgroundColor={backgroundColor}
            onBackgroundColorChange={setBackgroundColor}
            selectedPalette={selectedPalette}
            onPaletteChange={applyPalette}
          />
          <EditorToolbar 
            onAddNode={addNode} 
            onImport={() => setShowImportDialog(true)}
            onExport={handleExport}
            edgeType={defaultEdgeType}
            onEdgeTypeChange={setDefaultEdgeType}
            onUndo={handleUndo}
            onRedo={handleRedo}
            canUndo={historyIndex > 0}
            canRedo={historyIndex < history.length - 1}
          />
        </div>
      </div>

      {/* Main editor area */}
      <div className="flex-1 flex relative">
        {/* Sidebar */}
        {selectedElement && (
          <EditorSidebar
            element={selectedElement}
            onClose={() => setSelectedElement(null)}
            onUpdateLabel={updateNodeLabel}
            onUpdateColor={updateNodeColor}
            onUpdateTags={updateNodeTags}
            onUpdateEdge={updateEdge}
            onDelete={deleteNode}
          />
        )}
        
        {/* Canvas */}
        <div ref={canvasRef} className="flex-1 relative">
          <D3Canvas
            nodes={nodes}
            edges={edges}
            onNodesChange={setNodes}
            onEdgesChange={setEdges}
            selectedNodeId={selectedElement && 'data' in selectedElement ? selectedElement.id : null}
            selectedEdgeId={selectedElement && 'source' in selectedElement ? selectedElement.id : null}
            onNodeClick={onNodeClick}
            onEdgeClick={onEdgeClick}
            isSketchMode={isSketchMode}
            backgroundColor={backgroundColor}
            templateType={templateType || undefined}
          />
        </div>
      </div>

      {/* Import Dialog */}
      <ImportDialog
        open={showImportDialog}
        onOpenChange={setShowImportDialog}
        onImport={handleImport}
      />
    </div>
  );
};

export default Editor;
