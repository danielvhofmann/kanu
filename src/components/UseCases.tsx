import { GitBranch, Users2, Boxes, TrendingUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import type { TemplateType } from "@/lib/templates";

const useCases: Array<{
  icon: typeof Users2;
  title: string;
  description: string;
  color: string;
  bg: string;
  template: TemplateType;
}> = [
  {
    icon: Users2,
    title: "Stakeholder Mapping",
    description: "Visualize influence networks, identify key players, and understand power dynamics in complex organizational ecosystems.",
    color: "text-primary",
    bg: "bg-primary/10",
    template: "stakeholder",
  },
  {
    icon: GitBranch,
    title: "Systems Thinking",
    description: "Map causal loops, feedback cycles, and system dynamics to reveal leverage points and unintended consequences.",
    color: "text-secondary",
    bg: "bg-secondary/10",
    template: "systems",
  },
  {
    icon: Boxes,
    title: "Network Analysis",
    description: "Apply social network analysis to understand centrality, clustering, and community structure in any relational dataset.",
    color: "text-accent",
    bg: "bg-accent/10",
    template: "network",
  },
  {
    icon: TrendingUp,
    title: "Strategic Planning",
    description: "Connect goals, initiatives, and resources into coherent strategy maps that guide decision-making and alignment.",
    color: "text-primary-light",
    bg: "bg-primary-light/10",
    template: "strategic",
  },
];

export const UseCases = () => {
  const navigate = useNavigate();

  return (
    <section className="py-32 relative overflow-hidden bg-background">
      <div className="container mx-auto px-6">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-20 space-y-4">
            <h2 className="text-5xl font-extralight tracking-tight text-balance">
              Builder Mode:{" "}
              <span className="text-secondary">Your Use Cases</span>
            </h2>
            <p className="text-lg text-muted-foreground leading-relaxed max-w-2xl mx-auto">
              From strategists to researchers, NGOs to consultants—create powerful 
              network maps tailored to your needs.
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 gap-6 mb-16">
            {useCases.map((useCase, index) => (
              <div
                key={useCase.title}
                onClick={() => navigate(`/editor?template=${useCase.template}`)}
                className="bg-card border border-border/50 rounded-2xl p-8 hover:border-primary/30 transition-all duration-500 shadow-lg hover:shadow-2xl animate-fade-in cursor-pointer group"
                style={{ animationDelay: `${index * 0.15}s` }}
              >
                <div className={`inline-flex items-center justify-center w-14 h-14 rounded-xl ${useCase.bg} mb-6`}>
                  <useCase.icon className={`w-7 h-7 ${useCase.color}`} strokeWidth={1.5} />
                </div>
                
                <h3 className="text-2xl font-light mb-3 tracking-wide group-hover:text-primary transition-colors">
                  {useCase.title}
                </h3>
                
                <p className="text-muted-foreground leading-relaxed">
                  {useCase.description}
                </p>
                
                <div className="mt-4 text-sm text-primary opacity-0 group-hover:opacity-100 transition-opacity">
                  Try in Builder Mode →
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};
