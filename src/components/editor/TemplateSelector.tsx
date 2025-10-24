import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogHeader, 
  DialogTitle 
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Users, GitBranch, Brain, Server, Sparkles, Upload } from 'lucide-react';
import { Node, Edge } from 'reactflow';
import { getTemplate, type TemplateType } from '@/lib/templates';

interface TemplateSelectorProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSelect: (nodes: Node[], edges: Edge[]) => void;
  onImportData?: () => void;
}

export const TemplateSelector = ({ open, onOpenChange, onSelect, onImportData }: TemplateSelectorProps) => {
  const templates = [
    {
      id: 'import',
      name: 'Import Data',
      description: 'Use an existing CSV or XLSX dataset',
      icon: Upload,
    },
    {
      id: 'custom',
      name: 'Start from Scratch',
      description: 'Begin with an empty canvas and build your own network',
      icon: Sparkles,
    },
    {
      id: 'stakeholder',
      name: 'Stakeholder Map',
      description: 'Visualize relationships between core team, external partners, and customers',
      icon: Users,
    },
    {
      id: 'process',
      name: 'Process Flow',
      description: 'Map out workflows and process dependencies',
      icon: GitBranch,
    },
    {
      id: 'mindmap',
      name: 'Mind Map',
      description: 'Organize ideas and concepts hierarchically',
      icon: Brain,
    },
    {
      id: 'system',
      name: 'System Architecture',
      description: 'Document technical system components and connections',
      icon: Server,
    },
  ];

  const handleSelectTemplate = (templateId: string) => {
    if (templateId === 'import') {
      onOpenChange(false);
      onImportData?.();
    } else if (templateId === 'custom') {
      onSelect([], []);
      onOpenChange(false);
    } else {
      const template = getTemplate(templateId as TemplateType);
      if (template) {
        onSelect(template.nodes, template.edges);
      }
      onOpenChange(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl">
        <DialogHeader>
          <DialogTitle className="text-2xl font-light">Choose a Template</DialogTitle>
          <DialogDescription>
            Start with a template or build from scratch
          </DialogDescription>
        </DialogHeader>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
          {templates.map((template) => {
            const Icon = template.icon;
            return (
              <button
                key={template.id}
                onClick={() => handleSelectTemplate(template.id)}
                className="group relative p-6 border-2 border-border rounded-xl hover:border-primary transition-all hover:shadow-lg text-left"
              >
                <div className="flex items-start gap-4">
                  <div className="p-3 rounded-lg bg-primary/10 group-hover:bg-primary/20 transition-colors">
                    <Icon className="w-6 h-6 text-primary" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-medium text-lg mb-2 group-hover:text-primary transition-colors">
                      {template.name}
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      {template.description}
                    </p>
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      </DialogContent>
    </Dialog>
  );
};