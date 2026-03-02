# 🛒 淘宝商城 - Cloudflare D1数据库版

## 部署信息
- **Worker名称**: taobao-d1-807504
- **数据库**: Cloudflare D1 (taobao-d1-db)
- **API令牌**: 12d48135-9d9c-43cd-bec6-843dfb22e665
- **部署时间**: 2026/3/2 20:50:07

## 快速部署

### Linux/macOS
```bash
cd cloudflare-d1-deploy
bash deploy.sh
```

### Windows
```bash
cd cloudflare-d1-deploy
deploy.bat
```

## 手动部署步骤

### 1. 设置环境变量
```bash
export CLOUDFLARE_API_TOKEN="12d48135-9d9c-43cd-bec6-843dfb22e665"
```

### 2. 创建D1数据库
```bash
npx wrangler d1 create taobao-d1-db
```

### 3. 获取数据库ID并更新配置
```bash
DB_ID=$(npx wrangler d1 list --json | jq -r '.[0].uuid')
sed -i "s/database_id = \"\"/database_id = \"$DB_ID\"/" wrangler.toml
```

### 4. 部署Worker
```bash
npx wrangler deploy
```

## 访问地址
部署成功后访问：
```
https://taobao-d1-807504.your-username.workers.dev
```

## API端点

### 健康检查
```
GET /api/health
```

### 商品列表
```
GET /api/products
```

### 初始化数据库
```
POST /api/init-db
```

## 数据库结构
- **products** - 商品表
- **categories** - 分类表  
- **users** - 用户表

## 测试数据
初始化后会插入5个示例商品和3个分类。

## 技术支持
如果部署遇到问题：
1. 检查API令牌权限
2. 确认网络连接
3. 查看Cloudflare Dashboard
4. 运行 `npx wrangler tail` 查看日志

---
*文件位置: C:\Users\Administrator\.openclaw\workspace\web-learning\cloudflare-d1-deploy*
