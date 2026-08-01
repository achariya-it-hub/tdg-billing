import subprocess

with open("src/pages/Purchase.jsx", "r", encoding="utf-8") as f:
    lines = f.readlines()

low = 1
high = len(lines)
ans = -1

while low <= high:
    mid = (low + high) // 2
    test_code = "".join(lines[:mid]) + "\n  return null\n}"
    with open("scratch/test_tmp.jsx", "w", encoding="utf-8") as tf:
        tf.write(test_code)
    
    res = subprocess.run(["npx", "esbuild", "scratch/test_tmp.jsx", "--jsx=transform"], capture_output=True, text=True, shell=True)
    if "Unexpected end of file" in res.stderr or "Transform failed" in res.stderr:
        ans = mid
        high = mid - 1
    else:
        low = mid + 1

print(f"First syntax error occurs at line {ans}: {lines[ans-1].strip() if ans > 0 else 'None'}")
