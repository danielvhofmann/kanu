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
    // Generate random nodes with hub-and-spoke clusters
    const clusterCount = 4;
    const nodesPerCluster = 4; // 1 hub + 3 spokes
    const nodeCount = clusterCount * nodesPerCluster;
    
    // Cluster centers positioned away from middle
    const clusterCenters = [
      { x: 25, y: 25 },
      { x: 75, y: 25 },
      { x: 25, y: 75 },
      { x: 75, y: 75 }
    ];
    
    const generatedNodes: Node[] = [];
    
    for (let c = 0; c < clusterCount; c++) {
      const center = clusterCenters[c];
      
      // Create hub node (first node in each cluster)
      const hubInitialX = center.x + (Math.random() - 0.5) * 60;
      const hubInitialY = center.y + (Math.random() - 0.5) * 60;
      
      generatedNodes.push({
        id: c * nodesPerCluster,
        x: hubInitialX,
        y: hubInitialY,
        targetX: center.x,
        targetY: center.y,
        size: 3 + Math.random() * 2, // Hub nodes slightly larger
      });
      
      // Create spoke nodes around the hub
      for (let s = 1; s < nodesPerCluster; s++) {
        const angle = (s / (nodesPerCluster - 1)) * Math.PI * 2;
        const radius = 12 + Math.random() * 6;
        
        const spokeInitialX = center.x + (Math.random() - 0.5) * 60;
        const spokeInitialY = center.y + (Math.random() - 0.5) * 60;
        
        generatedNodes.push({
          id: c * nodesPerCluster + s,
          x: spokeInitialX,
          y: spokeInitialY,
          targetX: center.x + Math.cos(angle) * radius,
          targetY: center.y + Math.sin(angle) * radius,
          size: 2 + Math.random() * 2,
        });
      }
    }

    // Generate edges: spoke nodes connect to their hub
    const generatedEdges: Edge[] = [];
    
    for (let c = 0; c < clusterCount; c++) {
      const hubIndex = c * nodesPerCluster;
      const hubNode = generatedNodes[hubIndex];
      
      // Connect all spokes to the hub
      for (let s = 1; s < nodesPerCluster; s++) {
        const spokeNode = generatedNodes[hubIndex + s];
        generatedEdges.push({ from: hubNode, to: spokeNode });
      }
      
      // Occasionally connect between clusters (10% chance)
      if (c < clusterCount - 1 && Math.random() > 0.9) {
        const nextHubNode = generatedNodes[(c + 1) * nodesPerCluster];
        generatedEdges.push({ from: hubNode, to: nextHubNode });
      }
    }

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
