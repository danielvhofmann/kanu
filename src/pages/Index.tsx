import { Navigation } from "@/components/Navigation";
import { ModeCard } from "@/components/ModeCard";
import { Features } from "@/components/Features";
import { UseCases } from "@/components/UseCases";
import { Footer } from "@/components/Footer";
import { useNavigate } from "react-router-dom";
import { Search, Pencil } from "lucide-react";

const Index = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background">
      <main>
        {/* Hero Section - Dual Mode */}
        <section className="relative min-h-[90vh] flex items-center justify-center overflow-hidden">
          {/* Subtle gradient background */}
          <div className="absolute inset-0 bg-gradient-subtle -z-10" />
          
          {/* Animated glow orbs */}
          <div className="absolute top-20 left-10 w-96 h-96 bg-primary-glow/20 rounded-full blur-3xl animate-glow" />
          <div className="absolute bottom-20 right-10 w-96 h-96 bg-accent-light/20 rounded-full blur-3xl animate-glow" style={{ animationDelay: "1s" }} />
          
          <div className="container mx-auto px-6 relative z-10">
            {/* Header */}
            <div className="text-center max-w-4xl mx-auto mb-16 animate-fade-in">
              <h1 className="text-6xl lg:text-7xl font-extralight leading-tight text-balance mb-6">
                Turn complexity into{" "}
                <span className="bg-gradient-accent bg-clip-text text-transparent">
                  clarity
                </span>
              </h1>
              <p className="text-xl text-muted-foreground leading-relaxed">
                Explore existing knowledge networks or build your own—
                making systems thinking effortless and elegant.
              </p>
            </div>

            {/* Two Mode Cards */}
            <div className="grid lg:grid-cols-2 gap-8 max-w-6xl mx-auto">
              <ModeCard
                icon={Search}
                title="Explorer Mode"
                description="Discover historical knowledge networks"
                features={[
                  "Search any historical figure from Wikidata",
                  "Visualize connections through interactive graphs",
                  "Get AI-powered explanations of relationships",
                  "Import networks into Builder Mode for editing"
                ]}
                ctaText="Explore Knowledge"
                onCtaClick={() => navigate('/explorer')}
                gradient="from-primary/10 to-accent/5"
                delay={0.2}
              />
              
              <ModeCard
                icon={Pencil}
                title="Builder Mode"
                description="Create custom network maps"
                features={[
                  "Stakeholder mapping & systems thinking",
                  "Network analysis & strategic planning",
                  "AI-powered graph generation & editing",
                  "Beautiful exports & sharing options"
                ]}
                ctaText="Build Networks"
                onCtaClick={() => navigate('/editor')}
                gradient="from-secondary/10 to-primary/5"
                delay={0.4}
              />
            </div>

            {/* Trust Indicators */}
            <div className="flex items-center justify-center gap-8 pt-12 text-sm text-muted-foreground animate-fade-in" style={{ animationDelay: "0.6s" }}>
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
        </section>

        <UseCases />
        <Features />
      </main>
      <Footer />
    </div>
  );
};

export default Index;
