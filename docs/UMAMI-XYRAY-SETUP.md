# Umami HTTPS 配置指南（xray 共存方案）

## ✅ 解决方案

**不占用 443 端口**，使用 **8080/8443** 端口，通过 xray 反向代理实现 HTTPS。

---

## 📋 当前配置

### Nginx 配置
- **HTTP 端口**: 8080
- **HTTPS 端口**: 8443
- **域名**: stats.ai-master.cc
- **SSL 证书**: Let's Encrypt（已安装）

### 测试结果
```bash
# curl 测试成功
$ curl -kI https://localhost:8443
HTTP/1.1 200 OK
Server: nginx/1.24.0 (Ubuntu)
```

---

## 🔧 xray 配置步骤

### 方案 1：使用 x-ui 面板添加反向代理（推荐）

1. **登录 x-ui 面板**
   - 访问：`https://45.77.121.84:你的 x-ui 端口`
   - 账号密码：你的 x-ui 登录信息

2. **添加入站配置**
   ```json
   {
     "listen": "0.0.0.0",
     "port": 443,
     "protocol": "vless",
     "settings": {
       "clients": [
         {
           "email": "umami",
           "id": "你的 UUID",
           "flow": ""
         }
       ],
       "decryption": "none"
     },
     "streamSettings": {
       "network": "tcp",
       "realitySettings": {
         "serverNames": ["www.amd.com"],
         "privateKey": "你的私钥",
         "shortIds": ["你的 shortId"]
       }
     },
     "sniffing": {
       "enabled": true,
       "destOverride": ["http", "tls"]
     }
   }
   ```

3. **添加路由规则**
   - 在 x-ui 面板的"路由"或"配置"中添加：
   ```json
   {
     "type": "field",
     "domain": ["stats.ai-master.cc"],
     "outboundTag": "umami"
   }
   ```

4. **添加出站配置**
   ```json
   {
     "protocol": "freedom",
     "tag": "umami",
     "settings": {
       "domainStrategy": "UseIP"
     }
   }
   ```

### 方案 2：手动修改 xray 配置文件

1. **编辑 xray 配置**
   ```bash
   ssh root@45.77.121.84
   nano /usr/local/x-ui/bin/config.json
   ```

2. **添加 inbound 配置**
   在 `inbounds` 数组中添加：
   ```json
   {
     "listen": "0.0.0.0",
     "port": 443,
     "protocol": "vless",
     "settings": {
       "clients": [
         {
           "email": "umami-stats",
           "id": "54346135-97e3-4855-af52-2abb0b796eb9",
           "flow": ""
         }
       ],
       "decryption": "none"
     },
     "streamSettings": {
       "network": "tcp",
       "realitySettings": {
         "serverNames": ["stats.ai-master.cc"],
         "privateKey": "yO7Y66qsiAb2tP-vUu1VrDUAqA9WbqTycWkpmcE--08",
         "shortIds": ["", "0123456789abcdef"]
       }
     },
     "sniffing": {
       "enabled": true,
       "destOverride": ["http", "tls"]
     },
     "tag": "umami-inbound"
   }
   ```

3. **添加 routing 规则**
   在 `routing.rules` 数组中添加：
   ```json
   {
     "type": "field",
     "domain": ["stats.ai-master.cc"],
     "outboundTag": "umami-proxy"
   }
   ```

4. **添加 outbound 配置**
   在 `outbounds` 数组中添加：
   ```json
   {
     "protocol": "freedom",
     "tag": "umami-proxy",
     "settings": {
       "redirect": "127.0.0.1:8443"
     }
   }
   ```

5. **重启 xray**
   ```bash
   systemctl restart x-ui
   ```

---

## 🌐 DNS 配置

### 域名解析记录

| 类型 | 主机记录 | 记录值 | TTL |
|------|---------|--------|-----|
| A | stats | 45.77.121.84 | 10 分钟 |

**DNS 生效后访问**: https://stats.ai-master.cc

---

## 🧪 测试访问

### 1. 本地测试
```bash
# 测试 Nginx
curl -kI https://localhost:8443

# 应该返回 HTTP/1.1 200 OK
```

### 2. 域名测试
```bash
# 测试域名访问
curl -kI https://stats.ai-master.cc:8443

# 或者通过 xray 代理后访问
curl -I https://stats.ai-master.cc
```

### 3. 浏览器访问
- **临时访问**: https://45.77.121.84:8443
- **正式访问**: https://stats.ai-master.cc（需要 xray 配置）

---

## 🔐 SSL 证书自动续期

证书已配置自动续期，无需手动操作。

**手动测试续期**:
```bash
certbot renew --dry-run
```

**证书信息**:
- 颁发机构：Let's Encrypt
- 有效期：90 天
- 到期日期：2026-06-28

---

## 📊 Umami 登录信息

- **URL**: https://stats.ai-master.cc
- **账号**: admin
- **密码**: umami
- **Website ID**: 5b596de5-1f54-44da-b8b7-547ab465f339

---

## ⚠️ 注意事项

1. **不要禁用 xray** - 这是你的梯子工具
2. **端口不冲突** - Nginx 使用 8080/8443，xray 使用 443
3. **需要 xray 配置** - 必须配置 xray 反向代理才能通过域名访问
4. **DNS 生效时间** - 可能需要几分钟到几小时

---

## 🆘 故障排查

### 问题 1: 无法访问 8443 端口
```bash
# 检查 Nginx 状态
systemctl status nginx

# 检查端口监听
ss -tlnp | grep nginx

# 重启 Nginx
killall -9 nginx && nginx
```

### 问题 2: xray 配置后仍无法访问
```bash
# 检查 xray 配置
cat /usr/local/x-ui/bin/config.json

# 重启 x-ui
systemctl restart x-ui

# 查看日志
journalctl -u x-ui -f
```

### 问题 3: SSL 证书问题
```bash
# 检查证书
openssl s_client -connect localhost:8443 -servername stats.ai-master.cc

# 证书路径
ls -la /etc/letsencrypt/live/stats.ai-master.cc/
```

---

**配置完成时间**: 2026-03-30 15:43  
**技术支持**: 奥利奥 🍪
