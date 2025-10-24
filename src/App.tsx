import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/AppSidebar";
import Index from "./pages/Index";
import Editor from "./pages/Editor";
import Auth from "./pages/Auth";
import Explorer from "./pages/Explorer";
import Collections from "./pages/Collections";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

function AppContent() {
  const location = useLocation();
  const isLandingPage = location.pathname === '/';
  const isExplorerOrEditor = location.pathname === '/explorer' || location.pathname === '/editor';
  
  return (
    <>
      {!isExplorerOrEditor && !isLandingPage && (
        <header className="h-12 flex items-center border-b border-border/50 bg-background/80 backdrop-blur-lg sticky top-0 z-40 px-4">
          <SidebarTrigger />
        </header>
      )}
      <Routes>
        <Route path="/" element={<Index />} />
        <Route path="/editor" element={<Editor />} />
        <Route path="/explorer" element={<Explorer />} />
        <Route path="/collections" element={<Collections />} />
        <Route path="/auth" element={<Auth />} />
        {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
        <Route path="*" element={<NotFound />} />
      </Routes>
    </>
  );
}

function AppLayout() {
  const location = useLocation();
  const isLandingPage = location.pathname === '/';
  
  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full">
        {!isLandingPage && <AppSidebar />}
        <main className="flex-1 flex flex-col">
          <AppContent />
        </main>
      </div>
    </SidebarProvider>
  );
}

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AppLayout />
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
