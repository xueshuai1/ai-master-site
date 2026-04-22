#!/usr/bin/env python3
"""
Extract \`\`\` code blocks from body fields in blog TS files.
The backticks in TS template literals are escaped as \`\`\` (literal backslash+backtick).
"""

import re
import sys
from pathlib import Path

# In the file, code fences are: \`\`\` (backslash+backtick x3) = hex 5c605c605c60
# Opening: line starting with \`\`\` optionally followed by lang
# Closing: line with \`\`\` possibly followed by backtick and comma

ESCAPE = r'\`\`\`'  # literal 6 chars: \`\`\`

def extract_blocks_from_body(body_text: str):
    """Extract code blocks from body text.
    Code block: \`\`\`lang\ncontent\n\`\`\`
    Returns list of (lang, code_content) and cleaned body text.
    """
    # Pattern: \`\`\`lang\n...\`\`\`
    pattern = re.escape(ESCAPE) + r'(\w*)\n(.*?)' + re.escape(ESCAPE)
    
    blocks = []
    def replacer(m):
        lang = m.group(1).strip() or 'text'
        code = m.group(2).strip('\n')
        blocks.append((lang, code))
        return ''
    
    new_body = re.sub(pattern, replacer, body_text, flags=re.DOTALL)
    # Clean up excessive blank lines
    new_body = re.sub(r'\n{3,}', '\n\n', new_body)
    new_body = new_body.strip('\n')
    
    return blocks, new_body


def process_file(filepath: str) -> int:
    content = Path(filepath).read_text(encoding='utf-8')
    
    # Strategy: process body fields one at a time
    # Find 'body: `' and match to closing '`'
    
    # Find all body: ` positions
    body_field_starts = []
    search_pos = 0
    while True:
        idx = content.find('body: `', search_pos)
        if idx == -1:
            break
        # The body content starts after 'body: `'
        body_start = idx + len('body: `')
        
        # Find the closing backtick
        # It's a backtick followed by comma, or backtick followed by newline
        closing = content.find('`', body_start)
        while closing != -1:
            # Check: is this the actual closing?
            # The closing backtick is the first unescaped backtick after content starts
            # But in TS template literals, backticks INSIDE are escaped with \
            # So an unescaped backtick is one NOT preceded by \
            if closing > 0 and content[closing-1] == '\\':
                # This backtick is escaped, skip it
                closing = content.find('`', closing + 1)
                continue
            break
        
        if closing == -1:
            break
        
        body_field_starts.append((idx, body_start, closing))
        search_pos = closing + 1
    
    total_extracted = 0
    
    # Process from end to start to preserve positions
    for field_idx, body_start, body_end in reversed(body_field_starts):
        body_text = content[body_start:body_end]
        
        # Extract code blocks
        blocks, new_body = extract_blocks_from_body(body_text)
        
        if not blocks:
            continue
        
        # Build the new code entries
        # Find indent
        line_start = content.rfind('\n', 0, field_idx)
        if line_start == -1:
            line_start = 0
        else:
            line_start += 1
        indent = content[line_start:field_idx]  # whitespace before "body:"
        
        code_indent = indent  # same as field indent
        entry_indent = code_indent + '  '
        detail_indent = entry_indent + '  '
        
        code_entries = []
        for lang, code_content in blocks:
            code_lines = code_content.split('\n')
            entry = f'{entry_indent}{{\n'
            entry += f'{entry_indent}lang: "{lang}",\n'
            if len(code_lines) == 1:
                entry += f'{entry_indent}code: `{code_lines[0]}`,\n'
            else:
                entry += f'{entry_indent}code: `\n'
                for cl in code_lines:
                    entry += f'{detail_indent}{cl}\n'
                entry += f'{entry_indent}`,\n'
            entry += f'{entry_indent}}}'
            code_entries.append(entry)
        
        # Check if existing code field follows
        after_body = content[body_end:]  # starts after closing backtick
        # Skip comma and whitespace
        after_body = after_body.lstrip(',\n ')
        
        has_code = bool(re.match(r'code:\s*\[', after_body))
        
        # Build replacement for the body field
        # body: `new_body`,
        if '\n' in new_body:
            new_body_field = f'body: `\n{new_body}\n{indent}`,'
        else:
            new_body_field = f'body: `{new_body}`,'
        
        if has_code:
            # Insert into existing code array
            # Find the code array boundaries
            code_array_start = body_end + len(content[body_end:]) - len(after_body)
            # Actually let's recalculate
            code_match = re.search(r'code:\s*\[', content[body_end:])
            if code_match:
                ca_start = body_end + code_match.start()
                # Find closing ],
                bracket = 0
                started = False
                ca_end = ca_start
                for ci in range(ca_start, len(content)):
                    if content[ci] == '[':
                        bracket += 1
                        started = True
                    elif content[ci] == ']':
                        bracket -= 1
                    if started and bracket == 0:
                        ca_end = ci + 1
                        break
                
                # Get existing code content
                existing_code = content[ca_start:ca_end]
                # Find where to insert (before the closing ])
                insert_pos = existing_code.rfind(']')
                existing_content = existing_code[:insert_pos]
                closing_bracket = existing_code[insert_pos:]
                
                # Clean up existing content - ensure trailing comma
                existing_content = existing_content.rstrip()
                if existing_content and not existing_content.endswith(','):
                    existing_content += ','
                
                new_code_array = existing_content + '\n' + '\n'.join(code_entries) + '\n' + closing_bracket
                full_replacement = new_body_field + content[body_end:ca_start] + new_code_array
                replace_start = field_idx
                replace_end = ca_end
            else:
                # Shouldn't happen since has_code was True
                new_code = f'\n{code_indent}code: [\n' + '\n'.join(code_entries) + f'\n{code_indent}],'
                full_replacement = new_body_field + new_code
                replace_start = field_idx
                replace_end = body_end + (1 if body_end < len(content) and content[body_end] == ',' else 0)
        else:
            new_code = f'\n{code_indent}code: [\n' + '\n'.join(code_entries) + f'\n{code_indent}],'
            full_replacement = new_body_field + new_code
            replace_start = field_idx
            # Include the comma after body if present
            replace_end = body_end
            if replace_end < len(content) and content[replace_end] == ',':
                replace_end += 1
        
        # Apply replacement
        content = content[:replace_start] + full_replacement + content[replace_end:]
        total_extracted += len(blocks)
    
    Path(filepath).write_text(content, encoding='utf-8')
    return total_extracted


if __name__ == '__main__':
    files = sys.argv[1:]
    for f in files:
        print(f"Processing {f}...")
        count = process_file(f)
        print(f"  Extracted {count} code block(s)")
