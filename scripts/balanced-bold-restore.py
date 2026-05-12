#!/usr/bin/env python3
"""
FINAL bold restore - balanced approach.
Add bold for:
1. Short labels (≤ 8 chars) at paragraph starts followed by ： or :
   e.g., "要素一：", "数据来源：", "第一："
2. ALWAYS_BOLD terms (product/company names)
3. NO bold for medium/long phrases, running text, or whole sentences

Target: ~10-20 bold per file average.
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

def process_text(text):
    """Reset ALL bold, add back ONLY short structural labels + ALWAYS_BOLD."""
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
        return m.group(1) + process_text(m.group(2)) + m.group(3)
    
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
    print(f'分布: 0={sum(1 for c in counts if c==0)}, 1-5={sum(1 for c in counts if 1<=c<=5)}, 6-15={sum(1 for c in counts if 6<=c<=15)}, 15+={sum(1 for c in counts if c>15)}')

if __name__ == '__main__':
    main()
