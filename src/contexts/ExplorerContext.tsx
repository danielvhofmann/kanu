import { createContext, useContext, useState, useCallback, ReactNode } from 'react';

interface ExplorerContextType {
  currentPersonId: string | null;
  currentPersonName: string | null;
  searchHandler: ((personId: string, personName: string) => void) | null;
  importHandler: (() => void) | null;
  setCurrentPerson: (id: string, name: string) => void;
  clearCurrentPerson: () => void;
  setSearchHandler: (handler: (personId: string, personName: string) => void) => void;
  setImportHandler: (handler: () => void) => void;
}

const ExplorerContext = createContext<ExplorerContextType | undefined>(undefined);

export function ExplorerProvider({ children }: { children: ReactNode }) {
  const [currentPersonId, setCurrentPersonId] = useState<string | null>(null);
  const [currentPersonName, setCurrentPersonName] = useState<string | null>(null);
  const [searchHandler, setSearchHandlerState] = useState<((personId: string, personName: string) => void) | null>(null);
  const [importHandler, setImportHandlerState] = useState<(() => void) | null>(null);

  const setCurrentPerson = useCallback((id: string, name: string) => {
    setCurrentPersonId(id);
    setCurrentPersonName(name);
  }, []);

  const clearCurrentPerson = useCallback(() => {
    setCurrentPersonId(null);
    setCurrentPersonName(null);
  }, []);

  const setSearchHandler = useCallback((handler: (personId: string, personName: string) => void) => {
    setSearchHandlerState(() => handler);
  }, []);

  const setImportHandler = useCallback((handler: () => void) => {
    setImportHandlerState(() => handler);
  }, []);

  return (
    <ExplorerContext.Provider
      value={{
        currentPersonId,
        currentPersonName,
        searchHandler,
        importHandler,
        setCurrentPerson,
        clearCurrentPerson,
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
