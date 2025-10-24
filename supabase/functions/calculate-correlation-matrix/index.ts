import "https://deno.land/x/xhr@0.1.0/mod.ts";
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
    const { data, threshold = 0.3 } = await req.json();
    
    if (!data || !Array.isArray(data) || data.length === 0) {
      throw new Error("Invalid data format. Expected array of objects.");
    }

    console.log(`Processing ${data.length} observations with ${Object.keys(data[0]).length} variables`);

    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    if (!LOVABLE_API_KEY) {
      throw new Error('LOVABLE_API_KEY is not configured');
    }

    // Prepare data for AI analysis
    const variableNames = Object.keys(data[0]);
    const dataMatrix = data.map(row => 
      variableNames.map(varName => {
        const val = row[varName];
        // Handle missing data indicators
        if (val === null || val === undefined || val === '' || 
            val === 'NA' || val === 'N/A' || val === 'null') {
          return null;
        }
        return parseFloat(val);
      })
    );

    // Calculate total data points and missing data percentage
    const totalPoints = dataMatrix.length * variableNames.length;
    const missingPoints = dataMatrix.flat().filter(v => v === null).length;
    const missingPercent = ((missingPoints / totalPoints) * 100).toFixed(1);

    const prompt = `You are a statistical analyst. Calculate a correlation matrix using Full Information Maximum Likelihood (FIML) to handle missing data.

Dataset Information:
- Variables: ${variableNames.length}
- Observations: ${data.length}
- Missing data: ${missingPercent}%
- Variable names: ${variableNames.join(', ')}

Data Matrix (each row is an observation, each column is a variable):
${JSON.stringify(dataMatrix.slice(0, 100))}${dataMatrix.length > 100 ? '\n... (data truncated for brevity)' : ''}

Instructions:
1. Use FIML to calculate pairwise correlations, properly handling missing data (null values)
2. For each pair of variables, compute the Pearson correlation coefficient using only complete pairs
3. Return ONLY correlations with absolute value >= ${threshold}
4. Return a JSON object with this structure:
{
  "correlations": [
    {
      "var1": "variable_name_1",
      "var2": "variable_name_2", 
      "coefficient": 0.75,
      "pValue": 0.001,
      "n": 2340
    }
  ],
  "statistics": {
    "totalVariables": ${variableNames.length},
    "totalObservations": ${data.length},
    "missingPercent": ${missingPercent},
    "threshold": ${threshold},
    "totalCorrelations": "number of correlations above threshold"
  }
}

Important:
- coefficient should be between -1 and 1
- Only include correlations where |coefficient| >= ${threshold}
- Exclude diagonal (self-correlations)
- Use FIML principles: use all available data for each pair
- Calculate p-values for significance testing`;

    console.log('Calling Lovable AI for correlation calculation...');

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
            content: 'You are a statistical analyst expert in correlation analysis and FIML. Return only valid JSON responses.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        temperature: 0.1, // Low temperature for consistent statistical calculations
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(
          JSON.stringify({ error: 'Rate limit exceeded. Please try again later.' }),
          { status: 429, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      if (response.status === 402) {
        return new Response(
          JSON.stringify({ error: 'Payment required. Please add credits to your Lovable AI workspace.' }),
          { status: 402, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      const errorText = await response.text();
      console.error('AI gateway error:', response.status, errorText);
      throw new Error(`AI gateway error: ${response.status}`);
    }

    const aiResponse = await response.json();
    const content = aiResponse.choices?.[0]?.message?.content;
    
    if (!content) {
      throw new Error('No response from AI');
    }

    console.log('AI Response received, parsing...');

    // Extract JSON from response (AI might wrap it in markdown)
    let correlationData;
    try {
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        correlationData = JSON.parse(jsonMatch[0]);
      } else {
        correlationData = JSON.parse(content);
      }
    } catch (parseError) {
      console.error('Failed to parse AI response:', content);
      throw new Error('Failed to parse correlation matrix from AI response');
    }

    console.log(`Successfully calculated ${correlationData.correlations?.length || 0} correlations`);

    return new Response(
      JSON.stringify({
        success: true,
        data: correlationData,
        metadata: {
          variableNames,
          observationCount: data.length,
          missingDataPercent: missingPercent
        }
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );

  } catch (error) {
    console.error('Error in calculate-correlation-matrix:', error);
    return new Response(
      JSON.stringify({ 
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred'
      }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});
