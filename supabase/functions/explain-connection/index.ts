import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { person1, person2, nodes, links } = await req.json();

    console.log('Explaining connection between:', person1, 'and', person2);

    // Find the persons in nodes
    const p1 = nodes.find((n: any) => n.id === person1 || n.name === person1);
    const p2 = nodes.find((n: any) => n.id === person2 || n.name === person2);

    if (!p1 || !p2) {
      throw new Error('Persons not found in network');
    }

    // Find the connection
    const connection = links.find((l: any) => 
      (l.source === p1.id || l.source.id === p1.id) && 
      (l.target === p2.id || l.target.id === p2.id) ||
      (l.source === p2.id || l.source.id === p2.id) && 
      (l.target === p1.id || l.target.id === p1.id)
    );

    // Build context
    let context = `${p1.name} (${p1.profession})`;
    if (p1.birth || p1.death) {
      context += ` lived ${p1.birth || '?'}-${p1.death || 'present'}`;
    }
    context += `. ${p1.bio || ''}`;
    
    context += `\n\n${p2.name} (${p2.profession})`;
    if (p2.birth || p2.death) {
      context += ` lived ${p2.birth || '?'}-${p2.death || 'present'}`;
    }
    context += `. ${p2.bio || ''}`;

    if (connection) {
      context += `\n\nTheir relationship: ${connection.relationship}`;
      if (connection.year) {
        context += ` in ${connection.year}`;
      } else if (connection.startYear && connection.endYear) {
        context += ` from ${connection.startYear} to ${connection.endYear}`;
      }
    }

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
          {
            role: 'system',
            content: 'You are a knowledgeable historian. Explain connections between historical figures in 2-3 clear, engaging sentences. Focus on their historical significance and impact.'
          },
          {
            role: 'user',
            content: `Based on this information, explain the connection between ${p1.name} and ${p2.name}:\n\n${context}`
          }
        ]
      })
    });

    if (!response.ok) {
      throw new Error(`AI request failed: ${response.status}`);
    }

    const data = await response.json();
    const explanation = data.choices[0].message.content;

    console.log('Generated explanation');

    return new Response(JSON.stringify({ explanation }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error in explain-connection:', error);
    return new Response(JSON.stringify({ error: (error as Error).message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
