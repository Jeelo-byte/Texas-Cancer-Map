
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { DataOverlay } from "@/pages/Index";
import { DollarSign, Heart, Droplets, Skull } from "lucide-react";

interface DataOverlayToggleProps {
  activeOverlay: DataOverlay;
  onOverlayChange: (overlay: DataOverlay) => void;
}

export const DataOverlayToggle = ({ activeOverlay, onOverlayChange }: DataOverlayToggleProps) => {
  const overlays = [
    {
      id: "poverty" as const,
      label: "Poverty",
      icon: DollarSign,
      color: "text-red-600",
      description: "Poverty rates across counties"
    },
    {
      id: "healthcare" as const,
      label: "Healthcare",
      icon: Heart,
      color: "text-green-600",
      description: "Access to healthcare services"
    },
    {
      id: "pollution" as const,
      label: "Pollution",
      icon: Droplets,
      color: "text-blue-600",
      description: "Environmental pollution levels"
    },
    {
      id: "mortality" as const,
      label: "Mortality",
      icon: Skull,
      color: "text-purple-600",
      description: "Cancer mortality rates"
    }
  ];

  return (
    <Card
      className="p-4 text-foreground bg-white/60 dark:bg-slate-900/60 backdrop-blur-md border border-slate-200 dark:border-slate-700 shadow-lg"
    >
      <div className="mb-3">
        <h3 className="font-semibold text-foreground text-sm">Data Overlays</h3>
        <p className="text-xs text-muted-foreground">Toggle different data visualizations</p>
      </div>
      
      <div className="grid grid-cols-2 gap-2">
        {overlays.map((overlay) => {
          const Icon = overlay.icon;
          const isActive = activeOverlay === overlay.id;
          
          return (
            <Button
              key={overlay.id}
              variant={isActive ? "default" : "outline"}
              size="sm"
              onClick={() => onOverlayChange(isActive ? null : overlay.id)}
              className={`
                flex flex-col items-center p-3 h-auto
                ${isActive ? overlay.color + " bg-opacity-10" : ""}
              `}
              title={overlay.description}
            >
              <Icon className={`w-4 h-4 mb-1 ${isActive ? "" : overlay.color}`} />
              <span className="text-xs">{overlay.label}</span>
            </Button>
          );
        })}
      </div>
      
      {activeOverlay && (
        <Button
          variant="ghost"
          size="sm"
          onClick={() => onOverlayChange(null)}
          className="w-full mt-2 text-xs"
        >
          Clear Overlay
        </Button>
      )}
    </Card>
  );
};
