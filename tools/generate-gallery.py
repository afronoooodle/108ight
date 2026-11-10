
import os
import json
from pathlib import Path
from urllib.parse import quote

# ============================================================
# 108IGHT — GALLERY GENERATOR
# ============================================================

PROJECT_ROOT = Path(__file__).resolve().parent.parent

GALLERY_FOLDER = PROJECT_ROOT / "gallery"
OUTPUT_FILE = GALLERY_FOLDER / "gallery.json"

IMAGE_EXTENSIONS = {
    ".jpg", ".jpeg", ".png", ".gif",
    ".webp", ".avif", ".bmp"
}

VIDEO_EXTENSIONS = {
    ".mp4", ".webm", ".mov", ".m4v"
}

media_files = []

for root, dirs, files in os.walk(GALLERY_FOLDER):

    dirs.sort()

    for filename in sorted(files):

        if filename.startswith("."):
            continue

        if filename.lower().endswith(".json"):
            continue

        extension = Path(filename).suffix.lower()

        if extension in IMAGE_EXTENSIONS:
            media_type = "image"

        elif extension in VIDEO_EXTENSIONS:
            media_type = "video"

        else:
            continue

        filepath = os.path.relpath(
            os.path.join(root, filename),
            PROJECT_ROOT
        )

        safe_filepath = quote(
            filepath.replace(os.sep, "/"),
            safe="/"
        )

        media_files.append({
            "type": media_type,
            "src": safe_filepath
        })

with open(OUTPUT_FILE, "w", encoding="utf-8") as file:

    json.dump(
        media_files,
        file,
        indent=4,
        ensure_ascii=False
    )

print("Gallery updated successfully!")
print(f"Found {len(media_files)} media files.")
