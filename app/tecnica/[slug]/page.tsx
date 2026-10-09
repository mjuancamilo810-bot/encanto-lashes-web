import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { techniques } from "@/lib/categories";
import { formatCOP } from "@/lib/utils";
import { whatsappLink } from "@/lib/whatsapp";
import { BeforeAfterSlider } from "@/components/ui/BeforeAfterSlider";

interface TecnicaPageProps {
  params: Promise<{ slug: string }>;
}

export function generateStaticParams() {
  return techniques.map((t) => ({ slug: t.slug }));
}

export async function generateMetadata({ params }: TecnicaPageProps): Promise<Metadata> {
  const { slug } = await params;
  const technique = techniques.find((t) => t.slug === slug);
  if (!technique) return {};
  return { title: technique.name, description: technique.description };
}

export default async function TecnicaPage({ params }: TecnicaPageProps) {
  const { slug } = await params;
  const technique = techniques.find((t) => t.slug === slug);
  if (!technique) notFound();

  const message = `Hola, quiero reservar una sesión de ${technique.name} en Encanto Lashes`;

  return (
    <div className="mx-auto max-w-4xl px-4 py-12 sm:px-6 sm:py-16">
      <div className="text-center">
        <h1 className="font-display text-4xl font-semibold text-noir">{technique.name}</h1>
        <p className="mx-auto mt-3 max-w-xl text-sm text-mauve">{technique.description}</p>
        <div className="mt-4 flex items-center justify-center gap-6 text-sm text-noir/80">
          <span className="font-display text-2xl font-semibold text-noir">
            {formatCOP(technique.price)}
          </span>
          <span>{technique.durationMinutes} minutos</span>
        </div>
        <a
          href={whatsappLink(message)}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-6 inline-block rounded-full bg-noir px-6 py-3.5 text-sm font-medium text-blush hover:bg-noir/85"
        >
          Reserva esta técnica
        </a>
      </div>

      <div className="mx-auto mt-12 max-w-md">
        <BeforeAfterSlider
          imageBefore="/before-after/before-1.svg"
          imageAfter="/before-after/after-1.svg"
          caption={`Resultado real de ${technique.name.toLowerCase()}.`}
        />
      </div>
    </div>
  );
}
