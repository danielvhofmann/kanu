import { useEffect, useRef } from 'react';
import * as d3 from 'd3';
import { Node, Edge } from 'reactflow';

interface NetworkCanvasProps {
  nodes: Node[];
  edges: Edge[];
  onNodesChange: (nodes: Node[]) => void;
  onEdgesChange: (edges: Edge[]) => void;
  selectedNodeId: string | null;
  selectedEdgeId: string | null;
  onNodeClick: (node: Node) => void;
  onEdgeClick: (edge: Edge) => void;
  isSketchMode: boolean;
  backgroundColor?: string;
}

export const NetworkCanvas = ({
  nodes,
  edges,
  onNodesChange,
  onEdgesChange,
  selectedNodeId,
  selectedEdgeId,
  onNodeClick,
  onEdgeClick,
  isSketchMode,
  backgroundColor = 'hsl(var(--background))',
}: NetworkCanvasProps) => {
  const svgRef = useRef<SVGSVGElement>(null);
  const simulationRef = useRef<d3.Simulation<any, any> | null>(null);
  const nodesDataRef = useRef<any[]>([]);
  const dragLineRef = useRef<{ sourceId: string; x1: number; y1: number } | null>(null);

  // Initialize simulation once
  useEffect(() => {
    if (!svgRef.current) return;

    const svg = d3.select(svgRef.current);
    const width = svgRef.current.clientWidth;
    const height = svgRef.current.clientHeight;

    // Clear existing content
    svg.selectAll('*').remove();

    // Add zoom behavior
    const g = svg.append('g').attr('class', 'canvas-group');
    
    const zoom = d3.zoom<SVGSVGElement, unknown>()
      .scaleExtent([0.1, 4])
      .on('zoom', (event) => {
        g.attr('transform', event.transform);
      });

    svg.call(zoom);

    // Add grid pattern
    const defs = svg.append('defs');
    const pattern = defs.append('pattern')
      .attr('id', 'grid')
      .attr('width', 20)
      .attr('height', 20)
      .attr('patternUnits', 'userSpaceOnUse');
    
    pattern.append('rect')
      .attr('width', 20)
      .attr('height', 20)
      .attr('fill', 'transparent');
    
    pattern.append('path')
      .attr('d', 'M 20 0 L 0 0 0 20')
      .attr('fill', 'none')
      .attr('stroke', 'hsl(var(--border))')
      .attr('stroke-width', 0.5)
      .attr('opacity', 0.1);

    g.append('rect')
      .attr('width', width * 10)
      .attr('height', height * 10)
      .attr('x', -width * 5)
      .attr('y', -height * 5)
      .attr('fill', 'url(#grid)');

    // Add arrow marker for edges with arrows
    const arrowMarker = defs.append('marker')
      .attr('id', 'arrowhead')
      .attr('viewBox', '0 -5 10 10')
      .attr('refX', 10)
      .attr('refY', 0)
      .attr('markerWidth', 6)
      .attr('markerHeight', 6)
      .attr('orient', 'auto');
    
    arrowMarker.append('path')
      .attr('d', 'M0,-5L10,0L0,5')
      .attr('fill', 'currentColor')
      .style('color', 'inherit');

    // Create groups for edges and nodes
    g.append('g').attr('class', 'edges-group');
    g.append('g').attr('class', 'nodes-group');

    // Initialize force simulation
    const simulation = d3.forceSimulation()
      .force('charge', d3.forceManyBody().strength(-300))
      .force('center', d3.forceCenter(width / 2, height / 2))
      .force('collision', d3.forceCollide().radius(50))
      .force('link', d3.forceLink().id((d: any) => d.id).distance(150));

    simulationRef.current = simulation;

    return () => {
      simulation.stop();
    };
  }, []);

  // Update visualization when data changes
  useEffect(() => {
    if (!svgRef.current || !simulationRef.current) return;

    const svg = d3.select(svgRef.current);
    const g = svg.select<SVGGElement>('g.canvas-group');
    const simulation = simulationRef.current;

    // Prepare node data with positions
    const nodeMap = new Map(nodesDataRef.current.map(n => [n.id, n]));
    const d3Nodes = nodes.map(node => {
      const existing = nodeMap.get(node.id);
      return {
        ...node,
        x: existing?.x ?? node.position.x,
        y: existing?.y ?? node.position.y,
        vx: existing?.vx ?? 0,
        vy: existing?.vy ?? 0,
      };
    });
    nodesDataRef.current = d3Nodes;

    // Prepare edge data
    const d3Links = edges.map(edge => ({
      ...edge,
      source: edge.source,
      target: edge.target,
    }));

    // Update simulation
    simulation.nodes(d3Nodes);
    const linkForce = simulation.force('link') as d3.ForceLink<any, any>;
    if (linkForce) {
      linkForce.links(d3Links);
    }
    simulation.alpha(0.3).restart();

    // Render edges
    const edgesGroup = g.select<SVGGElement>('g.edges-group');
    const edgeSelection = edgesGroup
      .selectAll<SVGPathElement, any>('path.edge')
      .data(d3Links, (d: any) => d.id);

    edgeSelection.exit().remove();

    const edgeEnter = edgeSelection.enter()
      .append('path')
      .attr('class', 'edge')
      .attr('fill', 'none')
      .attr('cursor', 'pointer')
      .on('click', (event, d) => {
        event.stopPropagation();
        onEdgeClick(d as Edge);
      });

    const edgeMerge = edgeEnter.merge(edgeSelection)
      .style('color', (d: any) => 
        d.id === selectedEdgeId ? 'hsl(var(--primary))' : (d.style?.stroke || 'hsl(var(--border))')
      )
      .attr('stroke', (d: any) => 
        d.id === selectedEdgeId ? 'hsl(var(--primary))' : (d.style?.stroke || 'hsl(var(--border))')
      )
      .attr('stroke-width', (d: any) => 
        d.id === selectedEdgeId ? 3 : (d.style?.strokeWidth || 2)
      )
      .attr('stroke-dasharray', (d: any) => d.style?.strokeDasharray || null)
      .attr('opacity', (d: any) => d.id === selectedEdgeId ? 1 : 0.6)
      .attr('marker-end', (d: any) => d.markerEnd ? 'url(#arrowhead)' : null)
      .classed('animated-edge', (d: any) => d.animated || false);

    // Render nodes
    const nodesGroup = g.select<SVGGElement>('g.nodes-group');
    const nodeSelection = nodesGroup
      .selectAll<SVGGElement, any>('g.node')
      .data(d3Nodes, (d: any) => d.id);

    nodeSelection.exit().remove();

    const nodeEnter = nodeSelection.enter()
      .append('g')
      .attr('class', 'node')
      .attr('cursor', isSketchMode ? 'crosshair' : 'grab')
      .on('click', (event, d) => {
        event.stopPropagation();
        onNodeClick(d as Node);
      });

    // Add drag behavior
    const drag = d3.drag<SVGGElement, any>()
      .on('start', function(event, d) {
        if (isSketchMode) {
          dragLineRef.current = {
            sourceId: d.id,
            x1: d.x,
            y1: d.y,
          };
        } else {
          if (!event.active) simulation.alphaTarget(0.3).restart();
          d.fx = d.x;
          d.fy = d.y;
        }
      })
      .on('drag', function(event, d) {
        if (isSketchMode && dragLineRef.current) {
          // Draw temporary line
          g.selectAll('.drag-line').remove();
          g.append('line')
            .attr('class', 'drag-line')
            .attr('x1', dragLineRef.current.x1)
            .attr('y1', dragLineRef.current.y1)
            .attr('x2', event.x)
            .attr('y2', event.y)
            .attr('stroke', 'hsl(var(--primary))')
            .attr('stroke-width', 2)
            .attr('stroke-dasharray', '5,5');
        } else {
          d.fx = event.x;
          d.fy = event.y;
        }
      })
      .on('end', function(event, d) {
        g.selectAll('.drag-line').remove();
        
        if (isSketchMode && dragLineRef.current) {
          // Find target node
          const targetNode = d3Nodes.find(n => {
            if (n.id === d.id) return false;
            const dx = n.x - event.x;
            const dy = n.y - event.y;
            return Math.sqrt(dx * dx + dy * dy) < 50;
          });

          if (targetNode) {
            // Create edge to existing node - match style of existing edges
            const mostCommonEdgeType = edges.length > 0 ? (edges[0].type || 'straight') : 'straight';
            const newEdge: Edge = {
              id: `${dragLineRef.current.sourceId}-${targetNode.id}-${Date.now()}`,
              source: dragLineRef.current.sourceId,
              target: targetNode.id,
              type: mostCommonEdgeType,
              style: { stroke: 'hsl(var(--border))', strokeWidth: 2 },
            };
            onEdgesChange([...edges, newEdge]);
          } else {
            // Create new node and edge - preserve source node color
            const sourceNode = d3Nodes.find(n => n.id === dragLineRef.current?.sourceId);
            const sourceColor = sourceNode?.style?.background || 'hsl(195, 45%, 52%)';
            // Extract border color from border string
            const sourceBorderString = typeof sourceNode?.style?.border === 'string' 
              ? sourceNode.style.border 
              : 'hsl(195, 50%, 68%)';
            const sourceBorder = sourceBorderString.includes('solid') 
              ? sourceBorderString.split('solid')[1]?.trim() || 'hsl(195, 50%, 68%)'
              : 'hsl(195, 50%, 68%)';
            
            const newNode: Node = {
              id: `node-${Date.now()}`,
              type: 'default',
              position: { x: event.x, y: event.y },
              data: { label: `Node ${nodes.length + 1}`, shape: 'circle' },
              style: {
                background: sourceColor,
                color: 'white',
                border: `2px solid ${sourceBorder}`,
                borderRadius: '50%',
                width: '85px',
                height: '85px',
              },
            };
            
            // Match edge style to existing edges
            const mostCommonEdgeType = edges.length > 0 ? (edges[0].type || 'straight') : 'straight';
            const newEdge: Edge = {
              id: `${dragLineRef.current.sourceId}-${newNode.id}`,
              source: dragLineRef.current.sourceId,
              target: newNode.id,
              type: mostCommonEdgeType,
              style: { stroke: 'hsl(var(--border))', strokeWidth: 2 },
            };
            
            console.log('[NETWORK CANVAS] Creating new node and edge in sketch mode');
            const updatedNodes = [...nodes, newNode];
            const updatedEdges = [...edges, newEdge];
            onNodesChange(updatedNodes);
            onEdgesChange(updatedEdges);
          }
          dragLineRef.current = null;
        } else {
          if (!event.active) simulation.alphaTarget(0);
          d.fx = null;
          d.fy = null;
        }
      });

    // Apply drag to new nodes only initially
    nodeEnter.call(drag);

    // Draw node shapes
    nodeEnter.each(function(d: any) {
      const g = d3.select(this);
      const shape = d.data?.shape || 'circle';
      const size = 42.5;
      const fill = d.style?.background || 'hsl(195, 45%, 52%)';
      const stroke = d.style?.border?.split(' ')[2] || 'hsl(195, 50%, 68%)';

      if (shape === 'square') {
        g.append('rect')
          .attr('class', 'node-shape')
          .attr('x', -size)
          .attr('y', -size)
          .attr('width', size * 2)
          .attr('height', size * 2)
          .attr('rx', 8)
          .attr('fill', fill)
          .attr('stroke', stroke)
          .attr('stroke-width', 2);
      } else {
        g.append('circle')
          .attr('class', 'node-shape')
          .attr('r', size)
          .attr('fill', fill)
          .attr('stroke', stroke)
          .attr('stroke-width', 2);
      }

      // Add label
      g.append('text')
        .attr('class', 'node-label')
        .attr('text-anchor', 'middle')
        .attr('dy', '0.35em')
        .attr('fill', d.style?.color || 'white')
        .attr('font-size', '12px')
        .text(d.data.label || '');
    });

    // Update existing nodes - handle shape changes
    const nodeMerge = nodeEnter.merge(nodeSelection);
    
    // Update or recreate shapes when shape type changes
    nodeMerge.each(function(d: any) {
      const g = d3.select(this);
      const currentShape = d.data?.shape || 'circle';
      const existingShape = g.select('.node-shape');
      const shapeElement = existingShape.node() as SVGElement | null;
      const shapeType = shapeElement?.tagName.toLowerCase();
      
      // If shape type changed, remove old shape and create new one
      const needsRecreate = 
        (currentShape === 'circle' && shapeType !== 'circle') ||
        (currentShape === 'square' && shapeType !== 'rect');
      
      if (needsRecreate && shapeElement) {
        existingShape.remove();
        
        const size = 42.5;
        const fill = d.style?.background || 'hsl(195, 45%, 52%)';
        const borderString = typeof d.style?.border === 'string' ? d.style.border : '';
        const stroke = borderString.includes('solid') ? borderString.split('solid')[1]?.trim() || 'hsl(195, 50%, 68%)' : 'hsl(195, 50%, 68%)';
        
        if (currentShape === 'square') {
          g.insert('rect', '.node-label')
            .attr('class', 'node-shape')
            .attr('x', -size)
            .attr('y', -size)
            .attr('width', size * 2)
            .attr('height', size * 2)
            .attr('rx', 8)
            .attr('fill', fill)
            .attr('stroke', stroke)
            .attr('stroke-width', 2);
        } else {
          g.insert('circle', '.node-label')
            .attr('class', 'node-shape')
            .attr('r', size)
            .attr('fill', fill)
            .attr('stroke', stroke)
            .attr('stroke-width', 2);
        }
      }
    });
    
    // Update colors and selection state
    nodeMerge.select('.node-shape')
      .attr('stroke', (d: any) => {
        const borderString = typeof d.style?.border === 'string' ? d.style.border : '';
        const defaultStroke = borderString.includes('solid') ? borderString.split('solid')[1]?.trim() || 'hsl(195, 50%, 68%)' : 'hsl(195, 50%, 68%)';
        return d.id === selectedNodeId ? 'hsl(var(--primary))' : defaultStroke;
      })
      .attr('stroke-width', (d: any) => d.id === selectedNodeId ? 4 : 2)
      .attr('fill', (d: any) => d.style?.background || 'hsl(195, 45%, 52%)');

    nodeMerge.select('.node-label')
      .text((d: any) => d.data.label || '');
    
    // Update cursor and reapply drag to ALL nodes based on sketch mode state
    nodeMerge
      .attr('cursor', isSketchMode ? 'crosshair' : 'grab')
      .call(drag);

    // Update positions on tick
    simulation.on('tick', () => {
      edgeMerge.attr('d', (d: any) => {
        const sourceX = d.source.x;
        const sourceY = d.source.y;
        let targetX = d.target.x;
        let targetY = d.target.y;

        // Calculate arrow stop position at node boundary
        const nodeRadius = 42.5;
        const angle = Math.atan2(targetY - sourceY, targetX - sourceX);
        const adjustedTargetX = targetX - Math.cos(angle) * nodeRadius;
        const adjustedTargetY = targetY - Math.sin(angle) * nodeRadius;

        if (d.type === 'smoothstep') {
          const dx = adjustedTargetX - sourceX;
          const dy = adjustedTargetY - sourceY;
          const dr = Math.sqrt(dx * dx + dy * dy) * 0.7;
          return `M${sourceX},${sourceY}A${dr},${dr} 0 0,1 ${adjustedTargetX},${adjustedTargetY}`;
        } else if (d.type === 'step') {
          const midX = (sourceX + adjustedTargetX) / 2;
          return `M${sourceX},${sourceY}L${midX},${sourceY}L${midX},${adjustedTargetY}L${adjustedTargetX},${adjustedTargetY}`;
        }
        return `M${sourceX},${sourceY}L${adjustedTargetX},${adjustedTargetY}`;
      });

      nodeMerge.attr('transform', (d: any) => `translate(${d.x},${d.y})`);
    });
  }, [nodes, edges, selectedNodeId, selectedEdgeId, isSketchMode, onNodeClick, onEdgeClick, onNodesChange, onEdgesChange]);

  return (
    <svg
      ref={svgRef}
      className="w-full h-full"
      style={{ backgroundColor }}
    />
  );
};
