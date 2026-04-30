#!/bin/bash
GITHUB_TOKEN=$(grep GITHUB_TOKEN .env.local | cut -d= -f2 | tr -d ' "')
echo "Token: ${GITHUB_TOKEN:0:8}..."

repos=(
"opencv/opencv"
"tesseract-ocr/tesseract"
)

for repo in "${repos[@]}"; do
  result=$(curl -s -H "Authorization: Bearer $GITHUB_TOKEN" -H "Accept: application/vnd.github+json" "https://api.github.com/repos/$repo")
  stars=$(echo "$result" | python3 -c "import sys,json; d=json.load(sys.stdin); print(d.get('stargazers_count','N/A'))")
  forks=$(echo "$result" | python3 -c "import sys,json; d=json.load(sys.stdin); print(d.get('forks_count','N/A'))")
  pushed=$(echo "$result" | python3 -c "import sys,json; d=json.load(sys.stdin); print(d.get('pushed_at','N/A')[:10])")
  lang=$(echo "$result" | python3 -c "import sys,json; d=json.load(sys.stdin); print(d.get('language') or 'N/A')")
  echo "$repo → ⭐$stars 🍴$forks 📅$pushed 🔤$lang"
  sleep 1
done
