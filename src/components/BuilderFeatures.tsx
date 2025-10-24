import { Network, Share2, Sparkles } from "lucide-react";

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

export const BuilderFeatures = () => {
  return (
    <section className="relative overflow-hidden bg-background">
      <div className="absolute inset-0 bg-gradient-subtle -z-10" />
      
      <div className="container mx-auto px-6 pt-8">
        <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
          {builderFeatures.map((feature, index) => (
            <div
              key={feature.title}
              className="group relative bg-card border border-border/50 rounded-2xl p-8 shadow-lg hover:shadow-2xl transition-all duration-500 hover:-translate-y-1 animate-fade-in"
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
