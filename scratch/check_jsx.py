import re

with open("src/pages/Purchase.jsx", "r", encoding="utf-8") as f:
    content = f.read()

lines = content.split('\n')
div_stack = []

for idx, line in enumerate(lines, 1):
    opens = line.count("<div")
    closes = line.count("</div>")
    diff = opens - closes
    if diff != 0:
        print(f"Line {idx}: opens={opens}, closes={closes} | line: {line.strip()[:60]}")

print("Total <div opens:", content.count("<div"))
print("Total </div> closes:", content.count("</div>"))
print("Total <Modal opens:", content.count("<Modal"))
print("Total </Modal> closes:", content.count("</Modal>"))
