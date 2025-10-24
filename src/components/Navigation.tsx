import { Button } from "@/components/ui/button";
import { Network } from "lucide-react";
import { useNavigate } from "react-router-dom";

export const Navigation = () => {
  const navigate = useNavigate();
  
  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-lg border-b border-border/50">
      <div className="container mx-auto px-6">
        <div className="flex items-center justify-between h-20">
          {/* Logo */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-hero flex items-center justify-center shadow-md">
              <Network className="w-6 h-6 text-white" strokeWidth={1.5} />
            </div>
            <span className="text-2xl font-extralight tracking-tight">corners</span>
          </div>
          
          {/* Navigation links */}
          <div className="hidden md:flex items-center gap-8">
            <a href="#features" className="text-sm text-foreground hover:text-primary transition-colors duration-300">
              Features
            </a>
            <a href="#use-cases" className="text-sm text-foreground hover:text-primary transition-colors duration-300">
              Use Cases
            </a>
            <Button variant="ghost" size="sm" onClick={() => navigate('/explorer')} className="text-sm">
              Explorer Mode
            </Button>
            <a href="#community" className="text-sm text-foreground hover:text-primary transition-colors duration-300">
              Community
            </a>
            <a href="#docs" className="text-sm text-foreground hover:text-primary transition-colors duration-300">
              Docs
            </a>
          </div>
          
          {/* CTA buttons */}
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="sm" onClick={() => navigate('/auth')}>
              Sign In
            </Button>
            <Button variant="default" size="sm" onClick={() => navigate('/auth')} className="bg-primary hover:bg-primary-light">
              Register
            </Button>
          </div>
        </div>
      </div>
    </nav>
  );
};
