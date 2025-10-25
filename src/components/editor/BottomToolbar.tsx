import { Button } from "@/components/ui/button";
import { Pencil, Undo, Redo, MessageSquare, Map, Clock } from "lucide-react";
import { ColorControls } from "./ColorControls";
import { EditorToolbar } from "./EditorToolbar";

interface BottomToolbarProps {
  isSketchMode: boolean;
  onToggleSketchMode: () => void;
  backgroundColor: string;
  onBackgroundColorChange: (color: string) => void;
  selectedPalette: string;
  onPaletteChange: (palette: string) => void;
  onAddNode: () => void;
  onImport: () => void;
  onExport: (format: 'png' | 'svg' | 'pdf') => void;
  nodeShape: string;
  onNodeShapeChange: (shape: string) => void;
  edgeType: string;
  onEdgeTypeChange: (type: string) => void;
  onUndo: () => void;
  onRedo: () => void;
  canUndo: boolean;
  canRedo: boolean;
  showAIChat: boolean;
  onToggleAIChat: () => void;
  onAddMap: () => void;
  onAddTimeline: () => void;
}

export const BottomToolbar = ({
  isSketchMode,
  onToggleSketchMode,
  backgroundColor,
  onBackgroundColorChange,
  selectedPalette,
  onPaletteChange,
  onAddNode,
  onImport,
  onExport,
  nodeShape,
  onNodeShapeChange,
  edgeType,
  onEdgeTypeChange,
  onUndo,
  onRedo,
  canUndo,
  canRedo,
  showAIChat,
  onToggleAIChat,
  onAddMap,
  onAddTimeline,
}: BottomToolbarProps) => {
  return (
    <div className="h-16 border-t border-border/50 flex items-center justify-between px-6 bg-card/50 backdrop-blur-lg">
      <div className="flex items-center gap-2">
        {/* Map and Timeline Buttons */}
        <Button
          variant="ghost"
          size="sm"
          onClick={onAddMap}
          className="gap-2"
        >
          <Map className="w-4 h-4" />
          Add Map
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={onAddTimeline}
          className="gap-2"
        >
          <Clock className="w-4 h-4" />
          Add Timeline
        </Button>
        
        <div className="h-6 w-px bg-border mx-2" />
        
        {/* Undo/Redo */}
        <Button
          variant="ghost"
          size="sm"
          onClick={onUndo}
          disabled={!canUndo}
          className="gap-2"
        >
          <Undo className="w-4 h-4" />
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={onRedo}
          disabled={!canRedo}
          className="gap-2"
        >
          <Redo className="w-4 h-4" />
        </Button>
        
        <div className="h-6 w-px bg-border mx-2" />
        
        {/* Sketch Mode */}
        <Button
          variant={isSketchMode ? "default" : "ghost"}
          size="sm"
          onClick={onToggleSketchMode}
          className="gap-2"
        >
          <Pencil className="w-4 h-4" />
          Sketch Mode
        </Button>
        
        {/* Color Controls */}
        <ColorControls
          backgroundColor={backgroundColor}
          onBackgroundColorChange={onBackgroundColorChange}
          selectedPalette={selectedPalette}
          onPaletteChange={onPaletteChange}
        />
        
        {/* Editor Toolbar */}
        <EditorToolbar 
          onAddNode={onAddNode} 
          onImport={onImport}
          onExport={onExport}
          nodeShape={nodeShape}
          onNodeShapeChange={onNodeShapeChange}
          edgeType={edgeType}
          onEdgeTypeChange={onEdgeTypeChange}
          onUndo={onUndo}
          onRedo={onRedo}
          canUndo={canUndo}
          canRedo={canRedo}
        />
        
        <div className="h-6 w-px bg-border mx-2" />
        
        {/* AI Assistant */}
        <Button
          variant={showAIChat ? "default" : "ghost"}
          size="sm"
          onClick={onToggleAIChat}
          className="gap-2"
        >
          <MessageSquare className="w-4 h-4" />
          AI Assistant
        </Button>
      </div>
    </div>
  );
};
