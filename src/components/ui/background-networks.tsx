"use client";

import { motion } from "framer-motion";
import { useMemo } from "react";

interface Node {
  id: number;
  x: number;
  y: number;
  targetX: number;
  targetY: number;
  size: number;
}

interface Edge {
  from: Node;
  to: Node;
}

function FloatingNetwork({ layer }: { layer: number }) {
  const { nodes, edges } = useMemo(() => {
    // Generate random nodes with initial and target positions
    const nodeCount = 12 + layer * 3; // Reduced node count
    const generatedNodes: Node[] = Array.from({ length: nodeCount }, (_, i) => {
      // Initial random position - spread far apart
      const initialX = Math.random() * 150 - 25; // -25 to 125 (wider spread)
      const initialY = Math.random() * 150 - 25;
      
      // Target position - more structured (grid-like with some randomness)
      const cols = Math.ceil(Math.sqrt(nodeCount));
      const row = Math.floor(i / cols);
      const col = i % cols;
      const spacing = 100 / cols;
      const targetX = col * spacing + spacing / 2 + (Math.random() - 0.5) * spacing * 0.3;
      const targetY = row * spacing + spacing / 2 + (Math.random() - 0.5) * spacing * 0.3;
      
      return {
        id: i,
        x: initialX,
        y: initialY,
        targetX,
        targetY,
        size: 2 + Math.random() * 3,
      };
    });

    // Generate fewer edges between nearby nodes in the target formation
    const generatedEdges: Edge[] = [];
    generatedNodes.forEach((node, i) => {
      generatedNodes.slice(i + 1).forEach((otherNode) => {
        const distance = Math.sqrt(
          Math.pow(node.targetX - otherNode.targetX, 2) + Math.pow(node.targetY - otherNode.targetY, 2)
        );
        if (distance < 35 && Math.random() > 0.6) { // Fewer edges
          generatedEdges.push({ from: node, to: otherNode });
        }
      });
    });

    return { nodes: generatedNodes, edges: generatedEdges };
  }, [layer]);

  return (
    <div className="absolute inset-0 pointer-events-none opacity-50">
      <svg className="w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="xMidYMid slice">
        <title>Network Background Layer {layer}</title>
        
        {/* Render edges */}
        {edges.map((edge, i) => (
          <motion.line
            key={`edge-${layer}-${i}`}
            x1={edge.from.x}
            y1={edge.from.y}
            x2={edge.to.x}
            y2={edge.to.y}
            stroke="currentColor"
            strokeWidth={0.2}
            strokeOpacity={0.4}
            animate={{
              x1: [edge.from.x, edge.from.x, edge.from.targetX, edge.from.targetX, edge.from.targetX, edge.from.x],
              y1: [edge.from.y, edge.from.y, edge.from.targetY, edge.from.targetY, edge.from.targetY, edge.from.y],
              x2: [edge.to.x, edge.to.x, edge.to.targetX, edge.to.targetX, edge.to.targetX, edge.to.x],
              y2: [edge.to.y, edge.to.y, edge.to.targetY, edge.to.targetY, edge.to.targetY, edge.to.y],
              opacity: [0, 0, 0.6, 0.6, 0.6, 0],
            }}
            transition={{
              duration: 60,
              times: [0, 0.2, 0.4, 0.6, 0.7, 1],
              ease: "linear",
              repeat: Infinity,
              delay: i * 0.02,
            }}
          />
        ))}

        {/* Render nodes */}
        {nodes.map((node) => (
          <motion.circle
            key={`node-${layer}-${node.id}`}
            cx={node.x}
            cy={node.y}
            r={node.size / 8}
            fill="currentColor"
            fillOpacity={0.6}
            animate={{
              cx: [node.x, node.x, node.targetX, node.targetX, node.targetX, node.x],
              cy: [node.y, node.y, node.targetY, node.targetY, node.targetY, node.y],
              scale: [0.7, 0.7, 1.3, 1.3, 1.3, 0.7],
              opacity: [0.4, 0.4, 0.8, 0.8, 0.8, 0.4],
            }}
            transition={{
              duration: 60,
              times: [0, 0.2, 0.4, 0.6, 0.7, 1],
              ease: "linear",
              repeat: Infinity,
              delay: node.id * 0.05,
            }}
          />
        ))}
      </svg>
    </div>
  );
}

export function BackgroundNetworks() {
  return (
    <>
      <div className="absolute inset-0 text-primary/40">
        <FloatingNetwork layer={1} />
      </div>
      <div className="absolute inset-0 text-secondary/40">
        <FloatingNetwork layer={2} />
      </div>
      <div className="absolute inset-0 text-accent/30">
        <FloatingNetwork layer={3} />
      </div>
    </>
  );
}
