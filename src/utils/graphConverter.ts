import { Node, Edge } from 'reactflow';

// These interfaces match the KnowledgeGraph component's types
interface ExplorerNode {
  id: string;
  name: string;
  category: string;
  profession?: string;
  val: number;
  color?: string;
  bio?: string;
  birth?: string;
  death?: string;
  imageUrl?: string;
  wikipediaUrl?: string;
  importanceScore?: number;
  x?: number;
  y?: number;
}

interface ExplorerLink {
  source: string | ExplorerNode;
  target: string | ExplorerNode;
  relationship: string;
  type?: string;
  year?: number;
  startYear?: number;
  endYear?: number;
}

interface ExplorerGraphData {
  nodes: ExplorerNode[];
  links: ExplorerLink[];
}

/**
 * Convert Explorer Mode graph data to Builder Mode (ReactFlow) format
 */
export const convertExplorerToBuilder = (
  explorerData: ExplorerGraphData
): { nodes: Node[]; edges: Edge[] } => {
  // Convert nodes
  const nodes: Node[] = explorerData.nodes.map((node) => {
    const size = Math.max(60, Math.min(120, node.val * 10)); // Scale size appropriately
    const color = node.color || 'hsl(195, 45%, 52%)';
    
    return {
      id: node.id,
      type: 'default',
      position: {
        x: node.x ? node.x * 2 : Math.random() * 600 + 100, // Scale up positions
        y: node.y ? node.y * 2 : Math.random() * 400 + 100,
      },
      data: {
        label: node.name,
        tags: [node.category],
        shape: 'circle',
      },
      style: {
        background: color,
        color: 'white',
        border: `2px solid ${adjustColorBrightness(color, 20)}`,
        borderRadius: '50%',
        padding: '0',
        fontSize: '12px',
        fontWeight: '400',
        width: `${size}px`,
        height: `${size}px`,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        textAlign: 'center',
        boxShadow: `0 3px 12px ${color}33`,
      },
    };
  });

  // Convert links to edges
  const edges: Edge[] = explorerData.links.map((link, index) => {
    // Handle source/target being either string or object
    const sourceId = typeof link.source === 'string' ? link.source : link.source.id;
    const targetId = typeof link.target === 'string' ? link.target : link.target.id;
    
    return {
      id: `edge-${index}`,
      source: sourceId,
      target: targetId,
      type: 'smoothstep',
      animated: false,
      style: {
        stroke: 'hsl(var(--primary))',
        strokeWidth: 2,
      },
      markerEnd: { type: 'arrowClosed' as any },
      label: link.relationship || (link.year ? `${link.year}` : ''),
      labelStyle: {
        fontSize: '11px',
        fill: 'hsl(var(--muted-foreground))',
      },
      labelBgStyle: {
        fill: 'hsl(var(--background))',
        fillOpacity: 0.8,
      },
    };
  });

  return { nodes, edges };
};

/**
 * Adjust color brightness (helper function)
 */
function adjustColorBrightness(color: string, percent: number): string {
  // If color is in HSL format
  if (color.startsWith('hsl')) {
    const match = color.match(/hsl\((\d+),\s*(\d+)%,\s*(\d+)%\)/);
    if (match) {
      const [, h, s, l] = match;
      const newL = Math.min(100, Math.max(0, parseInt(l) + percent));
      return `hsl(${h}, ${s}%, ${newL}%)`;
    }
  }
  
  // For other formats, return as-is
  return color;
}
