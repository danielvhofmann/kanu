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
    const nodeCount = 12 + layer * 3;
    const generatedNodes: Node[] = Array.from({ length: nodeCount }, (_, i) => {
      // Initial random position - closer together
      const initialX = 30 + Math.random() * 40;
      const initialY = 30 + Math.random() * 40;
      
      // Target position - create distinct clusters
      const clusterCount = 3;
      const cluster = i % clusterCount;
      const nodesPerCluster = Math.ceil(nodeCount / clusterCount);
      const indexInCluster = Math.floor(i / clusterCount);
      
      // Cluster centers
      const clusterCenters = [
        { x: 30, y: 40 },
        { x: 70, y: 35 },
        { x: 50, y: 70 }
      ];
      
      const center = clusterCenters[cluster];
      const angle = (indexInCluster / nodesPerCluster) * Math.PI * 2;
      const radius = 8 + Math.random() * 8;
      const targetX = center.x + Math.cos(angle) * radius;
      const targetY = center.y + Math.sin(angle) * radius;
      
      return {
        id: i,
        x: initialX,
        y: initialY,
        targetX,
        targetY,
        size: 2 + Math.random() * 3,
      };
    });

    // Generate edges within and between clusters
    const generatedEdges: Edge[] = [];
    generatedNodes.forEach((node, i) => {
      generatedNodes.slice(i + 1).forEach((otherNode) => {
        const distance = Math.sqrt(
          Math.pow(node.targetX - otherNode.targetX, 2) + Math.pow(node.targetY - otherNode.targetY, 2)
        );
        if (distance < 20 && Math.random() > 0.5) {
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
            strokeOpacity={0.5}
            animate={{
              x1: [edge.from.x, edge.from.targetX, edge.from.targetX, edge.from.targetX, edge.from.x],
              y1: [edge.from.y, edge.from.targetY, edge.from.targetY, edge.from.targetY, edge.from.y],
              x2: [edge.to.x, edge.to.targetX, edge.to.targetX, edge.to.targetX, edge.to.x],
              y2: [edge.to.y, edge.to.targetY, edge.to.targetY, edge.to.targetY, edge.to.y],
            }}
            transition={{
              duration: 30,
              times: [0, 0.3, 0.5, 0.7, 1],
              ease: "easeInOut",
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
            fillOpacity={0.7}
            animate={{
              cx: [node.x, node.targetX, node.targetX, node.targetX, node.x],
              cy: [node.y, node.targetY, node.targetY, node.targetY, node.y],
            }}
            transition={{
              duration: 30,
              times: [0, 0.3, 0.5, 0.7, 1],
              ease: "easeInOut",
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
