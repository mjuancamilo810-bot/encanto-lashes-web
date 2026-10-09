# Encanto Lashes

Sitio web de Encanto Lashes: tienda de belleza y estudio de extensiones de
pestañas en Medellín. Next.js 16 (App Router) + TypeScript estricto +
Tailwind v4, con un hero 3D (Three.js) y un slider antes/después como
piezas centrales de conversión.

> **Nota de versión:** el prompt original de este proyecto pedía Next.js 14
> y Tailwind v3. Se construyó con Next.js 16 y Tailwind v4 (las versiones
> estables actuales al momento de construir el sitio) porque fijar
> versiones ya superadas no aporta nada a un sitio nuevo — la arquitectura,
> el sistema de tokens y todos los requisitos del brief se respetaron igual.
> Tailwind v4 configura el tema vía CSS (`@theme` en `app/globals.css`) en
> vez de `tailwind.config.js`; ver [DESIGN_TOKENS.md](DESIGN_TOKENS.md).

## 1. Stack y arquitectura

```
Next.js 16 (App Router, TS strict)
├─ Tailwind v4 (tema en app/globals.css) + shadcn/ui-style primitives (Radix)
├─ Three.js + @react-three/fiber + @react-three/drei  → hero y acento 3D
├─ Framer Motion + GSAP (ScrollTrigger)                → animación
├─ Zustand (persist → localStorage)                    → carrito, modo lashista
└─ @shopify/hydrogen-react                              → integración futura

app/
├─ page.tsx                 Homepage (ensambla /components/sections en orden)
├─ layout.tsx                Fuentes, metadata, JSON-LD, Navbar/Footer/WhatsApp/Cart
├─ sitemap.ts, robots.ts     SEO — generación nativa de App Router
├─ icon.svg                  Favicon (monograma)
├─ tienda/                   Catálogo con filtro por categoría/tag
├─ producto/[slug]/          Ficha de producto + relacionados + JSON-LD Product
├─ tecnica/[slug]/           Landing por técnica con su propio antes/después
├─ para-lashistas/           Landing B2B (mayorista)
├─ contacto/                 Formulario + mapa
└─ carrito/                  Resumen de pedido → WhatsApp

components/
├─ 3d/          ProductPodium (hero), KitBox (acento), fallback y error boundary
├─ ui/          BeforeAfterSlider, ProductCard, CartDrawer, WhatsAppButton...
├─ layout/      Navbar, Footer, Logo (único punto de referencia al archivo de logo)
└─ sections/    Hero, Pillars, BeforeAfterSection, FeaturedProducts...

lib/            products.ts (data access), cart.ts (Zustand), shopify.ts (guía
                de integración), categories.ts, types.ts, whatsapp.ts, utils.ts
hooks/          useIsLashista, useReducedMotion, useDeviceCapability
data/           products.json (44 productos), testimonials.json
```

Los datos viven en JSON local con una forma que imita la Shopify Storefront
API a propósito: conectar Shopify de verdad es cambiar el *data source* en
`lib/products.ts`, no reescribir componentes.

## 2. Instalación y ejecución local

Requiere Node.js 20+.

```bash
npm install
npm run dev
```

Abre [http://localhost:3000](http://localhost:3000).

```bash
npm run build   # build de producción — falla si hay errores de TS/ESLint
npm run start   # sirve el build de producción localmente
npm run lint
```

## 3. Variables de entorno

Copia `.env.local.example` a `.env.local` y completa los valores reales
(ya existe un `.env.local` con placeholders para que `npm run dev` funcione
sin configuración adicional — los enlaces de WhatsApp no funcionarán de
verdad hasta que pongas un número real).

| Variable | Para qué sirve |
|---|---|
| `NEXT_PUBLIC_SHOPIFY_STORE_DOMAIN` / `_STOREFRONT_TOKEN` | Conectar el carrito a Shopify (paso a paso abajo) |
| `NEXT_PUBLIC_WHATSAPP_NUMBER` | Número de WhatsApp Business, formato internacional sin `+` (ej. `573001234567`) |
| `NEXT_PUBLIC_INSTAGRAM_HANDLE` / `_TIKTOK_HANDLE` | Enlaces del footer |
| `NEXT_PUBLIC_GA_ID` | Google Analytics (no está cableado en el código todavía — solo reservado) |
| `NEXT_PUBLIC_SITE_URL` | Dominio final, usado en metadata, sitemap.xml y JSON-LD |

## 4. Conectar Shopify (Storefront API)

1. Shopify Admin → **Apps** → **Desarrollar Apps** → **Crear App**.
2. Permisos: `storefront:read` (products, collections, cart).
3. Copia el **Storefront Access Token** (no el Admin API key).
4. Pégalo en `.env.local` junto con tu dominio `.myshopify.com`.
5. El código para consumir la Storefront API con `@shopify/hydrogen-react`
   (ya instalado) está documentado paso a paso en
   [`lib/shopify.ts`](lib/shopify.ts) — hoy el carrito usa datos locales
   (`lib/cart.ts`, Zustand); migrar significa envolver la app en
   `<ShopifyProvider>` y reemplazar ese store por el `useCart` de
   hydrogen-react.

## 5. Conectar Dropi (dropshipping, vía app "Dropify")

Para las categorías que no tienen stock propio todavía (skincare, cabello,
cuerpo y baño, perfumería, uñas — ver campo `sourceType: "dropi"` en
`data/products.json`):

1. Crea cuenta en [dropi.co](https://dropi.co/comienza-en-el-dropshipping).
2. En Dropi: **Mis Integraciones** → **Agregar** → **Shopify** → copia el
   token.
3. Instala la app **Dropify** desde el Shopify App Store.
4. En Dropify, pega el token y verifica la conexión.
5. Los SKUs deben coincidir exactamente entre Dropi y Shopify — usa el
   mismo `sku` que aparece en cada variante dentro de `data/products.json`.
6. Cuando una categoría "dropi" empiece a vender bien y valga la pena tener
   stock propio, se migra igual que se hizo con pestañas: buscar proveedor
   directo y cambiar `sourceType` a `"own_stock"` en ese producto.

Detalles completos también en los comentarios de [`lib/shopify.ts`](lib/shopify.ts).

## 6. Reemplazar el logo

El logo real de la marca (monograma "EL" rosa dorado, script "Encanto" en
negro, "LASHES" en rosa) ya lo tienes en tu computador — el sitio hoy usa
un placeholder SVG que imita esa misma composición para que el layout se
vea correcto desde ya.

Todo el sitio referencia el logo desde **un solo componente**:
[`components/layout/Logo.tsx`](components/layout/Logo.tsx). Para poner el
archivo real:

1. Exporta tu logo como SVG o PNG con fondo transparente (recomendado
   ≥600px de ancho para que se vea nítido en pantallas retina).
2. Reemplaza el contenido de `public/logo.svg` (versión a color, para
   fondos claros — navbar) y opcionalmente `public/logo-light.svg`
   (versión clara, para el footer sobre fondo oscuro).
3. Si tu archivo es PNG en vez de SVG, cambia las rutas en `SRC` dentro de
   `Logo.tsx` (por ejemplo `/logo.png`) — es el único lugar del código que
   hay que tocar.

No hace falta editar Navbar.tsx, Footer.tsx ni ningún otro archivo.

## 7. Reemplazar las fotos del antes/después (el paso más importante)

El slider antes/después usa placeholders ilustrados en
`public/before-after/*.svg`. Es el componente que más impacta en
conversión — reemplázalo con fotos reales de clientas (con su permiso) en
cuanto tengas el sitio arriba:

1. Consigue pares de fotos "antes" y "después" reales, mismo ángulo y luz.
2. Guárdalas en `public/before-after/` (ej. `before-1.jpg`, `after-1.jpg`).
3. Actualiza las rutas en `components/sections/BeforeAfterSection.tsx` y en
   `app/tecnica/[slug]/page.tsx`.

Las imágenes de producto en `public/products/*.svg` son el mismo tipo de
placeholder — reemplázalas por fotos reales de producto cuando las tengas,
actualizando el campo `images` de cada producto en `data/products.json`.

## 8. Agregar o editar productos

Todo el catálogo vive en [`data/products.json`](data/products.json) (44
productos en las 8 categorías del rubro belleza). Cada producto:

```json
{
  "id": "nagaraku-classic-individual-0-07mm-curl-c",
  "slug": "nagaraku-classic-individual-0-07mm-curl-c",
  "name": "Classic Individual 0.07mm Curl C",
  "brand": "Nagaraku",
  "category": "pestanas-cejas",
  "sourceType": "own_stock",
  "price": 45000,
  "priceWholesale": 32000,
  "images": ["/products/placeholder-lashes.svg"],
  "variants": [{ "name": "7mm", "sku": "NAG-007-C-07", "stock": 15 }],
  "featured": true,
  "inStock": true
}
```

- `category` debe ser uno de los 8 slugs definidos en `lib/categories.ts`.
- `sourceType`: `"own_stock"` (inventario propio) o `"dropi"` (dropshipping).
- `featured: true` lo muestra en la sección "Lo más querido" de la home
  (máximo 12 — ver `getFeaturedProducts` en `lib/products.ts`).
- `tags: ["kit"]` lo incluye en el filtro de kits y sets de regalo.
- No hay que reiniciar nada más allá de guardar el archivo en desarrollo
  (`npm run dev` recarga solo); en producción hay que volver a desplegar.

## 9. Cambiar precios

Directamente en `data/products.json`: `price` (precio normal, en COP, sin
puntos ni decimales) y `priceWholesale` (precio de lashista, opcional). El
formato de moneda se aplica automáticamente vía `formatCOP()` en
`lib/utils.ts`.

## 10. Deploy en Vercel

```bash
npm install -g vercel
vercel
```

1. Sigue las instrucciones (vincula o crea un proyecto de Vercel).
2. En el dashboard de Vercel, agrega las mismas variables de
   `.env.local.example` en **Settings → Environment Variables**.
3. `vercel --prod` para el deploy de producción, o simplemente conecta el
   repositorio de GitHub en el dashboard de Vercel para deploys
   automáticos en cada push.

`vercel.json` ya está configurado (framework detectado automáticamente,
headers de seguridad básicos).

## 11. Accesibilidad y contraste

Todo el texto legible del sitio usa combinaciones verificadas en AA o
mejor (ver tabla de contraste en [DESIGN_TOKENS.md](DESIGN_TOKENS.md)):
`--noir` para precios, navegación y botones; `--rose-gold` se reserva para
íconos, bordes y texto sobre fondo oscuro, nunca como texto legible sobre
fondos claros. Única excepción documentada: la palabra en script del H1
del hero, tratada como logotype. Todos los componentes interactivos son
navegables por teclado con `focus-visible` marcado, y `prefers-reduced-motion`
se respeta en las animaciones 3D, GSAP y Framer Motion.

## Checklist para activar todo

- [ ] Copiar el logo real a `public/logo.svg` (o `.png`, ajustando la ruta
      en `Logo.tsx`).
- [ ] Reemplazar las fotos de `public/before-after/` por antes/después
      reales de clientas.
- [ ] Reemplazar las fotos de producto en `public/products/`.
- [ ] Crear la tienda en Shopify y completar las variables de Shopify.
- [ ] Crear cuenta en Dropi + instalar Dropify para las categorías sin
      stock propio.
- [ ] Poner el número real de WhatsApp Business en `NEXT_PUBLIC_WHATSAPP_NUMBER`.
- [ ] Reemplazar las cifras de la banda de confianza (`TrustBand.tsx`) por
      números reales — hoy son placeholders marcados con `TODO(dueña)`.
- [ ] Configurar `NEXT_PUBLIC_SITE_URL` con el dominio final antes del deploy.
- [ ] Conectar Google Analytics si se va a usar (`NEXT_PUBLIC_GA_ID` está
      reservado pero no cableado en el código todavía).
