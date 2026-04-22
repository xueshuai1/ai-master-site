#!/usr/bin/env python3
"""
批量改造 TS 文件：将 body 中的 \`\`\` 代码块提取到独立的 code 字段
简单策略：对每个 body，删除代码块，在 section 的 }, 之前追加 code 字段
"""
import sys, os, re

PROJECT_ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
BT3 = '\\`\\`\\`'

def find_body_end(text, start):
    i = start
    while i < len(text):
        bt = text.find('`', i)
        if bt == -1:
            return -1
        bc = 0
        j = bt - 1
        while j >= 0 and text[j] == '\\':
            bc += 1
            j -= 1
        if bc % 2 == 0:
            return bt
        i = bt + 1
    return -1

def find_code_blocks(body_text):
    blocks = []
    pattern = re.compile(r'^\s*' + re.escape(BT3) + r'(\w*)\s*$', re.MULTILINE)
    matches = list(pattern.finditer(body_text))
    
    i = 0
    while i < len(matches):
        m_start = matches[i]
        lang = m_start.group(1) or 'text'
        code_start = m_start.end()
        j = i + 1
        found = False
        while j < len(matches):
            m_end = matches[j]
            code_text = body_text[code_start:m_end.start()].rstrip()
            blocks.append((lang, code_text, m_start.start(), m_end.end()))
            i = j + 1
            found = True
            break
        if not found:
            i += 1
    return blocks

def remove_blocks(body_text, blocks):
    result = body_text
    for lang, code_text, blk_start, blk_end in reversed(blocks):
        pre = blk_start
        while pre > 0 and result[pre - 1] in ' \t\r':
            pre -= 1
        if pre > 0 and result[pre - 1] == '\n':
            pre -= 1
        post = blk_end
        while post < len(result) and result[post] in ' \t\r':
            post += 1
        if post < len(result) and result[post] == '\n':
            post += 1
        result = result[:pre] + result[post:]
    result = re.sub(r'\n{3,}', '\n\n', result).strip()
    return result

def process_file(filepath):
    with open(filepath, 'r') as f:
        content = f.read()
    
    if BT3 not in content:
        return 0
    
    # 找所有 body
    body_positions = []
    for m in re.finditer(r'body:\s*`', content):
        bs = m.end()
        be = find_body_end(content, bs)
        if be != -1:
            body_positions.append((bs, be))
    
    if not body_positions:
        return 0
    
    fixed_count = 0
    new_content = content
    body_positions.reverse()  # 从后往前
    
    for body_start, body_end in body_positions:
        body_text = new_content[body_start:body_end]
        blocks = find_code_blocks(body_text)
        if not blocks:
            continue
        
        # 构建 code 项
        code_items = []
        for lang, code_text, blk_start, blk_end in blocks:
            if not code_text.strip():
                continue
            escaped = code_text.replace('`', '\\`')
            code_items.append(f'      {{\n        lang: "{lang}",\n        code: `{escaped}`,\n      }}')
        
        if not code_items:
            continue
        
        code_items_str = ',\n'.join(code_items)
        
        # 删除 body 中的代码块
        cleaned = remove_blocks(body_text, blocks)
        
        # 计算 body 修改导致的长度变化
        old_body_len = body_end - body_start
        new_body_len = len(cleaned)
        diff = new_body_len - old_body_len
        
        new_content = new_content[:body_start] + cleaned + new_content[body_end:]
        
        # 找 section 的关闭 },（在 body 之后的第一个 4 空格 },）
        new_body_end = body_start + new_body_len
        search_start = new_body_end
        
        # 跳过 body 的闭合 ` 和可能的逗号
        idx = search_start
        while idx < len(new_content) and new_content[idx] in '`\n\r ,;':
            idx += 1
        
        # 找第一个 4-6 空格缩进的 },
        section_close = None
        for m in re.finditer(r'\n(    |      )\},', new_content[idx:]):
            section_close = idx + m.start() + 1  # \n 的位置
            break
        
        if not section_close:
            continue
        
        # 检查这个 section 是否已有 code 字段
        section_text = new_content[search_start:section_close]
        if 'code:' in section_text:
            # 已有 code 字段，在 }, 之前、现有 code 数组之后追加
            # 找 }, 之前的 \n    ]
            code_append_pos = None
            for m in reversed(list(re.finditer(r'\n(    |      )\],', new_content[idx:section_close]))):
                code_append_pos = idx + m.end()
                break
            
            if code_append_pos:
                # 在 ], 之后追加新项（在 ] 之前插入）
                # 找 ] 的位置
                bracket_pos = new_content.rfind(']', idx, code_append_pos)
                if bracket_pos != -1:
                    new_content = (
                        new_content[:bracket_pos] +
                        '\n' + code_items_str + ',\n' +
                        new_content[bracket_pos:]
                    )
                    fixed_count += 1
                    continue
            else:
                # 找不到现有 code 数组的 ], 在 }, 之前添加新 code 字段
                pass
        
        # 没有 code 字段，在 }, 之前添加
        # 在 }, 之前插入 code 字段
        new_content = (
            new_content[:section_close] +
            ',\n    code: [\n' + code_items_str + ',\n    ]' +
            new_content[section_close:]
        )
        
        fixed_count += 1
    
    if fixed_count > 0:
        with open(filepath, 'w') as f:
            f.write(new_content)
    
    return fixed_count

def main():
    files = sys.argv[1:]
    total = 0
    
    for file in files:
        path = os.path.join(PROJECT_ROOT, file)
        try:
            count = process_file(path)
            if count > 0:
                print(f"✅ {os.path.basename(file)}: 修复了 {count} 个 section")
                total += count
            else:
                print(f"⏭️ {os.path.basename(file)}: 无需修复")
        except Exception as e:
            print(f"❌ {os.path.basename(file)}: {e}")
            import traceback
            traceback.print_exc()
    
    print(f"\n📊 总计: 修复了 {total} 个 section")

if __name__ == '__main__':
    main()
