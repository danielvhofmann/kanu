import { Button } from "@/components/ui/button";
import { ArrowRight, LucideIcon } from "lucide-react";

interface ModeCardProps {
  icon: LucideIcon;
  title: string;
  description: string;
  features: string[];
  ctaText: string;
  onCtaClick: () => void;
  gradient: string;
  delay?: number;
}

export const ModeCard = ({
  icon: Icon,
  title,
  description,
  features,
  ctaText,
  onCtaClick,
  gradient,
  delay = 0,
}: ModeCardProps) => {
  return (
    <div
      className="group relative bg-card border border-border/50 rounded-3xl p-10 hover:border-primary/30 transition-all duration-500 hover:shadow-glow animate-fade-in flex flex-col"
      style={{ animationDelay: `${delay}s` }}
    >
      <div className={`absolute inset-0 bg-gradient-to-br ${gradient} rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 -z-10`} />
      
      <div className="space-y-6 flex-grow flex flex-col">
        {/* Icon */}
        <div className="w-16 h-16 rounded-2xl bg-gradient-hero flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
          <Icon className="w-8 h-8 text-white" strokeWidth={1.5} />
        </div>
        
        {/* Title & Description */}
        <div className="space-y-3">
          <h2 className="text-4xl font-extralight tracking-tight">
            {title}
          </h2>
          <p className="text-lg text-muted-foreground leading-relaxed">
            {description}
          </p>
        </div>
        
        {/* Features */}
        <ul className="space-y-3 pt-4 flex-grow">
          {features.map((feature, index) => (
            <li key={index} className="flex items-start gap-3 text-muted-foreground">
              <div className="w-1.5 h-1.5 rounded-full bg-primary mt-2 flex-shrink-0" />
              <span className="leading-relaxed">{feature}</span>
            </li>
          ))}
        </ul>
        
        {/* CTA */}
        <div className="pt-6 mt-auto">
          <Button 
            size="lg" 
            variant="hero" 
            className="w-full group/btn"
            onClick={onCtaClick}
          >
            {ctaText}
            <ArrowRight className="w-4 h-4 transition-transform group-hover/btn:translate-x-1" />
          </Button>
        </div>
      </div>
    </div>
  );
};
