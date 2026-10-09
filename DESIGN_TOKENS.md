# Design Tokens — Encanto Lashes

Fuente de verdad para color, tipografía y espaciado del sitio. Extraído
directamente del logo real de la marca (monograma "EL" rosa dorado/cobre,
script "Encanto" en negro, "LASHES" en rosa, fondo acuarela blush/crema).

Implementado en [`app/globals.css`](app/globals.css) vía el bloque `@theme`
de Tailwind v4 (el proyecto usa Tailwind v4, ver nota de versión en el
README — el sistema de tokens es CSS-nativo en vez de `tailwind.config.js`,
pero cumple exactamente el mismo rol descrito en el prompt original).

## Color

| Token | Hex | Uso |
|---|---|---|
| `--color-cream` | `#FBF3F0` | Fondo base del sitio, tomado del fondo del logo |
| `--color-blush` | `#F3CFC7` | Acuarela rosa del logo, superficies suaves, cards |
| `--color-blush-light` | `#F9E2DC` | Variante clara para gradientes |
| `--color-rose-gold` | `#C08552` | Color de marca principal (el monograma EL). CTAs secundarios, íconos, precios |
| `--color-rose-gold-light` | `#D9A574` | Variante clara: brillos y gradientes en renders 3D |
| `--color-pink` | `#E8A9B8` | El rosa de "LASHES". Badges y acentos de maquillaje — con moderación |
| `--color-noir` | `#1A1613` | El negro del script "Encanto". Texto principal, CTAs primarios, fondos dark |
| `--color-mauve` | `#6E5449` | Texto secundario sobre fondo claro u oscuro |

### Regla de oro de color

El rose-gold y el pink son los colores de marca, pero **--noir es el que
hace que los CTAs se vean profesionales**. Negro para botones primarios,
rose-gold para acentos/precios/íconos, pink solo para badges de maquillaje
o detalles puntuales. Si una sección tiene más de 3 tonos de rosa
compitiendo entre sí, simplificar.

### Contraste (AA) — verificado, no estimado

Ratios calculados (WCAG 2.1, fórmula de luminancia relativa):

| Combinación | Ratio | Veredicto |
|---|---|---|
| `--noir` sobre `--cream` | 16.4:1 | Pasa AAA |
| `--noir` sobre `--blush` | 12.5:1 | Pasa AAA |
| `--rose-gold-light` sobre `--noir` | 8.2:1 | Pasa AAA |
| `--mauve` sobre `--cream` | 6.3:1 | Pasa AA en cualquier tamaño |
| `--mauve` sobre `--blush` | 4.8:1 | Pasa AA en cualquier tamaño |
| `--rose-gold` sobre `--cream` | **2.9:1** | **No pasa AA en ningún tamaño** (ni siquiera el umbral de 3:1 para texto grande) |

Por eso `--rose-gold` (y `--rose-gold-light`) **nunca se usan como color de
texto legible sobre fondos claros** (`--cream`, `--blush`, blanco) en este
proyecto — solo como: iconografía decorativa/fills, bordes, o texto sobre
`--noir`. Toda cifra de precio, texto de navegación y texto de botón usa
`--noir` sobre fondo claro. La única excepción deliberada es la palabra en
Parisienne del H1 del hero ("enamora"): es un eco tipográfico del logo,
equivalente a texto de marca/logotype (exento por el criterio 1.4.3 de
WCAG), y la oración completa sigue siendo legible por el resto del texto
en `--noir` a su alrededor.

`--mauve` fue ajustado (oscurecido) respecto al primer extracto del logo
para garantizar 4.5:1 en cualquier tamaño de texto — el tono original
extraído directamente (`#8A7267`) medía 4.1:1 sobre `--cream`, por debajo
del mínimo AA. Se usa para todo el texto secundario: nombres, ciudades,
captions, contadores.

## Tipografía

| Rol | Fuente | Pesos | Uso |
|---|---|---|---|
| Display | Fraunces | 400, 500(italic), 600 | H1, titulares de sección |
| Script | Parisienne | 400 | **Máximo 1-2 palabras por sección** — eco puntual del logo, nunca párrafos |
| Body | Poppins | 300, 400, 500, 600 | Todo el texto de cuerpo, botones, nav |

## Espaciado y radios

Se usa la escala por defecto de Tailwind. Radios: `rounded-2xl` (1rem) como
default de cards, `rounded-full` para botones pill y avatares/badges.

## Sombras

`shadow-glow-rose`: sombra suave en rose-gold al 20% de opacidad, usada en
el podio del hero 3D y cards destacadas, para dar sensación de luz cálida.
