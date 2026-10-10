# Retomar este proyecto en Claude Code

Documento de contexto para una sesión nueva de Claude Code que nunca ha
visto este proyecto. Léelo completo antes de tocar código.

---

## Qué es

**Encanto Lashes**: tienda de belleza y estudio de extensiones de pestañas
en Medellín, Colombia. Sitio en Next.js, pensado para desplegar en Vercel y
conectar después a Shopify. Toda la interfaz está en **español colombiano**.

Stack real (verifícalo, no asumas):

- **Next.js 16** (App Router) — `params` en rutas dinámicas es `Promise`,
  hay que hacer `await`.
- **TypeScript estricto** — prohibido `any`.
- **Tailwind v4** — el tema vive en `app/globals.css` dentro de `@theme`.
  **No existe `tailwind.config.js` y no hay que crearlo.**
- Three.js + React Three Fiber, Framer Motion, GSAP, Zustand, Radix UI.
- El catálogo es JSON local (`data/products.json`), generado por un script
  de Python desde un CSV de proveedores.

## Arrancar

```bash
npm install
cp .env.local.example .env.local   # editar NEXT_PUBLIC_WHATSAPP_NUMBER
npm run dev
```

`npm run build` y `npm run lint` deben terminar con **cero errores y cero
advertencias**. Ese es el estándar del proyecto; no bajes la vara.

---

## Reglas que NO debes romper

### 1. Nada de prueba social inventada

Esto es lo más importante del proyecto. El sitio es de un negocio real que
va a vender de verdad, así que **no se inventan datos que el cliente pueda
creer ciertos**:

- Las fichas de producto muestran **"Aún sin reseñas"**. `rating` es `null`
  y `reviewCount` es `0` a propósito. No rellenes con valores inventados.
- El JSON-LD de producto **solo** declara `aggregateRating` si hay reseñas
  reales (ver `app/producto/[slug]/page.tsx`).
- `data/testimonials.json` está **vacío a propósito**. La sección se oculta
  sola. No inventes testimonios con nombre y ciudad.
- `components/sections/TrustBand.tsx` muestra datos verificables
  (cantidad de productos, categorías, cobertura, contraentrega). Antes tenía
  métricas inventadas tipo "500+ clientas atendidas" y se quitaron.

Si la dueña pide volver a poner números inventados, explícale el problema
(publicidad engañosa) y ofrécele la alternativa verificable.

### 2. Nada de imágenes sin licencia

Ya se rechazaron, por pedido explícito, imágenes de iStock y de Pinterest.
Solo se usan:

- Fotos del proveedor (de productos que el negocio realmente vendería).
- Bancos libres de uso comercial (Pixabay/Pexels/Unsplash) — hay 3 en
  `public/gallery/`, registradas en `lib/gallery.ts`.
- Ilustraciones SVG propias.

### 3. Filtros del catálogo

`scripts/importar-catalogo.py` bloquea, y debe seguir bloqueando:

- **Réplicas y marcas de terceros** (`1:1 copy`, `replica`, Chanel, Dior…) —
  es infracción de marca y las plataformas lo retiran.
- **Productos inyectables / mesoterapia / fillers** — en Colombia requieren
  registro INVIMA y no son producto de tienda.
- **Público masculino** — la tienda es de cuidado femenino.
- **MOQ > 200 unidades** — inviable de surtir.

### 4. Accesibilidad y color

`DESIGN_TOKENS.md` tiene la tabla de contraste medida. Lo crítico:

> `--rose-gold` sobre fondos claros da **2.9:1** y **no pasa AA en ningún
> tamaño**. Nunca lo uses como color de texto legible sobre claro — solo
> como ícono, borde, o texto sobre `--noir`.

Para texto sobre fondo claro: `--noir`. Precios, botones y navegación ya
están así; no los "embellezcas" cambiándolos a rosado.

Única excepción documentada: la palabra en script del H1 del hero, tratada
como logotipo.

---

## Trampas técnicas ya descubiertas (no las repitas)

1. **Reglas estrictas de React Compiler.** El lint de este proyecto rechaza:
   - `Math.random()` / `Date.now()` durante el render, incluido dentro de
     `useMemo`. Para datos aleatorios usa un **callback ref** que corre en
     commit (ver `components/3d/GoldParticles.tsx`).
   - `setState` sincrónico dentro del cuerpo de un `useEffect` para leer
     estado del navegador. Usa **`useSyncExternalStore`** (ver
     `hooks/useReducedMotion.ts` y `hooks/useDeviceCapability.ts`).
   - Mutar valores devueltos por `useMemo`, y **leer refs durante el render**.

2. **Los `<Canvas>` de Three.js** deben montarse con
   `dynamic(..., { ssr: false })`, si no rompen el build.

3. **Windows: matar el servidor de desarrollo.** `lsof -ti:3000 | xargs kill`
   **no funciona** aquí — el proceso sigue vivo y sirve contenido viejo.
   Usa `taskkill //PID <pid> //F`. Esto causó que la dueña viera una versión
   desactualizada del sitio durante un rato.

4. **No escribas regex de Python dentro de heredocs de bash.** El `\b` se
   convierte en un carácter de retroceso literal (`\x08`) y el filtro deja
   de funcionar **en silencio**. Pasó dos veces y dejó pasar réplicas.
   Escribe los scripts con la herramienta de archivos, no con heredoc.

5. **Las animaciones CSS pisan `transform` inline.** Si un elemento tiene
   rotación inline y una animación que anima `transform`, la rotación se
   pierde. Separa en dos elementos (ver `components/ui/FloatingPhoto.tsx`).

6. **Fallback de `prefers-reduced-motion`.** Si la visibilidad de un
   elemento depende solo del keyframe, al desactivar animaciones queda
   invisible. Siempre define un estado base visible.

---

## El pipeline del catálogo

```bash
python scripts/scraper-catalogo.py     # trae productos del proveedor
python scripts/importar-catalogo.py    # cura y genera data/products.json
```

Datos del sitio del proveedor ya verificados (no los redescubras):

- Página 1: `.../hot-china-products/<Categoria>.html`
- Página N: `.../find-china-products/0b0nolimit/<Categoria>-N.html`
- 30 productos por página, 9+ páginas por categoría.
- 6 imágenes por tarjeta.
- El prefijo del CDN define el tamaño: cambiarlo da **1086px en vez de
  300px**.

Hoy: 4.464 productos en el CSV, 162 publicados (18 por categoría, elegidos
por calidad de proveedor: auditado, membresía Diamond, fabricante).

### Curaduría de fotos — aquí es donde está el trabajo pendiente

Muchas fotos del proveedor no sirven: mockups que dicen "logo"/"Your Logo",
marcas de agua del proveedor, infografías en inglés, fotos de bodega.

Dos mecanismos, ambos en `scripts/`:

- **`proveedores-descartados.json`** — vetar un proveedor completo. Es lo
  más eficiente: si un proveedor marca con agua todas sus fotos, vetarlo
  libera cupos para otro mejor. Hay 9 vetados.
- **`fotos-descartadas.json`** — descartar productos sueltos por URL.

**Método que funcionó:** generar hojas de contacto (miniaturas en grilla con
PIL), mirarlas en bloque, identificar las malas, y vetar al proveedor
responsable. Quedó **1 de 7 hojas revisada**; faltan 6.

---

## Pendientes

| Tarea | Dónde |
|---|---|
| Terminar curaduría de fotos (6 hojas) | `scripts/*-descartados.json` |
| Fotos reales de antes/después de clientas | `public/before-after/` |
| Logo real (hoy hay un placeholder SVG fiel) | `public/logo.svg`, un solo punto en `components/layout/Logo.tsx` |
| Cifras reales para la banda de confianza | `components/sections/TrustBand.tsx` |
| Confirmar TRM y margen (hoy 4000 × 2.8) | arriba de `scripts/importar-catalogo.py` |
| Conectar Shopify y Dropi | `lib/shopify.ts` |
| Número real de WhatsApp | `.env.local` |

---

## Cómo trabaja bien este proyecto

- Verifica antes de afirmar: corre `npm run build`, `npm run lint`, y mira
  el sitio en el navegador con capturas antes de decir que algo funciona.
- La dueña no es desarrolladora. Explica en español, sin jerga innecesaria,
  y dile claramente cuándo algo es un riesgo legal o de credibilidad.
- Si encuentras un bug propio, dilo y arréglalo; no lo escondas.
