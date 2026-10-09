# Prompt para ampliar el catálogo de Made-in-China (v2)

> Copia todo lo que está dentro del bloque de abajo y pégalo en el otro chat.

---

Necesito ampliar un catálogo de productos de **belleza y cuidado femenino** desde
Made-in-China.com (sitio público, sin login). Ya existe una versión previa que quedó
corta: trajo solo 240 listados y, tras filtrarlos por calidad, sobrevivieron 51. El
objetivo ahora es traer **muchísimo más volumen y mejores fotos**.

## Datos técnicos YA VERIFICADOS — no los redescubras ni los cambies

Estos los comprobé contra el HTML real. Confía en ellos:

1. **Cada página trae 30 productos**, no 20. El script anterior cortaba en 20 y
   desperdiciaba 10 por página.

2. **La paginación usa una ruta DISTINTA a la de la página 1.** Este es el punto
   crítico que hizo que la versión anterior scrapeara una sola página por categoría:
   - Página 1: `https://www.made-in-china.com/products-search/hot-china-products/<Keyword>.html`
   - Página N (N≥2): `https://www.made-in-china.com/products-search/find-china-products/0b0nolimit/<Keyword>-<N>.html`

   Ejemplo real comprobado (página 2 devuelve 30 productos distintos, solapamiento de 1):
   `https://www.made-in-china.com/products-search/find-china-products/0b0nolimit/False_Eyelashes-2.html`

   Hay **al menos 9 páginas por categoría**. Recorre hasta que una página devuelva
   0 productos o hasta la página 10, lo que ocurra primero.

3. **Cada tarjeta de producto expone 6 imágenes**, no 1. Están en los atributos
   `data-original` y `src` de las etiquetas `<img>` dentro de la tarjeta, todas
   apuntando a `https://image.made-in-china.com/`. Extráelas TODAS: la primera
   suele ser un mockup de marca blanca que dice "logo" / "Your Logo", y las otras
   sirven de repuesto.

4. **Selectores que funcionan** (no los rediseñes):
   - Tarjeta: `div.products-item`
   - Nombre: `h2.product-name a` (atributo `title`)
   - Precio: `.attr-item.price-new .price`
   - MOQ: `.attr-item.moq-new .attribute`
   - Proveedor: `.company-name .compnay-name span`
   - Imágenes: dentro de la tarjeta, `img[data-original]` y `img[src*="image.made-in-china.com"]`

## Categorías

Estas 12 ya están comprobadas y devuelven productos:

```
Skincare_Products, Makeup, Makeup_Brush, Hair_Extension, False_Eyelashes,
Press_On_Nails, Facial_Massager, LED_Face_Mask, Perfume, Hair_Straightener,
Feminine_Hygiene_Products, Collagen_Supplement
```

Además prueba estas (son propuestas, NO están verificadas — comprueba cada una y
repórtame cuáles fallan). La tienda es de extensiones de pestañas primero, así que
las de pestañas son las más importantes:

```
Eyelash_Extension, Eyelash_Glue, Eyelash_Tweezers, Eyebrow_Pencil, Eyebrow_Products,
Lip_Gloss, Lipstick, Eyeshadow, Nail_Polish, Gel_Nail_Polish, Nail_Art,
Makeup_Mirror, Cosmetic_Bag, Makeup_Organizer, Jade_Roller, Gua_Sha,
Facial_Cleanser, Face_Serum, Sunscreen, Sheet_Mask, Body_Lotion,
Hair_Dryer, Curling_Iron, Hair_Care_Products, Wig
```

Antes de scrapear cada categoría, haz una petición de prueba a la página 1 y confirma
que `div.products-item` devuelve más de 0 resultados. Si devuelve 0, sáltala y anótala
en el reporte final.

## Filtros DURANTE el scraping (importantes)

Descarta el listado y no lo guardes si el título hace match con:

- **Réplicas / falsificaciones** (esto es infracción de marca, es lo más importante):
  `1:1`, `1: 1`, `copy`, `replica`, `dupe`, `clone`, `mirror quality`, `inspired by`,
  `original brand`, `same as`, `aaa`
- **Marcas registradas de terceros**: `chanel, dior, gucci, versace, prada, ysl,
  saint laurent, tom ford, creed, armani, hermes, lancome, estee, kylie, fenty,
  rare beauty, charlotte tilbury, dyson, olaplex, cerave, the ordinary,
  louis vuitton, burberry, calvin klein`
- **Público masculino** (la tienda es femenina): `men`, `male`, `beard`, `shaving`,
  `gentlemen`, `for him`
- **MOQ mayor a 200 unidades** — es inviable para una tienda que está empezando.
  (En el intento anterior había productos con MOQ de 300.000 unidades.)

Estos filtros ahorran descargar imágenes que igual se van a botar.

## Descarga de imágenes

**No descargues imágenes de todos los listados** — serían miles y tardaría horas.
Guarda siempre las URLs en el CSV, y descarga a disco solo las **3 primeras imágenes**
de los productos que **pasaron los filtros**. Guárdalas en
`catalogo-tienda/imagenes/<categoria-slug>/` con nombres estables.

## Formato de salida — RESPETA ESTAS COLUMNAS

Ya existe un importador que lee este CSV, así que **las 8 primeras columnas deben
mantenerse exactamente con estos nombres y en este orden**:

```
categoria, nombre, precio_usd, moq, proveedor, url_producto, url_imagen, imagen_local
```

Y agrega estas columnas nuevas al final:

```
url_imagen_2, url_imagen_3, imagen_local_2, imagen_local_3, pagina
```

- `url_imagen` / `imagen_local` siguen siendo la imagen principal (como antes).
- `pagina` = número de página de donde salió el listado (para diagnóstico).
- Si un producto tiene menos de 3 imágenes, deja las columnas sobrantes vacías.

Genera `catalogo.csv` (UTF-8 con BOM) y `catalogo.xlsx` en `catalogo-tienda/`, y copia
ambos también a la carpeta de Descargas.

## Reglas de scraping

- Sitio público, sin login.
- **Delay de 2 segundos entre páginas** y 0.5 s entre descargas de imagen. No lo
  aceleres.
- User-Agent de navegador normal.
- Si una categoría falla, que no tumbe las demás (try/except por categoría).
- Si una página falla, reintenta una vez y sigue.

## Repórtame al final

1. Cuántos productos por categoría, y cuántas páginas recorriste de cada una.
2. Qué categorías de la lista "no verificadas" fallaron.
3. Cuántos listados descartaste y por cuál filtro (réplica / marca / masculino / MOQ).
4. Cuántas imágenes descargaste y dónde quedaron.
5. Confirmación de que el CSV tiene las 13 columnas en el orden indicado.
