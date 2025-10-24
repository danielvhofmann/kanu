import { Network, Lightbulb, Zap } from "lucide-react";

export const WhatWhyHow = () => {
  return (
    <div className="py-32 bg-background relative overflow-hidden">
      {/* Left side glow */}
      <div className="absolute top-1/3 -left-32 w-96 h-96 rounded-full bg-secondary/12 blur-[100px]" />
      
      <div className="container mx-auto px-6 relative z-10">
        {/* What Section */}
        <section id="what" className="mb-32 scroll-mt-24">
          <div className="max-w-4xl mx-auto text-center">
            <div className="flex justify-center mb-6">
              <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center">
                <Network className="w-8 h-8 text-primary" />
              </div>
            </div>
            <h2 className="text-4xl lg:text-5xl font-light mb-6">What is Corners?</h2>
            <p className="text-xl text-muted-foreground leading-relaxed mb-8">
              Corners is a powerful visualization platform that helps you map, explore, and understand 
              complex relationships and networks. Whether you're exploring historical knowledge graphs 
              or building strategic stakeholder maps, Corners transforms interconnected data into 
              clear, actionable insights.
            </p>
            <div className="grid md:grid-cols-3 gap-6 mt-12">
              <div className="p-6 rounded-lg bg-muted/50">
                <h3 className="font-semibold mb-2">Explorer Mode</h3>
                <p className="text-sm text-muted-foreground">
                  Discover and navigate through existing knowledge networks from history and culture
                </p>
              </div>
              <div className="p-6 rounded-lg bg-muted/50">
                <h3 className="font-semibold mb-2">Builder Mode</h3>
                <p className="text-sm text-muted-foreground">
                  Create custom network maps for stakeholders, systems, and strategic planning
                </p>
              </div>
              <div className="p-6 rounded-lg bg-muted/50">
                <h3 className="font-semibold mb-2">Collections</h3>
                <p className="text-sm text-muted-foreground">
                  Browse and discover networks shared by the community
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Why Section */}
        <section id="why" className="mb-32 scroll-mt-24">
          <div className="max-w-4xl mx-auto text-center">
            <div className="flex justify-center mb-6">
              <div className="w-16 h-16 rounded-2xl bg-secondary/10 flex items-center justify-center">
                <Lightbulb className="w-8 h-8 text-secondary" />
              </div>
            </div>
            <h2 className="text-4xl lg:text-5xl font-light mb-6">Why Use Corners?</h2>
            <p className="text-xl text-muted-foreground leading-relaxed mb-8">
              Complex systems are everywhere—from organizational structures to historical events. 
              Traditional tools make it hard to see the big picture. Corners makes complexity visible, 
              understandable, and actionable.
            </p>
            <div className="grid md:grid-cols-2 gap-8 mt-12 text-left">
              <div>
                <h3 className="text-2xl font-semibold mb-4">For Professionals</h3>
                <ul className="space-y-3 text-muted-foreground">
                  <li className="flex items-start gap-2">
                    <span className="text-primary mt-1">•</span>
                    <span>Map stakeholder relationships and influence</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-primary mt-1">•</span>
                    <span>Visualize organizational structures and dependencies</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-primary mt-1">•</span>
                    <span>Plan strategic initiatives with systems thinking</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-primary mt-1">•</span>
                    <span>Communicate complex ideas to teams and stakeholders</span>
                  </li>
                </ul>
              </div>
              <div>
                <h3 className="text-2xl font-semibold mb-4">For Researchers & Educators</h3>
                <ul className="space-y-3 text-muted-foreground">
                  <li className="flex items-start gap-2">
                    <span className="text-secondary mt-1">•</span>
                    <span>Explore historical connections and knowledge networks</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-secondary mt-1">•</span>
                    <span>Discover patterns across different domains</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-secondary mt-1">•</span>
                    <span>Create educational materials that bring context to life</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-secondary mt-1">•</span>
                    <span>Share insights with the community</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </section>

        {/* How Section */}
        <section id="how" className="scroll-mt-24">
          <div className="max-w-4xl mx-auto text-center">
            <div className="flex justify-center mb-6">
              <div className="w-16 h-16 rounded-2xl bg-accent/10 flex items-center justify-center">
                <Zap className="w-8 h-8 text-accent" />
              </div>
            </div>
            <h2 className="text-4xl lg:text-5xl font-light mb-6">How It Works</h2>
            <p className="text-xl text-muted-foreground leading-relaxed mb-12">
              Getting started with Corners is simple. Choose your path and start visualizing 
              complex relationships in minutes.
            </p>
            <div className="grid md:grid-cols-3 gap-8 mt-12">
              <div className="text-center">
                <div className="w-12 h-12 rounded-full bg-primary text-white flex items-center justify-center text-xl font-semibold mx-auto mb-4">
                  1
                </div>
                <h3 className="text-xl font-semibold mb-2">Choose Your Mode</h3>
                <p className="text-muted-foreground">
                  Start with Explorer to discover existing networks, or jump into Builder to create your own
                </p>
              </div>
              <div className="text-center">
                <div className="w-12 h-12 rounded-full bg-secondary text-white flex items-center justify-center text-xl font-semibold mx-auto mb-4">
                  2
                </div>
                <h3 className="text-xl font-semibold mb-2">Visualize & Analyze</h3>
                <p className="text-muted-foreground">
                  Use intuitive tools to map relationships, add context, and uncover insights
                </p>
              </div>
              <div className="text-center">
                <div className="w-12 h-12 rounded-full bg-accent text-white flex items-center justify-center text-xl font-semibold mx-auto mb-4">
                  3
                </div>
                <h3 className="text-xl font-semibold mb-2">Share & Collaborate</h3>
                <p className="text-muted-foreground">
                  Export your work, share with your team, or publish to the community
                </p>
              </div>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
};
