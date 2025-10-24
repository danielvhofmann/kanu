import { Node, Edge, MarkerType } from 'reactflow';

export type TemplateType = 'stakeholder' | 'systems' | 'network' | 'strategic' | null;

export interface Template {
  id: TemplateType;
  name: string;
  description: string;
  nodes: Node[];
  edges: Edge[];
}

// Muted, sophisticated color palette
const nodeColors = {
  sage: { bg: 'hsl(168, 38%, 52%)', border: 'hsl(168, 35%, 65%)' },
  yellow: { bg: 'hsl(45, 95%, 60%)', border: 'hsl(45, 95%, 70%)' },
  orange: { bg: 'hsl(16, 85%, 60%)', border: 'hsl(16, 90%, 70%)' },
  teal: { bg: 'hsl(195, 45%, 52%)', border: 'hsl(195, 50%, 68%)' },
  burgundy: { bg: 'hsl(355, 45%, 50%)', border: 'hsl(355, 50%, 65%)' },
  brown: { bg: 'hsl(30, 35%, 55%)', border: 'hsl(30, 40%, 68%)' },
  sage2: { bg: 'hsl(85, 35%, 58%)', border: 'hsl(85, 40%, 70%)' },
  slate: { bg: 'hsl(210, 25%, 62%)', border: 'hsl(210, 30%, 75%)' },
  lightTeal: { bg: 'hsl(195, 50%, 68%)', border: 'hsl(195, 55%, 80%)' },
  lightBurgundy: { bg: 'hsl(355, 50%, 65%)', border: 'hsl(355, 55%, 78%)' },
  gray: { bg: 'hsl(210, 15%, 70%)', border: 'hsl(210, 20%, 82%)' },
};

const createCircularNode = (
  id: string,
  x: number,
  y: number,
  label: string,
  color: keyof typeof nodeColors,
  size: number = 90
): Node => ({
  id,
  type: 'default',
  position: { x, y },
  data: { label },
  style: {
    background: nodeColors[color].bg,
    color: 'white',
    border: `2px solid ${nodeColors[color].border}`,
    borderRadius: '50%',
    padding: '0',
    fontSize: size > 100 ? '13px' : '12px',
    fontWeight: '400',
    width: `${size}px`,
    height: `${size}px`,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    textAlign: 'center',
    boxShadow: `0 3px 12px ${nodeColors[color].bg}33`,
  },
});

const stakeholderTemplate: Template = {
  id: 'stakeholder',
  name: 'Stakeholder Mapping',
  description: 'Circular cluster layout showing influence networks with interconnected groups',
  nodes: [
    // Central cluster - core stakeholders (burgundy/red)
    createCircularNode('core1', 380, 200, 'CEO', 'burgundy', 100),
    createCircularNode('core2', 480, 180, 'Board', 'burgundy', 85),
    createCircularNode('core3', 450, 280, 'CFO', 'burgundy', 85),
    
    // Teal cluster - external stakeholders
    createCircularNode('ext1', 200, 150, 'Investors', 'teal', 95),
    createCircularNode('ext2', 150, 250, 'Partners', 'teal', 80),
    createCircularNode('ext3', 250, 280, 'Advisors', 'lightTeal', 70),
    createCircularNode('ext4', 180, 340, 'Consultants', 'lightTeal', 65),
    
    // Brown cluster - internal teams
    createCircularNode('int1', 600, 150, 'Engineering', 'brown', 90),
    createCircularNode('int2', 680, 220, 'Product', 'brown', 80),
    createCircularNode('int3', 650, 310, 'Marketing', 'brown', 75),
    
    // Gray cluster - supporting stakeholders
    createCircularNode('sup1', 350, 420, 'Customers', 'slate', 85),
    createCircularNode('sup2', 480, 400, 'Suppliers', 'gray', 70),
    createCircularNode('sup3', 550, 460, 'Community', 'gray', 65),
  ],
  edges: [
    // Core connections (strong, animated)
    { id: 'e1', source: 'core1', target: 'core2', type: 'smoothstep', animated: true, style: { stroke: nodeColors.burgundy.bg, strokeWidth: 2.5 }, markerEnd: { type: MarkerType.ArrowClosed, color: nodeColors.burgundy.bg } },
    { id: 'e2', source: 'core1', target: 'core3', type: 'smoothstep', animated: true, style: { stroke: nodeColors.burgundy.bg, strokeWidth: 2.5 }, markerEnd: { type: MarkerType.ArrowClosed, color: nodeColors.burgundy.bg } },
    
    // External to core
    { id: 'e3', source: 'ext1', target: 'core1', type: 'smoothstep', style: { stroke: nodeColors.teal.bg, strokeWidth: 2 }, markerEnd: { type: MarkerType.ArrowClosed, color: nodeColors.teal.bg } },
    { id: 'e4', source: 'ext2', target: 'core2', type: 'smoothstep', style: { stroke: nodeColors.teal.bg, strokeWidth: 1.5 } },
    { id: 'e5', source: 'ext3', target: 'ext1', type: 'smoothstep', style: { stroke: nodeColors.lightTeal.bg, strokeWidth: 1.5 } },
    { id: 'e6', source: 'ext4', target: 'ext2', type: 'smoothstep', style: { stroke: nodeColors.lightTeal.bg, strokeWidth: 1 } },
    
    // Internal to core
    { id: 'e7', source: 'core1', target: 'int1', type: 'smoothstep', animated: true, style: { stroke: nodeColors.brown.bg, strokeWidth: 2 }, markerEnd: { type: MarkerType.ArrowClosed, color: nodeColors.brown.bg } },
    { id: 'e8', source: 'int1', target: 'int2', type: 'smoothstep', style: { stroke: nodeColors.brown.bg, strokeWidth: 1.5 } },
    { id: 'e9', source: 'int2', target: 'int3', type: 'smoothstep', style: { stroke: nodeColors.brown.bg, strokeWidth: 1.5 } },
    
    // Supporting connections
    { id: 'e10', source: 'core3', target: 'sup1', type: 'smoothstep', style: { stroke: nodeColors.slate.bg, strokeWidth: 1.5 } },
    { id: 'e11', source: 'int3', target: 'sup1', type: 'smoothstep', style: { stroke: nodeColors.gray.bg, strokeWidth: 1 } },
    { id: 'e12', source: 'sup1', target: 'sup2', type: 'smoothstep', style: { stroke: nodeColors.gray.bg, strokeWidth: 1 } },
    { id: 'e13', source: 'sup2', target: 'sup3', type: 'smoothstep', style: { stroke: nodeColors.gray.bg, strokeWidth: 1 } },
  ],
};

const systemsTemplate: Template = {
  id: 'systems',
  name: 'Systems Thinking',
  description: 'Causal loop diagram with reinforcing and balancing feedback loops',
  nodes: [
    createCircularNode('1', 250, 180, 'Product\nQuality', 'sage', 105),
    createCircularNode('2', 550, 180, 'Customer\nSatisfaction', 'teal', 105),
    createCircularNode('3', 550, 380, 'Revenue', 'burgundy', 100),
    createCircularNode('4', 250, 380, 'R&D\nInvestment', 'brown', 100),
    createCircularNode('5', 400, 100, 'Brand\nReputation', 'slate', 85),
    createCircularNode('6', 400, 460, 'Market\nShare', 'lightBurgundy', 85),
  ],
  edges: [
    // Main reinforcing loop (R1)
    { id: 'e1', source: '1', target: '2', type: 'smoothstep', animated: true, label: '+', style: { stroke: nodeColors.teal.bg, strokeWidth: 2.5 }, markerEnd: { type: MarkerType.ArrowClosed, color: nodeColors.teal.bg } },
    { id: 'e2', source: '2', target: '3', type: 'smoothstep', animated: true, label: '+', style: { stroke: nodeColors.burgundy.bg, strokeWidth: 2.5 }, markerEnd: { type: MarkerType.ArrowClosed, color: nodeColors.burgundy.bg } },
    { id: 'e3', source: '3', target: '4', type: 'smoothstep', animated: true, label: '+', style: { stroke: nodeColors.brown.bg, strokeWidth: 2.5 }, markerEnd: { type: MarkerType.ArrowClosed, color: nodeColors.brown.bg } },
    { id: 'e4', source: '4', target: '1', type: 'smoothstep', animated: true, label: '+', style: { stroke: nodeColors.sage.bg, strokeWidth: 2.5 }, markerEnd: { type: MarkerType.ArrowClosed, color: nodeColors.sage.bg } },
    
    // Secondary connections
    { id: 'e5', source: '2', target: '5', type: 'smoothstep', label: '+', style: { stroke: nodeColors.slate.bg, strokeWidth: 2 }, markerEnd: { type: MarkerType.ArrowClosed, color: nodeColors.slate.bg } },
    { id: 'e6', source: '5', target: '1', type: 'smoothstep', label: '+', style: { stroke: nodeColors.slate.bg, strokeWidth: 2 }, markerEnd: { type: MarkerType.ArrowClosed, color: nodeColors.slate.bg } },
    { id: 'e7', source: '3', target: '6', type: 'smoothstep', label: '+', style: { stroke: nodeColors.lightBurgundy.bg, strokeWidth: 2 }, markerEnd: { type: MarkerType.ArrowClosed, color: nodeColors.lightBurgundy.bg } },
    { id: 'e8', source: '6', target: '3', type: 'smoothstep', label: '+', style: { stroke: nodeColors.lightBurgundy.bg, strokeWidth: 2 }, markerEnd: { type: MarkerType.ArrowClosed, color: nodeColors.lightBurgundy.bg } },
  ],
};

const networkTemplate: Template = {
  id: 'network',
  name: 'Network Analysis',
  description: 'Social network with community clusters and varied node sizes',
  nodes: [
    // Cluster 1 - Teal community (top left)
    createCircularNode('a1', 150, 120, 'Alice', 'teal', 95),
    createCircularNode('a2', 220, 80, 'Bob', 'lightTeal', 75),
    createCircularNode('a3', 280, 140, 'Carol', 'lightTeal', 70),
    createCircularNode('a4', 180, 180, 'David', 'teal', 65),
    createCircularNode('a5', 100, 200, 'Eve', 'lightTeal', 60),
    
    // Cluster 2 - Burgundy community (top right)
    createCircularNode('b1', 550, 100, 'Frank', 'burgundy', 90),
    createCircularNode('b2', 620, 160, 'Grace', 'lightBurgundy', 75),
    createCircularNode('b3', 680, 100, 'Henry', 'lightBurgundy', 70),
    createCircularNode('b4', 600, 220, 'Iris', 'burgundy', 65),
    
    // Cluster 3 - Brown community (bottom)
    createCircularNode('c1', 350, 380, 'Jack', 'brown', 85),
    createCircularNode('c2', 450, 380, 'Kate', 'brown', 80),
    createCircularNode('c3', 280, 440, 'Leo', 'brown', 70),
    createCircularNode('c4', 520, 440, 'Maya', 'brown', 70),
    
    // Bridge nodes
    createCircularNode('br1', 400, 220, 'Noah', 'sage', 80),
    createCircularNode('br2', 250, 300, 'Olivia', 'slate', 75),
  ],
  edges: [
    // Cluster 1 connections
    { id: 'e1', source: 'a1', target: 'a2', type: 'straight', style: { stroke: nodeColors.teal.bg, strokeWidth: 2 } },
    { id: 'e2', source: 'a1', target: 'a3', type: 'straight', style: { stroke: nodeColors.teal.bg, strokeWidth: 2 } },
    { id: 'e3', source: 'a1', target: 'a4', type: 'straight', style: { stroke: nodeColors.teal.bg, strokeWidth: 1.5 } },
    { id: 'e4', source: 'a2', target: 'a3', type: 'straight', style: { stroke: nodeColors.lightTeal.bg, strokeWidth: 1 } },
    { id: 'e5', source: 'a4', target: 'a5', type: 'straight', style: { stroke: nodeColors.lightTeal.bg, strokeWidth: 1 } },
    
    // Cluster 2 connections
    { id: 'e6', source: 'b1', target: 'b2', type: 'straight', style: { stroke: nodeColors.burgundy.bg, strokeWidth: 2 } },
    { id: 'e7', source: 'b1', target: 'b3', type: 'straight', style: { stroke: nodeColors.burgundy.bg, strokeWidth: 2 } },
    { id: 'e8', source: 'b2', target: 'b4', type: 'straight', style: { stroke: nodeColors.lightBurgundy.bg, strokeWidth: 1.5 } },
    { id: 'e9', source: 'b3', target: 'b2', type: 'straight', style: { stroke: nodeColors.lightBurgundy.bg, strokeWidth: 1 } },
    
    // Cluster 3 connections
    { id: 'e10', source: 'c1', target: 'c2', type: 'straight', style: { stroke: nodeColors.brown.bg, strokeWidth: 2 } },
    { id: 'e11', source: 'c1', target: 'c3', type: 'straight', style: { stroke: nodeColors.brown.bg, strokeWidth: 1.5 } },
    { id: 'e12', source: 'c2', target: 'c4', type: 'straight', style: { stroke: nodeColors.brown.bg, strokeWidth: 1.5 } },
    
    // Bridge connections
    { id: 'e13', source: 'a1', target: 'br1', type: 'straight', style: { stroke: nodeColors.sage.bg, strokeWidth: 1.5 } },
    { id: 'e14', source: 'b1', target: 'br1', type: 'straight', style: { stroke: nodeColors.sage.bg, strokeWidth: 1.5 } },
    { id: 'e15', source: 'br1', target: 'c1', type: 'straight', style: { stroke: nodeColors.sage.bg, strokeWidth: 1.5 } },
    { id: 'e16', source: 'a4', target: 'br2', type: 'straight', style: { stroke: nodeColors.slate.bg, strokeWidth: 1.5 } },
    { id: 'e17', source: 'br2', target: 'c1', type: 'straight', style: { stroke: nodeColors.slate.bg, strokeWidth: 1.5 } },
  ],
};

const strategicTemplate: Template = {
  id: 'strategic',
  name: 'Strategic Planning',
  description: 'Hierarchical flow from vision to goals and initiatives',
  nodes: [
    // Vision (top - burgundy)
    {
      id: 'vision',
      type: 'default',
      position: { x: 350, y: 60 },
      data: { label: 'Strategic Vision 2025' },
      style: {
        background: nodeColors.burgundy.bg,
        color: 'white',
        border: `3px solid ${nodeColors.burgundy.border}`,
        borderRadius: '16px',
        padding: '20px 32px',
        fontSize: '15px',
        fontWeight: '500',
        boxShadow: `0 4px 16px ${nodeColors.burgundy.bg}40`,
      },
    },
    
    // Goals (middle - teal and brown)
    {
      id: 'goal1',
      type: 'default',
      position: { x: 180, y: 200 },
      data: { label: 'Market Leadership' },
      style: {
        background: nodeColors.teal.bg,
        color: 'white',
        border: `2px solid ${nodeColors.teal.border}`,
        borderRadius: '14px',
        padding: '16px 26px',
        fontSize: '14px',
        fontWeight: '400',
        boxShadow: `0 3px 12px ${nodeColors.teal.bg}30`,
      },
    },
    {
      id: 'goal2',
      type: 'default',
      position: { x: 450, y: 200 },
      data: { label: 'Product Excellence' },
      style: {
        background: nodeColors.brown.bg,
        color: 'white',
        border: `2px solid ${nodeColors.brown.border}`,
        borderRadius: '14px',
        padding: '16px 26px',
        fontSize: '14px',
        fontWeight: '400',
        boxShadow: `0 3px 12px ${nodeColors.brown.bg}30`,
      },
    },
    
    // Initiatives (bottom - sage and slate)
    createCircularNode('init1', 100, 350, 'Sales\nExpansion', 'sage', 85),
    createCircularNode('init2', 220, 350, 'Brand\nAwareness', 'lightTeal', 80),
    createCircularNode('init3', 380, 350, 'Innovation\nLab', 'brown', 85),
    createCircularNode('init4', 520, 350, 'Quality\nAssurance', 'slate', 80),
    createCircularNode('init5', 640, 350, 'Customer\nSuccess', 'gray', 75),
  ],
  edges: [
    // Vision to goals
    { id: 'e1', source: 'vision', target: 'goal1', type: 'straight', animated: true, style: { stroke: nodeColors.teal.bg, strokeWidth: 2.5 }, markerEnd: { type: MarkerType.ArrowClosed, color: nodeColors.teal.bg } },
    { id: 'e2', source: 'vision', target: 'goal2', type: 'straight', animated: true, style: { stroke: nodeColors.brown.bg, strokeWidth: 2.5 }, markerEnd: { type: MarkerType.ArrowClosed, color: nodeColors.brown.bg } },
    
    // Goals to initiatives
    { id: 'e3', source: 'goal1', target: 'init1', type: 'straight', style: { stroke: nodeColors.sage.bg, strokeWidth: 2 }, markerEnd: { type: MarkerType.ArrowClosed, color: nodeColors.sage.bg } },
    { id: 'e4', source: 'goal1', target: 'init2', type: 'straight', style: { stroke: nodeColors.lightTeal.bg, strokeWidth: 2 }, markerEnd: { type: MarkerType.ArrowClosed, color: nodeColors.lightTeal.bg } },
    { id: 'e5', source: 'goal2', target: 'init3', type: 'straight', style: { stroke: nodeColors.brown.bg, strokeWidth: 2 }, markerEnd: { type: MarkerType.ArrowClosed, color: nodeColors.brown.bg } },
    { id: 'e6', source: 'goal2', target: 'init4', type: 'straight', style: { stroke: nodeColors.slate.bg, strokeWidth: 2 }, markerEnd: { type: MarkerType.ArrowClosed, color: nodeColors.slate.bg } },
    { id: 'e7', source: 'goal2', target: 'init5', type: 'straight', style: { stroke: nodeColors.gray.bg, strokeWidth: 1.5 }, markerEnd: { type: MarkerType.ArrowClosed, color: nodeColors.gray.bg } },
  ],
};

export const templates: Record<string, Template> = {
  stakeholder: stakeholderTemplate,
  systems: systemsTemplate,
  network: networkTemplate,
  strategic: strategicTemplate,
};

export const getTemplate = (type: TemplateType): Template | null => {
  if (!type) return null;
  return templates[type] || null;
};
