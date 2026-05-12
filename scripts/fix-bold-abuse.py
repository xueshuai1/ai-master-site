#!/usr/bin/env python3
"""
Fix bold abuse in knowledge base articles and blog posts.
Keep ** only for specific product/company names, frameworks, standards.
Remove ALL other bold from body/summary/tip/warning fields AND list array items.
"""

import os
import re

# STRICT whitelist - ONLY product/company/standard names
KEEP_BOLD = {
    'GPT-4', 'GPT-4o', 'GPT-5', 'GPT-5.5-Cyber', 'Claude', 'Gemini',
    'LLaMA', 'PaLM', 'Grok',
    'OpenAI', 'Anthropic', 'Google DeepMind', 'Meta AI', 'Microsoft', 'NVIDIA',
    'xAI', 'SpaceX', 'AWS', 'Azure', 'GCP',
    'RLHF', 'RLAIF', 'DPO', 'SFT', 'RAG', 'Transformer',
    'EU AI Act', 'NIST AI RMF', 'ISO/IEC 42001', 'GDPR',
    'Chrome', 'Chrome AI Skills', 'Chrome AI Mode', 'Chrome AI Actions',
    'LangChain', 'LangGraph', 'CrewAI', 'AutoGen',
    'vLLM', 'Ollama', 'LlamaIndex',
    'HuggingFace', 'Weights & Biases',
    'RealToxicityPrompts', 'TruthfulQA', 'BBH', 'MMLU', 'HELM',
    'SWE-bench', 'SWE-bench Pro',
    'Datadog', 'WeWork', 'Uber', 'Brilliant',
    'Level 0', 'Level 1', 'Level 2', 'Level 3', 'Level 4',
}

def should_keep(text):
    return text.strip() in KEEP_BOLD

def fix_bold(text):
    def replacer(m):
        if should_keep(m.group(1)):
            return m.group(0)
        return m.group(1)
    return re.sub(r'\*\*(.+?)\*\*', replacer, text)

def fix_string_in_quotes(content):
    """Fix bold in all double-quoted strings that are part of content arrays."""
    def replacer(m):
        quote_content = m.group(1)
        if re.search(r'[\u4e00-\u9fff]', quote_content) or len(quote_content) > 20:
            return '"' + fix_bold(quote_content) + '"'
        return m.group(0)
    # IMPORTANT: [^"\\\n] excludes newlines to prevent cross-line matches
    return re.sub(r'"((?:[^"\\\n]|\\.)*)"', replacer, content)

def fix_single_quotes(content):
    """Fix bold in single-quoted strings (tip/warning fields)."""
    def replacer(m):
        quote_content = m.group(1)
        if re.search(r'[\u4e00-\u9fff]', quote_content) or len(quote_content) > 20:
            return "'" + fix_bold(quote_content) + "'"
        return m.group(0)
    return re.sub(r"'((?:[^'\\]|\\.)*)'", replacer, content)

def fix_template_literal(content):
    """Fix bold in backtick template literals."""
    def replacer(m):
        return '`' + fix_bold(m.group(1)) + '`'
    return re.sub(r'`((?:[^`\\]|\\.)*)`', replacer, content)

def process_file(filepath):
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()

    original = content.count('**')
    
    # Fix backtick template literals
    content = fix_template_literal(content)
    # Fix double-quoted strings (list items, etc.)
    content = fix_string_in_quotes(content)
    # Fix single-quoted strings (tip/warning fields)
    content = fix_single_quotes(content)
    
    new = content.count('**')

    if new != original:
        with open(filepath, 'w', encoding='utf-8') as f:
            f.write(content)
        return True, original, new
    return False, original, new

def main():
    base = '/Users/xueshuai/.openclaw/workspace/ai-master-site'
    dirs = [
        os.path.join(base, 'src/data/articles'),
        os.path.join(base, 'src/data/blogs'),
    ]

    total = fixed = removed = 0
    still_heavy = []

    for dirpath in dirs:
        if not os.path.exists(dirpath):
            continue
        for fname in sorted(os.listdir(dirpath)):
            if not fname.endswith('.ts'):
                continue
            fpath = os.path.join(dirpath, fname)
            changed, orig, new = process_file(fpath)
            total += 1
            if changed:
                fixed += 1
                removed += orig - new
            with open(fpath, 'r', encoding='utf-8') as f:
                remaining = f.read().count('**')
            if remaining > 5:
                rel = f"{os.path.basename(dirpath)}/{fname}"
                still_heavy.append((rel, remaining))

    print(f"扫描: {total} 修改: {fixed} 移除: {removed}")
    if still_heavy:
        print(f"\n⚠️ 仍有加粗（> 5）: {len(still_heavy)} 个文件")
        for path, count in sorted(still_heavy, key=lambda x: -x[1])[:20]:
            print(f"  {path}: {count}")

if __name__ == '__main__':
    main()
