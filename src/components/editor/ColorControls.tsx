import { Palette } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Label } from '@/components/ui/label';

interface ColorControlsProps {
  backgroundColor: string;
  onBackgroundColorChange: (color: string) => void;
  selectedPalette: string;
  onPaletteChange: (palette: string) => void;
}

const backgroundColors = [
  { name: 'Light', value: 'hsl(0, 0%, 99%)' },
  { name: 'Cream', value: 'hsl(45, 30%, 97%)' },
  { name: 'Mint', value: 'hsl(150, 20%, 97%)' },
  { name: 'Sky', value: 'hsl(200, 25%, 97%)' },
  { name: 'Lavender', value: 'hsl(260, 20%, 97%)' },
  { name: 'Dark', value: 'hsl(215, 25%, 10%)' },
];

const palettes = [
  { name: 'Default', value: 'default' },
  { name: 'Ocean', value: 'ocean' },
  { name: 'Sunset', value: 'sunset' },
  { name: 'Forest', value: 'forest' },
  { name: 'Monochrome', value: 'monochrome' },
];

export const ColorControls = ({
  backgroundColor,
  onBackgroundColorChange,
  selectedPalette,
  onPaletteChange,
}: ColorControlsProps) => {
  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="ghost" size="sm" className="gap-2">
          <Palette className="w-4 h-4" />
          Colors
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80" align="end">
        <div className="space-y-4">
          <div>
            <Label className="text-sm font-medium mb-3 block">Background</Label>
            <div className="grid grid-cols-3 gap-2">
              {backgroundColors.map((color) => (
                <button
                  key={color.value}
                  onClick={() => onBackgroundColorChange(color.value)}
                  className={`h-10 rounded-lg border-2 transition-all hover:scale-105 ${
                    backgroundColor === color.value
                      ? 'border-primary ring-2 ring-primary/20'
                      : 'border-border'
                  }`}
                  style={{ backgroundColor: color.value }}
                  title={color.name}
                >
                  <span className="sr-only">{color.name}</span>
                </button>
              ))}
            </div>
          </div>

          <div>
            <Label className="text-sm font-medium mb-3 block">Color Palette</Label>
            <div className="space-y-2">
              {palettes.map((palette) => (
                <button
                  key={palette.value}
                  onClick={() => onPaletteChange(palette.value)}
                  className={`w-full px-3 py-2 rounded-lg text-left text-sm transition-colors ${
                    selectedPalette === palette.value
                      ? 'bg-primary text-primary-foreground'
                      : 'hover:bg-muted'
                  }`}
                >
                  {palette.name}
                </button>
              ))}
            </div>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
};
