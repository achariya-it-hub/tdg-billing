with open("src/pages/Purchase.jsx", "r", encoding="utf-8") as f:
    lines = f.readlines()

# Let's test compiling it with node/babel or typescript or esbuild syntax check
import subprocess
res = subprocess.run(["npx", "esbuild", "src/pages/Purchase.jsx", "--jsx=transform"], capture_output=True, text=True, shell=True)
print("ESBUILD ERROR:")
print(res.stderr)
