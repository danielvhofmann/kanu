import { Hero } from "@/components/Hero";
import { ModeCard } from "@/components/ModeCard";
import { Features } from "@/components/Features";
import { UseCases } from "@/components/UseCases";
import { Footer } from "@/components/Footer";
import { useNavigate } from "react-router-dom";
import { Search, Pencil, Share2 } from "lucide-react";

const Index = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background">
      <main>
        <Hero />

        {/* Three Mode Cards Section */}
        <section className="relative py-20">
          <div className="container mx-auto px-6">
            <div className="grid lg:grid-cols-3 gap-8 max-w-7xl mx-auto">
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

              <ModeCard
                icon={Share2}
                title="Collections"
                description="Explore shared networks"
                features={[
                  "Browse publicly shared knowledge graphs",
                  "Discover community-created networks",
                  "Get inspired by others' work",
                  "Save and remix shared collections"
                ]}
                ctaText="View Collections"
                onCtaClick={() => navigate('/collections')}
                gradient="from-accent/10 to-secondary/5"
                delay={0.6}
              />
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
