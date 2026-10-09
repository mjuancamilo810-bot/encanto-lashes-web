import { Star } from "lucide-react";
import { cn } from "@/lib/utils";

interface StarRatingProps {
  /** null = sin reseñas todavía: no se pintan estrellas. */
  rating: number | null;
  reviewCount?: number;
  size?: number;
  className?: string;
}

export function StarRating({ rating, reviewCount, size = 14, className }: StarRatingProps) {
  if (rating === null || reviewCount === 0) {
    return (
      <p className={cn("text-xs text-mauve", className)}>Aún sin reseñas</p>
    );
  }

  return (
    <div
      className={cn("flex items-center gap-1", className)}
      role="img"
      aria-label={`${rating} de 5 estrellas${
        reviewCount !== undefined ? `, ${reviewCount} reseñas` : ""
      }`}
    >
      <div className="flex" aria-hidden="true">
        {[1, 2, 3, 4, 5].map((i) => (
          <Star
            key={i}
            size={size}
            className={i <= Math.round(rating) ? "fill-rose-gold text-rose-gold" : "fill-blush text-blush"}
          />
        ))}
      </div>
      {reviewCount !== undefined && (
        <span className="text-xs text-mauve">({reviewCount})</span>
      )}
    </div>
  );
}
