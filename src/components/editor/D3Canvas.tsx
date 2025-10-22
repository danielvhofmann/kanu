import { useEffect, useRef, useState } from 'react';
import * as d3 from 'd3';
import { Node, Edge } from 'reactflow';

interface D3CanvasProps {
  nodes: Node[];
  edges: Edge[];
  onNodesChange: (nodes: Node[] | ((prev: Node[]) => Node[])) => void;
  onEdgesChange: (edges: Edge[] | ((prev: Edge[]) => Edge[])) => void;
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
  const gRef = useRef<d3.Selection<SVGGElement, unknown, null, undefined> | null>(null);
  const zoomTransformRef = useRef<d3.ZoomTransform>(d3.zoomIdentity);
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

  // Effect 1: One-time setup - SVG structure, zoom, grid
  useEffect(() => {
    if (!svgRef.current || dimensions.width === 0) return;

    const svg = d3.select(svgRef.current);
    svg.selectAll('*').remove();

    // Create main group for zoom/pan
    const g = svg.append('g');
    gRef.current = g;

    // Add zoom behavior
    const zoom = d3.zoom<SVGSVGElement, unknown>()
      .scaleExtent([0.1, 4])
      .on('zoom', (event) => {
        zoomTransformRef.current = event.transform;
        g.attr('transform', event.transform);
      });

    svg.call(zoom);

    // Restore previous zoom state if exists
    if (zoomTransformRef.current && !zoomTransformRef.current.k.toString().includes('1')) {
      svg.call(zoom.transform as any, zoomTransformRef.current);
    }

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

    // Add arrow markers
    defs.append('marker')
      .attr('id', 'arrowhead-straight')
      .attr('viewBox', '0 -5 10 10')
      .attr('refX', 50)
      .attr('refY', 0)
      .attr('markerWidth', 6)
      .attr('markerHeight', 6)
      .attr('orient', 'auto')
      .append('path')
      .attr('d', 'M0,-5L10,0L0,5')
      .attr('fill', 'hsl(var(--border))');

    defs.append('marker')
      .attr('id', 'arrowhead-straight-selected')
      .attr('viewBox', '0 -5 10 10')
      .attr('refX', 50)
      .attr('refY', 0)
      .attr('markerWidth', 6)
      .attr('markerHeight', 6)
      .attr('orient', 'auto')
      .append('path')
      .attr('d', 'M0,-5L10,0L0,5')
      .attr('fill', 'hsl(var(--primary))');

    defs.append('marker')
      .attr('id', 'arrowhead-curved')
      .attr('viewBox', '0 -5 10 10')
      .attr('refX', 45)
      .attr('refY', 0)
      .attr('markerWidth', 6)
      .attr('markerHeight', 6)
      .attr('orient', 'auto')
      .append('path')
      .attr('d', 'M0,-5L10,0L0,5')
      .attr('fill', 'hsl(var(--border))');

    defs.append('marker')
      .attr('id', 'arrowhead-curved-selected')
      .attr('viewBox', '0 -5 10 10')
      .attr('refX', 45)
      .attr('refY', 0)
      .attr('markerWidth', 6)
      .attr('markerHeight', 6)
      .attr('orient', 'auto')
      .append('path')
      .attr('d', 'M0,-5L10,0L0,5')
      .attr('fill', 'hsl(var(--primary))');

    // Initialize simulation once
    const simulation = d3.forceSimulation()
      .force('link', d3.forceLink()
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
      .velocityDecay(0.3);

    simulationRef.current = simulation;

    return () => {
      simulation.stop();
    };
  }, [dimensions.width, dimensions.height]);

  // Effect 1.5: Update click handler when sketch mode changes (without recreating SVG)
  useEffect(() => {
    if (!svgRef.current) return;
    
    const svg = d3.select(svgRef.current);
    
    // Update click handler
    svg.on('click', (event) => {
      if (!isSketchMode) return;
      
      if (event.target.__data__) return;
      const parentData = d3.select(event.target).node()?.parentNode?.__data__;
      if (parentData) return;
      
      const transform = d3.zoomTransform(svg.node() as Element);
      const [x, y] = d3.pointer(event, svg.node());
      const [transformedX, transformedY] = transform.invert([x, y]);
      
      onNodesChange((currentNodes) => {
        const newNode: Node = {
          id: `node-${Date.now()}`,
          type: 'default',
          position: { x: transformedX, y: transformedY },
          data: { label: `Node ${currentNodes.length + 1}` },
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
        return [...currentNodes, newNode];
      });
    });
  }, [isSketchMode, onNodesChange]);

  // Effect 2: Update data - nodes and edges using enter-update-exit pattern
  useEffect(() => {
    if (!gRef.current || !simulationRef.current || dimensions.width === 0) return;

    const g = gRef.current;
    const simulation = simulationRef.current;

    // Prepare data for D3 - clear old simulation data and only use current nodes
    const nodeIds = new Set(nodes.map(n => n.id));
    const currentSimNodes = simulation.nodes();
    
    // Filter simulation nodes to only keep those that exist in current state
    const validSimNodes = currentSimNodes.filter((n: any) => nodeIds.has(n.id));
    
    const d3Nodes = nodes.map(node => {
      const existingNode = validSimNodes.find((n: any) => n.id === node.id);
      return {
        ...node,
        x: existingNode?.x ?? node.position.x,
        y: existingNode?.y ?? node.position.y,
        vx: existingNode?.vx ?? 0,
        vy: existingNode?.vy ?? 0,
        fx: existingNode?.fx ?? null,
        fy: existingNode?.fy ?? null,
      };
    });

    const d3Links = edges.map(edge => ({
      ...edge,
      source: edge.source,
      target: edge.target,
    }));

    // Update simulation with new data
    simulation.nodes(d3Nodes);
    const linkForce = simulation.force('link') as d3.ForceLink<any, any>;
    if (linkForce) {
      linkForce.links(d3Links);
    }
    simulation.alpha(0.1).restart();

    // Update edges using enter-update-exit pattern
    const linkGroup = g.select<SVGGElement>('g.edges-group').empty() 
      ? g.insert('g', ':first-child').attr('class', 'edges-group')
      : g.select<SVGGElement>('g.edges-group');

    const link = linkGroup
      .selectAll<SVGPathElement, any>('path')
      .data(d3Links, (d: any) => d.id);

    // Remove old edges
    link.exit().remove();

    // Add new edges
    const linkEnter = link.enter()
      .append('path')
      .attr('class', (d: any) => d.animated ? 'animated-edge' : '')
      .attr('fill', 'none')
      .attr('cursor', 'pointer')
      .on('click', (event, d) => {
        event.stopPropagation();
        onEdgeClick(d as Edge);
      });

    // Merge and update all edges
    const linkMerged = linkEnter.merge(link)
      .attr('stroke', (d: any) => 
        d.id === selectedEdgeId ? 'hsl(var(--primary))' : (d.style?.stroke || 'hsl(var(--border))')
      )
      .attr('stroke-width', (d: any) => 
        d.id === selectedEdgeId ? (d.style?.strokeWidth || 1.5) + 1 : (d.style?.strokeWidth || 1.5)
      )
      .attr('opacity', (d: any) => d.id === selectedEdgeId ? 0.9 : 0.6)
      .attr('stroke-dasharray', (d: any) => d.style?.strokeDasharray || null)
      .attr('marker-end', (d: any) => {
        if (!d.animated && !d.markerEnd) return null;
        const isCurved = d.type === 'smoothstep';
        const isSelected = d.id === selectedEdgeId;
        if (isCurved) {
          return isSelected ? 'url(#arrowhead-curved-selected)' : 'url(#arrowhead-curved)';
        } else {
          return isSelected ? 'url(#arrowhead-straight-selected)' : 'url(#arrowhead-straight)';
        }
      });

    // Update nodes using enter-update-exit pattern
    const nodeGroup = g.select<SVGGElement>('g.nodes-group').empty()
      ? g.append('g').attr('class', 'nodes-group')
      : g.select<SVGGElement>('g.nodes-group');

    const node = nodeGroup
      .selectAll<SVGGElement, any>('g.node')
      .data(d3Nodes, (d: any) => d.id);

    // Remove old nodes
    node.exit().remove();

    // Add new nodes
    const nodeEnter = node.enter()
      .append('g')
      .attr('class', 'node')
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
            d.fx = d.x;
            d.fy = d.y;
          }
        })
        .on('drag', (event, d) => {
          if (isSketchMode) {
            if (dragLineRef.current) {
              dragLineRef.current.x2 = event.x;
              dragLineRef.current.y2 = event.y;
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
            if (!event.active) simulation.alphaTarget(0.1).restart();
            d.fx = event.x;
            d.fy = event.y;
          }
        })
        .on('end', (event, d) => {
          if (isSketchMode && dragLineRef.current) {
            g.selectAll('.drag-line').remove();
            const targetNode = d3Nodes.find(n => {
              const dx = n.x - event.x;
              const dy = n.y - event.y;
              return Math.sqrt(dx * dx + dy * dy) < 50 && n.id !== d.id;
            });

            if (targetNode) {
              const newEdge: Edge = {
                id: `${d.id}-${targetNode.id}`,
                source: d.id,
                target: targetNode.id,
                type: 'smoothstep',
                animated: true,
                style: { stroke: 'hsl(var(--primary))', strokeWidth: 2 },
                markerEnd: { type: 'arrowClosed' as any },
              };
              onEdgesChange((currentEdges) => [...currentEdges, newEdge]);
            } else {
              onNodesChange((currentNodes) => {
                const newNode: Node = {
                  id: `${Date.now()}`,
                  type: 'default',
                  position: { x: event.x, y: event.y },
                  data: { label: `Node ${currentNodes.length + 1}` },
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
                onEdgesChange((currentEdges) => [...currentEdges, newEdge]);
                return [...currentNodes, newNode];
              });
            }
            dragLineRef.current = null;
          } else {
            if (!event.active) simulation.alphaTarget(0);
            d.fx = null;
            d.fy = null;
          }
        })
      )
      .on('click', (event, d) => {
        event.stopPropagation();
        onNodeClick(d as Node);
      });

    // Draw node shapes for new nodes
    nodeEnter.each(function(d: any) {
      const g = d3.select(this);
      const shape = d.data?.shape || 'circle';
      const width = parseInt(d.style?.width || '85');
      const size = width / 2;
      const fill = d.style?.background || 'hsl(195, 45%, 52%)';
      const stroke = d.style?.border?.split(' ')[2] || 'hsl(195, 50%, 68%)';
      const filter = d.style?.boxShadow ? 'drop-shadow(0 3px 8px rgba(0,0,0,0.15))' : 'none';

      if (shape === 'square') {
        g.append('rect')
          .attr('class', 'node-shape')
          .attr('x', -size)
          .attr('y', -size)
          .attr('width', width)
          .attr('height', width)
          .attr('rx', 8)
          .attr('fill', fill)
          .attr('stroke', stroke)
          .attr('stroke-width', 2)
          .style('filter', filter);
      } else if (shape === 'triangle') {
        const points = `0,${-size} ${-size},${size} ${size},${size}`;
        g.append('polygon')
          .attr('class', 'node-shape')
          .attr('points', points)
          .attr('fill', fill)
          .attr('stroke', stroke)
          .attr('stroke-width', 2)
          .style('filter', filter);
      } else {
        g.append('circle')
          .attr('class', 'node-shape')
          .attr('r', size)
          .attr('fill', fill)
          .attr('stroke', stroke)
          .attr('stroke-width', 2)
          .style('filter', filter);
      }

      // Add label
      const text = g.append('text')
        .attr('class', 'node-label')
        .attr('text-anchor', 'middle')
        .attr('dy', '0.35em')
        .attr('fill', d.style?.color || 'white')
        .attr('font-size', d.style?.fontSize || '12px')
        .attr('font-weight', d.style?.fontWeight || '400')
        .attr('pointer-events', 'none');

      const words = d.data.label.split(/\s+/);
      const lineHeight = 1.1;
      const maxWidth = width * 0.8;
      
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
      
      const totalLines = text.selectAll('tspan').size();
      text.attr('dy', `${-(totalLines - 1) * lineHeight * 0.5}em`);
    });

    // Merge and update all nodes (update selection styling)
    const nodeMerged = nodeEnter.merge(node);
    
    nodeMerged.selectAll('.node-shape')
      .attr('stroke', (d: any) => 
        d.id === selectedNodeId ? 'hsl(var(--primary))' : (d.style?.border?.split(' ')[2] || 'hsl(195, 50%, 68%)')
      )
      .attr('stroke-width', (d: any) => d.id === selectedNodeId ? 3 : 2);

    // Update simulation tick
    simulation.on('tick', () => {
      linkMerged.attr('d', (d: any) => {
        const sourceX = d.source.x;
        const sourceY = d.source.y;
        const targetX = d.target.x;
        const targetY = d.target.y;
        
        if (d.type === 'smoothstep') {
          const dx = targetX - sourceX;
          const dy = targetY - sourceY;
          const dr = Math.sqrt(dx * dx + dy * dy) * 0.7;
          return `M${sourceX},${sourceY}A${dr},${dr} 0 0,1 ${targetX},${targetY}`;
        } else if (d.type === 'step') {
          const midX = (sourceX + targetX) / 2;
          return `M${sourceX},${sourceY}L${midX},${sourceY}L${midX},${targetY}L${targetX},${targetY}`;
        }
        return `M${sourceX},${sourceY}L${targetX},${targetY}`;
      });

      nodeMerged.attr('transform', (d: any) => `translate(${d.x},${d.y})`);
    });
  }, [nodes, edges, selectedNodeId, selectedEdgeId]);

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
