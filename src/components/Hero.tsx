import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { BackgroundNetworks } from "@/components/ui/background-networks";
import { motion } from "framer-motion";

export const Hero = () => {
  const navigate = useNavigate();
  
  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden bg-gradient-to-br from-orange-100 via-rose-50 to-background pt-20">
      {/* Large circular gradient background */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[140vh] h-[140vh] rounded-full bg-gradient-to-br from-orange-200/40 via-white to-rose-100/40 blur-3xl" />
      
      {/* Top-left red glow */}
      <div className="absolute -top-32 -left-32 w-96 h-96 rounded-full bg-red-500/12 blur-[100px]" />
      
      {/* Animated network background */}
      <BackgroundNetworks />
      
      {/* Gradient fade to white at bottom */}
      <div className="absolute bottom-0 left-0 right-0 h-48 bg-gradient-to-b from-transparent to-background pointer-events-none z-10" />
      
      <div className="container mx-auto px-6 relative z-10">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1.5 }}
          className="text-center max-w-5xl mx-auto space-y-12"
        >
          {/* Main headline */}
          <h1 className="text-5xl lg:text-6xl xl:text-7xl font-light leading-[0.95] text-balance">
            {"Turn complexity into ".split("").map((letter, i) => (
              <motion.span
                key={i}
                initial={{ y: 50, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{
                  delay: i * 0.02,
                  type: "spring",
                  stiffness: 150,
                  damping: 25,
                }}
                className={letter === " " ? "inline-block w-[0.25em]" : "inline-block"}
              >
                {letter === " " ? "\u00A0" : letter}
              </motion.span>
            ))}
            <span className="italic">
              {"clarity".split("").map((letter, i) => (
                <motion.span
                  key={i + 100}
                  initial={{ y: 50, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{
                    delay: (i + 20) * 0.02,
                    type: "spring",
                    stiffness: 150,
                    damping: 25,
                  }}
                  className="inline-block"
                >
                  {letter}
                </motion.span>
              ))}
            </span>
            .
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
              onClick={() => {
                const modesSection = document.querySelector('section.relative.py-20');
                modesSection?.scrollIntoView({ behavior: 'smooth', block: 'start' });
              }}
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
        </motion.div>
      </div>
    </section>
  );
};
