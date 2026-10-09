"use client";

import dynamic from "next/dynamic";
import { FloatingPhoto } from "@/components/ui/FloatingPhoto";
import { GALLERY } from "@/lib/gallery";

const KitBox = dynamic(() => import("@/components/3d/KitBox").then((m) => m.KitBox), {
  ssr: false,
  loading: () => (
    <div className="mx-auto h-64 w-full max-w-sm animate-pulse rounded-3xl bg-blush/10" />
  ),
});

export function KitAccent() {
  return (
    <section className="relative overflow-hidden bg-noir py-16 text-blush sm:py-20">
      <FloatingPhoto
        src={GALLERY.brushesGlam}
        objectPosition="30% 50%"
        rotate={-5}
        tone="dark"
        className="-left-12 top-16 h-28 w-24 sm:-left-8 sm:h-40 sm:w-32 lg:left-4 lg:h-52 lg:w-40 xl:left-12"
      />
      <FloatingPhoto
        src={GALLERY.brushesGlam}
        objectPosition="80% 40%"
        rotate={5}
        delay="1.4s"
        tone="dark"
        className="-right-12 bottom-16 h-28 w-24 sm:-right-8 sm:h-40 sm:w-32 lg:right-4 lg:h-52 lg:w-40 xl:right-12"
      />
      <div className="relative z-10 mx-auto max-w-3xl px-4 text-center sm:px-6">
        <p className="font-body text-xs font-semibold uppercase tracking-[0.2em] text-rose-gold-light">
          Regala encanto
        </p>
        <h2 className="mt-3 font-display text-2xl font-semibold sm:text-3xl">
          Kits y sets, listos para sorprender
        </h2>
        <div className="mt-8">
          <KitBox />
        </div>
        <a
          href="/tienda?tag=kit"
          className="mt-8 inline-block rounded-full bg-blush px-6 py-3 text-sm font-medium text-noir hover:bg-blush/90"
        >
          Ver kits y sets
        </a>
      </div>
    </section>
  );
}
