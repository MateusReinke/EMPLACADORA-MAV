#!/usr/bin/env python3
"""Gera a imagem de compartilhamento (Open Graph) da MAV Emplacamento.

Saída: public/og-mav-emplacamento.jpg, 1200x630, nas cores da marca.
É a imagem que aparece no preview de link do WhatsApp, Instagram e Facebook —
por isso é gerada aqui, e não copiada de um template genérico de plataforma.

Uso:  python3 scripts/generate_og_image.py
Requer: Pillow (pip install pillow)
"""

import math
from pathlib import Path

from PIL import Image, ImageDraw, ImageFont

W, H = 1200, 630

NAVY = (10, 31, 68)
NAVY_DEEP = (6, 20, 49)
BLUE = (11, 87, 224)
BLUE_HALO = (16, 52, 122)
WHITE = (255, 255, 255)
GOLD = (253, 184, 19)
MUTED = (176, 193, 222)
PLATE_FACE = (245, 247, 250)
PLATE_BAND = (14, 62, 145)
INK = (17, 23, 34)

FONT_DIR = Path("/usr/share/fonts/truetype")
BOLD_PATH = FONT_DIR / "liberation/LiberationSans-Bold.ttf"
REGULAR_PATH = FONT_DIR / "liberation/LiberationSans-Regular.ttf"
FALLBACK = FONT_DIR / "dejavu/DejaVuSans-Bold.ttf"

MARGIN = 64
TEXT_MAX_W = 600  # coluna de texto à esquerda, sem invadir a placa


def font(path: Path, size: int) -> ImageFont.FreeTypeFont:
    return ImageFont.truetype(str(path if path.exists() else FALLBACK), size)


def width_of(draw: ImageDraw.ImageDraw, text: str, f: ImageFont.FreeTypeFont) -> float:
    return draw.textlength(text, font=f)


def fitted(draw, text: str, path: Path, size: int, max_w: int) -> ImageFont.FreeTypeFont:
    """Reduz o corpo até a linha caber na largura — nada estoura a arte."""
    f = font(path, size)
    while size > 10 and width_of(draw, text, f) > max_w:
        size -= 2
        f = font(path, size)
    return f


def star(draw, cx: float, cy: float, r: float, fill) -> None:
    points = []
    for k in range(10):
        angle = math.radians(-90 + k * 36)
        radius = r if k % 2 == 0 else r * 0.45
        points.append((cx + radius * math.cos(angle), cy + radius * math.sin(angle)))
    draw.polygon(points, fill=fill)


def build_plate(width: int) -> Image.Image:
    """Placa Mercosul desenhada em escala 2x e reduzida, para bordas suaves."""
    scale = 2
    pw, ph = 620 * scale, 218 * scale
    plate = Image.new("RGB", (pw, ph), NAVY_DEEP)
    d = ImageDraw.Draw(plate)

    s = scale
    d.rounded_rectangle([0, 0, pw - 1, ph - 1], radius=22 * s, fill=(24, 30, 41))
    d.rounded_rectangle(
        [14 * s, 14 * s, pw - 14 * s, ph - 14 * s], radius=14 * s, fill=PLATE_FACE
    )

    # Faixa azul superior
    d.rounded_rectangle(
        [14 * s, 14 * s, pw - 14 * s, 62 * s], radius=14 * s, fill=PLATE_BAND
    )
    d.rectangle([14 * s, 48 * s, pw - 14 * s, 62 * s], fill=PLATE_BAND)

    f_band = font(BOLD_PATH, 26 * s)
    d.text(((pw - width_of(d, "BRASIL", f_band)) / 2, 24 * s), "BRASIL", font=f_band, fill=WHITE)
    d.text((32 * s, 34 * s), "MERCOSUL", font=font(BOLD_PATH, 11 * s), fill=WHITE)
    for i in range(4):
        d.ellipse(
            [
                (30 + i * 9) * s,
                (22 + (2 if i in (0, 3) else 0)) * s,
                (34 + i * 9) * s,
                (26 + (2 if i in (0, 3) else 0)) * s,
            ],
            fill=WHITE,
        )

    # Bandeira do Brasil
    fx, fy = (pw - 76 * s), 24 * s
    d.rounded_rectangle([fx, fy, fx + 56 * s, fy + 29 * s], radius=3 * s, fill=(21, 154, 72))
    d.polygon(
        [
            (fx + 28 * s, fy + 3 * s),
            (fx + 53 * s, fy + 14.5 * s),
            (fx + 28 * s, fy + 26 * s),
            (fx + 3 * s, fy + 14.5 * s),
        ],
        fill=(255, 209, 0),
    )
    d.ellipse(
        [fx + 20 * s, fy + 6.5 * s, fx + 36 * s, fy + 22.5 * s], fill=(11, 59, 140)
    )

    # QR Code e sigla do país
    qx, qy, qs = 34 * s, 78 * s, 58 * s
    d.rectangle([qx, qy, qx + qs, qy + qs], fill=WHITE, outline=INK, width=2 * s)
    cell = qs / 9
    for gx, gy in [(1, 1), (6, 1), (1, 6)]:
        d.rectangle(
            [qx + gx * cell, qy + gy * cell, qx + (gx + 2) * cell, qy + (gy + 2) * cell],
            fill=INK,
        )
        d.rectangle(
            [
                qx + (gx + 0.6) * cell,
                qy + (gy + 0.6) * cell,
                qx + (gx + 1.4) * cell,
                qy + (gy + 1.4) * cell,
            ],
            fill=WHITE,
        )
    for gx, gy in [(4, 1), (4, 3), (4, 5), (6, 4), (7, 6), (4, 7), (6, 7), (7, 4)]:
        d.rectangle(
            [qx + gx * cell, qy + gy * cell, qx + (gx + 1) * cell, qy + (gy + 1) * cell],
            fill=INK,
        )

    f_br = font(BOLD_PATH, 40 * s)
    d.text((qx + 4 * s, 148 * s), "BR", font=f_br, fill=INK)

    # Caracteres da placa, centrados na área útil à direita do QR
    code = "MAV2O26"
    area_l, area_r = 110 * s, (pw - 24 * s)
    f_code = font(BOLD_PATH, 112 * s)
    while width_of(d, code, f_code) > (area_r - area_l) and f_code.size > 40:
        f_code = font(BOLD_PATH, f_code.size - 4)
    d.text(
        (area_l + (area_r - area_l - width_of(d, code, f_code)) / 2, 74 * s),
        code,
        font=f_code,
        fill=INK,
    )

    height = round(width * ph / pw)
    return plate.resize((width, height), Image.LANCZOS)


def main() -> None:
    img = Image.new("RGB", (W, H), NAVY)
    d = ImageDraw.Draw(img)

    # Vinco diagonal e halo azul — mesma linguagem do hero do site
    d.polygon([(W * 0.54, 0), (W, 0), (W, H), (W * 0.38, H)], fill=NAVY_DEEP)
    d.ellipse([W * 0.60, -H * 0.12, W * 1.06, H * 0.78], fill=BLUE_HALO)

    # Barra "//" do logotipo MAV
    for i, tone in enumerate((BLUE, (28, 96, 210), (40, 104, 200))):
        x = MARGIN + i * 24
        d.polygon([(x + 16, 54), (x + 32, 54), (x + 16, 88), (x, 88)], fill=tone)

    d.text((MARGIN, 112), "MAV EMPLACAMENTO", font=font(BOLD_PATH, 27), fill=(120, 165, 255))

    # Estrelas logo abaixo do nome, longe do titular
    for i in range(5):
        star(d, MARGIN + 11 + i * 28, 168, 11, GOLD)

    # Título — cada linha ajustada para caber na coluna de texto
    lines = ["Sua Placa Mercosul", "pronta com agilidade", "e segurança"]
    y = 204
    for line in lines:
        f = fitted(d, line, BOLD_PATH, 64, TEXT_MAX_W)
        d.text((MARGIN, y), line, font=f, fill=WHITE)
        y += 74

    services = "1ª e 2ª via · Veículo 0km · Transferência · Licenciamento"
    d.text(
        (MARGIN, y + 22),
        services,
        font=fitted(d, services, REGULAR_PATH, 24, TEXT_MAX_W),
        fill=MUTED,
    )

    # Faixa de contato
    bar_top = H - 76
    d.rectangle([0, bar_top, W, H], fill=(4, 14, 36))
    d.rectangle([0, bar_top, W, bar_top + 3], fill=BLUE)

    f_phone = font(BOLD_PATH, 29)
    d.text((MARGIN, bar_top + 24), "(11) 93929-0373", font=f_phone, fill=WHITE)
    addr_x = MARGIN + width_of(d, "(11) 93929-0373", f_phone) + 28
    d.text(
        (addr_x, bar_top + 28),
        "Rua Bela Vista, 888 — Chácara Santo Antônio, São Paulo",
        font=font(REGULAR_PATH, 22),
        fill=MUTED,
    )

    # Placa: inteira dentro da arte, levemente inclinada
    plate = build_plate(430)
    plate = plate.rotate(-4, resample=Image.BICUBIC, expand=True, fillcolor=NAVY_DEEP)
    plate_mask = Image.new("L", plate.size, 0)
    ImageDraw.Draw(plate_mask).rectangle([0, 0, *plate.size], fill=255)
    img.paste(plate, (W - plate.width - 78, 196))

    out = Path(__file__).resolve().parent.parent / "public" / "og-mav-emplacamento.jpg"
    img.save(out, "JPEG", quality=88, optimize=True, progressive=True)
    print(f"gerado: {out} ({out.stat().st_size / 1024:.0f} kB)")


if __name__ == "__main__":
    main()
