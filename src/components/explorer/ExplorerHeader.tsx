import { Menu, User, Search, Loader2, ArrowLeft, Upload } from "lucide-react";
import { useState, useEffect, useRef } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { SidebarTrigger } from "@/components/ui/sidebar";
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
    <header className="border-b border-border bg-card sticky top-0 z-50">
      <div className="px-4 py-1 flex items-center gap-2 justify-between">
        {/* Sidebar Trigger - Left */}
        <div className="flex-shrink-0">
          <SidebarTrigger />
        </div>
        
        {/* Search Bar - Compact center */}
        <div ref={wrapperRef} className="flex-shrink-0 w-80 relative">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              type="text"
              placeholder="Search..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="pl-9 pr-9 h-9 bg-white border-border focus:border-border focus:ring-0 focus:ring-offset-0 focus-visible:ring-0 focus-visible:ring-offset-0 focus:outline-none w-full"
            />
            {isLoading && (
              <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground animate-spin" />
            )}
          </div>

          {isOpen && results.length > 0 && (
            <div className="absolute top-full left-0 right-0 mt-2 bg-card border border-border rounded-lg shadow-lg max-h-80 overflow-y-auto z-50">
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

        {/* Import Button and User Icon - Right */}
        <div className="flex-shrink-0 flex items-center gap-1">
          {onImportToBuilder && (
            <Button 
              variant="hero" 
              size="sm"
              onClick={onImportToBuilder}
              className="gap-1.5 h-8 text-xs px-2.5"
            >
              <Upload className="w-3.5 h-3.5" />
              <span className="hidden lg:inline">Import</span>
            </Button>
          )}
          <button className="p-1.5 hover:bg-accent rounded-full transition-colors">
            <User className="w-4 h-4" />
          </button>
        </div>
      </div>
    </header>
  );
};
