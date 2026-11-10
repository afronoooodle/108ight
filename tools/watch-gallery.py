
import os
import sys
import time
import subprocess
from pathlib import Path

# ============================================================
# 108IGHT — GALLERY WATCHER
# ============================================================

PROJECT_ROOT = Path(__file__).resolve().parent.parent

GALLERY_FOLDER = PROJECT_ROOT / "gallery"
GENERATOR = Path(__file__).resolve().parent / "generate-gallery.py"


def get_files():

    files = []

    for root, dirs, filenames in os.walk(GALLERY_FOLDER):

        dirs.sort()

        for filename in sorted(filenames):

            if filename.lower().endswith(".json"):
                continue

            if filename.startswith("."):
                continue

            path = Path(root) / filename

            files.append((
                str(path),
                path.stat().st_size,
                path.stat().st_mtime
            ))

    return tuple(files)


print("108IGHT Gallery Watcher Started!")
print("Watching for new media...")

previous_files = None

while True:

    try:

        current_files = get_files()

        if current_files != previous_files:

            if previous_files is not None:
                print("Gallery changes detected!")

            subprocess.run(
                [sys.executable, str(GENERATOR)],
                cwd=PROJECT_ROOT,
                check=True
            )

            previous_files = current_files

        time.sleep(2)

    except KeyboardInterrupt:

        print("Gallery Watcher Stopped.")
        break

    except Exception as error:

        print("Error:", error)
        time.sleep(2)
