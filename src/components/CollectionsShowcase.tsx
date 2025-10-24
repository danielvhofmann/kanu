import { Card } from "./ui/card";
import { Button } from "./ui/button";
import { useNavigate } from "react-router-dom";
import { Network, Users, BookOpen, Briefcase } from "lucide-react";
import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "./ui/dialog";
import renaissanceImage from "@/assets/collection-renaissance.jpg";
import techImage from "@/assets/collection-tech.jpg";
import scienceImage from "@/assets/collection-science.jpg";
import politicsImage from "@/assets/collection-politics.jpg";

const collectionExamples = [
  {
    title: "Renaissance Artists Network",
    description: "Explore connections between influential artists, patrons, and cities during the Renaissance period",
    icon: BookOpen,
    nodes: 45,
    connections: 128,
    category: "History & Culture",
    image: renaissanceImage,
  },
  {
    title: "Tech Startup Ecosystem",
    description: "Map of investors, founders, and companies in the Silicon Valley tech ecosystem",
    icon: Briefcase,
    nodes: 87,
    connections: 234,
    category: "Business",
    image: techImage,
  },
  {
    title: "Scientific Collaborations",
    description: "Network of researchers and their collaborative relationships in quantum physics",
    icon: Users,
    nodes: 62,
    connections: 156,
    category: "Science",
    image: scienceImage,
  },
  {
    title: "Political Influence Map",
    description: "Stakeholder relationships and influence patterns in modern policy making",
    icon: Network,
    nodes: 53,
    connections: 189,
    category: "Politics",
    image: politicsImage,
  }
];

export const CollectionsShowcase = () => {
  const navigate = useNavigate();
  const [selectedCollection, setSelectedCollection] = useState<typeof collectionExamples[0] | null>(null);

  return (
    <section className="py-32 relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-subtle -z-10" />
      
      <div className="container mx-auto px-6">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="text-4xl lg:text-5xl font-light mb-6">
            <span className="text-accent">Discover</span>{" "}
            <span className="text-foreground">Collections</span>
          </h2>
          <p className="text-xl text-muted-foreground leading-relaxed">
            Discover inspiring network maps created by the community. 
            Browse, learn, and get ideas for your own projects.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-7xl mx-auto mb-12">
          {collectionExamples.map((collection, index) => (
            <Card
              key={collection.title}
              className="overflow-hidden hover:shadow-lg transition-all duration-300 hover:-translate-y-1 animate-fade-in bg-card border-border/50 cursor-pointer"
              style={{ animationDelay: `${index * 0.1}s` }}
              onClick={() => setSelectedCollection(collection)}
            >
              <div className="aspect-video relative overflow-hidden">
                <img 
                  src={collection.image} 
                  alt={collection.title}
                  className="w-full h-full object-cover transition-transform duration-300 hover:scale-110"
                />
              </div>
              <div className="p-6 space-y-4">
                <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
                  <collection.icon className="w-6 h-6 text-primary" strokeWidth={1.5} />
                </div>
                
                <div>
                  <h3 className="font-semibold text-lg mb-2">{collection.title}</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed mb-4">
                    {collection.description}
                  </p>
                </div>

                <div className="flex gap-4 text-xs text-muted-foreground border-t border-border pt-4">
                  <div>
                    <span className="font-medium">{collection.nodes}</span> nodes
                  </div>
                  <div>
                    <span className="font-medium">{collection.connections}</span> connections
                  </div>
                </div>

                <div className="pt-2">
                  <span className="text-xs px-3 py-1 rounded-full bg-primary/10 text-primary">
                    {collection.category}
                  </span>
                </div>
              </div>
            </Card>
          ))}
        </div>

        <div className="text-center">
          <Button 
            size="lg" 
            onClick={() => navigate('/collections')}
            className="min-w-[200px]"
          >
            View All Collections
          </Button>
        </div>
      </div>

      <Dialog open={!!selectedCollection} onOpenChange={() => setSelectedCollection(null)}>
        <DialogContent className="max-w-4xl">
          <DialogHeader>
            <DialogTitle className="text-2xl">{selectedCollection?.title}</DialogTitle>
            <DialogDescription>
              {selectedCollection?.description}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <img 
              src={selectedCollection?.image} 
              alt={selectedCollection?.title}
              className="w-full rounded-lg"
            />
            <div className="flex gap-6 text-sm">
              <div>
                <span className="font-semibold">{selectedCollection?.nodes}</span> nodes
              </div>
              <div>
                <span className="font-semibold">{selectedCollection?.connections}</span> connections
              </div>
              <div>
                <span className="px-3 py-1 rounded-full bg-primary/10 text-primary text-xs">
                  {selectedCollection?.category}
                </span>
              </div>
            </div>
            <p className="text-muted-foreground">
              Click "View All Collections" to explore this network in detail and discover more collections.
            </p>
          </div>
        </DialogContent>
      </Dialog>
    </section>
  );
};
