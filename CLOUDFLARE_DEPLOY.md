# Cloudflare Workers 部署指南

将淘宝商城全栈应用部署到Cloudflare Workers，包含前端静态文件和后端API服务。

## 部署方案

### 方案一：全栈部署（推荐）
将前端静态文件和后端API都部署到同一个Worker，实现一体化部署。

### 方案二：前后端分离
- 前端：Cloudflare Pages（静态托管）
- 后端：Cloudflare Workers（API服务）
- 数据库：Cloudflare D1（SQLite数据库）

## 快速开始（方案一：全栈部署）

### 1. 准备部署文件

```bash
# 进入部署目录
cd cloudflare-deploy

# 安装wrangler（如果未安装）
npm install -g wrangler
```

### 2. 登录Cloudflare

```bash
# 登录Cloudflare账户
wrangler login

# 检查登录状态
wrangler whoami
```

### 3. 配置项目

编辑 `wrangler.toml` 文件：
- 修改 `name` 为你的项目名称
- 如果需要自定义域名，修改 `route` 配置
- 配置环境变量

### 4. 部署到Cloudflare Workers

```bash
# 部署到workers.dev子域名
wrangler deploy

# 或部署到自定义环境
wrangler deploy --env production
```

### 5. 访问你的应用

部署成功后，你会获得一个类似这样的URL：
```
https://taobao-fullstack.your-username.workers.dev
```

## 方案二：前后端分离部署

### 前端部署（Cloudflare Pages）

1. **准备前端文件**
```bash
# 将前端文件复制到pages目录
mkdir -p cloudflare-pages
cp -r index.html css/ js/ img/ cloudflare-pages/
```

2. **创建Pages项目**
   - 登录Cloudflare Dashboard
   - 进入 "Workers & Pages"
   - 点击 "Create application" → "Pages"
   - 连接GitHub仓库或直接上传文件夹

3. **配置构建设置**
   - 构建命令：留空（静态站点）
   - 构建输出目录：`cloudflare-pages`
   - 根目录：`cloudflare-pages`

### 后端部署（Cloudflare Workers + D1数据库）

1. **创建D1数据库**
```bash
# 创建数据库
wrangler d1 create taobao-db

# 初始化数据库
wrangler d1 execute taobao-db --file=../database/schema.sql
```

2. **配置Worker使用D1**
在 `wrangler.toml` 中添加：
```toml
[[d1_databases]]
binding = "DB"
database_name = "taobao-db"
database_id = "your-database-id-here"
```

3. **部署API Worker**
```bash
cd backend
wrangler deploy
```

## 数据库迁移到Cloudflare D1

### 1. 创建D1数据库
```bash
wrangler d1 create taobao-database
```

### 2. 导出SQLite数据
```bash
# 从本地SQLite导出
sqlite3 taobao.db .dump > taobao_dump.sql

# 清理SQLite特定语法
sed -i 's/AUTOINCREMENT/AUTO_INCREMENT/g' taobao_dump.sql
```

### 3. 导入到D1
```bash
wrangler d1 execute taobao-database --file=taobao_dump.sql
```

### 4. 修改后端代码使用D1
创建新的Worker文件 `d1-worker.js`：
```javascript
export default {
  async fetch(request, env) {
    const { pathname } = new URL(request.url);
    
    if (pathname.startsWith('/api/')) {
      return handleAPI(request, env.DB);
    }
    
    return new Response('Not Found', { status: 404 });
  }
};

async function handleAPI(request, db) {
  const { pathname, searchParams } = new URL(request.url);
  
  if (pathname === '/api/products') {
    const { results } = await db.prepare(
      'SELECT * FROM products WHERE status = "active" LIMIT 20'
    ).all();
    
    return new Response(JSON.stringify(results), {
      headers: { 'Content-Type': 'application/json' }
    });
  }
  
  // 其他API处理...
}
```

## 环境变量配置

### 1. 在wrangler.toml中配置
```toml
[vars]
JWT_SECRET = "your-secret-key"
API_BASE_URL = "https://api.yourdomain.com"
ENVIRONMENT = "production"
```

### 2. 在Cloudflare Dashboard中配置
1. 进入Worker设置
2. 选择 "Settings" → "Variables"
3. 添加环境变量

### 3. 在代码中使用
```javascript
const jwtSecret = env.JWT_SECRET;
const environment = env.ENVIRONMENT;
```

## 静态文件托管

### 使用KV存储
1. **创建KV命名空间**
```bash
wrangler kv:namespace create STATIC_ASSETS
```

2. **上传静态文件**
```bash
# 上传单个文件
wrangler kv:key put --binding=STATIC_ASSETS "index.html" --path=index.html

# 批量上传
wrangler kv:bulk put --binding=STATIC_ASSETS static-files.json
```

3. **在Worker中读取**
```javascript
async function getStaticFile(path) {
  return await env.STATIC_ASSETS.get(path);
}
```

### 使用R2存储（推荐）
1. **创建R2存储桶**
```bash
wrangler r2 bucket create static-assets
```

2. **上传文件**
```bash
wrangler r2 object put static-assets/index.html --file=index.html
```

3. **配置公开访问**
在R2设置中启用公共访问权限。

## 域名配置

### 1. 添加自定义域名
1. 进入Worker设置
2. 选择 "Triggers" → "Custom Domains"
3. 点击 "Add Custom Domain"
4. 输入你的域名

### 2. DNS配置
在Cloudflare DNS中添加CNAME记录：
```
类型: CNAME
名称: taobao
内容: your-worker.your-username.workers.dev
代理状态: 已代理
```

## 监控和日志

### 1. 启用日志
```toml
[logpush]
enabled = true
```

### 2. 查看日志
```bash
# 实时日志
wrangler tail

# 特定时间范围
wrangler tail --format=pretty
```

### 3. 性能监控
1. 进入Cloudflare Dashboard
2. 选择 "Analytics" → "Workers"
3. 查看请求量、错误率、执行时间等

## 安全配置

### 1. 限制访问
```javascript
// 限制特定IP
const allowedIPs = ['192.168.1.0/24'];
const clientIP = request.headers.get('CF-Connecting-IP');

if (!allowedIPs.some(ip => isIPInRange(clientIP, ip))) {
  return new Response('Access Denied', { status: 403 });
}
```

### 2. API密钥验证
```javascript
// 验证API密钥
const apiKey = request.headers.get('X-API-Key');
if (apiKey !== env.API_KEY) {
  return new Response('Invalid API Key', { status: 401 });
}
```

### 3. CORS配置
```javascript
const corsHeaders = {
  'Access-Control-Allow-Origin': 'https://your-frontend.com',
  'Access-Control-Allow-Methods': 'GET,POST,PUT,DELETE,OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type,Authorization'
};
```

## 自动部署

### 1. GitHub Actions
创建 `.github/workflows/deploy.yml`：
```yaml
name: Deploy to Cloudflare
on:
  push:
    branches: [ main ]
jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
      - run: npm ci
      - run: npm run build
      - uses: cloudflare/wrangler-action@v2
        with:
          apiToken: ${{ secrets.CF_API_TOKEN }}
```

### 2. 环境变量配置
在GitHub仓库设置中添加：
- `CF_API_TOKEN`: Cloudflare API令牌
- `CF_ACCOUNT_ID`: Cloudflare账户ID

## 故障排除

### 常见问题

**Q: 部署失败 "Authentication Error"**
```
A: 运行 wrangler login 重新登录
```

**Q: Worker超时**
```
A: 增加CPU时间限制，优化代码性能
```

**Q: 数据库连接失败**
```
A: 检查D1数据库绑定配置，确保数据库已创建
```

**Q: 静态文件404**
```
A: 检查KV/R2绑定，确认文件已上传
```

**Q: CORS错误**
```
A: 检查CORS头配置，确保前端域名被允许
```

### 调试工具
```bash
# 本地测试
wrangler dev

# 查看部署状态
wrangler deployments list

# 查看Worker信息
wrangler info

# 删除Worker
wrangler delete <worker-name>
```

## 成本优化

### 1. 免费额度
- Workers: 每天100,000次请求
- D1: 每天最多5百万次读取操作
- R2: 每月10GB存储，100万次操作
- Pages: 无限请求，500个构建/月

### 2. 优化建议
- 启用缓存减少数据库查询
- 使用KV缓存频繁访问的数据
- 压缩静态文件
- 启用Brotli压缩

### 3. 监控用量
```bash
# 查看用量
wrangler analytics
```

## 备份和恢复

### 1. 数据库备份
```bash
# 导出D1数据
wrangler d1 export taobao-db --output=backup.sql

# 导入数据
wrangler d1 execute taobao-db --file=backup.sql
```

### 2. Worker配置备份
```bash
# 导出Worker配置
wrangler config
```

### 3. 静态文件备份
```bash
# 从R2下载文件
wrangler r2 object get static-assets/index.html --file=index.html.backup
```

## 扩展功能

### 1. 添加CDN缓存
```javascript
// 设置缓存头
const cacheHeaders = {
  'Cache-Control': 'public, max-age=3600',
  'CDN-Cache-Control': 'public, max-age=86400'
};
```

### 2. 启用边缘计算
```javascript
// 在边缘处理请求
addEventListener('fetch', event => {
  event.respondWith(handleRequest(event.request));
});
```

### 3. 集成其他Cloudflare服务
- **Cloudflare Images**: 图片优化和托管
- **Cloudflare Stream**: 视频托管
- **Cloudflare Queues**: 异步任务处理
- **Cloudflare Email Routing**: 邮件处理

## 支持资源

- [Cloudflare Workers文档](https://developers.cloudflare.com/workers/)
- [D1数据库文档](https://developers.cloudflare.com/d1/)
- [R2存储文档](https://developers.cloudflare.com/r2/)
- [Pages文档](https://developers.cloudflare.com/pages/)
- [社区论坛](https://community.cloudflare.com/)
- [Discord支持](https://discord.cloudflare.com/)

## 紧急恢复

如果部署出现问题：

1. **回滚到上一个版本**
```bash
wrangler rollback
```

2. **禁用Worker**
```bash
wrangler publish --dry-run
```

3. **联系支持**
- Cloudflare Dashboard → Support
- 社区论坛
- 企业客户支持热线