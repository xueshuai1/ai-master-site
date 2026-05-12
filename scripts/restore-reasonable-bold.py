#!/usr/bin/env python3
"""
Restore REASONABLE bold to article/blog body content.
After the aggressive cleanup removed ALL bold, we now restore bold for:
1. Short key terms at the start of paragraphs/lines (e.g., "要素一：模型基本信息")
2. Short labeled items followed by ： or : or — (e.g., "数据来源：xxx", "核心概念 — xxx")
3. List item starts (short phrases ≤ 15 chars followed by punctuation)

NOT restored:
- Long phrases/sentences (> 15 chars)
- Descriptive running text
- Whole paragraphs
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

def add_structural_bold(text):
    """Add bold to short structural labels at line/paragraph starts."""
    lines = text.split('\n')
    result = []
    
    for line in lines:
        # Skip empty lines
        if not line.strip():
            result.append(line)
            continue
        
        # Pattern: short phrase (1-20 chars, no colons/dashes) followed by ： or : or — or -
        # This catches things like "要素一：xxx", "数据来源：xxx", "核心概念 — xxx"
        m = re.match(r'^(\s*)([^\n：:—\-]{1,20}?)([：:]\s*|[—-]\s+)', line)
        if m:
            indent = m.group(1)
            label = m.group(2).strip()
            sep = m.group(3)
            rest = line[m.end():]
            
            # Only add bold if:
            # 1. Label is short (≤ 20 chars) AND
            # 2. Has Chinese characters OR is a known term
            if len(label) <= 20 and (
                any('\u4e00' <= c <= '\u9fff' for c in label) or
                label in ALWAYS_BOLD
            ):
                result.append(f'{indent}**{label}**{sep}{rest}')
                continue
        
        # Also add bold for ALWAYS_BOLD terms that appear without bold
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
    
    # Fix body fields (both ` and " delimited)
    def fix_body(m):
        prefix = m.group(1)
        body = m.group(2)
        suffix = m.group(3)
        fixed = add_structural_bold(body)
        return prefix + fixed + suffix
    
    for delim in ['`', '"']:
        for field in ['body', 'body2']:
            escaped = re.escape(delim)
            # More careful pattern - match field: " or field: `
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
    dirs = [
        os.path.join(base, 'src/data/articles'),
        os.path.join(base, 'src/data/blogs'),
    ]

    total = fixed = added = 0
    examples = []

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
                added += (new - orig)
                rel = f"{os.path.basename(dirpath)}/{fname}"
                examples.append((rel, orig, new))

    print(f"扫描: {total} 修改: {fixed} 新增加粗: {added}")
    if examples:
        print(f"\n示例（原 → 新）:")
        for path, orig, new in sorted(examples, key=lambda x: -(x[2]-x[1]))[:20]:
            print(f"  {path}: {orig} → {new} (+{new-orig})")

if __name__ == '__main__':
    main()
