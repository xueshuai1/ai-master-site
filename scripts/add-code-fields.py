#!/usr/bin/env python3
"""
为已删除代码块的文件添加 code 字段
使用 git 原始版本提取代码块内容
"""
import sys, os, re, subprocess

PROJECT_ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
BT3 = '\\`\\`\\`'

def get_original_content(filepath):
    """从 git 获取原始内容"""
    rel_path = os.path.relpath(filepath, PROJECT_ROOT)
    result = subprocess.run(
        ['git', 'show', f'HEAD:{rel_path}'],
        capture_output=True, text=True, cwd=PROJECT_ROOT
    )
    return result.stdout if result.returncode == 0 else None

def extract_code_from_original(original):
    """从原始内容提取所有 body 中的代码块及其所属 section"""
    sections = []
    for m in re.finditer(r'title:\s*"([^"]+)"', original):
        title = m.group(1)
        # 找这个 title 后的 body
        after_title = original[m.end():]
        body_m = re.search(r'body:\s*`', after_title)
        if not body_m:
            continue
        
        body_start = m.end() + body_m.end()
        # 找 body 结束
        i = body_start
        while i < len(original):
            bt = original.find('`', i)
            if bt == -1: break
            bc = 0
            j = bt - 1
            while j >= 0 and original[j] == '\\':
                bc += 1
                j -= 1
            if bc % 2 == 0:
                body_end = bt
                break
            i = bt + 1
        else:
            continue
        
        body = original[body_start:body_end]
        # 提取代码块
        pattern = re.compile(r'^\s*' + re.escape(BT3) + r'(\w*)\s*$', re.MULTILINE)
        matches = list(pattern.finditer(body))
        
        blocks = []
        idx = 0
        while idx < len(matches):
            m_start = matches[idx]
            lang = m_start.group(1) or 'text'
            code_start = m_start.end()
            found = False
            for jdx in range(idx + 1, len(matches)):
                m_end = matches[jdx]
                code = body[code_start:m_end.start()].rstrip()
                if code.strip():
                    blocks.append({'lang': lang, 'code': code})
                idx = jdx + 1
                found = True
                break
            if not found:
                idx += 1
        
        if blocks:
            sections.append({'title': title, 'blocks': blocks})
    
    return sections

def add_code_fields_to_modified(filepath, sections):
    """为修改后的文件添加 code 字段"""
    with open(filepath, 'r') as f:
        content = f.read()
    
    for section in sections:
        title = section['title']
        blocks = section['blocks']
        
        # 在修改后的文件中找到这个 title
        title_m = re.search(r'title:\s*"' + re.escape(title) + '"', content)
        if not title_m:
            print(f'  ⚠️  Section "{title}" not found in modified file')
            continue
        
        # 找这个 section 的 body: `
        after_title = content[title_m.end():]
        body_m = re.search(r'body:\s*`', after_title)
        if not body_m:
            continue
        
        body_end = title_m.end() + body_m.end()
        # 找 body 结束 `
        i = body_end
        while i < len(content):
            bt = content.find('`', i)
            if bt == -1: break
            bc = 0
            j = bt - 1
            while j >= 0 and content[j] == '\\':
                bc += 1
                j -= 1
            if bc % 2 == 0:
                closing_bt = bt
                break
            i = bt + 1
        else:
            continue
        
        # 检查是否已有 code 字段（在 body 后到 section 关闭 }, 之间）
        after_body = content[closing_bt + 1:]
        section_end_m = re.search(r'\n\s{4}\},', after_body)
        if not section_end_m:
            section_end_m = re.search(r'\n\s{4}\}', after_body)
        section_text = after_body[:section_end_m.end() if section_end_m else 200]
        if re.search(r'\bcode:\s*\[', section_text):
            continue  # 已有 code 字段，跳过
        
        # 构建 code 字段
        code_items = []
        for b in blocks:
            escaped = b['code'].replace('`', '\\`')
            code_items.append(f'      {{\n        lang: "{b["lang"]}",\n        code: `{escaped}`,\n      }}')
        
        code_field = ',\n    code: [\n' + ',\n'.join(code_items) + ',\n    ]'
        
        # 插入在 body 闭合 ` 后
        content = content[:closing_bt + 1] + code_field + content[closing_bt + 1:]
    
    with open(filepath, 'w') as f:
        f.write(content)

def process_file(filepath):
    original = get_original_content(filepath)
    if not original:
        print(f'  ❌ 无法获取原始内容')
        return 0
    
    sections = extract_code_from_original(original)
    if not sections:
        return 0
    
    add_code_fields_to_modified(filepath, sections)
    return len(sections)

def main():
    files = sys.argv[1:]
    total = 0
    
    for file in files:
        path = os.path.join(PROJECT_ROOT, file)
        try:
            count = process_file(path)
            if count > 0:
                print(f"✅ {os.path.basename(file)}: {count} 个 section")
                total += count
            else:
                print(f"⏭️ {os.path.basename(file)}: 无需处理")
        except Exception as e:
            print(f"❌ {os.path.basename(file)}: {e}")
    
    print(f"\n📊 总计: {total} 个 section")

if __name__ == '__main__':
    main()
