import { useState, useCallback, useEffect, useRef } from 'react';
import { Node, Edge, Connection, MarkerType } from 'reactflow';
import { EditorToolbar } from '@/components/editor/EditorToolbar';
import { EditorSidebar } from '@/components/editor/EditorSidebar';
import { TemplateSelector } from '@/components/editor/TemplateSelector';
import { NetworkCanvas } from '@/components/editor/NetworkCanvas';
import { ColorControls } from '@/components/editor/ColorControls';
import { AIChat } from '@/components/editor/AIChat';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ArrowLeft, Pencil, Undo, Redo, MessageSquare } from 'lucide-react';
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
  const [defaultNodeShape, setDefaultNodeShape] = useState('circle');
  const [defaultEdgeType, setDefaultEdgeType] = useState('straight');
  const [mapTitle, setMapTitle] = useState('Untitled Map');
  const [showAIChat, setShowAIChat] = useState(false);
  const templateType = searchParams.get('template') as TemplateType;
  
  // History management for undo/redo
  const [history, setHistory] = useState<HistoryState[]>([{ nodes: [], edges: [] }]);
  const [historyIndex, setHistoryIndex] = useState(0);
  const canvasRef = useRef<HTMLDivElement>(null);
  const isUndoRedoAction = useRef(false);
  const lastSavedStateRef = useRef<HistoryState>({ nodes: [], edges: [] });

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
    
    const shapeStyles = {
      circle: { borderRadius: '50%', clipPath: 'none' },
      square: { borderRadius: '8px', clipPath: 'none' },
      triangle: { borderRadius: '0%', clipPath: 'polygon(50% 0%, 0% 100%, 100% 100%)' },
    };
    
    const newNode: Node = {
      id: `node-${Date.now()}`,
      type: 'default',
      position: { x: Math.random() * 500 + 100, y: Math.random() * 300 + 100 },
      data: { 
        label: `Node ${nodes.length + 1}`,
        shape: defaultNodeShape,
      },
      style: {
        background: color.bg,
        color: 'white',
        border: `2px solid ${color.border}`,
        ...shapeStyles[defaultNodeShape as keyof typeof shapeStyles],
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
    const updatedNodes = [...nodes, newNode];
    setNodes(updatedNodes);
    toast.success('Node added');
  }, [nodes, defaultNodeShape]);

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

  const updateNodeShape = useCallback(
    (nodeId: string, shape: string) => {
      setNodes((nds) =>
        nds.map((node) => {
          if (node.id !== nodeId) return node;
          
          const shapeStyles = {
            circle: { borderRadius: '50%', clipPath: 'none' },
            square: { borderRadius: '8px', clipPath: 'none' },
            triangle: { borderRadius: '0%', clipPath: 'polygon(50% 0%, 0% 100%, 100% 100%)' },
          };
          
          return {
            ...node,
            data: { ...node.data, shape },
            style: {
              ...node.style,
              ...shapeStyles[shape as keyof typeof shapeStyles],
            },
          };
        })
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

  const deleteEdge = useCallback(
    (edgeId: string) => {
      setEdges((eds) => eds.filter((edge) => edge.id !== edgeId));
      setSelectedElement(null);
    },
    []
  );

  const deleteElement = useCallback(
    (elementId: string) => {
      // Use functional updates to access the latest state
      setNodes((currentNodes) => {
        const isNode = currentNodes.some(node => node.id === elementId);
        
        if (isNode) {
          // Delete node and its connected edges
          setEdges((currentEdges) =>
            currentEdges.filter(
              (edge) => edge.source !== elementId && edge.target !== elementId
            )
          );
          setSelectedElement(null);
          return currentNodes.filter((node) => node.id !== elementId);
        }
        
        return currentNodes; // No change if not a node
      });
      
      // Check for edge deletion
      setEdges((currentEdges) => {
        const isEdge = currentEdges.some(edge => edge.id === elementId);
        
        if (isEdge) {
          setSelectedElement(null);
          return currentEdges.filter((edge) => edge.id !== elementId);
        }
        
        return currentEdges; // No change if not an edge
      });
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

  const applyNodeShapeToAll = useCallback(
    (shape: string) => {
      const shapeStyles = {
        circle: { borderRadius: '50%', clipPath: 'none' },
        square: { borderRadius: '8px', clipPath: 'none' },
        triangle: { borderRadius: '0%', clipPath: 'polygon(50% 0%, 0% 100%, 100% 100%)' },
      };

      setNodes((nds) =>
        nds.map((node) => ({
          ...node,
          data: { ...node.data, shape },
          style: {
            ...node.style,
            ...shapeStyles[shape as keyof typeof shapeStyles],
          },
        }))
      );

      setDefaultNodeShape(shape);
      toast.success(`Applied ${shape} shape to all nodes`);
    },
    []
  );

  const applyEdgeTypeToAll = useCallback(
    (edgeType: string) => {
      const typeMap: Record<string, any> = {
        straight: 'straight',
        curved: 'smoothstep',
        step: 'step',
      };

      const mappedType = typeMap[edgeType] || 'straight';

      setEdges((eds) =>
        eds.map((edge) => ({
          ...edge,
          type: mappedType,
        }))
      );

      setDefaultEdgeType(edgeType);
      toast.success(`Applied ${edgeType} edges`);
    },
    []
  );

  // Save to history when nodes or edges change (but not during undo/redo)
  useEffect(() => {
    // Skip if this is an undo/redo action
    if (isUndoRedoAction.current) {
      isUndoRedoAction.current = false;
      return;
    }
    
    if (nodes.length > 0 || edges.length > 0) {
      const newState = { nodes: [...nodes], edges: [...edges] };
      const lastSaved = lastSavedStateRef.current;
      
      // Quick comparison using joined IDs
      const newNodeIds = newState.nodes.map(n => n.id).sort().join(',');
      const lastNodeIds = lastSaved.nodes.map(n => n.id).sort().join(',');
      const newEdgeIds = newState.edges.map(e => e.id).sort().join(',');
      const lastEdgeIds = lastSaved.edges.map(e => e.id).sort().join(',');
      
      // Don't add if it's the same as last saved state
      if (newNodeIds === lastNodeIds && newEdgeIds === lastEdgeIds) {
        return;
      }
      
      // Update history immediately
      setHistory(prev => {
        const newHistory = prev.slice(0, historyIndex + 1);
        newHistory.push(newState);
        // Keep history limited to 50 states
        if (newHistory.length > 50) newHistory.shift();
        return newHistory;
      });
      setHistoryIndex(prev => Math.min(prev + 1, 49));
      
      // Save this state as the last saved state
      lastSavedStateRef.current = newState;
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
    const svgElement = canvasRef.current?.querySelector('svg');
    if (!svgElement) {
      toast.error('Canvas not found');
      return;
    }

    if (format === 'svg') {
      const svgData = new XMLSerializer().serializeToString(svgElement);
      const blob = new Blob([svgData], { type: 'image/svg+xml' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `${mapTitle}.svg`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      toast.success('SVG exported');
    } else if (format === 'png') {
      const svgData = new XMLSerializer().serializeToString(svgElement);
      const svgBlob = new Blob([svgData], { type: 'image/svg+xml;charset=utf-8' });
      const url = URL.createObjectURL(svgBlob);
      
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const rect = svgElement.getBoundingClientRect();
        canvas.width = rect.width * 2;
        canvas.height = rect.height * 2;
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.scale(2, 2);
          ctx.fillStyle = backgroundColor;
          ctx.fillRect(0, 0, rect.width, rect.height);
          ctx.drawImage(img, 0, 0, rect.width, rect.height);
          canvas.toBlob((blob) => {
            if (blob) {
              const pngUrl = URL.createObjectURL(blob);
              const link = document.createElement('a');
              link.href = pngUrl;
              link.download = `${mapTitle}.png`;
              document.body.appendChild(link);
              link.click();
              document.body.removeChild(link);
              URL.revokeObjectURL(pngUrl);
              toast.success('PNG exported');
            }
          }, 'image/png');
        }
        URL.revokeObjectURL(url);
      };
      img.onerror = () => {
        toast.error('Failed to export PNG');
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
            nodeShape={defaultNodeShape}
            onNodeShapeChange={applyNodeShapeToAll}
            edgeType={defaultEdgeType}
            onEdgeTypeChange={applyEdgeTypeToAll}
            onUndo={handleUndo}
            onRedo={handleRedo}
            canUndo={historyIndex > 0}
            canRedo={historyIndex < history.length - 1}
          />
          <div className="h-6 w-px bg-border mx-2" />
          <Button
            variant={showAIChat ? "default" : "ghost"}
            size="sm"
            onClick={() => setShowAIChat(!showAIChat)}
            className="gap-2"
          >
            <MessageSquare className="w-4 h-4" />
            AI Assistant
          </Button>
        </div>
      </div>

      {/* Main editor area */}
      <div className="flex-1 flex relative overflow-hidden">
        {/* Sidebar */}
        {selectedElement && (
          <EditorSidebar
            element={selectedElement}
            onClose={() => setSelectedElement(null)}
            onUpdateLabel={updateNodeLabel}
            onUpdateColor={updateNodeColor}
            onUpdateTags={updateNodeTags}
            onUpdateNodeShape={updateNodeShape}
            onUpdateEdge={updateEdge}
            onDelete={deleteElement}
          />
        )}
        
        {/* Canvas */}
        <div ref={canvasRef} className="flex-1 relative">
          <NetworkCanvas
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
          />
        </div>

        {/* AI Chat */}
        {showAIChat && (
          <AIChat
            nodes={nodes}
            edges={edges}
            onNodesChange={setNodes}
            onEdgesChange={setEdges}
            onClose={() => setShowAIChat(false)}
          />
        )}
      </div>

      {/* Template Selector Dialog */}
      <TemplateSelector
        open={showImportDialog}
        onOpenChange={setShowImportDialog}
        onSelect={handleImport}
      />
    </div>
  );
};

export default Editor;
