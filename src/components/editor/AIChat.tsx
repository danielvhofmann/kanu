import { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
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

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const sendMessage = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage: Message = { role: 'user', content: input };
    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      const graphContext = {
        nodes: nodes.map(n => ({ id: n.id, label: n.data.label, tags: n.data.tags })),
        edges: edges.map(e => ({ source: e.source, target: e.target })),
      };

      const { data, error } = await supabase.functions.invoke('ai-graph-assistant', {
        body: {
          message: input,
          graphContext,
          conversationHistory: messages.slice(-10), // Keep last 10 messages for context
        },
      });

      if (error) throw error;

      console.log('AI Response:', data);

      // Apply graph changes if any
      if (data.graphChanges) {
        const { action, nodeId, label, source, target, edgeId } = data.graphChanges;
        console.log('Graph change:', action, { nodeId, label, source, target, edgeId });
        
        if (action === 'remove_node') {
          // Find node by ID or label (case-insensitive)
          const searchTerm = (nodeId || label || '').toLowerCase();
          const nodeToRemove = nodes.find(n => 
            n.id.toLowerCase() === searchTerm || 
            n.data.label.toLowerCase() === searchTerm
          );
          
          console.log('Looking for node to remove:', searchTerm, 'Found:', nodeToRemove);
          
          if (nodeToRemove) {
            const newNodes = nodes.filter(n => n.id !== nodeToRemove.id);
            const newEdges = edges.filter(e => e.source !== nodeToRemove.id && e.target !== nodeToRemove.id);
            onNodesChange(newNodes);
            onEdgesChange(newEdges);
            toast.success(`Removed node: ${nodeToRemove.data.label}`);
          } else {
            toast.error(`Could not find node: ${searchTerm}`);
          }
        } else if (action === 'add_node') {
          const newNode: Node = {
            id: `node-${Date.now()}`,
            type: 'default',
            position: { x: Math.random() * 500 + 100, y: Math.random() * 300 + 100 },
            data: { label: label || `Node ${nodes.length + 1}`, shape: 'circle' },
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
          onNodesChange([...nodes, newNode]);
          toast.success(`Added node: ${label}`);
        } else if (action === 'update_node' && nodeId && label) {
          const nodeToUpdate = nodes.find(n => n.id === nodeId || n.data.label.toLowerCase() === nodeId.toLowerCase());
          if (nodeToUpdate) {
            onNodesChange(nodes.map(n => 
              n.id === nodeToUpdate.id
                ? { ...n, data: { ...n.data, label } } 
                : n
            ));
            toast.success(`Updated node: ${label}`);
          }
        } else if (action === 'add_edge' && source && target) {
          const sourceNode = nodes.find(n => n.id === source || n.data.label.toLowerCase() === source.toLowerCase());
          const targetNode = nodes.find(n => n.id === target || n.data.label.toLowerCase() === target.toLowerCase());
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
            onEdgesChange([...edges, newEdge]);
            toast.success('Added connection');
          }
        } else if (action === 'remove_edge' && edgeId) {
          onEdgesChange(edges.filter(e => e.id !== edgeId));
          toast.success('Removed connection');
        }
      }

      const assistantMessage: Message = {
        role: 'assistant',
        content: data.message || 'Done!',
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
      <ScrollArea className="flex-1 p-4" ref={scrollRef}>
        <div className="space-y-4">
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
      </ScrollArea>

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
