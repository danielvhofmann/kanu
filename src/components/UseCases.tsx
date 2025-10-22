import { GitBranch, Users2, Boxes, TrendingUp } from "lucide-react";
import { Button } from "@/components/ui/button";

const useCases = [
  {
    icon: Users2,
    title: "Stakeholder Mapping",
    description: "Visualize influence networks, identify key players, and understand power dynamics in complex organizational ecosystems.",
    color: "text-primary",
    bg: "bg-primary/10",
  },
  {
    icon: GitBranch,
    title: "Systems Thinking",
    description: "Map causal loops, feedback cycles, and system dynamics to reveal leverage points and unintended consequences.",
    color: "text-secondary",
    bg: "bg-secondary/10",
  },
  {
    icon: Boxes,
    title: "Network Analysis",
    description: "Apply social network analysis to understand centrality, clustering, and community structure in any relational dataset.",
    color: "text-accent",
    bg: "bg-accent/10",
  },
  {
    icon: TrendingUp,
    title: "Strategic Planning",
    description: "Connect goals, initiatives, and resources into coherent strategy maps that guide decision-making and alignment.",
    color: "text-primary-light",
    bg: "bg-primary-light/10",
  },
];

export const UseCases = () => {
  return (
    <section className="py-32 relative overflow-hidden bg-muted/30">
      <div className="container mx-auto px-6">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-20 space-y-4">
            <h2 className="text-5xl font-extralight tracking-tight text-balance">
              Built for those who work with{" "}
              <span className="text-primary">complexity</span>
            </h2>
            <p className="text-lg text-muted-foreground leading-relaxed max-w-2xl mx-auto">
              From strategists to researchers, NGOs to consultants—Kumu helps you 
              see what others miss.
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 gap-6 mb-16">
            {useCases.map((useCase, index) => (
              <div
                key={useCase.title}
                className="bg-card border border-border/50 rounded-2xl p-8 hover:border-primary/30 transition-all duration-500 hover:shadow-md animate-fade-in"
                style={{ animationDelay: `${index * 0.15}s` }}
              >
                <div className={`inline-flex items-center justify-center w-14 h-14 rounded-xl ${useCase.bg} mb-6`}>
                  <useCase.icon className={`w-7 h-7 ${useCase.color}`} strokeWidth={1.5} />
                </div>
                
                <h3 className="text-2xl font-light mb-3 tracking-wide">
                  {useCase.title}
                </h3>
                
                <p className="text-muted-foreground leading-relaxed">
                  {useCase.description}
                </p>
              </div>
            ))}
          </div>
          
          <div className="text-center space-y-6 pt-8">
            <p className="text-muted-foreground text-lg">
              Trusted by hundreds of organizations worldwide
            </p>
            <div className="flex justify-center gap-4">
              <Button variant="hero" size="lg">
                Explore Use Cases
              </Button>
              <Button variant="outline" size="lg">
                View Community Projects
              </Button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
