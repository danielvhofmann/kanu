import { Network, Share2, Sparkles, Database, Eye, Users } from "lucide-react";

const features = [
  {
    icon: Network,
    title: "Relationship Mapping",
    description: "Turn elements and connections into living visual networks that reveal hidden patterns and relationships.",
    gradient: "from-primary/10 to-primary/5",
  },
  {
    icon: Database,
    title: "Import & Integrate",
    description: "Seamlessly import from spreadsheets or connect live to Google Sheets for real-time collaborative mapping.",
    gradient: "from-secondary/10 to-secondary/5",
  },
  {
    icon: Sparkles,
    title: "Style & Customize",
    description: "Data-driven decorations automatically size, color, and style nodes based on metrics and relationships.",
    gradient: "from-accent/10 to-accent/5",
  },
  {
    icon: Eye,
    title: "Focus & Filter",
    description: "Highlight what matters with focus mode—dim the noise, illuminate insights, and guide exploration.",
    gradient: "from-primary-light/10 to-primary-light/5",
  },
  {
    icon: Share2,
    title: "Share & Present",
    description: "Embed interactive maps anywhere, export beautiful reports, or create guided story presentations.",
    gradient: "from-secondary-light/10 to-secondary-light/5",
  },
  {
    icon: Users,
    title: "Collaborate",
    description: "Work together in real-time, manage permissions, and build collective understanding of complex systems.",
    gradient: "from-accent-light/10 to-accent-light/5",
  },
];

export const Features = () => {
  return (
    <section className="py-32 relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-subtle -z-10" />
      
      <div className="container mx-auto px-6">
        <div className="text-center max-w-3xl mx-auto mb-20 space-y-4">
          <h2 className="text-5xl font-extralight tracking-tight text-balance">
            Beautiful by design.{" "}
            <span className="text-muted-foreground">Powerful by nature.</span>
          </h2>
          <p className="text-lg text-muted-foreground leading-relaxed">
            Everything you need to map, analyze, and share complex systems—
            with elegance and intelligence built in.
          </p>
        </div>
        
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => (
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
