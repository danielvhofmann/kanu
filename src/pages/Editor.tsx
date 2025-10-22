import { useState, useCallback, useEffect } from 'react';
import ReactFlow, {
  Node,
  Edge,
  Controls,
  Background,
  Connection,
  addEdge,
  useNodesState,
  useEdgesState,
  BackgroundVariant,
  MarkerType,
} from 'reactflow';
import 'reactflow/dist/style.css';
import { EditorToolbar } from '@/components/editor/EditorToolbar';
import { EditorSidebar } from '@/components/editor/EditorSidebar';
import { ImportDialog } from '@/components/editor/ImportDialog';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { getTemplate, type TemplateType } from '@/lib/templates';

const initialNodes: Node[] = [];
const initialEdges: Edge[] = [];

const Editor = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);
  const [selectedElement, setSelectedElement] = useState<Node | null>(null);
  const [showImportDialog, setShowImportDialog] = useState(false);

  // Load template if specified in URL, otherwise show import dialog
  useEffect(() => {
    const templateType = searchParams.get('template') as TemplateType;
    if (templateType) {
      const template = getTemplate(templateType);
      if (template) {
        setNodes(template.nodes);
        setEdges(template.edges);
      }
    } else if (nodes.length === 0) {
      // Show import dialog if no nodes and no template
      setShowImportDialog(true);
    }
  }, [searchParams, setNodes, setEdges, nodes.length]);

  const onConnect = useCallback(
    (connection: Connection) => {
      const newEdge = {
        ...connection,
        type: 'smoothstep',
        animated: true,
        style: { stroke: 'hsl(var(--primary))', strokeWidth: 2 },
        markerEnd: {
          type: MarkerType.ArrowClosed,
          color: 'hsl(var(--primary))',
        },
      };
      setEdges((eds) => addEdge(newEdge, eds));
    },
    [setEdges]
  );

  const addNode = useCallback(() => {
    const colors = ['primary', 'secondary', 'accent', 'primary-light'];
    const color = colors[nodes.length % colors.length];
    
    const newNode: Node = {
      id: `${Date.now()}`,
      type: 'default',
      position: { x: Math.random() * 500 + 100, y: Math.random() * 300 + 100 },
      data: { label: `Node ${nodes.length + 1}` },
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
    };
    setNodes((nds) => [...nds, newNode]);
  }, [nodes.length, setNodes]);

  const handleImport = useCallback((importedNodes: Node[], importedEdges: Edge[]) => {
    setNodes(importedNodes);
    setEdges(importedEdges);
  }, [setNodes, setEdges]);

  const onNodeClick = useCallback((_: React.MouseEvent, node: Node) => {
    setSelectedElement(node);
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
    [setNodes]
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
    [setNodes]
  );

  const deleteNode = useCallback(
    (nodeId: string) => {
      setNodes((nds) => nds.filter((node) => node.id !== nodeId));
      setEdges((eds) =>
        eds.filter((edge) => edge.source !== nodeId && edge.target !== nodeId)
      );
      setSelectedElement(null);
    },
    [setNodes, setEdges]
  );

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
          <h1 className="text-lg font-light">Untitled Map</h1>
        </div>
        <EditorToolbar onAddNode={addNode} onImport={() => setShowImportDialog(true)} />
      </div>

      {/* Main editor area */}
      <div className="flex-1 flex relative">
        {/* Canvas */}
        <div className="flex-1 relative">
          <ReactFlow
            nodes={nodes}
            edges={edges}
            onNodesChange={onNodesChange}
            onEdgesChange={onEdgesChange}
            onConnect={onConnect}
            onNodeClick={onNodeClick}
            fitView
            className="bg-gradient-subtle"
          >
            <Background
              variant={BackgroundVariant.Dots}
              gap={24}
              size={1}
              color="hsl(var(--border))"
            />
            <Controls
              className="bg-card border border-border/50 rounded-lg shadow-md"
            />
          </ReactFlow>
        </div>

        {/* Sidebar */}
        {selectedElement && (
          <EditorSidebar
            element={selectedElement}
            onClose={() => setSelectedElement(null)}
            onUpdateLabel={updateNodeLabel}
            onUpdateColor={updateNodeColor}
            onDelete={deleteNode}
          />
        )}
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
