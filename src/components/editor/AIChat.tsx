import { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

import { X, Send, Loader2, MessageSquare } from 'lucide-react';
import { Node, Edge } from 'reactflow';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface AIChatProps {
  nodes: Node[];
  edges: Edge[];
  onNodesChange: (nodes: Node[]) => void;
  onEdgesChange: (edges: Edge[]) => void;
  onClose: () => void;
}

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

export const AIChat = ({ nodes, edges, onNodesChange, onEdgesChange, onClose }: AIChatProps) => {
  const [messages, setMessages] = useState<Message[]>([
    {
      role: 'assistant',
      content: 'Hi! I can help you build and modify your network map. I can search the web for information, find images, and understand your graph. What would you like to create?',
    },
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  
  // Use refs to track the absolute latest state
  const nodesRef = useRef<Node[]>(nodes);
  const edgesRef = useRef<Edge[]>(edges);
  
  // Update refs whenever props change
  useEffect(() => {
    nodesRef.current = nodes;
    edgesRef.current = edges;
  }, [nodes, edges]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const sendMessage = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage: Message = { role: 'user', content: input };
    setMessages((prev) => [...prev, userMessage]);
    const currentInput = input;
    setInput('');
    setIsLoading(true);

    try {
      // Use refs to get the absolute latest state for graph context
      const currentNodes = nodesRef.current;
      const currentEdges = edgesRef.current;
      
      const graphContext = {
        nodes: currentNodes.map(n => ({ id: n.id, label: n.data.label, tags: n.data.tags })),
        edges: currentEdges.map(e => ({ source: e.source, target: e.target })),
      };

      const { data, error } = await supabase.functions.invoke('ai-graph-assistant', {
        body: {
          message: currentInput,
          graphContext,
          conversationHistory: messages.slice(-10),
        },
      });

      if (error) throw error;

      // Apply graph changes using the latest state from refs
      let updatedNodes = [...nodesRef.current];
      let updatedEdges = [...edgesRef.current];
      let changeApplied = false;

      if (data.graphChanges) {
        const { action, nodeId, label, source, target, edgeId } = data.graphChanges;
        
        if (action === 'remove_node') {
          const searchTerm = (nodeId || label || '').toLowerCase();
          const nodeToRemove = updatedNodes.find(n => 
            n.id.toLowerCase() === searchTerm || 
            n.data.label.toLowerCase() === searchTerm
          );
          
          if (nodeToRemove) {
            updatedNodes = updatedNodes.filter(n => n.id !== nodeToRemove.id);
            updatedEdges = updatedEdges.filter(e => e.source !== nodeToRemove.id && e.target !== nodeToRemove.id);
            
            // Update refs before calling callbacks
            nodesRef.current = updatedNodes;
            edgesRef.current = updatedEdges;
            
            onNodesChange(updatedNodes);
            onEdgesChange(updatedEdges);
            changeApplied = true;
            toast.success(`Removed: ${nodeToRemove.data.label}`);
          }
        } else if (action === 'add_node') {
          const newNode: Node = {
            id: nodeId || `node-${Date.now()}`,
            type: 'default',
            position: { x: Math.random() * 500 + 100, y: Math.random() * 300 + 100 },
            data: { label: label || `Node ${updatedNodes.length + 1}`, shape: 'circle' },
            style: {
              background: 'hsl(195, 45%, 52%)',
              color: 'white',
              border: '2px solid hsl(195, 50%, 68%)',
              borderRadius: '50%',
              padding: '0',
              fontSize: '12px',
              fontWeight: '400',
              width: '85px',
              height: '85px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              textAlign: 'center',
              boxShadow: '0 3px 12px hsl(195 45% 52% / 0.2)',
            },
          };
          updatedNodes = [...updatedNodes, newNode];
          
          // Update refs before calling callbacks
          nodesRef.current = updatedNodes;
          
          onNodesChange(updatedNodes);
          changeApplied = true;
          toast.success(`Added: ${label}`);
        } else if (action === 'update_node' && nodeId && label) {
          const nodeToUpdate = updatedNodes.find(n => n.id === nodeId || n.data.label.toLowerCase() === nodeId.toLowerCase());
          if (nodeToUpdate) {
            updatedNodes = updatedNodes.map(n => 
              n.id === nodeToUpdate.id
                ? { ...n, data: { ...n.data, label } } 
                : n
            );
            
            // Update refs before calling callbacks
            nodesRef.current = updatedNodes;
            
            onNodesChange(updatedNodes);
            changeApplied = true;
            toast.success(`Updated: ${label}`);
          }
        } else if (action === 'add_edge' && source && target) {
          const sourceNode = updatedNodes.find(n => n.id === source || n.data.label.toLowerCase() === source.toLowerCase());
          const targetNode = updatedNodes.find(n => n.id === target || n.data.label.toLowerCase() === target.toLowerCase());
          if (sourceNode && targetNode) {
            const newEdge: Edge = {
              id: `edge-${Date.now()}`,
              source: sourceNode.id,
              target: targetNode.id,
              type: 'smoothstep',
              animated: true,
              style: { stroke: 'hsl(var(--primary))', strokeWidth: 2 },
              markerEnd: { type: 'arrowClosed' as any },
            };
            updatedEdges = [...updatedEdges, newEdge];
            
            // Update refs before calling callbacks
            edgesRef.current = updatedEdges;
            
            onEdgesChange(updatedEdges);
            changeApplied = true;
            toast.success('Added connection');
          }
        } else if (action === 'remove_edge' && edgeId) {
          updatedEdges = updatedEdges.filter(e => e.id !== edgeId);
          
          // Update refs before calling callbacks
          edgesRef.current = updatedEdges;
          
          onEdgesChange(updatedEdges);
          changeApplied = true;
          toast.success('Removed connection');
        }
      }

      // Add assistant message with confirmation
      const assistantMessage: Message = {
        role: 'assistant',
        content: changeApplied 
          ? data.message || 'Done!' 
          : data.message || "I couldn't complete that action. Please try rephrasing your request.",
      };
      setMessages((prev) => [...prev, assistantMessage]);
    } catch (error) {
      console.error('Error:', error);
      const errorMessage: Message = {
        role: 'assistant',
        content: 'Sorry, I encountered an error. Please try again.',
      };
      setMessages((prev) => [...prev, errorMessage]);
      toast.error('Failed to process message');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-96 border-l border-border/50 bg-card/50 backdrop-blur-lg flex flex-col h-full">
      {/* Header */}
      <div className="p-4 border-b border-border/50 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <MessageSquare className="w-5 h-5 text-primary" />
          <h2 className="text-lg font-light">AI Assistant</h2>
        </div>
        <Button variant="ghost" size="icon" onClick={onClose}>
          <X className="w-4 h-4" />
        </Button>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4" ref={scrollRef}>
        {messages.map((message, index) => (
          <div
            key={index}
            className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`max-w-[80%] rounded-lg p-3 ${
                message.role === 'user'
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-muted'
              }`}
            >
              <p className="text-sm whitespace-pre-wrap">{message.content}</p>
            </div>
          </div>
        ))}
        {isLoading && (
          <div className="flex justify-start">
            <div className="bg-muted rounded-lg p-3">
              <Loader2 className="w-4 h-4 animate-spin" />
            </div>
          </div>
        )}
      </div>

      {/* Input */}
      <div className="p-4 border-t border-border/50">
        <div className="flex gap-2">
          <Input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
            placeholder="Ask me anything..."
            disabled={isLoading}
            className="bg-background/50"
          />
          <Button onClick={sendMessage} disabled={isLoading} size="icon">
            <Send className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </div>
  );
};
