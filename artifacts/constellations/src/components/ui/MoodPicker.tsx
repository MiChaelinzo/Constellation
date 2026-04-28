import { Mood } from "@workspace/api-client-react";
import { MOOD_COLORS, MOOD_LABELS } from "@/lib/mood";
import { cn } from "@/lib/utils";

interface MoodPickerProps {
  value: Mood;
  onChange: (mood: Mood) => void;
}

export function MoodPicker({ value, onChange }: MoodPickerProps) {
  const moods: Mood[] = ["radiant", "calm", "neutral", "cloudy", "stormy"];

  return (
    <div className="flex flex-wrap gap-3">
      {moods.map((mood) => {
        const isSelected = value === mood;
        return (
          <button
            key={mood}
            type="button"
            onClick={() => onChange(mood)}
            className={cn(
              "relative px-4 py-2 rounded-full text-sm font-medium transition-all duration-300 border outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background",
              isSelected 
                ? "border-transparent text-black" 
                : "border-border text-muted-foreground hover:border-muted-foreground/30 hover:text-foreground bg-transparent"
            )}
            style={isSelected ? { backgroundColor: MOOD_COLORS[mood] } : {}}
          >
            {isSelected && (
              <span 
                className="absolute inset-0 rounded-full blur-md opacity-40 -z-10"
                style={{ backgroundColor: MOOD_COLORS[mood] }}
              />
            )}
            {MOOD_LABELS[mood]}
          </button>
        );
      })}
    </div>
  );
}
