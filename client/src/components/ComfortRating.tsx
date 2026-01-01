import { Star } from "lucide-react";
import { cn } from "@/lib/utils";
import { useApp } from "@/contexts/AppContext";

interface ComfortRatingProps {
  value: number;
  onChange?: (value: number) => void;
  readonly?: boolean;
  size?: "sm" | "md" | "lg";
}

export function ComfortRating({
  value,
  onChange,
  readonly = false,
  size = "md",
}: ComfortRatingProps) {
  const { t } = useApp();
  
  const sizeClasses = {
    sm: "h-4 w-4",
    md: "h-5 w-5",
    lg: "h-6 w-6",
  };

  const comfortLabels = t.comfortLevels as Record<number, string>;

  return (
    <div className="flex flex-col gap-1">
      <div className="flex items-center gap-1">
        {[1, 2, 3, 4, 5].map((rating) => (
          <button
            key={rating}
            type="button"
            disabled={readonly}
            onClick={() => onChange?.(rating)}
            className={cn(
              "transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 rounded-sm",
              readonly ? "cursor-default" : "cursor-pointer"
            )}
            data-testid={`button-rating-${rating}`}
          >
            <Star
              className={cn(
                sizeClasses[size],
                "transition-colors",
                rating <= value
                  ? "fill-chart-5 text-chart-5"
                  : "fill-transparent text-muted-foreground"
              )}
            />
          </button>
        ))}
      </div>
      {value > 0 && (
        <span className="text-xs text-muted-foreground">
          {comfortLabels[value]}
        </span>
      )}
    </div>
  );
}
