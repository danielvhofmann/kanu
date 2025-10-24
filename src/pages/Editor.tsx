import { useState, useCallback, useEffect, useRef } from 'react';
import { Node, Edge, Connection, MarkerType } from 'reactflow';
import { EditorToolbar } from '@/components/editor/EditorToolbar';
import { EditorSidebar } from '@/components/editor/EditorSidebar';
import { TemplateSelector } from '@/components/editor/TemplateSelector';
import { NetworkCanvas } from '@/components/editor/NetworkCanvas';
import { ColorControls } from '@/components/editor/ColorControls';
import { AIChat } from '@/components/editor/AIChat';
import { NodeEditorOverlay } from '@/components/editor/NodeEditorOverlay';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ArrowLeft, Pencil, Undo, Redo, MessageSquare, Badge as BadgeIcon } from 'lucide-react';
import { useNavigate, useSearchParams, useLocation } from 'react-router-dom';
import { getTemplate, type TemplateType } from '@/lib/templates';
import { toast } from 'sonner';
import * as d3 from 'd3';
import { Badge } from '@/components/ui/badge';
import { SidebarTrigger } from '@/components/ui/sidebar';

const initialNodes: Node[] = [];
const initialEdges: Edge[] = [];

interface HistoryState {
  nodes: Node[];
  edges: Edge[];
}

const Editor = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams] = useSearchParams();
  const [nodes, setNodes] = useState<Node[]>(initialNodes);
  const [edges, setEdges] = useState<Edge[]>(initialEdges);
  const [selectedElement, setSelectedElement] = useState<Node | Edge | null>(null);
  const [showImportDialog, setShowImportDialog] = useState(false);
  const [isSketchMode, setIsSketchMode] = useState(false);
  const [backgroundColor, setBackgroundColor] = useState('hsl(0, 0%, 99%)');
  const [selectedPalette, setSelectedPalette] = useState('default');
  const [defaultNodeShape, setDefaultNodeShape] = useState('circle');
  const [defaultEdgeType, setDefaultEdgeType] = useState<'straight' | 'smoothstep' | 'step'>('straight');
  const [mapTitle, setMapTitle] = useState('Untitled Map');
  const [showAIChat, setShowAIChat] = useState(false);
  const templateType = searchParams.get('template') as TemplateType;
  
  // Handle imported data from Explorer Mode
  const importedData = location.state as {
    importedFrom?: string;
    sourcePersonName?: string;
    nodes?: Node[];
    edges?: Edge[];
  } | null;
  
  // History management for undo/redo - consolidated state
  const [historyState, setHistoryState] = useState({
    history: [{ nodes: [], edges: [] }] as HistoryState[],
    index: 0,
  });
  const canvasRef = useRef<HTMLDivElement>(null);
  const isUndoRedoAction = useRef(false);
  const isModifyingElements = useRef(false);
  const lastSavedStateRef = useRef<HistoryState>({ nodes: [], edges: [] });
  const historySaveTimeout = useRef<number | null>(null);
  const templateLoadedRef = useRef(false);

  // Color palettes
  const paletteColors: Record<string, string[]> = {
    default: [
      'hsl(182, 42%, 50%)',
      'hsl(195, 45%, 52%)',
      'hsl(355, 45%, 50%)',
      'hsl(30, 35%, 55%)',
      'hsl(85, 35%, 58%)',
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

  // Handle imported data from Explorer Mode
  useEffect(() => {
    if (importedData?.nodes && importedData?.edges && !templateLoadedRef.current) {
      console.log('[IMPORT] Loading imported data from Explorer Mode');
      setNodes(importedData.nodes);
      setEdges(importedData.edges);
      setMapTitle(`${importedData.sourcePersonName} Network`);
      templateLoadedRef.current = true;
      toast.success('Network imported from Explorer Mode');
      // Clear location state
      window.history.replaceState({}, document.title);
    }
  }, [importedData]);

  // Load template if specified in URL, otherwise show import dialog
  useEffect(() => {
    if (templateType && !templateLoadedRef.current && !importedData) {
      const template = getTemplate(templateType);
      if (template) {
        console.log('[TEMPLATE] Loading template once:', templateType);
        setNodes(template.nodes);
        setEdges(template.edges);
        templateLoadedRef.current = true;
      }
    } else if (!templateType && nodes.length === 0 && !templateLoadedRef.current) {
      setShowImportDialog(true);
    }
  }, [templateType]);

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
    console.log('[ADD NODE] Starting...');
    isModifyingElements.current = true;
    
    setNodes(currentNodes => {
      const colors = [
        { bg: 'hsl(182, 42%, 50%)', border: 'hsl(182, 40%, 63%)' },
        { bg: 'hsl(195, 45%, 52%)', border: 'hsl(195, 50%, 68%)' },
        { bg: 'hsl(355, 45%, 50%)', border: 'hsl(355, 50%, 65%)' },
        { bg: 'hsl(30, 35%, 55%)', border: 'hsl(30, 40%, 68%)' },
        { bg: 'hsl(85, 35%, 58%)', border: 'hsl(85, 40%, 70%)' },
      ];
      const color = colors[currentNodes.length % colors.length];
      
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
          label: `Node ${currentNodes.length + 1}`,
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
      
      const updatedNodes = [...currentNodes, newNode];
      console.log('[ADD NODE] New nodes length:', updatedNodes.length);
      return updatedNodes;
    });
    
    toast.success('Node added');
  }, [defaultNodeShape]);

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
      console.log('[UPDATE EDGE]', edgeId, updates);
      setEdges((eds) =>
        eds.map((edge) => {
          if (edge.id !== edgeId) return edge;
          
          // Merge updates properly, handling nested objects
          const updatedEdge = {
            ...edge,
            ...updates,
            style: {
              ...edge.style,
              ...updates.style,
            },
          };
          
          console.log('[UPDATE EDGE] Updated edge:', updatedEdge);
          return updatedEdge;
        })
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
      console.log('[DELETE ELEMENT] Starting for:', elementId);
      isModifyingElements.current = true;
      
      // Check what type of element we're deleting
      const isNode = nodes.some(node => node.id === elementId);
      const isEdge = edges.some(edge => edge.id === elementId);
      
      if (isNode) {
        console.log('[DELETE ELEMENT] Deleting node');
        // Delete node and its connected edges in separate updates
        setNodes(currentNodes => currentNodes.filter(node => node.id !== elementId));
        setEdges(currentEdges => 
          currentEdges.filter(edge => edge.source !== elementId && edge.target !== elementId)
        );
        setSelectedElement(null);
      } else if (isEdge) {
        console.log('[DELETE ELEMENT] Deleting edge');
        setEdges(currentEdges => currentEdges.filter(edge => edge.id !== elementId));
        setSelectedElement(null);
      }
    },
    [nodes, edges]
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
    (edgeType: 'straight' | 'smoothstep' | 'step') => {
      setEdges((eds) =>
        eds.map((edge) => ({
          ...edge,
          type: edgeType,
        }))
      );

      setDefaultEdgeType(edgeType);
      const displayNames = { straight: 'straight', smoothstep: 'curved', step: 'step' };
      toast.success(`Applied ${displayNames[edgeType]} edges`);
    },
    []
  );

  // Save to history when nodes or edges change (but not during undo/redo or element modifications)
  // Debounced to prevent cascading renders
  useEffect(() => {
    // ALWAYS clear any pending timeout first to prevent stale data saves
    if (historySaveTimeout.current !== null) {
      window.clearTimeout(historySaveTimeout.current);
      historySaveTimeout.current = null;
    }
    
    // Skip if this is an undo/redo action
    if (isUndoRedoAction.current) {
      console.log('[HISTORY] Skipping save - undo/redo');
      isUndoRedoAction.current = false;
      return;
    }
    
    // Skip if we're currently modifying elements (don't reset flag yet)
    if (isModifyingElements.current) {
      console.log('[HISTORY] Skipping save - modifying elements');
      return;
    }
    
    // Debounce history saving to after render cycle completes
    historySaveTimeout.current = window.setTimeout(() => {
      console.log('[HISTORY] Timeout fired - checking state');
      if (nodes.length > 0 || edges.length > 0) {
        const newState = { nodes: [...nodes], edges: [...edges] };
        const lastSaved = lastSavedStateRef.current;
        
        // Fast comparison: check array lengths first
        if (newState.nodes.length === lastSaved.nodes.length && 
            newState.edges.length === lastSaved.edges.length) {
          // Then check IDs
          const newNodeIds = newState.nodes.map(n => n.id).sort().join(',');
          const lastNodeIds = lastSaved.nodes.map(n => n.id).sort().join(',');
          const newEdgeIds = newState.edges.map(e => e.id).sort().join(',');
          const lastEdgeIds = lastSaved.edges.map(e => e.id).sort().join(',');
          
          // Don't add if it's the same as last saved state
          if (newNodeIds === lastNodeIds && newEdgeIds === lastEdgeIds) {
            console.log('[HISTORY] State unchanged - not saving');
            isModifyingElements.current = false;
            return;
          }
        }
        
        console.log('[HISTORY] Saving new state - nodes:', newState.nodes.length, 'edges:', newState.edges.length);
        
        // Update history state in one atomic update
        setHistoryState(prev => {
          const newHistory = prev.history.slice(0, prev.index + 1);
          newHistory.push(newState);
          // Keep history limited to 50 states
          if (newHistory.length > 50) newHistory.shift();
          
          return {
            history: newHistory,
            index: Math.min(prev.index + 1, 49),
          };
        });
        
        // Save this state as the last saved state
        lastSavedStateRef.current = newState;
        
        // Reset the modification flag after saving
        isModifyingElements.current = false;
      }
    }, 200); // Increased from 50ms to 200ms
    
    // Cleanup timeout on unmount
    return () => {
      if (historySaveTimeout.current !== null) {
        window.clearTimeout(historySaveTimeout.current);
      }
    };
  }, [nodes, edges]);

  const handleUndo = useCallback(() => {
    if (historyState.index > 0) {
      isUndoRedoAction.current = true;
      const newIndex = historyState.index - 1;
      const state = historyState.history[newIndex];
      setNodes(state.nodes);
      setEdges(state.edges);
      setHistoryState(prev => ({ ...prev, index: newIndex }));
      toast.success('Undo');
    }
  }, [historyState]);

  const handleRedo = useCallback(() => {
    if (historyState.index < historyState.history.length - 1) {
      isUndoRedoAction.current = true;
      const newIndex = historyState.index + 1;
      const state = historyState.history[newIndex];
      setNodes(state.nodes);
      setEdges(state.edges);
      setHistoryState(prev => ({ ...prev, index: newIndex }));
      toast.success('Redo');
    }
  }, [historyState]);

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
          <SidebarTrigger />
          <div className="h-6 w-px bg-border" />
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
          
          {/* Builder Mode Badge */}
          <Badge variant="secondary" className="gap-2 bg-primary/10 text-primary border-primary/20">
            <BadgeIcon className="w-3 h-3" />
            Builder Mode
            {importedData?.importedFrom === 'explorer' && (
              <span className="text-xs opacity-75">
                (from {importedData.sourcePersonName})
              </span>
            )}
          </Badge>
          
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
            disabled={historyState.index <= 0}
            className="gap-2"
          >
            <Undo className="w-4 h-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleRedo}
            disabled={historyState.index >= historyState.history.length - 1}
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
            canUndo={historyState.index > 0}
            canRedo={historyState.index < historyState.history.length - 1}
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
        {/* Left Sidebar - Only show when AI chat is closed */}
        {selectedElement && !showAIChat && (
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
          
          {/* Node Editor Overlay - Show when AI chat is open AND element is selected */}
          {showAIChat && selectedElement && (
            <NodeEditorOverlay
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
        </div>

        {/* AI Chat - Right pane */}
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
