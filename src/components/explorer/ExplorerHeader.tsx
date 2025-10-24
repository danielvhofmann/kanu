import { Menu, User, Search, Loader2, ArrowLeft, Upload } from "lucide-react";
import { useState, useEffect, useRef } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface SearchResult {
  id: string;
  label: string;
  description: string;
}

interface ExplorerHeaderProps {
  currentPersonName: string;
  onSearch: (personId: string, personName: string) => void;
  onBack: () => void;
  onImportToBuilder?: () => void;
}

export const ExplorerHeader = ({ currentPersonName, onSearch, onBack, onImportToBuilder }: ExplorerHeaderProps) => {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchResult[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const wrapperRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    const searchPerson = async () => {
      if (query.length < 2) {
        setResults([]);
        setIsOpen(false);
        return;
      }

      setIsLoading(true);
      try {
        const { data, error } = await supabase.functions.invoke('search-person', {
          body: { query }
        });

        if (error) throw error;

        setResults(data.results || []);
        setIsOpen(true);
      } catch (error) {
        console.error('Search error:', error);
        toast.error('Failed to search. Please try again.');
      } finally {
        setIsLoading(false);
      }
    };

    const debounce = setTimeout(searchPerson, 300);
    return () => clearTimeout(debounce);
  }, [query]);

  const handleSelect = (result: SearchResult) => {
    onSearch(result.id, result.label);
    setQuery("");
    setResults([]);
    setIsOpen(false);
  };

  return (
    <header className="border-b border-border bg-card sticky top-0 z-50 relative">
      <div className="px-6 h-16 flex items-center gap-6">
        {/* Left: Back, Menu and Branding */}
        <div className="flex items-center gap-3">
          <button 
            onClick={onBack}
            className="p-2 hover:bg-accent rounded-lg transition-colors"
            title="Back to search"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <button className="p-2 hover:bg-accent rounded-lg transition-colors">
            <Menu className="w-5 h-5" />
          </button>
          <span className="font-semibold text-lg">Corners</span>
        </div>

        {/* Center: Search Bar */}
        <div ref={wrapperRef} className="flex-1 max-w-xl relative">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              type="text"
              placeholder={`Search... (currently viewing ${currentPersonName})`}
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="pl-9 pr-9 h-10 bg-white border-border focus:border-border focus:ring-0 focus:ring-offset-0 focus-visible:ring-0 focus-visible:ring-offset-0 focus:outline-none"
            />
            {isLoading && (
              <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground animate-spin" />
            )}
          </div>

          {isOpen && results.length > 0 && (
            <div className="absolute top-full left-0 right-0 mt-2 bg-card border border-border rounded-lg shadow-lg max-h-80 overflow-y-auto">
              {results.map((result) => (
                <button
                  key={result.id}
                  onClick={() => handleSelect(result)}
                  className="w-full px-4 py-3 text-left hover:bg-accent transition-colors border-b border-border last:border-b-0 first:rounded-t-lg last:rounded-b-lg"
                >
                  <div className="font-medium text-sm">{result.label}</div>
                  <div className="text-xs text-muted-foreground mt-1">{result.description}</div>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Right: Import Button and User Icon - Absolutely positioned */}
      <div className="absolute top-3 right-6 flex items-center gap-2">
        {onImportToBuilder && (
          <Button 
            variant="hero" 
            size="sm"
            onClick={onImportToBuilder}
            className="gap-2"
          >
            <Upload className="w-4 h-4" />
            Import to Builder
          </Button>
        )}
        <button className="p-2 hover:bg-accent rounded-full transition-colors">
          <User className="w-5 h-5" />
        </button>
      </div>
    </header>
  );
};
