from io import BytesIO
from pathlib import Path
from PIL import Image

ROOT = Path(__file__).resolve().parents[1]
MAX_BYTES = 290 * 1024
MIN_QUALITY = 60
EXPECTED_SIZE = (1080, 1440)
PAIRS = [
    (ROOT / "output" / "mms-sens" / "mms_01_intro_raw.png", ROOT / "mms_img" / "mms_01_intro.jpg"),
    (ROOT / "output" / "mms-sens" / "mms_02_details_raw.png", ROOT / "mms_img" / "mms_02_details.jpg"),
]

for source, target in PAIRS:
    with Image.open(source) as opened:
        image = opened.convert("RGB")
        if image.size != EXPECTED_SIZE:
            raise ValueError(f"{source} must be {EXPECTED_SIZE}, got {image.size}")
        encoded = None
        selected_quality = None
        for quality in range(95, MIN_QUALITY - 1, -1):
            buffer = BytesIO()
            image.save(buffer, format="JPEG", quality=quality, optimize=True, progressive=False, subsampling=2)
            if buffer.tell() <= MAX_BYTES:
                encoded = buffer.getvalue()
                selected_quality = quality
                break
    if encoded is None:
        raise ValueError(f"{source} cannot meet {MAX_BYTES} bytes at quality >= {MIN_QUALITY}")
    target.write_bytes(encoded)
    print(f"created={target} quality={selected_quality} bytes={len(encoded)} size={EXPECTED_SIZE}")
