import { getAllProducts } from "@/lib/products";

/**
 * Banda de confianza. Solo muestra datos verificables: dos se calculan del
 * catálogo real y dos son condiciones del negocio.
 *
 * Cuando existan cifras reales de operación (clientas atendidas,
 * calificación promedio verificada), se agregan aquí. Mientras no existan,
 * no se inventan: publicar métricas falsas es publicidad engañosa.
 */
export function TrustBand() {
  const productos = getAllProducts();
  const categorias = new Set(productos.map((p) => p.category)).size;

  const metrics = [
    { value: `${productos.length}`, label: "Productos en catálogo" },
    { value: `${categorias}`, label: "Categorías de belleza" },
    { value: "Toda Colombia", label: "Cobertura de envíos" },
    { value: "Contraentrega", label: "Puedes pagar al recibir" },
  ];

  return (
    <section className="bg-noir py-8 text-blush">
      <div className="mx-auto grid max-w-7xl grid-cols-2 gap-6 px-4 sm:grid-cols-4 sm:px-6">
        {metrics.map((m) => (
          <div key={m.label} className="text-center">
            <p className="font-display text-xl font-semibold sm:text-3xl">{m.value}</p>
            <p className="mt-1 text-xs text-blush/70 sm:text-sm">{m.label}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
