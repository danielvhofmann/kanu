import { Database, Eye, Sparkles } from "lucide-react";

const explorerFeatures = [
  {
    icon: Database,
    title: "Wikidata Integration",
    description: "Access millions of historical figures and their documented relationships from Wikidata's vast database.",
    gradient: "from-primary/10 to-primary/5",
  },
  {
    icon: Eye,
    title: "Interactive Visualization",
    description: "Explore force-directed graphs that reveal connection patterns and knowledge network structures.",
    gradient: "from-secondary/10 to-secondary/5",
  },
  {
    icon: Sparkles,
    title: "AI Explanations",
    description: "Get context-aware explanations of historical relationships and biographical summaries powered by AI.",
    gradient: "from-accent/10 to-accent/5",
  },
];

export const ExplorerFeatures = () => {
  return (
    <section className="py-32 pb-8 relative overflow-hidden bg-background">
      <div className="absolute inset-0 bg-gradient-subtle -z-10" />
      
      {/* Right side red glow */}
      <div className="absolute top-20 -right-32 w-96 h-96 rounded-full bg-red-500/10 blur-[100px]" />
      
      <div className="container mx-auto px-6">
        <div className="text-center max-w-3xl mx-auto mb-20 space-y-4">
          <h2 className="text-5xl font-extralight tracking-tight text-balance">
            <span className="text-foreground">Explore Mode: </span>
            <span className="text-primary">Your Use Cases</span>
          </h2>
          <p className="text-lg text-muted-foreground leading-relaxed">
            Everything you need to explore complex knowledge networks—
            with elegance and intelligence built in.
          </p>
        </div>
        
        <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
          {explorerFeatures.map((feature, index) => (
            <div
              key={feature.title}
              className="group relative bg-card border border-border/50 rounded-2xl p-8 hover:shadow-lg transition-all duration-500 hover:-translate-y-1 animate-fade-in"
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              <div className={`absolute inset-0 bg-gradient-to-br ${feature.gradient} rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 -z-10`} />
              
              <div className="space-y-4">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary/10 to-accent/10 flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                  <feature.icon className="w-6 h-6 text-primary" strokeWidth={1.5} />
                </div>
                
                <h3 className="text-xl font-light tracking-wide">
                  {feature.title}
                </h3>
                
                <p className="text-muted-foreground leading-relaxed text-sm">
                  {feature.description}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
