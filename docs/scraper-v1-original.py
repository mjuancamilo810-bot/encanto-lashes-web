"""
Catálogo automático desde Made-in-China.com — estudio de mercado para surtir tienda.

Uso:
    python scrape_catalogo.py

Qué hace:
  1. Para cada categoría configurada en CATEGORIAS, baja la página pública de resultados
     de búsqueda de Made-in-China.com (sin login).
  2. Extrae de cada producto: nombre, precio, MOQ, proveedor, URL del producto, URL de imagen.
  3. Descarga la imagen principal de cada producto a imagenes/<categoria>/.
  4. Escribe todo a catalogo.csv y catalogo.xlsx (listo para revisar/filtrar en Excel).

Notas:
  - Es scraping público (sin login), producto por producto respetando un delay entre
    requests — no es un ataque de fuerza bruta al sitio. Si necesitas MUCHO más volumen,
    lo correcto es pedir acceso a la API/feed oficial de Made-in-China o usar su función
    de exportación, no escalar este script sin límite.
  - Vuelve a correr el script cuando quieras refrescar precios/MOQ o agregar categorías
    nuevas: solo edita la lista CATEGORIAS abajo.
"""
from __future__ import annotations

import csv
import re
import time
from dataclasses import dataclass, asdict
from pathlib import Path
from urllib.parse import urlparse

import requests
from bs4 import BeautifulSoup

ROOT = Path(__file__).resolve().parent
IMG_DIR = ROOT / "imagenes"
CSV_PATH = ROOT / "catalogo.csv"
XLSX_PATH = ROOT / "catalogo.xlsx"

HEADERS = {
    "User-Agent": ("Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 "
                   "(KHTML, like Gecko) Chrome/124.0 Safari/537.36"),
}

# categoria (texto libre) -> URL pública de búsqueda de Made-in-China
# Enfoque: belleza y cuidado femenino.
CATEGORIAS: dict[str, str] = {
    "Skincare / cuidado facial": "https://www.made-in-china.com/products-search/hot-china-products/Skincare_Products.html",
    "Maquillaje": "https://www.made-in-china.com/products-search/hot-china-products/Makeup.html",
    "Brochas de maquillaje": "https://www.made-in-china.com/products-search/hot-china-products/Makeup_Brush.html",
    "Extensiones de cabello": "https://www.made-in-china.com/products-search/hot-china-products/Hair_Extension.html",
    "Pestanas postizas": "https://www.made-in-china.com/products-search/hot-china-products/False_Eyelashes.html",
    "Unas postizas": "https://www.made-in-china.com/products-search/hot-china-products/Press_On_Nails.html",
    "Herramientas faciales (gua sha, roller)": "https://www.made-in-china.com/products-search/hot-china-products/Facial_Massager.html",
    "Mascarillas LED": "https://www.made-in-china.com/products-search/hot-china-products/LED_Face_Mask.html",
    "Perfumes / fragancias": "https://www.made-in-china.com/products-search/hot-china-products/Perfume.html",
    "Planchas / cuidado del cabello": "https://www.made-in-china.com/products-search/hot-china-products/Hair_Straightener.html",
    "Cuidado intimo femenino": "https://www.made-in-china.com/products-search/hot-china-products/Feminine_Hygiene_Products.html",
    "Suplementos colageno": "https://www.made-in-china.com/products-search/hot-china-products/Collagen_Supplement.html",
}

DELAY_SECONDS = 2.0          # entre requests de páginas de categoría
IMG_DELAY_SECONDS = 0.5      # entre descargas de imagen
MAX_PRODUCTS_PER_CATEGORY = 20


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


def _slug(text: str, maxlen: int = 60) -> str:
    s = re.sub(r"[^a-zA-Z0-9]+", "-", text).strip("-").lower()
    return s[:maxlen] or "producto"


def _clean(s: str | None) -> str:
    return re.sub(r"\s+", " ", (s or "")).strip()


def parse_categoria(nombre_categoria: str, url: str) -> list[Producto]:
    r = requests.get(url, headers=HEADERS, timeout=25)
    r.raise_for_status()
    soup = BeautifulSoup(r.text, "html.parser")

    productos: list[Producto] = []
    items = soup.select("div.products-item")
    for item in items[:MAX_PRODUCTS_PER_CATEGORY]:
        name_a = item.select_one("h2.product-name a")
        if not name_a:
            continue
        nombre = _clean(name_a.get("title") or name_a.get_text())
        url_producto = name_a.get("href", "")

        price_el = item.select_one(".attr-item.price-new .price")
        precio = _clean(price_el.get_text(" ")) if price_el else ""

        moq_el = item.select_one(".attr-item.moq-new .attribute")
        moq = _clean(moq_el.get_text(" ")) if moq_el else ""

        supplier_el = item.select_one(".company-name .compnay-name span")
        proveedor = _clean(supplier_el.get_text()) if supplier_el else ""

        img_el = item.select_one(".img-thumb-inner img")
        url_imagen = (img_el.get("data-original") or img_el.get("src") or "") if img_el else ""

        productos.append(Producto(
            categoria=nombre_categoria, nombre=nombre, precio_usd=precio, moq=moq,
            proveedor=proveedor, url_producto=url_producto, url_imagen=url_imagen,
            imagen_local="",
        ))
    return productos


def descargar_imagen(producto: Producto, carpeta: Path) -> str:
    if not producto.url_imagen:
        return ""
    carpeta.mkdir(parents=True, exist_ok=True)
    ext = Path(urlparse(producto.url_imagen).path).suffix or ".jpg"
    fname = f"{_slug(producto.nombre)}{ext}"
    fpath = carpeta / fname
    try:
        resp = requests.get(producto.url_imagen, headers=HEADERS, timeout=20)
        resp.raise_for_status()
        fpath.write_bytes(resp.content)
        return str(fpath.relative_to(ROOT))
    except Exception as ex:  # noqa: BLE001 — una imagen que falla no debe tumbar el resto
        print(f"  [imagen] fallo {producto.nombre[:40]!r}: {ex}")
        return ""


def main() -> None:
    todos: list[Producto] = []
    for categoria, url in CATEGORIAS.items():
        print(f"== {categoria} ==")
        try:
            productos = parse_categoria(categoria, url)
        except Exception as ex:  # noqa: BLE001 — una categoria que falla no tumba el resto
            print(f"  fallo la categoria completa: {ex}")
            continue
        print(f"  {len(productos)} productos encontrados")
        carpeta_cat = IMG_DIR / _slug(categoria)
        for p in productos:
            p.imagen_local = descargar_imagen(p, carpeta_cat)
            time.sleep(IMG_DELAY_SECONDS)
        todos.extend(productos)
        time.sleep(DELAY_SECONDS)

    # CSV
    with open(CSV_PATH, "w", newline="", encoding="utf-8-sig") as f:
        w = csv.DictWriter(f, fieldnames=list(asdict(todos[0]).keys()) if todos else [])
        w.writeheader()
        for p in todos:
            w.writerow(asdict(p))
    print(f"\nCSV escrito: {CSV_PATH} ({len(todos)} productos)")

    # XLSX
    try:
        from openpyxl import Workbook
        from openpyxl.drawing.image import Image as XLImage
        wb = Workbook()
        ws = wb.active
        ws.title = "Catalogo"
        headers = ["Categoria", "Nombre", "Precio USD", "MOQ", "Proveedor", "URL producto", "URL imagen", "Imagen local"]
        ws.append(headers)
        for p in todos:
            ws.append([p.categoria, p.nombre, p.precio_usd, p.moq, p.proveedor,
                       p.url_producto, p.url_imagen, p.imagen_local])
        for col, width in zip("ABCDEFGH", (22, 55, 14, 14, 32, 45, 45, 30)):
            ws.column_dimensions[col].width = width
        wb.save(XLSX_PATH)
        print(f"XLSX escrito: {XLSX_PATH}")
    except Exception as ex:  # noqa: BLE001
        print(f"[xlsx] no se pudo generar: {ex}")


if __name__ == "__main__":
    main()
