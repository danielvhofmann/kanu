import { Network, Share2, Sparkles, Database, Eye, Users } from "lucide-react";

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

const builderFeatures = [
  {
    icon: Network,
    title: "Relationship Mapping",
    description: "Turn elements and connections into living visual networks that reveal hidden patterns and relationships.",
    gradient: "from-primary-light/10 to-primary-light/5",
  },
  {
    icon: Sparkles,
    title: "AI-Powered Creation",
    description: "Generate and modify networks using natural language. The AI understands your graph and helps you build it.",
    gradient: "from-secondary-light/10 to-secondary-light/5",
  },
  {
    icon: Share2,
    title: "Export & Share",
    description: "Export as PNG or SVG, share interactive maps, or import from Explorer Mode for further editing.",
    gradient: "from-accent-light/10 to-accent-light/5",
  },
];

export const Features = () => {
  return (
    <section className="py-32 relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-subtle -z-10" />
      
      {/* Right side red glow at "Beautiful by design" section */}
      <div className="absolute top-20 -right-32 w-96 h-96 rounded-full bg-red-500/10 blur-[100px]" />
      
      <div className="container mx-auto px-6">
        <div className="text-center max-w-3xl mx-auto mb-20 space-y-4">
          <h2 className="text-5xl font-extralight tracking-tight text-balance">
            <span className="text-foreground">Explore Mode: </span>
            <span className="text-secondary">Your Use Cases</span>
          </h2>
          <p className="text-lg text-muted-foreground leading-relaxed">
            Everything you need to explore and build complex systems—
            with elegance and intelligence built in.
          </p>
        </div>
        
        {/* Explorer Mode Features */}
        <div className="mb-20">
          <h3 className="text-3xl font-extralight text-center mb-10 text-foreground">
            Explorer Mode Features
          </h3>
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

        {/* Builder Mode Features */}
        <div>
          <h3 className="text-3xl font-extralight text-center mb-10">
            <span className="text-secondary">Your Use Cases</span>
          </h3>
          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {builderFeatures.map((feature, index) => (
              <div
                key={feature.title}
                className="group relative bg-card border border-border/50 rounded-2xl p-8 hover:shadow-lg transition-all duration-500 hover:-translate-y-1 animate-fade-in"
                style={{ animationDelay: `${index * 0.1}s + 0.3s` }}
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
      </div>
    </section>
  );
};
