"""Convierte el catálogo de proveedores en data/products.json.

Lee `catalogo-v2.csv` (formato nuevo: varias imágenes en alta resolución y
señales de calidad del proveedor). Si no existe, cae a `catalogo.csv`.

Uso:  python scripts/importar-catalogo.py [ruta/al/catalogo-v2.csv]

Es idempotente: reescribe data/products.json completo. Las imágenes que ya
estén descargadas no se vuelven a bajar.
"""
from __future__ import annotations

import collections
import csv
import io
import json
import re
import sys
import time
import unicodedata
from pathlib import Path

import requests

# ─────────────────────────────────────────────────────────────────────────
# PRECIOS: precio_venta_COP = costo_USD * TRM * MARGEN, redondeado.
# El costo es el extremo ALTO del rango del proveedor (lo que se paga en
# pedidos pequeños). TRM y MARGEN no separan flete ni nacionalización.
TRM_COP_POR_USD = 4000
MARGEN = 2.8
REDONDEO = 500
DESCUENTO_LASHISTA = 0.72

# CURADURÍA: cuántos productos entran por categoría. Se eligen los de mejor
# proveedor (auditado, membresía Diamond, fabricante) y menor MOQ.
MAX_POR_CATEGORIA = 18
MOQ_MAXIMO = 200
PRECIO_MINIMO_COP = 8000
PRECIO_MAXIMO_COP = 900000
IMAGENES_POR_PRODUCTO = 3
# ─────────────────────────────────────────────────────────────────────────

ROOT = Path(__file__).resolve().parent.parent
DATA = ROOT / "data" / "products.json"
IMG_DEST = ROOT / "public" / "products" / "catalogo"
HEADERS = {
    "User-Agent": (
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 "
        "(KHTML, like Gecko) Chrome/124.0 Safari/537.36"
    )
}

# Proveedores vetados: sus fotos llevan marca de agua propia, infografías en
# inglés o producto mal categorizado. Vetarlos libera cupos para otros mejores.
_prov = Path(__file__).resolve().parent / "proveedores-descartados.json"
PROVEEDORES_VETADOS: set[str] = set(
    json.loads(_prov.read_text(encoding="utf-8"))["proveedores"] if _prov.exists() else []
)

# Tope por proveedor: evita que una sola fábrica cope la tienda.
MAX_POR_PROVEEDOR = 3

_desc = Path(__file__).resolve().parent / "fotos-descartadas.json"
FOTOS_NO_USABLES: set[str] = set(
    json.loads(_desc.read_text(encoding="utf-8"))["urls"] if _desc.exists() else []
)

LINEAS = [
    "Aura", "Destello", "Seda", "Pétalo", "Rosa", "Luz", "Nube", "Brisa",
    "Gala", "Velo", "Miel", "Perla", "Encanto", "Lumen", "Sirena", "Bruma",
    "Coral", "Ámbar", "Jazmín", "Terciopelo", "Alba", "Iris", "Marfil", "Azahar",
]

CATEGORIA_SITIO = {
    "Skincare / cuidado facial": ("skincare", "cuidado-facial"),
    "Limpiadores faciales": ("skincare", "limpieza"),
    "Protector solar": ("skincare", "proteccion-solar"),
    "Mascarillas de tela": ("skincare", "mascarillas"),
    "Maquillaje": ("maquillaje", "rostro"),
    "Labiales": ("maquillaje", "labios"),
    "Lip gloss": ("maquillaje", "labios"),
    "Sombras de ojos": ("maquillaje", "ojos"),
    "Cejas": ("pestanas-cejas", "cejas"),
    "Brochas de maquillaje": ("accesorios", "brochas"),
    "Espejos de maquillaje": ("accesorios", "espejos"),
    "Neceseres": ("accesorios", "neceseres"),
    "Organizadores de maquillaje": ("accesorios", "organizadores"),
    "Extensiones de cabello": ("cabello", "extensiones"),
    "Pelucas": ("cabello", "pelucas"),
    "Secadores de cabello": ("cabello", "herramientas"),
    "Rizadores": ("cabello", "herramientas"),
    "Planchas / cuidado del cabello": ("cabello", "herramientas"),
    "Pestanas postizas": ("pestanas-cejas", "pestanas-postizas"),
    "Extensiones de pestanas": ("pestanas-cejas", "extensiones"),
    "Pegamento de pestanas": ("pestanas-cejas", "pegamentos"),
    "Pinzas para pestanas": ("pestanas-cejas", "herramientas"),
    "Unas postizas": ("unas", "unas-postizas"),
    "Esmaltes de unas": ("unas", "esmaltes"),
    "Esmalte semipermanente": ("unas", "esmaltes"),
    "Herramientas faciales (gua sha, roller)": ("skincare", "herramientas-faciales"),
    "Gua sha": ("skincare", "herramientas-faciales"),
    "Mascarillas LED": ("skincare", "dispositivos"),
    "Perfumes / fragancias": ("perfumeria", "fragancias"),
    "Cremas corporales": ("cuerpo-bano", "hidratacion"),
    "Cuidado intimo femenino": ("cuerpo-bano", "cuidado-intimo"),
    "Suplementos colageno": ("bienestar", "suplementos"),
}

NOMBRE_BASE = {
    "skincare": {
        "cuidado-facial": "Set de Cuidado Facial",
        "limpieza": "Limpiador Facial",
        "proteccion-solar": "Protector Solar",
        "mascarillas": "Mascarilla Facial",
        "herramientas-faciales": "Herramienta Facial",
        "dispositivos": "Mascarilla LED Facial",
    },
    "maquillaje": {"rostro": "Maquillaje", "labios": "Labial", "ojos": "Sombras"},
    "pestanas-cejas": {
        "pestanas-postizas": "Pestañas Postizas",
        "extensiones": "Extensiones de Pestañas",
        "pegamentos": "Pegamento de Pestañas",
        "herramientas": "Pinzas de Pestañas",
        "cejas": "Cejas",
    },
    "accesorios": {
        "brochas": "Set de Brochas",
        "espejos": "Espejo de Maquillaje",
        "neceseres": "Neceser",
        "organizadores": "Organizador de Maquillaje",
    },
    "cabello": {
        "extensiones": "Extensiones de Cabello",
        "pelucas": "Peluca",
        "herramientas": "Herramienta de Cabello",
    },
    "unas": {"unas-postizas": "Uñas Postizas", "esmaltes": "Esmalte de Uñas"},
    "perfumeria": {"fragancias": "Perfume"},
    "cuerpo-bano": {"hidratacion": "Crema Corporal", "cuidado-intimo": "Cuidado Íntimo"},
    "bienestar": {"suplementos": "Colágeno"},
}

FALSIFICACION = re.compile(
    r"\b(1\s*:\s*1|copy|replica|dupe|clone|mirror\s*quality|inspired\s*by|"
    r"original\s*brand|same\s*as|aaa+)\b",
    re.I,
)
MARCAS_TERCEROS = re.compile(
    r"\b(chanel|dior|gucci|versace|prada|ysl|saint\s*laurent|tom\s*ford|creed|armani|"
    r"hermes|lancome|estee|kylie|fenty|rare\s*beauty|charlotte\s*tilbury|dyson|olaplex|"
    r"cerave|the\s*ordinary|louis\s*vuitton|burberry|calvin\s*klein)\b",
    re.I,
)
# Productos regulados: ampollas inyectables, mesoterapia, fillers y agujas.
# No son producto de tienda: en Colombia requieren registro sanitario INVIMA
# y su venta al público está restringida.
PRODUCTO_REGULADO = re.compile(
    r"\b(ampoule|ampule|vial|mesotherapy|meso|inject|injection|injectable|"
    r"filler|botox|prp|microneedl|derma\s*pen|skin\s*booster|lipolysis|"
    r"lipolytic|exosome|pdrn)\b",
    re.I,
)

PUBLICO_MASCULINO = re.compile(r"\b(men|male|beard|shaving|gentlemen|for\s+him)\b", re.I)
RUIDO = re.compile(
    r"\b(oem|odm|obm|moq|pcs?|pc|wholesale|private|label|custom|customized|customizable|"
    r"logo|factory|supplier|manufacturer|free|sample|hot|sale|best|selling|new|arrival|"
    r"high|top|quality|china|chinese|bulk|cheap|price|stock|ready|ship|shipping|"
    r"professional|luxury|premium|product|products|for|with|and|the|of|in|to)\b",
    re.I,
)

DESCRIPTORES = [
    (r"mink", "Mink"), (r"silk", "Seda"), (r"magnetic", "Magnéticas"),
    (r"gua\s?sha", "Gua Sha"), (r"roller", "Roller"), (r"jade", "Jade"),
    (r"rose\s?quartz", "Cuarzo Rosa"), (r"hyaluronic", "Ácido Hialurónico"),
    (r"vitamin\s?c", "Vitamina C"), (r"retinol", "Retinol"), (r"collagen", "Colágeno"),
    (r"turmeric", "Cúrcuma"), (r"niacinamide", "Niacinamida"), (r"whitening", "Iluminador"),
    (r"anti[\s-]?aging", "Antiedad"), (r"moisturi\w*", "Hidratante"), (r"serum", "Sérum"),
    (r"matte", "Mate"), (r"glossy", "Glossy"), (r"waterproof", "A Prueba de Agua"),
    (r"human\s?hair", "Cabello Humano"), (r"lace\s?front", "Lace Front"),
    (r"curly", "Rizado"), (r"straight\b", "Liso"), (r"press[\s-]?on", "Press On"),
    (r"french", "French"), (r"glitter", "Glitter"), (r"led", "LED"),
    (r"photon", "Fotones"), (r"menstrual", "Menstrual"), (r"peptide", "Péptidos"),
    (r"powder", "en Polvo"), (r"portable", "Portátil"), (r"cordless", "Inalámbrica"),
    (r"ceramic", "Cerámica"), (r"cluster", "Cluster"), (r"volume", "Volumen"),
]
MEDIDA = re.compile(r"\b(\d{2})\s?mm\b", re.I)
DIMENSION_D = re.compile(r"\b(\d)d\b", re.I)


def slugify(text: str, maxlen: int = 70) -> str:
    t = unicodedata.normalize("NFD", text)
    t = "".join(c for c in t if unicodedata.category(c) != "Mn")
    t = re.sub(r"[^a-zA-Z0-9]+", "-", t).strip("-").lower()
    return t[:maxlen].strip("-") or "producto"


def costo_usd(raw: str) -> float:
    nums = [float(n.replace(",", "")) for n in re.findall(r"[0-9][0-9,]*\.?[0-9]*", raw)]
    return max(nums) if nums else 0.0


def parse_moq(raw: str) -> tuple[int, str]:
    m = re.match(r"\s*([0-9,]+)\s*(.*)", raw.strip())
    if not m:
        return (1, "unidades")
    return (int(m.group(1).replace(",", "")), (m.group(2) or "unidades").strip().lower())


def precio_publico(costo: float) -> int:
    return max(REDONDEO, int(round(costo * TRM_COP_POR_USD * MARGEN / REDONDEO) * REDONDEO))


def puntaje_proveedor(row: dict) -> int:
    """Calidad del proveedor: auditado y fabricante pesan más que la membresía."""
    p = 0
    if (row.get("proveedor_auditado") or "").lower() == "si":
        p += 3
    p += {"Diamond": 2, "Platinum": 2, "Gold": 1}.get(row.get("proveedor_membresia", ""), 0)
    if row.get("proveedor_tipo") == "Fabricante":
        p += 2
    return p


def nombre_es(cat: str, subcat: str, titulo: str) -> str:
    base = NOMBRE_BASE.get(cat, {}).get(subcat, "Producto de Belleza")
    low = titulo.lower()
    enc: list[str] = []
    m = MEDIDA.search(low)
    if m:
        enc.append(f"{m.group(1)}mm")
    m = DIMENSION_D.search(low)
    if m:
        enc.append(f"{m.group(1)}D")
    for patron, desc in DESCRIPTORES:
        if len(enc) >= 3:
            break
        if re.search(patron, low, re.I):
            actuales = f"{base} {' '.join(enc)}".lower().split()
            if not any(w in actuales for w in desc.lower().split()):
                enc.append(desc)
    return f"{base} {' '.join(enc)}".strip() if enc else base


def tokens_distintivos(titulo: str, usados: str) -> list[str]:
    limpio = RUIDO.sub(" ", titulo)
    fuera = set(usados.lower().split())
    out: list[str] = []
    for tok in re.findall(r"[A-Za-z][A-Za-z-]{3,}", limpio):
        t = tok.strip("-").title()
        if len(t) >= 4 and t.lower() not in fuera and t not in out:
            out.append(t)
    return out


def nombre_unico(nombre: str, titulo: str, usados: set[str]) -> str:
    if nombre not in usados:
        return nombre
    for tok in tokens_distintivos(titulo, nombre):
        candidato = f"{nombre} {tok}"
        if candidato not in usados:
            return candidato
    n = 2
    while f"{nombre} ({n})" in usados:
        n += 1
    return f"{nombre} ({n})"


def descargar(url: str, destino: Path) -> bool:
    if destino.exists() and destino.stat().st_size > 1000:
        return True
    try:
        r = requests.get(url, headers=HEADERS, timeout=25)
        r.raise_for_status()
        destino.parent.mkdir(parents=True, exist_ok=True)
        destino.write_bytes(r.content)
        time.sleep(0.35)
        return True
    except Exception as ex:
        print(f"    imagen falla: {str(ex)[:60]}")
        return False


def main() -> None:
    if len(sys.argv) > 1:
        csv_path = Path(sys.argv[1])
    else:
        # El CSV vive dentro del repo para que el pipeline sea reproducible
        # en cualquier equipo; se cae a la carpeta local del scraper si no está.
        candidatos_csv = [
            ROOT / "data" / "fuente" / "catalogo-v2.csv",
            Path.home() / "catalogo-tienda" / "catalogo-v2.csv",
            ROOT / "data" / "fuente" / "catalogo-v1.csv",
            Path.home() / "catalogo-tienda" / "catalogo.csv",
        ]
        csv_path = next((c for c in candidatos_csv if c.exists()), candidatos_csv[0])
    if not csv_path.exists():
        sys.exit(f"No encuentro el CSV: {csv_path}")
    print(f"leyendo {csv_path}")

    rows = list(csv.DictReader(io.open(csv_path, encoding="utf-8-sig")))
    descartados: collections.Counter[str] = collections.Counter()
    candidatos: list[dict] = []

    for row in rows:
        cat_raw = row["categoria"].strip()
        if cat_raw not in CATEGORIA_SITIO:
            descartados["categoria no mapeada"] += 1
            continue
        titulo = row["nombre"]
        if FALSIFICACION.search(titulo) or MARCAS_TERCEROS.search(titulo):
            descartados["replica / marca de terceros"] += 1
            continue
        if PUBLICO_MASCULINO.search(titulo):
            descartados["publico masculino"] += 1
            continue
        if PRODUCTO_REGULADO.search(titulo):
            descartados["producto regulado (inyectable/medico)"] += 1
            continue
        if row["proveedor"].strip() in PROVEEDORES_VETADOS:
            descartados["proveedor vetado"] += 1
            continue
        if row["url_producto"] in FOTOS_NO_USABLES:
            descartados["foto marcada como no usable"] += 1
            continue
        moq, moq_unit = parse_moq(row["moq"])
        if moq > MOQ_MAXIMO:
            descartados["moq alto"] += 1
            continue
        costo = costo_usd(row["precio_usd"])
        precio = precio_publico(costo)
        if not (PRECIO_MINIMO_COP <= precio <= PRECIO_MAXIMO_COP):
            descartados["precio fuera de rango"] += 1
            continue
        if not row.get("url_imagen"):
            descartados["sin imagen"] += 1
            continue
        row["_moq"], row["_moq_unit"] = moq, moq_unit
        row["_costo"], row["_precio"] = costo, precio
        row["_puntaje"] = puntaje_proveedor(row)
        candidatos.append(row)

    # Curaduría: mejor proveedor primero; a igual puntaje, menor MOQ.
    por_cat: dict[str, list[dict]] = collections.defaultdict(list)
    por_prov: collections.Counter[str] = collections.Counter()
    for r in sorted(candidatos, key=lambda r: (-r["_puntaje"], r["_moq"])):
        cat_slug = CATEGORIA_SITIO[r["categoria"].strip()][0]
        prov = r["proveedor"].strip()
        if len(por_cat[cat_slug]) >= MAX_POR_CATEGORIA:
            continue
        if por_prov[prov] >= MAX_POR_PROVEEDOR:
            continue
        por_cat[cat_slug].append(r)
        por_prov[prov] += 1

    seleccion = [r for lista in por_cat.values() for r in lista]
    print(f"candidatos: {len(candidatos)}  ->  seleccionados: {len(seleccion)}")

    productos: list[dict] = []
    slugs_usados: set[str] = set()
    nombres_usados: set[str] = set()
    usos_linea: collections.Counter[str] = collections.Counter()

    for row in seleccion:
        cat_slug, subcat = CATEGORIA_SITIO[row["categoria"].strip()]
        base = nombre_es(cat_slug, subcat, row["nombre"])
        linea = LINEAS[(usos_linea[cat_slug] + sum(ord(c) for c in cat_slug)) % len(LINEAS)]
        usos_linea[cat_slug] += 1
        nombre = nombre_unico(f"{base} {linea}", row["nombre"], nombres_usados)
        nombres_usados.add(nombre)

        slug_base = slugify(nombre)
        slug = slug_base
        n = 2
        while slug in slugs_usados:
            slug = f"{slug_base}-{n}"
            n += 1
        slugs_usados.add(slug)

        urls = [
            row.get(k, "")
            for k in ("url_imagen", "url_imagen_2", "url_imagen_3", "url_imagen_4")
        ]
        urls = [u for u in urls if u][:IMAGENES_POR_PRODUCTO]
        imagenes: list[str] = []
        for i, u in enumerate(urls, 1):
            destino = IMG_DEST / cat_slug / f"{slug}-{i}.webp"
            if descargar(u, destino):
                imagenes.append(f"/products/catalogo/{cat_slug}/{destino.name}")
        if not imagenes:
            descartados["descarga de imagen fallida"] += 1
            continue

        precio = row["_precio"]
        productos.append(
            {
                "id": slug,
                "slug": slug,
                "name": nombre,
                "brand": "Encanto Lashes",
                "category": cat_slug,
                "subcategory": subcat,
                "sourceType": "own_stock",
                "tags": [subcat],
                "badges": [],
                "rating": None,
                "reviewCount": 0,
                "shortDescription": nombre,
                "description": (
                    f"{nombre}. Producto de la línea de {cat_slug.replace('-', ' ')} de "
                    "Encanto Lashes, importado directamente de fábrica. Escríbenos por "
                    "WhatsApp si quieres conocer presentaciones, tonos o cantidades."
                ),
                "price": precio,
                "priceWholesale": int(round(precio * DESCUENTO_LASHISTA / REDONDEO) * REDONDEO),
                "priceUnit": "COP",
                "images": imagenes,
                "variants": [{"name": "Única", "sku": slug.upper()[:24], "stock": 0}],
                "shopifyVariantId": f"SHOPIFY_VARIANT_ID_{slug.upper()[:20]}",
                "featured": False,
                "inStock": True,
                "sourcing": {
                    "supplier": row["proveedor"],
                    "moq": row["_moq"],
                    "moqUnit": row["_moq_unit"],
                    "costUsd": round(row["_costo"], 2),
                    "supplierUrl": row["url_producto"],
                    "audited": (row.get("proveedor_auditado") or "").lower() == "si",
                    "membership": row.get("proveedor_membresia", ""),
                    "supplierType": row.get("proveedor_tipo", ""),
                },
            }
        )

    # Destacados de portada, repartidos entre categorías.
    agrupado: dict[str, list[dict]] = collections.defaultdict(list)
    for p in productos:
        agrupado[p["category"]].append(p)
    destacados = 0
    for ronda in range(3):
        for lista in agrupado.values():
            if destacados >= 12:
                break
            if len(lista) > ronda:
                lista[ronda]["featured"] = True
                destacados += 1

    DATA.write_text(
        json.dumps({"products": productos}, ensure_ascii=False, indent=2) + "\n",
        encoding="utf-8",
    )

    print(f"\n{len(productos)} productos -> {DATA.relative_to(ROOT)}")
    print(f"imágenes: {sum(len(p['images']) for p in productos)} en {IMG_DEST.relative_to(ROOT)}")
    print(f"destacados: {destacados}")
    print(f"descartados: {dict(descartados)}")
    for cat, lista in sorted(agrupado.items(), key=lambda kv: -len(kv[1])):
        aud = sum(1 for p in lista if p["sourcing"]["audited"])
        print(f"   {len(lista):>3} {cat:<16} ({aud} con proveedor auditado)")


if __name__ == "__main__":
    main()
