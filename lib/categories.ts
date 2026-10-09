export type CategorySlug =
  | "pestanas-cejas"
  | "maquillaje"
  | "skincare"
  | "cabello"
  | "cuerpo-bano"
  | "perfumeria"
  | "unas"
  | "accesorios"
  | "bienestar";

export interface Category {
  slug: CategorySlug;
  name: string;
  shortName: string;
  description: string;
  flagship?: boolean;
}

export const categories: Category[] = [
  {
    slug: "pestanas-cejas",
    name: "Pestañas y cejas",
    shortName: "Pestañas y cejas",
    description:
      "Extensiones, pegamentos y herramientas profesionales. Nuestra categoría insignia.",
    flagship: true,
  },
  {
    slug: "maquillaje",
    name: "Maquillaje",
    shortName: "Maquillaje",
    description: "Rostro, ojos, labios y mejillas.",
  },
  {
    slug: "skincare",
    name: "Cuidado facial",
    shortName: "Skincare",
    description: "Limpiadores, sueros, hidratantes y protección solar.",
  },
  {
    slug: "cabello",
    name: "Cabello",
    shortName: "Cabello",
    description: "Shampoo, tratamientos y herramientas de peinado.",
  },
  {
    slug: "cuerpo-bano",
    name: "Cuerpo y baño",
    shortName: "Cuerpo y baño",
    description: "Cremas corporales, exfoliantes y aceites.",
  },
  {
    slug: "perfumeria",
    name: "Perfumería",
    shortName: "Perfumería",
    description: "Fragancias y sets de regalo.",
  },
  {
    slug: "unas",
    name: "Uñas",
    shortName: "Uñas",
    description: "Esmaltes, semipermanente y accesorios de manicure.",
  },
  {
    slug: "bienestar",
    name: "Bienestar y suplementos",
    shortName: "Bienestar",
    description: "Colágeno y suplementos para la piel, el cabello y las uñas.",
  },
  {
    slug: "accesorios",
    name: "Accesorios y herramientas",
    shortName: "Accesorios",
    description: "Brochas, espejos, organizadores y neceseres.",
  },
];

export function getCategory(slug: string): Category | undefined {
  return categories.find((c) => c.slug === slug);
}

export interface Technique {
  slug: string;
  name: string;
  price: number;
  durationMinutes: number;
  description: string;
}

export const techniques: Technique[] = [
  {
    slug: "clasicas",
    name: "Clásicas",
    price: 80000,
    durationMinutes: 90,
    description:
      "Una extensión por cada pestaña natural. Efecto natural, ideal para el día a día.",
  },
  {
    slug: "volumen",
    name: "Volumen ruso",
    price: 110000,
    durationMinutes: 120,
    description:
      "Abanicos de 3 a 6 extensiones ultra finas por pestaña natural. Densidad con peso pluma.",
  },
  {
    slug: "mega-volumen",
    name: "Mega volumen",
    price: 130000,
    durationMinutes: 150,
    description:
      "Abanicos de hasta 10 extensiones por pestaña. El efecto más dramático e intenso.",
  },
  {
    slug: "hibridas",
    name: "Híbridas",
    price: 95000,
    durationMinutes: 105,
    description:
      "Mezcla de clásicas y volumen para un efecto texturizado, ni muy natural ni muy cargado.",
  },
  {
    slug: "lifting",
    name: "Lifting de pestañas",
    price: 60000,
    durationMinutes: 60,
    description:
      "Levanta y riza tu pestaña natural desde la raíz. Dura hasta 8 semanas, sin extensiones.",
  },
];
