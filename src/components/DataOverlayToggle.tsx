import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card } from "@/components/ui/card";
import { DataOverlay } from "@/pages/Index";

interface OverlayOption {
  id: string;
  label: string;
  icon: React.ElementType;
  color: string;
  description?: string;
  group?: "metrics" | "carcinogens" | "cancers";
}

interface DataOverlayToggleProps {
  activeOverlay: DataOverlay;
  onOverlayChange: (overlay: DataOverlay) => void;
  overlays: OverlayOption[];
}

export const DataOverlayToggle = ({
  activeOverlay,
  onOverlayChange,
  overlays,
}: DataOverlayToggleProps) => {
  // Group overlays by type
  const metrics = overlays.filter((o) => !o.id.startsWith("carcinogen_") && !o.id.startsWith("cancer_"));
  const carcinogens = overlays.filter((o) => o.id.startsWith("carcinogen_"));
  const cancers = overlays.filter((o) => o.id.startsWith("cancer_"));

  // Find the selected overlay option for display
  const selectedOption = overlays.find((o) => o.id === activeOverlay);

  return (
    <Card className="p-4 text-foreground bg-white/60 dark:bg-slate-900/60 backdrop-blur-md border border-slate-200 dark:border-slate-700 shadow-lg">
      <div className="mb-3">
        <h3 className="font-semibold text-foreground text-sm">Data Overlay</h3>
        <p className="text-xs text-muted-foreground">
          Select a metric or type to overlay
        </p>
      </div>
      <Select value={activeOverlay ?? undefined} onValueChange={onOverlayChange}>
        <SelectTrigger className="w-full">
          <SelectValue placeholder="Select overlay...">
            {selectedOption ? (
              <span className="flex items-center gap-2">
                {selectedOption.icon && (
                  <selectedOption.icon className={`w-4 h-4 ${selectedOption.color}`} />
                )}
                {selectedOption.label}
              </span>
            ) : null}
          </SelectValue>
        </SelectTrigger>
        <SelectContent className="z-[2000]">
          <SelectGroup>
            <SelectLabel>Metrics</SelectLabel>
            {metrics.map((overlay) => (
              <SelectItem key={overlay.id} value={overlay.id}>
                <span className="flex items-center gap-2">
                  {overlay.icon && (
                    <overlay.icon className={`w-4 h-4 ${overlay.color}`} />
                  )}
                  {overlay.label}
                </span>
              </SelectItem>
            ))}
          </SelectGroup>
          {carcinogens.length > 0 && (
            <SelectGroup>
              <SelectLabel>Carcinogens</SelectLabel>
              {carcinogens.map((overlay) => (
                <SelectItem key={overlay.id} value={overlay.id}>
                  <span className="flex items-center gap-2">
                    {overlay.icon && (
                      <overlay.icon className={`w-4 h-4 ${overlay.color}`} />
                    )}
                    {overlay.label}
                  </span>
                </SelectItem>
              ))}
            </SelectGroup>
          )}
          {cancers.length > 0 && (
            <SelectGroup>
              <SelectLabel>Cancers</SelectLabel>
              {cancers.map((overlay) => (
                <SelectItem key={overlay.id} value={overlay.id}>
                  <span className="flex items-center gap-2">
                    {overlay.icon && (
                      <overlay.icon className={`w-4 h-4 ${overlay.color}`} />
                    )}
                    {overlay.label}
                  </span>
                </SelectItem>
              ))}
            </SelectGroup>
          )}
        </SelectContent>
      </Select>
      {activeOverlay && (
        <button
          onClick={() => onOverlayChange(null)}
          className="w-full mt-2 text-xs text-blue-600 hover:underline"
        >
          Clear Overlay
        </button>
      )}
    </Card>
  );
};
