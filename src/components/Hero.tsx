import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";
import { useNavigate } from "react-router-dom";

export const Hero = () => {
  const navigate = useNavigate();
  
  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden bg-gradient-to-br from-orange-100 via-rose-50 to-background">
      {/* Large circular gradient background */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[140vh] h-[140vh] rounded-full bg-gradient-to-br from-orange-200/40 via-white to-rose-100/40 blur-3xl" />
      
      <div className="container mx-auto px-6 relative z-10">
        <div className="text-center max-w-5xl mx-auto space-y-12 animate-fade-in">
          {/* Main headline */}
          <h1 className="text-7xl lg:text-8xl xl:text-9xl font-light leading-[0.95] text-balance">
            Turn complexity into{" "}
            <span className="font-light italic">clarity</span>.
          </h1>
          
          {/* Subheadline with inline badges */}
          <p className="text-2xl lg:text-3xl text-foreground/80 leading-relaxed max-w-4xl mx-auto">
            Explore existing{" "}
            <span className="inline-flex items-center px-4 py-1 rounded-full bg-primary/10 text-primary border border-primary/20">
              knowledge networks
            </span>
            {" "}or build your own—making{" "}
            <span className="inline-flex items-center px-4 py-1 rounded-full bg-secondary/10 text-secondary border border-secondary/20">
              systems thinking
            </span>
            {" "}effortless and elegant.
          </p>
          
          {/* CTA Button */}
          <div className="flex flex-wrap justify-center gap-4 pt-8">
            <Button 
              size="lg" 
              className="text-lg px-8 py-6 rounded-full shadow-lg hover:shadow-xl transition-all"
              onClick={() => navigate('/editor?template=stakeholder')}
            >
              Get Started
              <ArrowRight className="w-5 h-5 ml-2" />
            </Button>
          </div>
          
          {/* Trust indicators */}
          <div className="flex items-center justify-center gap-8 pt-6 text-sm text-muted-foreground">
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
      </div>
    </section>
  );
};
