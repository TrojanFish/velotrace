# 🐳 VPS & Docker 部署指南

由于项目需要在中国等地区提供更稳定的访问体验，你可以将其部署在自己的 VPS 上。

## 🛠️ 前置要求

在你的 VPS 上，你需要安装以下软件：
- [Docker](https://docs.docker.com/get-docker/)
- [Docker Compose](https://docs.docker.com/compose/install/)

## 🚀 部署步骤

### 1. 克隆代码
```bash
git clone https://github.com/TrojanFish/velotrace.git
cd velotrace
```

### 2. 配置环境变量
将 `.env.example` 复制并重命名为 `.env`，填入你的 Strava API 和认证密钥。

```bash
cp .env.example .env
# 使用 vim 或 nano 编辑 .env
```

### 3. 构建并运行镜像
使用 Docker Compose 自动处理构建和运行流程：

```bash
docker compose up -d --build
```

应用现在应该运行在 `http://your-vps-ip:3000`。

## 🛡️ 反向代理建议 (Nginx + SSL)

推荐在 Docker 容器前加一层 Nginx 以提供 HTTPS 支持。以下是一个基础的 Nginx 配置方案：

```nginx
server {
    listen 80;
    server_name yourdomain.com;
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl;
    server_name yourdomain.com;

    ssl_certificate /etc/letsencrypt/live/yourdomain.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/yourdomain.com/privkey.pem;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

## 🛠️ 常见管理命令

- **查看日志**: `docker-compose logs -f`
- **停止运行**: `docker-compose down`
- **更新代码**: 
  ```bash
  git pull
  docker compose up -d --build
  ```

---
**VeloTrace Team** 🚴
