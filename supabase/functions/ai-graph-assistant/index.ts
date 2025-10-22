import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { message, graphContext, conversationHistory } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    const YOU_API_KEY = Deno.env.get('YOU_API_KEY');

    if (!LOVABLE_API_KEY) throw new Error('LOVABLE_API_KEY not configured');

    // Build system prompt with graph context
    const systemPrompt = `You are an AI assistant that helps users build and modify network maps/graphs.

Current graph state:
- Nodes: ${JSON.stringify(graphContext.nodes)}
- Edges: ${JSON.stringify(graphContext.edges)}

You can:
1. Answer questions about the current graph
2. Suggest modifications to nodes and edges
3. Search the web for information using the web_search tool
4. Find images using the image_search tool
5. Help users build graphs from scratch

When modifying the graph, return your suggestions in a structured format that can be parsed.
Always be helpful and provide accurate information.`;

    // Prepare tools for the AI
    const tools = [
      {
        type: "function",
        function: {
          name: "web_search",
          description: "Search the web for current information using you.com API",
          parameters: {
            type: "object",
            properties: {
              query: {
                type: "string",
                description: "The search query"
              }
            },
            required: ["query"]
          }
        }
      },
      {
        type: "function",
        function: {
          name: "image_search",
          description: "Search for images using you.com API",
          parameters: {
            type: "object",
            properties: {
              query: {
                type: "string",
                description: "The image search query"
              }
            },
            required: ["query"]
          }
        }
      },
      {
        type: "function",
        function: {
          name: "modify_graph",
          description: "Modify the graph by adding/removing/updating nodes and edges",
          parameters: {
            type: "object",
            properties: {
              action: {
                type: "string",
                enum: ["add_node", "remove_node", "add_edge", "remove_edge", "update_node"],
                description: "The action to perform"
              },
              nodeId: {
                type: "string",
                description: "The node ID (for remove/update actions)"
              },
              label: {
                type: "string",
                description: "Node label (for add/update actions)"
              },
              source: {
                type: "string",
                description: "Source node ID (for add_edge)"
              },
              edgeId: {
                type: "string",
                description: "Edge ID (for remove_edge)"
              }
            },
            required: ["action"]
          }
        }
      }
    ];

    // Call Lovable AI
    const response = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${LOVABLE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-2.5-flash',
        messages: [
          { role: 'system', content: systemPrompt },
          ...conversationHistory,
          { role: 'user', content: message }
        ],
        tools: tools,
        tool_choice: 'auto',
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Lovable AI error:', response.status, errorText);
      throw new Error(`Lovable AI error: ${response.status}`);
    }

    const data = await response.json();
    const aiMessage = data.choices[0].message;
    
    // Handle tool calls
    let finalMessage = aiMessage.content || '';
    let graphChanges = null;

    if (aiMessage.tool_calls && aiMessage.tool_calls.length > 0) {
      for (const toolCall of aiMessage.tool_calls) {
        const args = JSON.parse(toolCall.function.arguments);
        
        if (toolCall.function.name === 'web_search' && YOU_API_KEY) {
          const searchResponse = await fetch(`https://api.ydc-index.io/search?query=${encodeURIComponent(args.query)}`, {
            headers: {
              'X-API-Key': YOU_API_KEY,
            },
          });
          const searchData = await searchResponse.json();
          finalMessage += `\n\nSearch results: ${JSON.stringify(searchData.hits?.slice(0, 3))}`;
        } else if (toolCall.function.name === 'image_search' && YOU_API_KEY) {
          const imageResponse = await fetch(`https://api.ydc-index.io/search?query=${encodeURIComponent(args.query + ' image')}`, {
            headers: {
              'X-API-Key': YOU_API_KEY,
            },
          });
          const imageData = await imageResponse.json();
          finalMessage += `\n\nImages found: ${JSON.stringify(imageData.hits?.slice(0, 3))}`;
        } else if (toolCall.function.name === 'modify_graph') {
          // Handle graph modifications
          graphChanges = args;
        }
      }
    }

    return new Response(
      JSON.stringify({
        message: finalMessage,
        graphChanges: graphChanges,
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
});
