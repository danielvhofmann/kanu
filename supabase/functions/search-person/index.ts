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
    const { query } = await req.json();
    
    if (!query || query.length < 2) {
      return new Response(JSON.stringify({ results: [] }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    console.log('Searching Wikidata for:', query);

    // Search Wikidata
    const searchUrl = `https://www.wikidata.org/w/api.php?action=wbsearchentities&search=${encodeURIComponent(query)}&language=en&limit=10&format=json&origin=*`;
    const searchResponse = await fetch(searchUrl);
    const searchData = await searchResponse.json();

    // Filter for humans only
    const results = [];
    for (const item of searchData.search || []) {
      if (results.length >= 5) break;

      // Fetch entity details to check if it's a human
      const entityUrl = `https://www.wikidata.org/w/api.php?action=wbgetentities&ids=${item.id}&format=json&origin=*`;
      const entityResponse = await fetch(entityUrl);
      const entityData = await entityResponse.json();
      
      const entity = entityData.entities[item.id];
      const claims = entity?.claims || {};
      
      // Check if instance of (P31) includes human (Q5)
      const instanceOf = claims.P31 || [];
      const isHuman = instanceOf.some((claim: any) => 
        claim.mainsnak?.datavalue?.value?.id === 'Q5'
      );

      if (isHuman) {
        results.push({
          id: item.id,
          label: item.label,
          description: item.description || 'No description available'
        });
      }
    }

    console.log('Found', results.length, 'human results');

    return new Response(JSON.stringify({ results }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error in search-person:', error);
    return new Response(JSON.stringify({ error: (error as Error).message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
