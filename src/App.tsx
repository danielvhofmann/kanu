import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/AppSidebar";
import { Network } from "lucide-react";
import Index from "./pages/Index";
import Editor from "./pages/Editor";
import Auth from "./pages/Auth";
import Explorer from "./pages/Explorer";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <SidebarProvider>
          <div className="min-h-screen flex w-full">
            <AppSidebar />
            <main className="flex-1 flex flex-col">
              <header className="h-12 flex items-center gap-3 border-b border-border/50 bg-background/80 backdrop-blur-lg sticky top-0 z-40 px-4">
                <SidebarTrigger />
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-gradient-hero flex items-center justify-center">
                    <Network className="w-4 h-4 text-white" strokeWidth={1.5} />
                  </div>
                  <span className="text-lg font-extralight tracking-tight">corners</span>
                </div>
              </header>
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
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
