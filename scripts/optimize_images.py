import os
import glob
from PIL import Image

dirs_to_optimize = [
    r"d:\TDG-Billing\public\images\menu",
    r"d:\TDG-Billing\ttt\assets\images\menu"
]

MAX_SIZE = (600, 600)

for d in dirs_to_optimize:
    if not os.path.exists(d):
        continue
    print(f"Optimizing directory: {d}")
    for file_path in glob.glob(os.path.join(d, "*.*")):
        if file_path.lower().endswith(('.png', '.jpg', '.jpeg', '.webp')):
            orig_size = os.path.getsize(file_path)
            try:
                with Image.open(file_path) as img:
                    img = img.copy()
                    img.thumbnail(MAX_SIZE, Image.Resampling.LANCZOS)
                    img.save(file_path, optimize=True, quality=85)
                new_size = os.path.getsize(file_path)
                saved_percent = ((orig_size - new_size) / orig_size) * 100
                print(f"  OK {os.path.basename(file_path)}: {orig_size/1024/1024:.2f}MB -> {new_size/1024:.1f}KB ({saved_percent:.1f}% smaller)")
            except Exception as e:
                print(f"  ERR Error optimizing {file_path}: {e}")

print("Image optimization completed successfully!")
