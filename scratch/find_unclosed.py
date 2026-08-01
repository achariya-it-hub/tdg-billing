import subprocess

with open("src/pages/Purchase.jsx", "r", encoding="utf-8") as f:
    lines = f.readlines()

# Test removing lines from the end backwards to find which modal/block has unclosed tag
for i in range(len(lines), 500, -10):
    test_code = "".join(lines[:i]) + "\n  return null\n}"
    with open("scratch/test_tmp.jsx", "w", encoding="utf-8") as tf:
        tf.write(test_code)
    
    res = subprocess.run(["npx", "esbuild", "scratch/test_tmp.jsx", "--jsx=transform"], capture_output=True, text=True)
    if "Unexpected end of file" not in res.stderr:
        print(f"Syntax becomes valid when truncating at line {i}")
        break
