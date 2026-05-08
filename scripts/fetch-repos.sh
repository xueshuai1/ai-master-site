#!/bin/bash
# Fetch GitHub repo data using curl with Authorization header
# Usage: GITHUB_TOKEN=xxx ./fetch-repos.sh repo1 repo2 ...

TOKEN="$1"
shift

for repo in "$@"; do
  echo "---FETCHING $repo---" >&2
  result=$(curl -s -H "Authorization: Bearer $TOKEN" "https://api.github.com/repos/$repo" 2>/dev/null)
  status=$(echo "$result" | python3 -c "import sys,json;d=json.load(sys.stdin);print(d.get('stargazers_count','N/A') if 'stargazers_count' in d else 'ERROR:'+d.get('message',''))" 2>/dev/null)
  echo "$repo|$status" >&2
  echo "$result"
  echo "---END---"
  sleep 1.2
done
