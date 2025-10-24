import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Share2, Eye, Heart } from "lucide-react";

const Collections = () => {
  // Placeholder data for publicly shared collections
  const sharedCollections = [
    {
      id: 1,
      title: "Renaissance Artists Network",
      author: "HistoryBuff42",
      views: 1234,
      likes: 89,
      description: "Exploring connections between Renaissance masters and their patrons",
      tags: ["History", "Art", "Renaissance"]
    },
    {
      id: 2,
      title: "Tech Startup Ecosystem",
      author: "StartupMapper",
      views: 2156,
      likes: 156,
      description: "Mapping relationships between founders, investors, and companies in Silicon Valley",
      tags: ["Tech", "Business", "Networks"]
    },
    {
      id: 3,
      title: "Ancient Philosophy Schools",
      author: "PhilosophyLover",
      views: 892,
      likes: 67,
      description: "Connections between philosophers and their schools of thought",
      tags: ["Philosophy", "Education", "Ancient Greece"]
    }
  ];

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-6 py-12">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="text-center mb-12">
            <h1 className="text-4xl lg:text-5xl font-bold mb-4">
              Public Collections
            </h1>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Explore networks and knowledge graphs shared by the community
            </p>
          </div>

          {/* Collections Grid */}
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {sharedCollections.map((collection) => (
              <Card 
                key={collection.id}
                className="hover:shadow-lg transition-shadow cursor-pointer"
              >
                <CardHeader>
                  <CardTitle className="text-xl">{collection.title}</CardTitle>
                  <CardDescription>by {collection.author}</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p className="text-sm text-muted-foreground">
                    {collection.description}
                  </p>
                  
                  {/* Tags */}
                  <div className="flex flex-wrap gap-2">
                    {collection.tags.map((tag) => (
                      <Badge key={tag} variant="secondary">
                        {tag}
                      </Badge>
                    ))}
                  </div>

                  {/* Stats */}
                  <div className="flex items-center gap-4 text-sm text-muted-foreground pt-2">
                    <div className="flex items-center gap-1">
                      <Eye className="h-4 w-4" />
                      <span>{collection.views}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Heart className="h-4 w-4" />
                      <span>{collection.likes}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Share2 className="h-4 w-4" />
                      <span>Share</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Coming Soon Message */}
          <div className="text-center mt-12 p-8 bg-muted/50 rounded-lg">
            <p className="text-muted-foreground">
              Community sharing features coming soon. Stay tuned!
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Collections;
