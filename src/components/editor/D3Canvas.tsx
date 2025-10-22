import { useEffect, useRef, useState } from 'react';
import * as d3 from 'd3';
import { Node, Edge } from 'reactflow';

interface D3CanvasProps {
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
  templateType?: string;
}

export const D3Canvas = ({
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
  templateType,
}: D3CanvasProps) => {
  const svgRef = useRef<SVGSVGElement>(null);
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 });
  const simulationRef = useRef<d3.Simulation<any, any> | null>(null);
  const dragLineRef = useRef<{ x1: number; y1: number; x2: number; y2: number; sourceId: string } | null>(null);
  const isInitialMount = useRef(true);

  // Update dimensions on mount and resize
  useEffect(() => {
    const updateDimensions = () => {
      if (svgRef.current) {
        const { width, height } = svgRef.current.getBoundingClientRect();
        setDimensions({ width, height });
      }
    };
    updateDimensions();
    window.addEventListener('resize', updateDimensions);
    return () => window.removeEventListener('resize', updateDimensions);
  }, []);

  useEffect(() => {
    if (!svgRef.current || dimensions.width === 0) return;

    isInitialMount.current = false;

    const svg = d3.select(svgRef.current);
    svg.selectAll('*').remove();

    // Create main group for zoom/pan
    const g = svg.append('g');

    // Add zoom behavior
    const zoom = d3.zoom<SVGSVGElement, unknown>()
      .scaleExtent([0.1, 4])
      .on('zoom', (event) => {
        g.attr('transform', event.transform);
      });

    svg.call(zoom);

    // Add background grid
    const defs = svg.append('defs');
    const pattern = defs.append('pattern')
      .attr('id', 'grid')
      .attr('width', 24)
      .attr('height', 24)
      .attr('patternUnits', 'userSpaceOnUse');

    pattern.append('circle')
      .attr('cx', 12)
      .attr('cy', 12)
      .attr('r', 0.5)
      .attr('fill', 'hsl(var(--border))');

    g.append('rect')
      .attr('width', dimensions.width * 10)
      .attr('height', dimensions.height * 10)
      .attr('x', -dimensions.width * 5)
      .attr('y', -dimensions.height * 5)
      .attr('fill', 'url(#grid)');

    // Prepare data for D3
    const d3Nodes = nodes.map(node => ({
      ...node,
      x: node.position.x,
      y: node.position.y,
      fx: null,
      fy: null,
    }));

    const d3Links = edges.map(edge => ({
      ...edge,
      source: edge.source,
      target: edge.target,
    }));

    // Create force simulation with gentle, slow physics
    const simulation = d3.forceSimulation(d3Nodes)
      .force('link', d3.forceLink(d3Links)
        .id((d: any) => d.id)
        .distance(150)
        .strength(0.2))
      .force('charge', d3.forceManyBody()
        .strength(-400)
        .distanceMax(400))
      .force('collision', d3.forceCollide()
        .radius(60)
        .strength(0.7))
      .force('center', d3.forceCenter(dimensions.width / 2, dimensions.height / 2)
        .strength(0.03))
      .alpha(0.3)
      .alphaDecay(0.008)
      .velocityDecay(0.6);

    simulationRef.current = simulation;

    // Add arrow markers for directed edges
    defs.append('marker')
      .attr('id', 'arrowhead')
      .attr('viewBox', '0 -5 10 10')
      .attr('refX', 35)
      .attr('refY', 0)
      .attr('markerWidth', 6)
      .attr('markerHeight', 6)
      .attr('orient', 'auto')
      .append('path')
      .attr('d', 'M0,-5L10,0L0,5')
      .attr('fill', 'hsl(var(--border))');

    defs.append('marker')
      .attr('id', 'arrowhead-selected')
      .attr('viewBox', '0 -5 10 10')
      .attr('refX', 35)
      .attr('refY', 0)
      .attr('markerWidth', 6)
      .attr('markerHeight', 6)
      .attr('orient', 'auto')
      .append('path')
      .attr('d', 'M0,-5L10,0L0,5')
      .attr('fill', 'hsl(var(--primary))');

    // Draw edges with curved paths for strategic template
    const link = g.append('g')
      .selectAll('path')
      .data(d3Links)
      .join('path')
      .attr('class', (d: any) => d.animated ? 'animated-edge' : '')
      .attr('stroke', (d: any) => 
        d.id === selectedEdgeId ? 'hsl(var(--primary))' : (d.style?.stroke || 'hsl(var(--border))')
      )
      .attr('stroke-width', (d: any) => 
        d.id === selectedEdgeId ? (d.style?.strokeWidth || 1.5) + 1 : (d.style?.strokeWidth || 1.5)
      )
      .attr('fill', 'none')
      .attr('opacity', (d: any) => d.id === selectedEdgeId ? 0.9 : 0.6)
      .attr('marker-end', (d: any) => 
        d.animated || d.markerEnd ? (d.id === selectedEdgeId ? 'url(#arrowhead-selected)' : 'url(#arrowhead)') : null
      )
      .attr('stroke-dasharray', (d: any) => d.style?.strokeDasharray || null)
      .attr('cursor', 'pointer')
      .on('click', (event, d) => {
        event.stopPropagation();
        onEdgeClick(d as Edge);
      });

    // Draw nodes
    const node = g.append('g')
      .selectAll('g')
      .data(d3Nodes)
      .join('g')
      .attr('cursor', isSketchMode ? 'pointer' : 'grab')
      .call(d3.drag<SVGGElement, any>()
        .on('start', (event, d) => {
          if (isSketchMode) {
            dragLineRef.current = {
              x1: d.x,
              y1: d.y,
              x2: d.x,
              y2: d.y,
              sourceId: d.id,
            };
          } else {
            // Only activate simulation if actually dragging, not just clicking
            d.fx = d.x;
            d.fy = d.y;
          }
        })
        .on('drag', (event, d) => {
          if (isSketchMode) {
            if (dragLineRef.current) {
              dragLineRef.current.x2 = event.x;
              dragLineRef.current.y2 = event.y;
              // Draw temporary line
              g.selectAll('.drag-line').remove();
              g.append('line')
                .attr('class', 'drag-line')
                .attr('x1', dragLineRef.current.x1)
                .attr('y1', dragLineRef.current.y1)
                .attr('x2', dragLineRef.current.x2)
                .attr('y2', dragLineRef.current.y2)
                .attr('stroke', 'hsl(var(--primary))')
                .attr('stroke-width', 2)
                .attr('stroke-dasharray', '5,5');
            }
          } else {
            // Gently wake simulation for smooth dragging
            if (!event.active) simulation.alphaTarget(0.1).restart();
            d.fx = event.x;
            d.fy = event.y;
          }
        })
        .on('end', (event, d) => {
          if (isSketchMode && dragLineRef.current) {
            g.selectAll('.drag-line').remove();
            // Check if dropped on another node
            const targetNode = d3Nodes.find(n => {
              const dx = n.x - event.x;
              const dy = n.y - event.y;
              return Math.sqrt(dx * dx + dy * dy) < 50 && n.id !== d.id;
            });

            if (targetNode) {
              // Create edge to existing node
              const newEdge: Edge = {
                id: `${d.id}-${targetNode.id}`,
                source: d.id,
                target: targetNode.id,
                type: 'smoothstep',
                animated: true,
                style: { stroke: 'hsl(var(--primary))', strokeWidth: 2 },
                markerEnd: { type: 'arrowClosed' as any },
              };
              onEdgesChange([...edges, newEdge]);
            } else {
              // Create new node and edge
              const newNode: Node = {
                id: `${Date.now()}`,
                type: 'default',
                position: { x: event.x, y: event.y },
                data: { label: `Node ${nodes.length + 1}` },
                style: {
                  background: 'hsl(195, 45%, 52%)',
                  color: 'white',
                  border: '2px solid hsl(195, 50%, 68%)',
                  borderRadius: '50%',
                  width: '85px',
                  height: '85px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  textAlign: 'center',
                  boxShadow: '0 3px 12px hsl(195 45% 52% / 0.2)',
                },
              };
              const newEdge: Edge = {
                id: `${d.id}-${newNode.id}`,
                source: d.id,
                target: newNode.id,
                type: 'smoothstep',
                animated: true,
                style: { stroke: 'hsl(var(--primary))', strokeWidth: 2 },
                markerEnd: { type: 'arrowClosed' as any },
              };
              onNodesChange([...nodes, newNode]);
              onEdgesChange([...edges, newEdge]);
            }
            dragLineRef.current = null;
          } else {
            if (!event.active) simulation.alphaTarget(0);
            d.fx = null;
            d.fy = null;
          }
        })
      );

    // Draw node circles
    node.append('circle')
      .attr('r', (d: any) => {
        const width = parseInt(d.style?.width || '85');
        return width / 2;
      })
      .attr('fill', (d: any) => d.style?.background || 'hsl(195, 45%, 52%)')
      .attr('stroke', (d: any) => 
        d.id === selectedNodeId ? 'hsl(var(--primary))' : (d.style?.border?.split(' ')[2] || 'hsl(195, 50%, 68%)')
      )
      .attr('stroke-width', (d: any) => d.id === selectedNodeId ? 3 : 2)
      .style('filter', (d: any) => d.style?.boxShadow ? 'drop-shadow(0 3px 8px rgba(0,0,0,0.15))' : 'none');

    // Draw node labels
    node.append('text')
      .text((d: any) => d.data.label)
      .attr('text-anchor', 'middle')
      .attr('dy', '0.35em')
      .attr('fill', (d: any) => d.style?.color || 'white')
      .attr('font-size', (d: any) => d.style?.fontSize || '12px')
      .attr('font-weight', (d: any) => d.style?.fontWeight || '400')
      .attr('pointer-events', 'none')
      .each(function(d: any) {
        const text = d3.select(this);
        const words = d.data.label.split(/\s+/);
        const lineHeight = 1.1;
        const width = parseInt(d.style?.width || '85');
        const maxWidth = width * 0.8;
        
        text.text(null);
        
        let line: string[] = [];
        let lineNumber = 0;
        const tspan = text.append('tspan').attr('x', 0).attr('dy', 0);
        
        words.forEach((word: string) => {
          line.push(word);
          tspan.text(line.join(' '));
          if (tspan.node()!.getComputedTextLength() > maxWidth) {
            line.pop();
            tspan.text(line.join(' '));
            line = [word];
            lineNumber++;
            text.append('tspan')
              .attr('x', 0)
              .attr('dy', `${lineHeight}em`)
              .text(word);
          }
        });
        
        // Center vertically
        const totalLines = text.selectAll('tspan').size();
        text.attr('dy', `${-(totalLines - 1) * lineHeight * 0.5}em`);
      });

    // Handle node clicks
    node.on('click', (event, d) => {
      event.stopPropagation();
      onNodeClick(d as Node);
    });

    // Update positions on simulation tick with proper edge rendering
    simulation.on('tick', () => {
      link.attr('d', (d: any) => {
        const sourceX = d.source.x;
        const sourceY = d.source.y;
        const targetX = d.target.x;
        const targetY = d.target.y;
        
        // Use curved paths only for smoothstep edges
        if (d.type === 'smoothstep') {
          const dx = targetX - sourceX;
          const dy = targetY - sourceY;
          const dr = Math.sqrt(dx * dx + dy * dy) * 0.7;
          return `M${sourceX},${sourceY}A${dr},${dr} 0 0,1 ${targetX},${targetY}`;
        }
        
        // Straight lines for everything else
        return `M${sourceX},${sourceY}L${targetX},${targetY}`;
      });

      node.attr('transform', (d: any) => `translate(${d.x},${d.y})`);
    });

    // Don't save positions automatically - causes reset issue
    // Positions are managed by the simulation itself

    return () => {
      simulation.stop();
    };
  }, [nodes, edges, dimensions, selectedNodeId, selectedEdgeId, isSketchMode, onNodesChange, onEdgesChange, onNodeClick, onEdgeClick, backgroundColor, templateType]);

  return (
    <svg
      ref={svgRef}
      className="w-full h-full"
      style={{ 
        cursor: isSketchMode ? 'crosshair' : 'default',
        backgroundColor: backgroundColor
      }}
    />
  );
};
