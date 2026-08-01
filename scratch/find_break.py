import subprocess

with open("src/pages/Purchase.jsx", "r", encoding="utf-8") as f:
    lines = f.readlines()

for i in range(100, len(lines)):
    test_code = "".join(lines[:i]) + "\n  return null\n}"
    with open("scratch/test_tmp.jsx", "w", encoding="utf-8") as tf:
        tf.write(test_code)
    
    res = subprocess.run(["npx", "esbuild", "scratch/test_tmp.jsx", "--jsx=transform"], capture_output=True, text=True, shell=True)
    if "Unexpected end of file" in res.stderr:
        print(f"Broke after line {i}: {lines[i-1].strip()}")
        break
