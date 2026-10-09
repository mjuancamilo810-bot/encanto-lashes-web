import Link from "next/link";
import type { Technique } from "@/lib/categories";
import { formatCOP } from "@/lib/utils";

interface TechniqueCardProps {
  technique: Technique;
}

export function TechniqueCard({ technique }: TechniqueCardProps) {
  return (
    <Link
      href={`/tecnica/${technique.slug}`}
      className="group flex flex-col justify-between rounded-2xl bg-white/70 p-5 shadow-sm ring-1 ring-blush transition-shadow hover:shadow-glow-rose"
    >
      <div>
        <h3 className="font-display text-lg font-semibold text-noir">{technique.name}</h3>
        <p className="mt-1 text-sm text-mauve">{technique.description}</p>
      </div>
      <div className="mt-4 flex items-center justify-between">
        <span className="font-display text-base font-semibold text-noir">
          {formatCOP(technique.price)}
        </span>
        <span className="text-sm font-medium text-noir underline decoration-rose-gold decoration-2 underline-offset-4">
          Ver técnica
        </span>
      </div>
    </Link>
  );
}
