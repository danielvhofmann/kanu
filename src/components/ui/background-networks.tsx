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
    // Offset clusters based on layer to avoid overlap
    const layerOffsetX = (layer - 1) * 12;
    const layerOffsetY = (layer - 1) * 8;
    
    // Create varied clusters matching the reference image structure
    const clusters = [
      // Small left clusters
      { x: 15 + layerOffsetX, y: 30 + layerOffsetY, nodeCount: 4, hubRadius: 4, density: 0.7 },
      { x: 22 + layerOffsetX, y: 42 + layerOffsetY, nodeCount: 6, hubRadius: 5, density: 0.8 },
      
      // Medium teal-like cluster left
      { x: 28 + layerOffsetX, y: 52 + layerOffsetY, nodeCount: 8, hubRadius: 7, density: 0.75 },
      
      // Large bottom-left cluster
      { x: 20 + layerOffsetX, y: 68 + layerOffsetY, nodeCount: 12, hubRadius: 8, density: 0.8 },
      
      // Top-center orange-like cluster
      { x: 48 + layerOffsetX, y: 25 + layerOffsetY, nodeCount: 9, hubRadius: 7, density: 0.75 },
      
      // Large central-right blue-like cluster (biggest)
      { x: 62 + layerOffsetX, y: 48 + layerOffsetY, nodeCount: 20, hubRadius: 12, density: 0.85 },
      
      // Small pink-like center cluster
      { x: 50 + layerOffsetX, y: 62 + layerOffsetY, nodeCount: 6, hubRadius: 6, density: 0.7 },
      
      // Bottom-right yellow-like cluster
      { x: 78 + layerOffsetX, y: 68 + layerOffsetY, nodeCount: 10, hubRadius: 8, density: 0.75 },
    ];
    
    const generatedNodes: Node[] = [];
    const hubNodes: Node[] = [];
    let nodeId = 0;
    
    clusters.forEach((cluster) => {
      const { x: targetCenterX, y: targetCenterY, nodeCount, hubRadius, density } = cluster;
      
      // Initial positions - completely random and chaotic across the whole canvas
      const chaosSpread = 150;
      
      // Create 1-2 hub nodes based on cluster size
      const hubCount = nodeCount > 10 ? 2 : 1;
      
      for (let h = 0; h < hubCount; h++) {
        const hubInitialX = Math.random() * chaosSpread - 25;
        const hubInitialY = Math.random() * chaosSpread - 25;
        
        const hubOffset = h * 3; // Small offset for second hub
        const hubNode = {
          id: nodeId++,
          x: hubInitialX,
          y: hubInitialY,
          targetX: targetCenterX + hubOffset,
          targetY: targetCenterY + hubOffset,
          size: 5 + Math.random() * 2, // Bigger hubs
        };
        generatedNodes.push(hubNode);
        hubNodes.push(hubNode);
      }
      
      // Create spoke nodes with varied positioning
      const spokeCount = nodeCount - hubCount;
      for (let s = 0; s < spokeCount; s++) {
        // Chaotic initial position
        const spokeInitialX = Math.random() * chaosSpread - 25;
        const spokeInitialY = Math.random() * chaosSpread - 25;
        
        // Organized target position with natural spread
        const angle = (s / spokeCount) * Math.PI * 2 + (Math.random() - 0.5) * 0.6;
        const radiusVariation = Math.random() * 5;
        const layerRadius = Math.floor(s / 5); // Create layers of nodes
        const radius = hubRadius + radiusVariation + layerRadius * 3;
        
        generatedNodes.push({
          id: nodeId++,
          x: spokeInitialX,
          y: spokeInitialY,
          targetX: targetCenterX + Math.cos(angle) * radius,
          targetY: targetCenterY + Math.sin(angle) * radius,
          size: 2 + Math.random() * 2,
        });
      }
    });

    // Generate edges with short connections only
    const generatedEdges: Edge[] = [];
    let currentNodeIndex = 0;
    
    clusters.forEach((cluster) => {
      const { nodeCount, density } = cluster;
      const hubCount = nodeCount > 10 ? 2 : 1;
      
      const clusterHubs = generatedNodes.slice(currentNodeIndex, currentNodeIndex + hubCount);
      
      // Connect hubs if there are multiple
      if (hubCount === 2) {
        generatedEdges.push({ from: clusterHubs[0], to: clusterHubs[1] });
      }
      
      // Connect spokes to hubs
      for (let s = hubCount; s < nodeCount; s++) {
        const spokeNode = generatedNodes[currentNodeIndex + s];
        const targetHub = clusterHubs[s % hubCount];
        generatedEdges.push({ from: targetHub, to: spokeNode });
        
        // Dense intra-cluster connections based on density
        for (let t = hubCount; t < s; t++) {
          const otherSpoke = generatedNodes[currentNodeIndex + t];
          const distance = Math.sqrt(
            Math.pow(spokeNode.targetX - otherSpoke.targetX, 2) +
            Math.pow(spokeNode.targetY - otherSpoke.targetY, 2)
          );
          
          // Connect nearby nodes within cluster
          if (distance < 12 && Math.random() < density) {
            generatedEdges.push({ from: spokeNode, to: otherSpoke });
          }
        }
      }
      
      currentNodeIndex += nodeCount;
    });
    
    // Connect hubs between clusters
    hubNodes.forEach((hub, i) => {
      hubNodes.slice(i + 1).forEach((otherHub) => {
        const distance = Math.sqrt(
          Math.pow(hub.targetX - otherHub.targetX, 2) +
          Math.pow(hub.targetY - otherHub.targetY, 2)
        );
        
        // Connect hubs that are reasonably close
        if (distance < 40 && Math.random() > 0.4) {
          generatedEdges.push({ from: hub, to: otherHub });
        }
      });
    });
    
    // Add some inter-cluster spoke connections
    currentNodeIndex = 0;
    clusters.forEach((cluster, clusterIdx) => {
      const { nodeCount } = cluster;
      const hubCount = nodeCount > 10 ? 2 : 1;
      
      if (clusterIdx < clusters.length - 1) {
        // Get a few spoke nodes from this cluster
        const clusterSpokes = generatedNodes.slice(
          currentNodeIndex + hubCount,
          currentNodeIndex + Math.min(nodeCount, hubCount + 3)
        );
        
        const nextClusterStart = currentNodeIndex + nodeCount;
        const nextCluster = clusters[clusterIdx + 1];
        const nextHubCount = nextCluster.nodeCount > 10 ? 2 : 1;
        const nextSpokes = generatedNodes.slice(
          nextClusterStart + nextHubCount,
          nextClusterStart + Math.min(nextCluster.nodeCount, nextHubCount + 3)
        );
        
        // Create 1-2 connections between cluster spokes
        clusterSpokes.slice(0, 2).forEach((spoke, idx) => {
          if (nextSpokes[idx] && Math.random() > 0.6) {
            generatedEdges.push({ from: spoke, to: nextSpokes[idx] });
          }
        });
      }
      
      currentNodeIndex += nodeCount;
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
            r={node.size / 6} // Bigger nodes (divided by 6 instead of 8)
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
    <div className="absolute inset-0 text-cyan-400/40">
      <FloatingNetwork layer={1} />
    </div>
  );
}
