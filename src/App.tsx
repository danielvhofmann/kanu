import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/AppSidebar";
import { ExplorerProvider, useExplorer } from "@/contexts/ExplorerContext";
import { ExplorerSearchBar } from "@/components/explorer/ExplorerSearchBar";
import Index from "./pages/Index";
import Editor from "./pages/Editor";
import Auth from "./pages/Auth";
import Explorer from "./pages/Explorer";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

function AppHeader() {
  const location = useLocation();
  const { currentPersonName, currentPersonId, searchHandler, importHandler, clearCurrentPerson } = useExplorer();
  
  const isExplorerWithPerson = location.pathname === '/explorer' && currentPersonId && currentPersonName;

  return (
    <header className="h-12 flex items-center border-b border-border/50 bg-background/80 backdrop-blur-lg sticky top-0 z-40 px-4">
      <SidebarTrigger />
      {isExplorerWithPerson && searchHandler && (
        <ExplorerSearchBar
          currentPersonName={currentPersonName}
          onSearch={searchHandler}
          onBack={clearCurrentPerson}
          onImportToBuilder={importHandler || undefined}
        />
      )}
    </header>
  );
}

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <ExplorerProvider>
          <SidebarProvider>
            <div className="min-h-screen flex w-full">
              <AppSidebar />
              <main className="flex-1 flex flex-col">
                <AppHeader />
                <Routes>
                  <Route path="/" element={<Index />} />
                  <Route path="/editor" element={<Editor />} />
                  <Route path="/explorer" element={<Explorer />} />
                  <Route path="/auth" element={<Auth />} />
                  {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
                  <Route path="*" element={<NotFound />} />
                </Routes>
              </main>
            </div>
          </SidebarProvider>
        </ExplorerProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
