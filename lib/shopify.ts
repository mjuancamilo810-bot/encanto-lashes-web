/**
 * Integración Shopify + Dropi — actualmente sin conectar.
 *
 * El sitio funciona hoy con datos locales (ver lib/products.ts y
 * data/products.json). Este archivo documenta cómo migrar el carrito a
 * Shopify Storefront API cuando la tienda esté lista, sin tener que tocar
 * los componentes de UI (todos consumen las funciones de lib/products.ts
 * y lib/cart.ts, nunca fetch directo).
 *
 * ── SHOPIFY STOREFRONT API ──────────────────────────────────────────
 * 1. Shopify Admin → Apps → Desarrollar Apps → Crear App.
 * 2. Permisos: storefront:read (products, collections, cart).
 * 3. Copia el Storefront Access Token (NO el Admin API key, ese nunca
 *    debe llegar al frontend).
 * 4. Agrega a .env.local (ver .env.local.example):
 *    NEXT_PUBLIC_SHOPIFY_STORE_DOMAIN=tu-tienda.myshopify.com
 *    NEXT_PUBLIC_SHOPIFY_STOREFRONT_TOKEN=tu-token-aqui
 * 5. Usa @shopify/hydrogen-react (ya instalado) para envolver la app en
 *    <ShopifyProvider> y reemplazar useCartStore (lib/cart.ts) por el
 *    hook useCart de hydrogen-react, o sincronizar ambos.
 *
 * ── DROPI + SHOPIFY (APP "DROPIFY") ─────────────────────────────────
 * 1. dropi.co/comienza-en-el-dropshipping → crear cuenta.
 * 2. Dropi: Mis Integraciones → Agregar → Shopify → copiar el TOKEN.
 * 3. Shopify App Store: instalar la app "Dropify".
 * 4. En Dropify: pegar el token → Verificar conexión.
 * 5. Los SKUs deben coincidir EXACTAMENTE entre Dropi y Shopify — usa el
 *    mismo `sku` que aparece en cada variante de data/products.json.
 * 6. Los insumos propios (Nagaraku, Sky Glue, Stacy Lash, productos con
 *    sourceType "own_stock") se agregan manualmente en Shopify. Dropi
 *    gestiona el fulfillment de las categorías con sourceType "dropi"
 *    (skincare, cabello, cuerpo y baño, perfumería, uñas) mientras se
 *    consiguen proveedores propios para esas categorías.
 * 7. Cuando una categoría "dropi" empiece a vender bien y valga la pena
 *    tener stock propio, se migra igual que se hizo con pestañas: buscar
 *    proveedor directo y cambiar `sourceType` a "own_stock" en ese
 *    producto dentro de data/products.json.
 *
 * Docs: https://apps.shopify.com/dropify-5
 */

export const SHOPIFY_STORE_DOMAIN =
  process.env.NEXT_PUBLIC_SHOPIFY_STORE_DOMAIN ?? "";
export const SHOPIFY_STOREFRONT_TOKEN =
  process.env.NEXT_PUBLIC_SHOPIFY_STOREFRONT_TOKEN ?? "";

export function isShopifyConfigured(): boolean {
  return Boolean(SHOPIFY_STORE_DOMAIN && SHOPIFY_STOREFRONT_TOKEN);
}
