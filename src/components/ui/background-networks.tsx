"use client";

import { motion } from "framer-motion";
import { useMemo } from "react";

interface Node {
  id: number;
  x: number;
  y: number;
  size: number;
}

interface Edge {
  from: Node;
  to: Node;
}

function FloatingNetwork({ layer }: { layer: number }) {
  const { nodes, edges } = useMemo(() => {
    // Generate random nodes
    const nodeCount = 20 + layer * 5;
    const generatedNodes: Node[] = Array.from({ length: nodeCount }, (_, i) => ({
      id: i,
      x: Math.random() * 100,
      y: Math.random() * 100,
      size: 2 + Math.random() * 3,
    }));

    // Generate edges between nearby nodes
    const generatedEdges: Edge[] = [];
    generatedNodes.forEach((node, i) => {
      generatedNodes.slice(i + 1).forEach((otherNode) => {
        const distance = Math.sqrt(
          Math.pow(node.x - otherNode.x, 2) + Math.pow(node.y - otherNode.y, 2)
        );
        if (distance < 30 && Math.random() > 0.5) {
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
            initial={{ pathLength: 0 }}
            animate={{
              pathLength: [0, 1, 0],
              x1: edge.from.x + Math.sin(i) * 3,
              y1: edge.from.y + Math.cos(i) * 3,
              x2: edge.to.x + Math.sin(i + 1) * 3,
              y2: edge.to.y + Math.cos(i + 1) * 3,
            }}
            transition={{
              duration: 30 + Math.random() * 20,
              repeat: Infinity,
              ease: "linear",
              delay: Math.random() * 5,
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
            initial={{ scale: 0.8 }}
            animate={{
              scale: [0.8, 1.2, 0.8],
              cx: node.x + Math.sin(node.id) * 2,
              cy: node.y + Math.cos(node.id) * 2,
            }}
            transition={{
              duration: 20 + node.id * 0.5,
              repeat: Infinity,
              ease: "easeInOut",
              delay: node.id * 0.1,
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
