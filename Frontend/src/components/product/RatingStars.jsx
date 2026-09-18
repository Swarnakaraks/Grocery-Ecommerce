import React, { useState } from "react";
import { Star } from "lucide-react";
import { cn } from "@/lib/utils";

export function RatingStars({ rating = 0, size = 16, className, showValue = false, count }) {
  const full = Math.floor(rating);
  const hasHalf = rating - full >= 0.5;

  return (
    <div className={cn("flex items-center gap-1", className)}>
      <div className="flex items-center">
        {[1, 2, 3, 4, 5].map((i) => (
          <Star
            key={i}
            size={size}
            className={cn(
              i <= full
                ? "fill-amber-400 text-amber-400"
                : i === full + 1 && hasHalf
                  ? "fill-amber-400/50 text-amber-400"
                  : "fill-transparent text-gray-300"
            )}
          />
        ))}
      </div>

      {showValue && <span className="text-sm font-medium text-foreground/80">{rating?.toFixed(1)}</span>}
      {typeof count === "number" && <span className="text-xs text-muted-foreground">({count})</span>}
    </div>
  );
}

export function RatingInput({ value = 0, onChange, size = 26, disabled = false }) {
  const [hover, setHover] = useState(0);

  return (
    <div className="flex items-center gap-1">
      {[1, 2, 3, 4, 5].map((i) => (
        <button
          key={i}
          type="button"
          disabled={disabled}
          onMouseEnter={() => setHover(i)}
          onMouseLeave={() => setHover(0)}
          onClick={() => onChange(i)}
          className={cn("transition-transform", disabled ? "cursor-not-allowed opacity-50" : "hover:scale-110")}
        >
          <Star
            size={size}
            className={cn(
              (hover || value) >= i
                ? "fill-amber-400 text-amber-400"
                : "fill-transparent text-gray-300"
            )}
          />
        </button>
      ))}
    </div>
  );
}