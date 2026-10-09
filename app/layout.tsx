import type { Metadata } from "next";
import { Fraunces, Parisienne, Poppins } from "next/font/google";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { WhatsAppButton } from "@/components/ui/WhatsAppButton";
import { CartDrawer } from "@/components/ui/CartDrawer";
import "./globals.css";

const fraunces = Fraunces({
  variable: "--font-fraunces",
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  style: ["normal", "italic"],
});

const parisienne = Parisienne({
  variable: "--font-parisienne",
  subsets: ["latin"],
  weight: "400",
});

const poppins = Poppins({
  variable: "--font-poppins",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600"],
});

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "https://encantolashes.co";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "Encanto Lashes — Pestañas, Maquillaje y Accesorios",
    template: "%s · Encanto Lashes",
  },
  description:
    "Extensiones de pestañas profesionales, maquillaje y accesorios de belleza en Medellín, con envíos a toda Colombia.",
  openGraph: {
    title: "Encanto Lashes — Pestañas, Maquillaje y Accesorios",
    description:
      "Extensiones de pestañas profesionales, maquillaje y accesorios de belleza en Medellín, con envíos a toda Colombia.",
    url: siteUrl,
    siteName: "Encanto Lashes",
    locale: "es_CO",
    type: "website",
    images: ["/products/placeholder-lashes.svg"],
  },
};

const localBusinessJsonLd = {
  "@context": "https://schema.org",
  "@type": "LocalBusiness",
  name: "Encanto Lashes",
  image: `${siteUrl}/logo.svg`,
  address: {
    "@type": "PostalAddress",
    addressLocality: "Medellín",
    addressRegion: "Antioquia",
    addressCountry: "CO",
  },
  priceRange: "$$",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="es-CO"
      className={`${fraunces.variable} ${parisienne.variable} ${poppins.variable} h-full antialiased`}
    >
      <body className="flex min-h-full flex-col bg-cream font-body text-noir">
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(localBusinessJsonLd) }}
        />
        <Navbar />
        <main className="flex-1">{children}</main>
        <Footer />
        <WhatsAppButton />
        <CartDrawer />
      </body>
    </html>
  );
}
