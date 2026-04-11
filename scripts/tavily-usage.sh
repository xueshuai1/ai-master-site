#!/bin/bash
# Tavily 用量追踪（免费版 1000 次/月）
# 用法:
#   bash scripts/tavily-usage.sh check   → ok / exhausted
#   bash scripts/tavily-usage.sh bump    → 增加 1 次计数，返回剩余

USAGE_FILE="/Users/xueshuai/.openclaw/workspace/ai-master-site/.tavily-usage"
LIMIT=1000
THRESHOLD=850  # 超过 850 开始预警
MONTH=$(date +%Y-%m)

# 读状态
data=$(cat "$USAGE_FILE" 2>/dev/null || echo "0|")
count="${data%%|*}"
saved_month="${data##*|}"

# 跨月重置
if [ "$saved_month" != "$MONTH" ]; then
  count=0
fi

case "$1" in
  check)
    if [ "$count" -ge "$LIMIT" ]; then
      echo "exceeded|0"
    elif [ "$count" -ge "$THRESHOLD" ]; then
      remaining=$((LIMIT - count))
      echo "warning|$remaining"
    else
      remaining=$((LIMIT - count))
      echo "ok|$remaining"
    fi
    ;;
  bump)
    count=$((count + 1))
    echo "${count}|${MONTH}" > "$USAGE_FILE"
    remaining=$((LIMIT - count))
    echo "${count}|${remaining}"
    ;;
  status)
    remaining=$((LIMIT - count))
    echo "used=${count}/${LIMIT}|remaining=${remaining}|month=${MONTH}"
    ;;
esac
