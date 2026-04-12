#!/bin/bash
# Update the last content update timestamp
# Run this after pushing new articles to the knowledge base

TIMESTAMP=$(TZ="Asia/Shanghai" date +"%Y-%m-%d %H:%M")
CONTENT="// 此文件由部署脚本自动生成，记录最后内容更新时间
export const LAST_UPDATE_TIME = \"${TIMESTAMP}\";
"

echo "$CONTENT" > src/data/update-time.ts
echo "Updated last update time to: ${TIMESTAMP}"
