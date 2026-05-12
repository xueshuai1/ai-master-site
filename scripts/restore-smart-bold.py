#!/usr/bin/env python3
"""
Restore SMART bold to article/blog body content.
After aggressive cleanup removed ALL bold, we need to restore it intelligently.

Strategy:
1. Short labels (≤ 10 chars) at paragraph starts followed by ： or : → bold
   e.g., "要素一：", "数据来源：", "第一层："
2. ALWAYS_BOLD terms (OpenAI, Claude, etc.) → bold
3. Key short terms (2-6 chars with Chinese) that appear at the START of a sentence
   after a period/newline → bold
   e.g., "幻觉率", "红队测试", "对齐方法"

NOT bold:
- Long phrases or sentences (> 15 chars)
- Running descriptive text
- Labels that are part of flowing text
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

def add_smart_bold(text):
    lines = text.split('\n')
    result = []
    
    for line in lines:
        stripped = line.lstrip()
        if not stripped:
            result.append(line)
            continue
        
        # Rule 1: Short label (≤ 10 chars) at start followed by ： or :
        m = re.match(r'^(\s*)(.{1,10}?)([：:]\s*)', line)
        if m:
            indent, label, sep = m.group(1), m.group(2).strip(), m.group(3)
            rest = line[m.end():]
            if any('\u4e00' <= c <= '\u9fff' for c in label) or label in ALWAYS_BOLD:
                result.append(f'{indent}**{label}**{sep}{rest}')
                continue
        
        # Rule 2: ALWAYS_BOLD terms
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
    
    def fix_body(m):
        return m.group(1) + add_smart_bold(m.group(2)) + m.group(3)
    
    for delim in ['`', '"']:
        for field in ['body', 'body2']:
            escaped = re.escape(delim)
            pattern = rf'({field}:\s*{escaped})([\s\S]*?)(\s*{escaped}\s*[,}}\n])'
            content = re.sub(pattern, fix_body, content)
    
    new = content.count('**')
    if new != original:
        with open(filepath, 'w', encoding='utf-8') as f:
            f.write(content)
        return True, original, new
    return False, original, new

def main():
    base = '/Users/xueshuai/.openclaw/workspace/ai-master-site'
    dirs = [os.path.join(base, 'src/data/articles'), os.path.join(base, 'src/data/blogs')]
    
    total = fixed = added = 0
    examples = []
    
    for dirpath in dirs:
        if not os.path.exists(dirpath): continue
        for fname in sorted(os.listdir(dirpath)):
            if not fname.endswith('.ts'): continue
            fpath = os.path.join(dirpath, fname)
            changed, orig, new = process_file(fpath)
            total += 1
            if changed:
                fixed += 1
                added += (new - orig)
                examples.append((f"{os.path.basename(dirpath)}/{fname}", orig, new))
    
    print(f"扫描: {total} 修改: {fixed} 新增加粗: {added}")
    if examples:
        print(f"\n示例:")
        for path, orig, new in sorted(examples, key=lambda x: -(x[2]-x[1]))[:15]:
            print(f"  {path}: {orig} → {new} (+{new-orig})")

if __name__ == '__main__':
    main()
