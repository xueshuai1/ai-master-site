#!/usr/bin/env python3
"""
上传图片到七牛云 CDN
用法：
  python3 scripts/upload-to-qiniu.py                    # 上传 public/images/ 下所有图片
  python3 scripts/upload-to-qiniu.py news               # 只上传 news 目录
  python3 scripts/upload-to-qiniu.py blogs              # 只上传 blogs 目录
  python3 scripts/upload-to-qiniu.py news/funding.jpg   # 只上传单个文件
"""
import os
import sys
import json
from typing import Optional
import qiniu

# 七牛云配置
AK = os.environ.get("QINIU_AK", "KuAOFEcR3z7xo27R5hl3kJcqNz8ll-7zm2eeAtuk")
SK = os.environ.get("QINIU_SK", "RN_X3__g71X2E8TRjlRHZJC5yp3SxlzFLIiBdWO8")
BUCKET = "ai-master-site"
CDN_BASE = "http://tdewkptsq.hd-bkt.clouddn.com"

PROJECT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
IMG_DIR = os.path.join(PROJECT, "public", "images")

VALID_EXTS = {'.jpg', '.jpeg', '.png', '.webp', '.gif', '.svg'}

def upload_file(local_path: str, key: str) -> Optional[str]:
    """上传单个文件，返回 CDN URL"""
    auth = qiniu.Auth(AK, SK)
    token = auth.upload_token(BUCKET, key, 3600)
    ret, info = qiniu.put_file(token, key, local_path)
    
    if info.status_code == 200:
        return f"{CDN_BASE}/{key}"
    else:
        print(f"  ❌ {key} failed: {info.status_code} {info.error}")
        return None

def main():
    auth = qiniu.Auth(AK, SK)
    
    targets = sys.argv[1:] if len(sys.argv) > 1 else []
    
    files_to_upload = []
    
    if not targets:
        # 上传所有图片
        for subdir in os.listdir(IMG_DIR):
            subdir_path = os.path.join(IMG_DIR, subdir)
            if not os.path.isdir(subdir_path):
                continue
            for filename in os.listdir(subdir_path):
                if os.path.splitext(filename)[1].lower() in VALID_EXTS:
                    local_path = os.path.join(subdir_path, filename)
                    key = f"images/{subdir}/{filename}"
                    files_to_upload.append((local_path, key))
    else:
        for target in targets:
            # 可能是 "news", "blogs", 或 "news/funding.jpg"
            if '/' in target:
                # 单个文件
                local_path = os.path.join(IMG_DIR, target)
                if os.path.exists(local_path):
                    key = f"images/{target}"
                    files_to_upload.append((local_path, key))
                else:
                    print(f"⚠️  文件不存在: {local_path}")
            else:
                # 整个子目录
                subdir_path = os.path.join(IMG_DIR, target)
                if os.path.isdir(subdir_path):
                    for filename in os.listdir(subdir_path):
                        if os.path.splitext(filename)[1].lower() in VALID_EXTS:
                            local_path = os.path.join(subdir_path, filename)
                            key = f"images/{target}/{filename}"
                            files_to_upload.append((local_path, key))
                else:
                    print(f"⚠️  目录不存在: {subdir_path}")
    
    if not files_to_upload:
        print("没有找到需要上传的图片")
        return
    
    print(f"📤 开始上传 {len(files_to_upload)} 张图片到七牛云...\n")
    
    success = 0
    failed = 0
    url_map = {}
    
    for local_path, key in files_to_upload:
        url = upload_file(local_path, key)
        if url:
            # 替换本地引用为 CDN URL
            old_ref = f"/{key}"
            url_map[old_ref] = url
            print(f"  ✅ {key}")
            success += 1
        else:
            failed += 1
    
    print(f"\n📊 结果: ✅ {success} 成功, ❌ {failed} 失败")
    
    if url_map:
        print(f"\n📋 CDN URL 映射 ({len(url_map)} 条):")
        for old, new in sorted(url_map.items()):
            print(f"  {old} → {new}")

if __name__ == "__main__":
    main()
