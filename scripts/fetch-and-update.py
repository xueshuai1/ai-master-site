#!/usr/bin/env python3
"""Fetch GitHub repo data with proper auth (Authorization header)."""
import json
import re
import time
import sys
import ssl
from urllib.request import Request, urlopen
from urllib.error import HTTPError

# Load token
GITHUB_TOKEN = None
with open('.env.local') as f:
    for line in f:
        if line.startswith('GITHUB_TOKEN='):
            GITHUB_TOKEN = line.strip().split('=', 1)[1]
            break

if not GITHUB_TOKEN:
    print("No GITHUB_TOKEN found")
    sys.exit(1)

# Load tools.ts
with open('src/data/tools.ts') as f:
    tools_content = f.read()

# Extract unique repos
urls = re.findall(r'https://github\.com/([a-zA-Z0-9_.-]+/[a-zA-Z0-9_.-]+)', tools_content)
repos = sorted(set(u.lower() for u in urls))
print(f"Found {len(repos)} repos", flush=True)

# Use proper Authorization header
headers = {
    'Authorization': f'token {GITHUB_TOKEN}',
    'Accept': 'application/vnd.github.v3+json',
    'User-Agent': 'OpenClaw-Data-Agent'
}

results = {}
all_topics = {}
ctx = ssl.create_default_context()

for i, repo in enumerate(repos):
    if i > 0 and i % 50 == 0:
        print(f"\n  ... {i}/{len(repos)}, waiting 10s", flush=True)
        time.sleep(10)
    
    url = f"https://api.github.com/repos/{repo}"
    try:
        req = Request(url, headers=headers)
        with urlopen(req, timeout=15, context=ctx) as resp:
            data = json.loads(resp.read())
            results[repo] = {
                'stars': data.get('stargazers_count'),
                'forks': data.get('forks_count'),
                'language': data.get('language'),
                'pushed_at': data.get('pushed_at'),
                'topics': data.get('topics', [])
            }
            if i % 10 == 0:
                print(f"  {i}/{len(repos)} {repo}: {data['stargazers_count']} stars", flush=True)
            # Check rate limit headers
            remaining = int(resp.headers.get('X-RateLimit-Remaining', '0'))
            if remaining < 100:
                print(f"  WARNING: Only {remaining} API calls remaining", flush=True)
    except HTTPError as e:
        if e.code == 403:
            reset = e.headers.get('X-RateLimit-Reset', 'unknown')
            remaining = e.headers.get('X-RateLimit-Remaining', 'unknown')
            print(f"  403 at {i}/{len(repos)}. Remaining: {remaining}, Reset: {reset}", flush=True)
            results[repo] = {'error': 'rate_limited'}
        elif e.code == 404:
            results[repo] = {'error': 'not_found'}
        else:
            results[repo] = {'error': f'http_{e.code}'}
    except Exception as e:
        results[repo] = {'error': str(e)}
    
    time.sleep(0.8)

# Save results
with open('/tmp/github-repo-results.json', 'w') as f:
    json.dump(results, f, indent=2)
print(f"\nSaved {len(results)} repo results", flush=True)

# Collect all topics
for repo, data in results.items():
    if isinstance(data, dict) and data.get('topics'):
        for t in data['topics']:
            nt = t.lower().replace(' ', '-')
            if nt not in all_topics:
                all_topics[nt] = {'name': t, 'count': 0, 'repos': [], 'max_stars': 0}
            all_topics[nt]['count'] += 1
            all_topics[nt]['repos'].append(repo)
            if data.get('stars'):
                all_topics[nt]['max_stars'] = max(all_topics[nt]['max_stars'], data['stars'])

# Load existing topics
with open('data/ai-topics.json') as f:
    topics_data = json.load(f)
existing = set(t['topic'].lower() for t in topics_data['topics'])

# AI keywords
AI_KEYWORDS = [
    'ai','ml','dl','llm','nlp','cv','agent','robot','robots','robotics','vision','language',
    'neural','learning','generative','prompt','chatbot','deep-learning','machine-learning',
    'transformer','gpt','diffusion','rag','embedding','inference','fine-tuning','llmops',
    'mlops','model-serving','vector-search','semantic-search','knowledge-graph','multimodal',
    'speech','text-to-speech','image-generation','video-generation','code-generation',
    'autonomous','embodied-ai','world-models','foundation-models','large-language-models',
    'retrieval-augmented','instruction-tuning','rlhf','alignment'
]

def is_ai_topic(topic):
    t = topic.lower()
    return any(kw == t or kw in t or t in kw for kw in AI_KEYWORDS)

# Find new topics
new_topics = []
for topic_key, info in all_topics.items():
    if topic_key in existing:
        continue
    if is_ai_topic(topic_key) or is_ai_topic(info['name']):
        if info['count'] == 1 and info['max_stars'] < 1000:
            continue
        min_stars = 5000
        if info['count'] >= 3:
            min_stars = 2000
        elif info['count'] >= 2:
            min_stars = 3000
        new_topics.append({
            'topic': topic_key,
            'url': f'https://github.com/topics/{topic_key}',
            'minStars': min_stars,
            'description': f'（自动发现）{topic_key}',
            'repo_count': info['count'],
            'max_stars': info['max_stars']
        })

new_topics.sort(key=lambda x: (-x['repo_count'], -x['max_stars']))

# Add to topics data
if new_topics:
    for nt in new_topics:
        entry = {
            'topic': nt['topic'],
            'url': nt['url'],
            'minStars': nt['minStars'],
            'description': nt['description']
        }
        topics_data['topics'].append(entry)
    topics_data['lastUpdated'] = time.strftime('%Y-%m-%dT%H:%M:%S.000Z', time.gmtime())
    with open('data/ai-topics.json', 'w') as f:
        json.dump(topics_data, f, indent=2)
    print(f"\nAdded {len(new_topics)} new topics (total: {len(topics_data['topics'])})", flush=True)
else:
    print("\nNo new AI topics discovered", flush=True)

# Apply updates to tools.ts
print("\n--- Checking for data updates ---", flush=True)
updated_content = tools_content

# Parse tool objects and find updates
tool_pattern = re.compile(
    r'(\{\s*id:\s*"([^"]+)"[^}]*?url:\s*"https://github\.com/([^"]+)"[\s\S]*?\n\s*\})',
    re.DOTALL
)

stars_updates = []
forks_updates = []
lang_updates = []

for m in tool_pattern.finditer(tools_content):
    tool_id = m.group(2)
    tool_url = m.group(3).lower()
    block = m.group(1)
    
    old_stars = re.search(r'githubStars:\s*(\d+)', block)
    old_forks = re.search(r'forks:\s*(\d+)', block)
    old_lang = re.search(r'language:\s*"([^"]+)"', block)
    
    if tool_url not in results:
        continue
    data = results[tool_url]
    if data.get('error'):
        continue
    
    new_stars = data.get('stars')
    new_forks = data.get('forks')
    new_lang = data.get('language')
    
    if old_stars and new_stars and int(old_stars.group(1)) != new_stars:
        stars_updates.append({'id': tool_id, 'old': int(old_stars.group(1)), 'new': new_stars})
    if old_forks and new_forks and int(old_forks.group(1)) != new_forks:
        forks_updates.append({'id': tool_id, 'old': int(old_forks.group(1)), 'new': new_forks})
    if new_lang and (not old_lang or old_lang.group(1) != new_lang):
        lang_updates.append({'id': tool_id, 'old': old_lang.group(1) if old_lang else 'None', 'new': new_lang})

# Apply stars
for u in stars_updates:
    lines = updated_content.split('\n')
    in_tool = False
    for idx, line in enumerate(lines):
        if f'id: "{u["id"]}"' in line:
            in_tool = True
        if in_tool and 'githubStars:' in line:
            new_line = re.sub(r'(githubStars:\s*)\d+', rf'\g<1>{u["new"]}', line)
            if new_line != line:
                lines[idx] = new_line
                print(f"  Stars: {u['id']} {u['old']} → {u['new']} ({u['new']-u['old']:+d})", flush=True)
            break
        if in_tool and line.strip() == '},':
            break
    updated_content = '\n'.join(lines)

# Apply forks
for u in forks_updates:
    lines = updated_content.split('\n')
    in_tool = False
    for idx, line in enumerate(lines):
        if f'id: "{u["id"]}"' in line:
            in_tool = True
        if in_tool and 'forks:' in line and 'githubStars' not in line:
            new_line = re.sub(r'(forks:\s*)\d+', rf'\g<1>{u["new"]}', line)
            if new_line != line:
                lines[idx] = new_line
                print(f"  Forks: {u['id']} {u['old']} → {u['new']}", flush=True)
            break
        if in_tool and line.strip() == '},':
            break
    updated_content = '\n'.join(lines)

# Apply language
for u in lang_updates:
    lines = updated_content.split('\n')
    in_tool = False
    for idx, line in enumerate(lines):
        if f'id: "{u["id"]}"' in line:
            in_tool = True
        if in_tool and 'language:' in line:
            new_line = re.sub(r'(language:\s*)"[^"]*"', rf'\g<1>"{u["new"]}"', line)
            if new_line != line:
                lines[idx] = new_line
                print(f"  Lang: {u['id']} {u['old']} → {u['new']}", flush=True)
            break
        if in_tool and line.strip() == '},':
            break
    updated_content = '\n'.join(lines)

if updated_content != tools_content:
    with open('src/data/tools.ts', 'w') as f:
        f.write(updated_content)
    print(f"\nUpdated tools.ts", flush=True)
else:
    print("\nNo changes to tools.ts", flush=True)

# Save summary
summary = {
    'repos_scanned': len(repos),
    'successful': sum(1 for r in results.values() if not r.get('error')),
    'errors': sum(1 for r in results.values() if r.get('error')),
    'stars_updates': len(stars_updates),
    'forks_updates': len(forks_updates),
    'lang_updates': len(lang_updates),
    'new_topics': len(new_topics),
    'total_topics': len(topics_data['topics']),
    'stars_details': sorted(stars_updates, key=lambda x: abs(x['new']-x['old']), reverse=True)[:10],
    'new_topic_details': [{'topic': t['topic'], 'repos': t['repo_count'], 'max_stars': t['max_stars']} for t in new_topics[:15]]
}
with open('/tmp/github-update-summary.json', 'w') as f:
    json.dump(summary, f, indent=2)

print(f"\n=== SUMMARY ===", flush=True)
print(json.dumps(summary, indent=2, ensure_ascii=False), flush=True)
