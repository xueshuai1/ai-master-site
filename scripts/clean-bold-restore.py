#!/usr/bin/env python3
"""
FINAL clean bold restore.
1. Remove ALL existing ** markers from body content
2. Add back ONLY:
   - Short labels (≤ 10 chars) at paragraph starts followed by ： or :
   - ALWAYS_BOLD terms (OpenAI, Claude, etc.)
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

def clean_and_restore(text):
    """Remove ALL **, then add back ONLY short labels + ALWAYS_BOLD."""
    # Step 1: Remove all existing **
    text = text.replace('**', '')
    
    # Step 2: Add back short structural labels
    lines = text.split('\n')
    result = []
    for line in lines:
        stripped = line.lstrip()
        if not stripped:
            result.append(line)
            continue
        
        # Short label (≤ 10 chars) at start followed by ： or :
        m = re.match(r'^(\s*)(.{1,10}?)([：:]\s*)', line)
        if m:
            indent, label, sep = m.group(1), m.group(2).strip(), m.group(3)
            rest = line[m.end():]
            if any('\u4e00' <= c <= '\u9fff' for c in label) or label in ALWAYS_BOLD:
                result.append(f'{indent}**{label}**{sep}{rest}')
                continue
        
        # ALWAYS_BOLD terms
        for term in ALWAYS_BOLD:
            pattern = r'(?<!\*\*)' + re.escape(term) + r'(?!\*\*)'
            if re.search(pattern, line):
                line = re.sub(pattern, f'**{term}**', line)
        
        result.append(line)
    
    return '\n'.join(result)

def process_file(filepath):
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()

    original = content.count('**')
    
    def fix(m):
        return m.group(1) + clean_and_restore(m.group(2)) + m.group(3)
    
    for delim in ['`', '"']:
        for field in ['body', 'body2']:
            escaped = re.escape(delim)
            pattern = rf'({field}:\s*{escaped})([\s\S]*?)(\s*{escaped}\s*[,}})\n]?)'
            content = re.sub(pattern, fix, content)
    
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
    counts = []
    
    for dirpath in dirs:
        if not os.path.exists(dirpath): continue
        for fname in sorted(os.listdir(dirpath)):
            if not fname.endswith('.ts'): continue
            fpath = os.path.join(dirpath, fname)
            changed, orig, new = process_file(fpath)
            total += 1
            if changed: fixed += 1
            with open(fpath) as f:
                counts.append(f.read().count('**'))
    
    print(f'扫描: {total} 修改: {fixed}')
    print(f'总计: {sum(counts)} markers, 平均: {sum(counts)/len(counts):.0f}/file')
    print(f'分布: 0={sum(1 for c in counts if c==0)}, 1-10={sum(1 for c in counts if 1<=c<=10)}, 10-30={sum(1 for c in counts if 10<c<=30)}, 30+={sum(1 for c in counts if c>30)}')

if __name__ == '__main__':
    main()
