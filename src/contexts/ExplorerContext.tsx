import { createContext, useContext, useState, ReactNode } from 'react';

interface ExplorerContextType {
  currentPersonId: string | null;
  currentPersonName: string | null;
  setCurrentPerson: (id: string, name: string) => void;
  clearCurrentPerson: () => void;
  onSearch?: (personId: string, personName: string) => void;
  onImportToBuilder?: () => void;
  setSearchHandler: (handler: (personId: string, personName: string) => void) => void;
  setImportHandler: (handler: () => void) => void;
}

const ExplorerContext = createContext<ExplorerContextType | undefined>(undefined);

export function ExplorerProvider({ children }: { children: ReactNode }) {
  const [currentPersonId, setCurrentPersonId] = useState<string | null>(null);
  const [currentPersonName, setCurrentPersonName] = useState<string | null>(null);
  const [onSearch, setOnSearch] = useState<((personId: string, personName: string) => void) | undefined>();
  const [onImportToBuilder, setOnImportToBuilder] = useState<(() => void) | undefined>();

  const setCurrentPerson = (id: string, name: string) => {
    setCurrentPersonId(id);
    setCurrentPersonName(name);
  };

  const clearCurrentPerson = () => {
    setCurrentPersonId(null);
    setCurrentPersonName(null);
  };

  const setSearchHandler = (handler: (personId: string, personName: string) => void) => {
    setOnSearch(() => handler);
  };

  const setImportHandler = (handler: () => void) => {
    setOnImportToBuilder(() => handler);
  };

  return (
    <ExplorerContext.Provider
      value={{
        currentPersonId,
        currentPersonName,
        setCurrentPerson,
        clearCurrentPerson,
        onSearch,
        onImportToBuilder,
        setSearchHandler,
        setImportHandler,
      }}
    >
      {children}
    </ExplorerContext.Provider>
  );
}

export function useExplorer() {
  const context = useContext(ExplorerContext);
  if (context === undefined) {
    throw new Error('useExplorer must be used within an ExplorerProvider');
  }
  return context;
}
