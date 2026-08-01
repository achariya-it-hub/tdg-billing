with open("src/pages/Purchase.jsx", "r", encoding="utf-8") as f:
    lines = f.readlines()

stack = []
for line_idx, line in enumerate(lines, 1):
    for col_idx, ch in enumerate(line, 1):
        if ch == '{':
            stack.append((line_idx, col_idx, line.strip()))
        elif ch == '}':
            if stack:
                stack.pop()

print("Remaining open { on stack:")
for l, c, text in stack:
    print(f"Line {l}, Col {c}: {text}")
