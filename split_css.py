import os
import re

css_path = 'frontend/style.css'
out_dir = 'frontend/css'

with open(css_path, 'r') as f:
    content = f.read()

# Define the sections
# The comments look like /* ── Section Name ────... */
sections = re.split(r'/\* ── (.+?) ─+ \*/', content)

header_content = sections[0].strip() + "\n\n"

# Map sections to files
file_map = {
    'base': ['Fonts', 'Custom Properties', 'Reset'],
    'header': ['Header'],
    'feed': ['Main Content', 'Feed Controls', 'Load More'],
    'cards': ['Cards', 'Voting'],
    'pages': ['Profile Page', 'Auth Pages'],
    'modal': ['Modal'],
    'utilities': ['Empty State', 'Responsive', 'Utilities', 'Go To Top']
}

out_contents = {k: [] for k in file_map}

for i in range(1, len(sections), 2):
    name = sections[i]
    code = sections[i+1]
    
    # Find which file it belongs to
    assigned = False
    for fname, mapped_names in file_map.items():
        if name in mapped_names:
            out_contents[fname].append(f"/* ── {name} ─────────────────────────────────────────────────────────── */\n{code.strip()}")
            assigned = True
            break
    
    if not assigned:
        print(f"Warning: Section {name} not mapped")
        out_contents['utilities'].append(f"/* ── {name} ─────────────────────────────────────────────────────────── */\n{code.strip()}")

# Write files
for fname, contents in out_contents.items():
    with open(f"{out_dir}/{fname}.css", 'w') as f:
        if fname == 'base':
            f.write(header_content + "\n\n".join(contents))
        else:
            f.write("\n\n".join(contents))
        f.write("\n")

# Write new style.css
with open('frontend/style.css', 'w') as f:
    f.write(header_content)
    for fname in file_map:
        f.write(f'@import "./css/{fname}.css";\n')

