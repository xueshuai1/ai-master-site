#!/usr/bin/env python3
"""
Restore MINIMAL but useful bold to article/blog body content.
After aggressive cleanup removed ALL bold, restore ONLY:
1. VERY short labels (≤ 8 chars) at paragraph starts followed by ： or :
2. ALWAYS_BOLD terms (product/company names)

NOT: medium phrases, running text, descriptive labels > 8 chars
"""

import os
import re

# Terms that should DEFINITELY be bold (products, companies, standards)
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

def add_minimal_bold(text):
    """Add bold ONLY to very short structural labels + ALWAYS_BOLD terms."""
    lines = text.split('\n')
    result = []
    
    for line in lines:
        stripped = line.lstrip()
        if not stripped:
            result.append(line)
            continue
        
        # VERY strict: only short labels (≤ 8 chars) followed by ： or :
        # This catches: "要素一：", "来源：", "数据：", etc.
        m = re.match(r'^(\s*)(.{1,8}?)([：:]\s*)', line)
        if m:
            indent = m.group(1)
            label = m.group(2).strip()
            sep = m.group(3)
            rest = line[m.end():]
            
            # Only if label has Chinese OR is a known term
            if any('\u4e00' <= c <= '\u9fff' for c in label) or label in ALWAYS_BOLD:
                result.append(f'{indent}**{label}**{sep}{rest}')
                continue
        
        # Add bold for ALWAYS_BOLD terms
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
        return m.group(1) + add_minimal_bold(m.group(2)) + m.group(3)
    
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
    print(f"\n示例:")
    for path, orig, new in sorted(examples, key=lambda x: -(x[2]-x[1]))[:15]:
        print(f"  {path}: {orig} → {new} (+{new-orig})")

if __name__ == '__main__':
    main()
