from pathlib import Path
from PIL import Image

ROOT = Path(__file__).resolve().parents[1]
MAX_BYTES = 290 * 1024
EXPECTED_SIZE = (1080, 1440)
FILES = [
    ROOT / "mms_img" / "mms_01_intro.jpg",
    ROOT / "mms_img" / "mms_02_details.jpg",
]

failed = False
for path in FILES:
    with Image.open(path) as image:
        result = {
            "path": str(path),
            "format": image.format,
            "size": image.size,
            "bytes": path.stat().st_size,
        }
    passed = result["format"] == "JPEG" and result["size"] == EXPECTED_SIZE and result["bytes"] <= MAX_BYTES
    print(f"{'PASS' if passed else 'FAIL'} SENS JPEG {result}")
    failed |= not passed
raise SystemExit(1 if failed else 0)
