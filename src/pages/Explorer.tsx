import { useState } from "react";
import { SearchAutocomplete } from "@/components/explorer/SearchAutocomplete";
import { KnowledgeGraph } from "@/components/explorer/KnowledgeGraph";
import { Network } from "lucide-react";

const Explorer = () => {
  const [selectedPerson, setSelectedPerson] = useState<{ id: string; name: string } | null>(null);

  const handlePersonSelect = (personId: string, personName: string) => {
    setSelectedPerson({ id: personId, name: personName });
  };

  const handleBack = () => {
    setSelectedPerson(null);
  };

  if (selectedPerson) {
    return (
      <KnowledgeGraph 
        personId={selectedPerson.id}
        personName={selectedPerson.name}
        onBack={handleBack}
      />
    );
  }

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center p-6">
      <div className="text-center max-w-3xl mb-12">
        <div className="inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-gradient-hero mb-6">
          <Network className="w-10 h-10 text-white" strokeWidth={1.5} />
        </div>
        <h1 className="text-5xl font-extralight tracking-tight mb-4">
          Explorer Mode
        </h1>
        <p className="text-xl text-muted-foreground mb-2">
          Discover historical knowledge networks
        </p>
        <p className="text-muted-foreground">
          Search for any historical figure and explore their connections through an interactive network visualization powered by Wikidata and Wikipedia.
        </p>
      </div>

      <SearchAutocomplete onSelect={handlePersonSelect} />

      <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-6 max-w-3xl">
        <div className="text-center">
          <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mx-auto mb-3">
            <span className="text-2xl">🔍</span>
          </div>
          <h3 className="font-medium mb-2">Search</h3>
          <p className="text-sm text-muted-foreground">
            Find any historical figure from Wikidata's vast database
          </p>
        </div>
        
        <div className="text-center">
          <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mx-auto mb-3">
            <span className="text-2xl">🕸️</span>
          </div>
          <h3 className="font-medium mb-2">Visualize</h3>
          <p className="text-sm text-muted-foreground">
            See connections through an interactive force-directed graph
          </p>
        </div>
        
        <div className="text-center">
          <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mx-auto mb-3">
            <span className="text-2xl">💡</span>
          </div>
          <h3 className="font-medium mb-2">Learn</h3>
          <p className="text-sm text-muted-foreground">
            Get AI-generated explanations of historical connections
          </p>
        </div>
      </div>

      <div className="mt-12">
        <p className="text-sm text-muted-foreground mb-4">Try searching for:</p>
        <div className="flex flex-wrap gap-2 justify-center">
          {['Albert Einstein', 'Leonardo da Vinci', 'Marie Curie', 'William Shakespeare', 'Ada Lovelace'].map(name => (
            <button
              key={name}
              onClick={() => {
                // This would require the ID, so it's just a visual example
                // In a real implementation, you'd search for these and get their IDs
              }}
              className="px-4 py-2 rounded-full bg-secondary hover:bg-secondary/80 text-sm transition-colors"
            >
              {name}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Explorer;
