with open("server/index.js", "r", encoding="utf-8") as f:
    lines = f.readlines()

brace_stack = []
for i, line in enumerate(lines, start=1):
    for col, char in enumerate(line, start=1):
        if char == '{':
            brace_stack.append((i, col))
        elif char == '}':
            if brace_stack:
                brace_stack.pop()
            else:
                print(f"Unmatched closing brace '}}' at line {i}, col {col}")

if brace_stack:
    print(f"Unclosed opening braces count: {len(brace_stack)}")
    for line, col in brace_stack[-10:]:
        print(f"  Unclosed '{{' at line {line}, col {col}")
else:
    print("Braces are 100% balanced!")
