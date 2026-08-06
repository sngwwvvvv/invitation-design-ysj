from pathlib import Path
from PIL import Image

root = Path(__file__).resolve().parents[1]
intro_path = root / "mms_img" / "mms_01_intro.png"
details_path = root / "output" / "mms-wide" / "mms_02_details_wide.png"
output_path = root / "mms_img" / "mms_intro_details_horizontal_v3.png"

with Image.open(intro_path) as intro, Image.open(details_path) as details, Image.open(output_path) as output:
    result = {
        "intro": intro.size,
        "details": details.size,
        "output": output.size,
        "mode": output.mode,
    }

passed = (
    result["intro"] == (640, 1082)
    and result["details"] == (971, 1641)
    and result["output"] == (1942, 1641)
    and result["mode"] in {"RGB", "RGBA"}
)
print(f"{'PASS' if passed else 'FAIL'} wide MMS composite {result}")
if not passed:
    raise SystemExit(1)
