# Migración a otro equipo + estado del proyecto

Documento de traspaso. Si estás leyendo esto en un computador nuevo, la
sección 1 es lo único que necesitas para dejar el sitio corriendo.

---

## 1. Arrancar en el PC nuevo

Requisitos: **Node.js 20+**, **Git**, y **Python 3.10+** (solo si vas a
reimportar el catálogo).

```bash
git clone <URL-DEL-REPO>
cd encanto-lashes-web
npm install
cp .env.local.example .env.local     # luego edita .env.local
npm run dev
```

Abre http://localhost:3000

Comandos útiles:

| Comando | Para qué |
|---|---|
| `npm run dev` | Desarrollo con recarga automática |
| `npm run build` | Build de producción (falla si hay errores de TS/ESLint) |
| `npm run lint` | Revisar código |
| `python scripts/importar-catalogo.py` | Regenerar el catálogo desde el CSV |
| `python scripts/scraper-catalogo.py` | Traer más productos del proveedor |

### Lo que debes configurar en `.env.local`

Lo único **imprescindible** para que el sitio funcione de verdad es el
número de WhatsApp. El resto puede quedarse con el valor de ejemplo
mientras tanto.

```
NEXT_PUBLIC_WHATSAPP_NUMBER=573001234567   <-- CAMBIAR por el real
NEXT_PUBLIC_SITE_URL=https://encantolashes.co
NEXT_PUBLIC_INSTAGRAM_HANDLE=@encantolashes
NEXT_PUBLIC_TIKTOK_HANDLE=@encantolashes
NEXT_PUBLIC_SHOPIFY_STORE_DOMAIN=...       <-- cuando exista la tienda Shopify
NEXT_PUBLIC_SHOPIFY_STOREFRONT_TOKEN=...
```

> `.env.local` **no está en el repositorio** (contiene secretos). Por eso
> hay que crearlo a partir del ejemplo en cada equipo.

---

## 2. En qué quedó el proyecto

### Funcionando

- **Sitio completo en Next.js 16** (App Router, TypeScript estricto,
  Tailwind v4). `npm run build` y `npm run lint` pasan sin errores ni
  advertencias.
- **162 productos reales** en 9 categorías, con foto en alta resolución
  (1000×1000), precio en COP y datos internos de proveedor.
- **Vitrina animada** arriba de la portada: carrusel arrastrable con
  inercia, navegable por teclado, que respeta `prefers-reduced-motion`.
- **Fotos flotantes** acompañando el scroll en las 8 secciones.
- **Hero 3D** (Three.js) con fallback estático para equipos de gama baja.
- **Comparador antes/después** con arrastre táctil y por teclado.
- **Carrito** persistente (Zustand) + modo mayorista para lashistas.
- Páginas: `/tienda`, `/producto/[slug]`, `/tecnica/[slug]`,
  `/para-lashistas`, `/contacto`, `/carrito`. SEO con sitemap y JSON-LD.

### Decisiones de integridad que NO hay que revertir

Estas se tomaron a propósito; si se deshacen, el sitio publica
afirmaciones falsas:

1. **Sin estrellas inventadas.** Las fichas dicen "Aún sin reseñas" hasta
   que existan reseñas reales. El JSON-LD tampoco declara calificación.
2. **Sin testimonios inventados.** `data/testimonials.json` está vacío a
   propósito y la sección se oculta sola. Al llenarlo con testimonios
   reales, reaparece.
3. **Banda de confianza con datos verificables** (productos, categorías,
   cobertura, contraentrega) en vez de métricas inventadas.
4. **Filtros del catálogo**: se bloquean réplicas y marcas de terceros
   (infracción de marca), productos inyectables/mesoterapia (requieren
   INVIMA) y listados de público masculino.

### Pendiente

| Tarea | Dónde |
|---|---|
| Fotos reales de antes/después de clientas | `public/before-after/` |
| Logo real de la marca | `public/logo.svg` (ver `components/layout/Logo.tsx`) |
| Curar fotos de producto del proveedor | ver sección 3 |
| Cifras reales para la banda de confianza | `components/sections/TrustBand.tsx` |
| Conectar Shopify y Dropi | ver `lib/shopify.ts` y `README.md` |
| Confirmar TRM y margen de precios | `scripts/importar-catalogo.py` (arriba del todo) |

---

## 3. Curaduría de fotos: dónde quedó

Las fotos vienen del proveedor y **muchas no sirven** para una tienda:
mockups de marca blanca que dicen "logo"/"Your Logo", marcas de agua del
proveedor, infografías en inglés, fotos de bodega.

Mecanismos ya implementados para manejarlo:

- `scripts/proveedores-descartados.json` — **vetar un proveedor completo**.
  Es lo más eficiente: un proveedor con marca de agua arruina todas sus
  fotos, y vetarlo libera cupos para otro mejor.
- `scripts/fotos-descartadas.json` — descartar productos sueltos por URL.
- `MAX_POR_PROVEEDOR = 3` en el importador: ningún proveedor copa la tienda.

**Cómo seguir revisando** (el método que funcionó): generar hojas de
contacto con miniaturas de todas las fotos, mirarlas en bloque, anotar las
malas, y vetar al proveedor responsable. Tras cada cambio:

```bash
python scripts/importar-catalogo.py
npm run build
```

Quedó **una pasada de revisión hecha** (de 7 hojas, la primera). Faltan las
otras 6.

---

## 4. Cómo crecer el catálogo

El scraper ya conoce los datos difíciles del sitio del proveedor:

- La paginación usa una ruta distinta a la de la página 1
  (`find-china-products/0b0nolimit/<Categoria>-N.html`).
- Cada página trae 30 productos; hay 9+ páginas por categoría.
- Cada tarjeta expone 6 imágenes.
- El prefijo del CDN define el tamaño: cambiarlo da **1086px en vez de
  300px**.

Para agregar categorías: edita `CATEGORIAS_PRUEBA` en
`scripts/scraper-catalogo.py`, corre el scraper, y luego el importador.
Hoy el CSV tiene **4.464 productos** disponibles de 32 categorías, de los
cuales se publican 162 (18 por categoría, los de mejor proveedor).

---

## 5. Publicar en internet (Vercel)

```bash
npm install -g vercel
vercel
```

Luego, en el panel de Vercel → Settings → Environment Variables, agrega las
mismas variables de `.env.local`. Para producción: `vercel --prod`.

Lo más cómodo es conectar el repositorio de GitHub en vercel.com: cada
`git push` despliega solo.
