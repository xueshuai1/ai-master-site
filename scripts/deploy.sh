#!/bin/bash
# 自动更新首页内容时间戳，然后执行 git commit + push
# 用法：./scripts/deploy.sh "commit message"

MESSAGE=${1:-"update: 内容更新"}

# macOS 兼容的北京时间获取方式
BJ_TIME=$(date -v+8H +"%Y-%m-%d %H:%M")

# 更新首页时间戳
cat > src/data/update-time.ts << EOF
// 此文件由部署脚本自动生成，记录最后内容更新时间
export const LAST_UPDATE_TIME = "${BJ_TIME}";
EOF

# git add + commit + push
git add -A
git commit -m "${MESSAGE}"
git push

echo "✅ 已更新首页时间为 ${BJ_TIME}，提交并推送完成"
