from pathlib import Path
from PIL import Image

root = Path(__file__).resolve().parents[1]
intro_path = root / "mms_img" / "mms_01_intro.png"
details_path = root / "output" / "mms-wide" / "mms_02_details_wide.png"
output_path = root / "mms_img" / "mms_intro_details_horizontal_v3.png"

target_size = (971, 1641)
with Image.open(intro_path) as intro_src, Image.open(details_path) as details_src:
    intro = intro_src.convert("RGB").resize(target_size, Image.Resampling.LANCZOS)
    details = details_src.convert("RGB")
    if details.size != target_size:
        raise ValueError(f"Details panel must be {target_size}, got {details.size}")
    combined = Image.new("RGB", (target_size[0] * 2, target_size[1]))
    combined.paste(intro, (0, 0))
    combined.paste(details, (target_size[0], 0))
    combined.save(output_path, format="PNG", optimize=True)
print(f"created={output_path} size={combined.size}")
