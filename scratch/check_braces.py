with open("src/pages/Purchase.jsx", "r", encoding="utf-8") as f:
    content = f.read()

curly_stack = []
paren_stack = []

for idx, char in enumerate(content):
    if char == '{':
        curly_stack.append(idx)
    elif char == '}':
        if curly_stack:
            curly_stack.pop()
        else:
            print("Extra closing } at char", idx)
    elif char == '(':
        paren_stack.append(idx)
    elif char == ')':
        if paren_stack:
            paren_stack.pop()
        else:
            print("Extra closing ) at char", idx)

print("Unclosed { count:", len(curly_stack))
if curly_stack:
    for pos in curly_stack[:5]:
        line_no = content[:pos].count('\n') + 1
        print(f"Unclosed {{ near line {line_no}: {content[max(0, pos-20):pos+30]}")

print("Unclosed ( count:", len(paren_stack))
if paren_stack:
    for pos in paren_stack[:5]:
        line_no = content[:pos].count('\n') + 1
        print(f"Unclosed ( near line {line_no}: {content[max(0, pos-20):pos+30]}")
