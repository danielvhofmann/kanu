import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface WikidataEntity {
  labels?: { en?: { value: string } };
  descriptions?: { en?: { value: string } };
  claims?: Record<string, any[]>;
  sitelinks?: Record<string, any>;
}

const RELATIONSHIP_PROPERTIES = {
  P737: 'influenced by',
  P1066: 'student of',
  P802: 'student',
  P108: 'employer',
  P185: 'doctoral student',
  P184: 'doctoral advisor',
  P1327: 'colleague',
  P451: 'partner',
  P26: 'spouse',
};

const PROFESSION_KEYWORDS: Record<string, string> = {
  'mathematician': 'Mathematician',
  'physicist': 'Physicist',
  'chemist': 'Chemist',
  'biologist': 'Biologist',
  'philosopher': 'Philosopher',
  'painter': 'Painter',
  'sculptor': 'Sculptor',
  'composer': 'Composer',
  'writer': 'Writer',
  'poet': 'Poet',
  'politician': 'Politician',
  'scientist': 'Scientist',
  'artist': 'Artist',
  'musician': 'Musician',
  'architect': 'Architect',
  'engineer': 'Engineer',
};

const CATEGORY_MAP: Record<string, string> = {
  'Mathematician': 'Science',
  'Physicist': 'Science',
  'Chemist': 'Science',
  'Biologist': 'Science',
  'Scientist': 'Science',
  'Engineer': 'Science',
  'Philosopher': 'Philosophy',
  'Painter': 'Art',
  'Sculptor': 'Art',
  'Artist': 'Art',
  'Architect': 'Art',
  'Composer': 'Music',
  'Musician': 'Music',
  'Writer': 'Art',
  'Poet': 'Art',
  'Politician': 'Politics',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { personId } = await req.json();
    console.log('Fetching network for:', personId);

    // Fetch main person data
    const mainEntityUrl = `https://www.wikidata.org/w/api.php?action=wbgetentities&ids=${personId}&format=json&origin=*`;
    const mainResponse = await fetch(mainEntityUrl);
    const mainData = await mainResponse.json();
    const mainEntity: WikidataEntity = mainData.entities[personId];

    if (!mainEntity) {
      throw new Error('Person not found');
    }

    // Extract main person info
    const mainPerson = extractPersonData(personId, mainEntity);
    
    // Extract connections
    const connections: Array<{ id: string; type: string; relationship: string; qualifiers?: any }> = [];
    const claims = mainEntity.claims || {};

    for (const [propId, relationshipName] of Object.entries(RELATIONSHIP_PROPERTIES)) {
      const propClaims = claims[propId] || [];
      for (const claim of propClaims) {
        const targetId = claim.mainsnak?.datavalue?.value?.id;
        if (targetId) {
          connections.push({
            id: targetId,
            type: propId,
            relationship: relationshipName,
            qualifiers: claim.qualifiers
          });
        }
      }
    }

    console.log('Found', connections.length, 'connections');

    // Fetch all connected people
    const connectedPeople = [];
    const batchSize = 50;
    
    for (let i = 0; i < connections.length; i += batchSize) {
      const batch = connections.slice(i, i + batchSize);
      const ids = batch.map(c => c.id).join('|');
      
      const batchUrl = `https://www.wikidata.org/w/api.php?action=wbgetentities&ids=${ids}&format=json&origin=*`;
      const batchResponse = await fetch(batchUrl);
      const batchData = await batchResponse.json();

      for (const connection of batch) {
        const entity: WikidataEntity = batchData.entities[connection.id];
        if (!entity) continue;

        // Check if human
        const instanceOf = entity.claims?.P31 || [];
        const isHuman = instanceOf.some((claim: any) => 
          claim.mainsnak?.datavalue?.value?.id === 'Q5'
        );

        if (isHuman) {
          const personData = extractPersonData(connection.id, entity);
          const sitelinkCount = Object.keys(entity.sitelinks || {}).length;
          const connectionCount = connections.filter(c => c.id === connection.id).length;
          const hasTemporalData = connection.qualifiers && 
            (connection.qualifiers.P585 || connection.qualifiers.P580 || connection.qualifiers.P582);

          const importanceScore = 
            sitelinkCount * 10 + 
            connectionCount * 5 + 
            (hasTemporalData ? 50 : 0) +
            (!personData.birth && personData.death ? -20 : 0);

          connectedPeople.push({
            ...personData,
            connectionType: connection.type,
            relationship: connection.relationship,
            qualifiers: connection.qualifiers,
            importanceScore
          });
        }
      }
    }

    // Sort by importance and take top 15
    connectedPeople.sort((a, b) => b.importanceScore - a.importanceScore);
    const topPeople = connectedPeople.slice(0, 15);

    console.log('Selected top', topPeople.length, 'connected people');

    // Build nodes
    const nodes = [
      {
        ...mainPerson,
        importanceScore: 1000
      },
      ...topPeople.map(p => ({
        id: p.id,
        name: p.name,
        category: p.category,
        profession: p.profession,
        bio: p.bio,
        birth: p.birth,
        death: p.death,
        imageUrl: p.imageUrl,
        wikipediaUrl: p.wikipediaUrl,
        importanceScore: p.importanceScore
      }))
    ];

    // Build links with temporal data
    const links = topPeople.map(p => {
      const link: any = {
        source: personId,
        target: p.id,
        type: p.connectionType,
        relationship: p.relationship
      };

      // Extract temporal data from qualifiers
      if (p.qualifiers) {
        // Point in time (P585)
        if (p.qualifiers.P585) {
          const timeValue = p.qualifiers.P585[0]?.datavalue?.value?.time;
          if (timeValue) {
            const year = extractYear(timeValue);
            if (year) link.year = year;
          }
        }

        // Start time (P580) and End time (P582)
        if (p.qualifiers.P580) {
          const startTime = p.qualifiers.P580[0]?.datavalue?.value?.time;
          if (startTime) {
            const year = extractYear(startTime);
            if (year) link.startYear = year;
          }
        }
        if (p.qualifiers.P582) {
          const endTime = p.qualifiers.P582[0]?.datavalue?.value?.time;
          if (endTime) {
            const year = extractYear(endTime);
            if (year) link.endYear = year;
          }
        }
      }

      return link;
    });

    return new Response(JSON.stringify({ nodes, links }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error in get-person-network:', error);
    return new Response(JSON.stringify({ error: (error as Error).message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});

function extractPersonData(id: string, entity: WikidataEntity) {
  const name = entity.labels?.en?.value || 'Unknown';
  const bio = entity.descriptions?.en?.value || '';
  const claims = entity.claims || {};

  // Extract birth/death dates
  const birth = extractYear(claims.P569?.[0]?.mainsnak?.datavalue?.value?.time);
  const death = extractYear(claims.P570?.[0]?.mainsnak?.datavalue?.value?.time);

  // Extract profession
  const professions = extractProfessions(bio, claims);
  const profession = professions.length >= 3 ? 'Polymath' : professions[0] || 'Scholar';
  const category = CATEGORY_MAP[profession] || 'Other';

  // Extract image URL
  let imageUrl = '';
  const imageFile = claims.P18?.[0]?.mainsnak?.datavalue?.value;
  if (imageFile) {
    const fileName = imageFile.replace(/ /g, '_');
    const md5 = '';
    imageUrl = `https://commons.wikimedia.org/wiki/Special:FilePath/${fileName}?width=300`;
  }

  // Extract Wikipedia URL
  let wikipediaUrl = '';
  const sitelinks = entity.sitelinks || {};
  if (sitelinks.enwiki) {
    const title = sitelinks.enwiki.title.replace(/ /g, '_');
    wikipediaUrl = `https://en.wikipedia.org/wiki/${title}`;
  }

  return {
    id,
    name,
    bio,
    birth,
    death,
    profession,
    category,
    imageUrl,
    wikipediaUrl
  };
}

function extractProfessions(description: string, claims: Record<string, any[]>): string[] {
  const professions: string[] = [];
  const lowerDesc = description.toLowerCase();

  // Check description for keywords
  for (const [keyword, profession] of Object.entries(PROFESSION_KEYWORDS)) {
    if (lowerDesc.includes(keyword)) {
      if (!professions.includes(profession)) {
        professions.push(profession);
      }
    }
  }

  // Check occupation property (P106)
  const occupations = claims.P106 || [];
  for (const occ of occupations) {
    const occId = occ.mainsnak?.datavalue?.value?.id;
    const occMapping: Record<string, string> = {
      'Q170790': 'Mathematician',
      'Q169470': 'Physicist',
      'Q593644': 'Chemist',
      'Q864503': 'Biologist',
      'Q4964182': 'Philosopher',
      'Q1028181': 'Painter',
      'Q1281618': 'Sculptor',
      'Q36834': 'Composer',
      'Q36180': 'Writer',
      'Q49757': 'Poet',
      'Q82955': 'Politician',
    };
    if (occId && occMapping[occId]) {
      const prof = occMapping[occId];
      if (!professions.includes(prof)) {
        professions.push(prof);
      }
    }
  }

  return professions;
}

function extractYear(timeString?: string): number | undefined {
  if (!timeString) return undefined;
  const match = timeString.match(/[+-]?(\d{1,4})-/);
  if (match) {
    return parseInt(match[1]);
  }
  return undefined;
}
