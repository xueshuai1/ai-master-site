#!/usr/bin/env python3
"""
Reset all body bold, then add back ONLY what's needed.
This ensures a clean baseline.
"""

import os
import re

ALWAYS_BOLD = {
    'GPT-4', 'GPT-4o', 'GPT-5', 'GPT-5.5-Cyber', 'Claude', 'Gemini',
    'LLaMA', 'PaLM', 'Grok',
    'OpenAI', 'Anthropic', 'Google DeepMind', 'Meta AI', 'Microsoft', 'NVIDIA',
    'xAI', 'SpaceX', 'AWS', 'Azure', 'GCP',
    'RLHF', 'RLAIF', 'DPO', 'SFT', 'RAG', 'Transformer',
    'EU AI Act', 'NIST AI RMF', 'ISO/IEC 42001', 'GDPR',
    'LangChain', 'LangGraph', 'CrewAI', 'AutoGen',
    'vLLM', 'Ollama', 'LlamaIndex',
    'HuggingFace', 'Weights & Biases',
    'RealToxicityPrompts', 'TruthfulQA', 'BBH', 'MMLU', 'HELM',
    'Level 0', 'Level 1', 'Level 2', 'Level 3', 'Level 4',
    'System Card', 'Model Card', '宪法式 AI',
    'Chrome AI Skills', 'Chrome AI Mode', 'Chrome AI Actions',
}

def reset_and_add_bold(text):
    """Remove ALL ** from body, then add back only structural labels and ALWAYS_BOLD."""
    # First remove all existing **
    text = text.replace('**', '')
    
    lines = text.split('\n')
    result = []
    for line in lines:
        stripped = line.lstrip()
        if not stripped:
            result.append(line)
            continue
        # Short label (≤ 8 chars) at start followed by ： or :
        m = re.match(r'^(\s*)(.{1,8}?)([：:]\s*)', line)
        if m:
            indent, label, sep = m.group(1), m.group(2).strip(), m.group(3)
            rest = line[m.end():]
            if any('\u4e00' <= c <= '\u9fff' for c in label) or label in ALWAYS_BOLD:
                result.append(f'{indent}**{label}**{sep}{rest}')
                continue
        # ALWAYS_BOLD terms
        for term in ALWAYS_BOLD:
            if re.search(r'(?<!\*\*)' + re.escape(term) + r'(?!\*\*)', line):
                line = re.sub(r'(?<!\*\*)' + re.escape(term) + r'(?!\*\*)', f'**{term}**', line)
        result.append(line)
    return '\n'.join(result)

def process_file(filepath):
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()
    original = content.count('**')
    def fix(m):
        return m.group(1) + reset_and_add_bold(m.group(2)) + m.group(3)
    for delim in ['`', '"']:
        for field in ['body', 'body2']:
            pat = rf'({field}:\s*{re.escape(delim)})([\s\S]*?)(\s*{re.escape(delim)}\s*[,}}\n])'
            content = re.sub(pat, fix, content)
    new = content.count('**')
    if new != original:
        with open(filepath, 'w', encoding='utf-8') as f:
            f.write(content)
        return True, original, new
    return False, original, new

def main():
    base = '/Users/xueshuai/.openclaw/workspace/ai-master-site'
    dirs = [os.path.join(base, 'src/data/articles'), os.path.join(base, 'src/data/blogs')]
    total = fixed = 0
    final_counts = []
    for dirpath in dirs:
        if not os.path.exists(dirpath): continue
        for fname in sorted(os.listdir(dirpath)):
            if not fname.endswith('.ts'): continue
            fpath = os.path.join(dirpath, fname)
            changed, orig, new = process_file(fpath)
            total += 1
            if changed: fixed += 1
            with open(fpath) as f:
                final_counts.append(f.read().count('**'))
    print(f'扫描: {total} 修改: {fixed}')
    print(f'最终总计 ** 标记: {sum(final_counts)}')
    print(f'平均每文件: {sum(final_counts)/len(final_counts):.0f}')

if __name__ == '__main__':
    main()
