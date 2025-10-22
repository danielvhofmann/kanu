import { useState } from "react";
import { Button } from "@/components/ui/button";
import { ArrowRight, Network } from "lucide-react";
import { useNavigate } from "react-router-dom";
import heroImage from "@/assets/hero-network.jpg";
import { DemoPresentation } from "./DemoPresentation";

export const Hero = () => {
  const navigate = useNavigate();
  const [showDemo, setShowDemo] = useState(false);
  
  return (
    <section className="relative min-h-[90vh] flex items-center justify-center overflow-hidden">
      {/* Subtle gradient background */}
      <div className="absolute inset-0 bg-gradient-subtle -z-10" />
      
      {/* Animated glow orbs */}
      <div className="absolute top-20 left-10 w-96 h-96 bg-primary-glow/20 rounded-full blur-3xl animate-glow" />
      <div className="absolute bottom-20 right-10 w-96 h-96 bg-accent-light/20 rounded-full blur-3xl animate-glow" style={{ animationDelay: "1s" }} />
      
      <div className="container mx-auto px-6 relative z-10">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          {/* Left content */}
          <div className="space-y-8 animate-fade-in">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-muted/50 rounded-full border border-border/50 backdrop-blur-sm">
              <Network className="w-4 h-4 text-primary" />
              <span className="text-sm text-muted-foreground">Visualize Complex Systems</span>
            </div>
            
            <h1 className="text-6xl lg:text-7xl font-extralight leading-tight text-balance">
              Turn complexity into{" "}
              <span className="bg-gradient-accent bg-clip-text text-transparent">
                clarity
              </span>
            </h1>
            
            <p className="text-xl text-muted-foreground leading-relaxed max-w-xl text-balance">
              Organize complex data into beautiful relationship maps that reveal connections, 
              patterns, and insights—making systems thinking effortless and elegant.
            </p>
            
            <div className="flex flex-wrap gap-4 pt-4">
              <Button 
                size="lg" 
                variant="hero" 
                className="group"
                onClick={() => navigate('/auth')}
              >
                Sign In
                <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
              </Button>
              <Button 
                size="lg" 
                variant="outline"
                onClick={() => navigate('/editor')}
              >
                Start Mapping Free
              </Button>
            </div>
            
            <div className="flex items-center gap-8 pt-6 text-sm text-muted-foreground">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-primary animate-pulse" />
                <span>No credit card required</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-secondary animate-pulse" />
                <span>Free forever plan</span>
              </div>
            </div>
          </div>
          
          {/* Right visual */}
          <div className="relative animate-slide-up">
            <div className="relative rounded-3xl overflow-hidden shadow-glow border border-white/10">
              <img 
                src={heroImage} 
                alt="Network visualization showing interconnected nodes and relationships"
                className="w-full h-auto"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-background/20 to-transparent" />
            </div>
            
            {/* Floating cards */}
            <div className="absolute -bottom-6 -left-6 bg-card p-4 rounded-xl shadow-lg border border-border/50 backdrop-blur-sm animate-fade-in" style={{ animationDelay: "0.3s" }}>
              <div className="text-sm text-muted-foreground">Network Nodes</div>
              <div className="text-2xl font-light text-foreground">1,247</div>
            </div>
            
            <div className="absolute -top-6 -right-6 bg-card p-4 rounded-xl shadow-lg border border-border/50 backdrop-blur-sm animate-fade-in" style={{ animationDelay: "0.5s" }}>
              <div className="text-sm text-muted-foreground">Connections</div>
              <div className="text-2xl font-light text-foreground">3,891</div>
            </div>
          </div>
        </div>
      </div>

      <DemoPresentation open={showDemo} onOpenChange={setShowDemo} />
    </section>
  );
};
