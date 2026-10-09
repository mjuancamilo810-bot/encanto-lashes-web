"""Scraper de catálogo desde Made-in-China.com (v2).

Mejoras sobre la primera versión:
  * Recorre TODAS las páginas de cada categoría (antes solo la 1).
  * 30 productos por página (antes cortaba en 20).
  * Guarda hasta 4 imágenes por producto en ALTA RESOLUCIÓN (1086px en vez
    de la miniatura de 300px).
  * Filtra réplicas, marcas de terceros y público masculino al momento.
  * Registra señales de calidad del proveedor (auditado, membresía, tipo).

No descarga imágenes: guarda las URLs. La descarga la hace
`importar-catalogo.py` solo para los productos que terminan en la tienda.

Uso:  python scripts/scraper-catalogo.py
"""
from __future__ import annotations

import csv
import re
import sys
import time
from dataclasses import dataclass, asdict, fields
from pathlib import Path

import requests
from bs4 import BeautifulSoup

SALIDA = Path.home() / "catalogo-tienda"
CSV_PATH = SALIDA / "catalogo-v2.csv"

HEADERS = {
    "User-Agent": (
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 "
        "(KHTML, like Gecko) Chrome/124.0 Safari/537.36"
    )
}

DELAY_PAGINA = 2.0
MAX_PAGINAS = 8
MOQ_MAXIMO = 200
IMAGENES_POR_PRODUCTO = 4

# Categorías comprobadas contra el sitio.
CATEGORIAS_OK = {
    "Skincare / cuidado facial": "Skincare_Products",
    "Maquillaje": "Makeup",
    "Brochas de maquillaje": "Makeup_Brush",
    "Extensiones de cabello": "Hair_Extension",
    "Pestanas postizas": "False_Eyelashes",
    "Unas postizas": "Press_On_Nails",
    "Herramientas faciales (gua sha, roller)": "Facial_Massager",
    "Mascarillas LED": "LED_Face_Mask",
    "Perfumes / fragancias": "Perfume",
    "Planchas / cuidado del cabello": "Hair_Straightener",
    "Cuidado intimo femenino": "Feminine_Hygiene_Products",
    "Suplementos colageno": "Collagen_Supplement",
}

# Propuestas: se prueban y se descartan solas si no devuelven productos.
CATEGORIAS_PRUEBA = {
    "Extensiones de pestanas": "Eyelash_Extension",
    "Pegamento de pestanas": "Eyelash_Glue",
    "Pinzas para pestanas": "Eyelash_Tweezers",
    "Cejas": "Eyebrow_Pencil",
    "Lip gloss": "Lip_Gloss",
    "Labiales": "Lipstick",
    "Sombras de ojos": "Eyeshadow",
    "Esmaltes de unas": "Nail_Polish",
    "Esmalte semipermanente": "Gel_Nail_Polish",
    "Espejos de maquillaje": "Makeup_Mirror",
    "Neceseres": "Cosmetic_Bag",
    "Organizadores de maquillaje": "Makeup_Organizer",
    "Gua sha": "Gua_Sha",
    "Limpiadores faciales": "Facial_Cleanser",
    "Protector solar": "Sunscreen",
    "Mascarillas de tela": "Sheet_Mask",
    "Cremas corporales": "Body_Lotion",
    "Secadores de cabello": "Hair_Dryer",
    "Rizadores": "Curling_Iron",
    "Pelucas": "Wig",
}

URL_P1 = "https://www.made-in-china.com/products-search/hot-china-products/{kw}.html"
URL_PN = "https://www.made-in-china.com/products-search/find-china-products/0b0nolimit/{kw}-{n}.html"

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
PUBLICO_MASCULINO = re.compile(r"\b(men|male|beard|shaving|gentlemen|for\s+him)\b", re.I)

# El prefijo del CDN codifica el tamaño: 43f34j00 = 300px, 2f0j00 = 1086px.
RE_IMG = re.compile(r"^(https://image\.made-in-china\.com/)([0-9A-Za-z]+)(/.+)$")


@dataclass
class Producto:
    categoria: str
    nombre: str
    precio_usd: str
    moq: str
    proveedor: str
    url_producto: str
    url_imagen: str
    imagen_local: str
    url_imagen_2: str
    url_imagen_3: str
    url_imagen_4: str
    proveedor_auditado: str
    proveedor_membresia: str
    proveedor_tipo: str
    pagina: str


def alta_resolucion(url: str) -> str:
    """Cambia el prefijo del CDN por el de 1086px. Verificado contra el sitio."""
    m = RE_IMG.match(url)
    return f"{m.group(1)}2f0j00{m.group(2)[8:]}{m.group(3)}" if m else url


def limpiar(s: str | None) -> str:
    return re.sub(r"\s+", " ", (s or "")).strip()


def parsear_pagina(html: str, categoria: str, pagina: int) -> tuple[list[Producto], dict[str, int]]:
    soup = BeautifulSoup(html, "html.parser")
    productos: list[Producto] = []
    descartes = {"replica": 0, "masculino": 0, "moq": 0}

    for item in soup.select("div.products-item"):
        a = item.select_one("h2.product-name a")
        if not a:
            continue
        nombre = limpiar(a.get("title") or a.get_text())
        if FALSIFICACION.search(nombre) or MARCAS_TERCEROS.search(nombre):
            descartes["replica"] += 1
            continue
        if PUBLICO_MASCULINO.search(nombre):
            descartes["masculino"] += 1
            continue

        moq_el = item.select_one(".attr-item.moq-new .attribute")
        moq = limpiar(moq_el.get_text(" ")) if moq_el else ""
        m = re.match(r"\s*([0-9,]+)", moq)
        if m and int(m.group(1).replace(",", "")) > MOQ_MAXIMO:
            descartes["moq"] += 1
            continue

        precio_el = item.select_one(".attr-item.price-new .price")
        prov_el = item.select_one(".company-name .compnay-name span")

        vistas: list[str] = []
        for img in item.select("img"):
            u = img.get("data-original") or ""
            if u.startswith("https://image.made-in-china.com/"):
                hi = alta_resolucion(u)
                if hi not in vistas:
                    vistas.append(hi)
            if len(vistas) >= IMAGENES_POR_PRODUCTO:
                break

        texto = limpiar(item.get_text(" "))
        membresia = ""
        mm = re.search(r"(Diamond|Gold|Platinum|Silver)\s+Member", texto, re.I)
        if mm:
            membresia = mm.group(1).title()
        tipo = ""
        if re.search(r"Manufacturer\s*/\s*Factory", texto, re.I):
            tipo = "Fabricante"
        elif re.search(r"Trading\s+Company", texto, re.I):
            tipo = "Comercializadora"

        productos.append(
            Producto(
                categoria=categoria,
                nombre=nombre,
                precio_usd=limpiar(precio_el.get_text(" ")) if precio_el else "",
                moq=moq,
                proveedor=limpiar(prov_el.get_text()) if prov_el else "",
                url_producto=a.get("href", ""),
                url_imagen=vistas[0] if vistas else "",
                imagen_local="",
                url_imagen_2=vistas[1] if len(vistas) > 1 else "",
                url_imagen_3=vistas[2] if len(vistas) > 2 else "",
                url_imagen_4=vistas[3] if len(vistas) > 3 else "",
                proveedor_auditado="si" if re.search(r"Audited\s+Supplier", texto, re.I) else "no",
                proveedor_membresia=membresia,
                proveedor_tipo=tipo,
                pagina=str(pagina),
            )
        )
    return productos, descartes


def pedir(url: str) -> str | None:
    for intento in (1, 2):
        try:
            r = requests.get(url, headers=HEADERS, timeout=30)
            r.raise_for_status()
            return r.text
        except Exception as ex:
            if intento == 2:
                print(f"    fallo: {str(ex)[:70]}")
                return None
            time.sleep(3)
    return None


def scrapear_categoria(categoria: str, kw: str) -> tuple[list[Producto], dict[str, int]]:
    todos: list[Producto] = []
    totales = {"replica": 0, "masculino": 0, "moq": 0}
    for n in range(1, MAX_PAGINAS + 1):
        url = URL_P1.format(kw=kw) if n == 1 else URL_PN.format(kw=kw, n=n)
        html = pedir(url)
        if html is None:
            break
        productos, desc = parsear_pagina(html, categoria, n)
        for k in totales:
            totales[k] += desc[k]
        crudos = len(BeautifulSoup(html, "html.parser").select("div.products-item"))
        if crudos == 0:
            break
        todos.extend(productos)
        print(f"    pag {n}: {crudos} listados -> {len(productos)} utiles")
        time.sleep(DELAY_PAGINA)
    return todos, totales


def main() -> None:
    SALIDA.mkdir(parents=True, exist_ok=True)
    todos: list[Producto] = []
    resumen: list[str] = []
    fallidas: list[str] = []
    descartes_global = {"replica": 0, "masculino": 0, "moq": 0}

    categorias = {**CATEGORIAS_OK, **CATEGORIAS_PRUEBA}
    for i, (categoria, kw) in enumerate(categorias.items(), 1):
        print(f"\n[{i}/{len(categorias)}] {categoria}  ({kw})")
        try:
            productos, desc = scrapear_categoria(categoria, kw)
        except Exception as ex:
            print(f"    categoria fallida: {str(ex)[:70]}")
            fallidas.append(f"{categoria} ({kw})")
            continue
        if not productos:
            fallidas.append(f"{categoria} ({kw})")
            continue
        for k in descartes_global:
            descartes_global[k] += desc[k]
        todos.extend(productos)
        resumen.append(f"{len(productos):>4}  {categoria}")

    cols = [f.name for f in fields(Producto)]
    with open(CSV_PATH, "w", newline="", encoding="utf-8-sig") as f:
        w = csv.DictWriter(f, fieldnames=cols)
        w.writeheader()
        for p in todos:
            w.writerow(asdict(p))

    print("\n" + "=" * 60)
    print(f"TOTAL: {len(todos)} productos utiles -> {CSV_PATH}")
    for line in resumen:
        print("  " + line)
    print(f"\ndescartados durante el scraping: {descartes_global}")
    if fallidas:
        print(f"categorias sin resultados: {', '.join(fallidas)}")


if __name__ == "__main__":
    main()
