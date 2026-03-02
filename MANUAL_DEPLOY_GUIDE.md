# 🔧 手动部署到Cloudflare指南

由于API令牌认证问题，这里提供完整的手动部署步骤。

## 📋 部署前准备

### 1. 获取正确的API令牌
1. 登录 [Cloudflare Dashboard](https://dash.cloudflare.com)
2. 进入 **My Profile** → **API Tokens**
3. 点击 **Create Token**
4. 使用模板 **"Edit Cloudflare Workers"**
5. 需要的权限：
   - Account: Workers Scripts: Edit
   - Account: Workers Routes: Edit
   - Zone: Zone: Read（如果使用自定义域名）
6. 复制生成的令牌

### 2. 检查账户状态
- 确认账户有Workers权限
- 检查账户是否被限制
- 确认网络可以访问Cloudflare API

## 🚀 手动部署步骤

### 方法1：Cloudflare Dashboard（最简单）

#### 步骤1：登录Dashboard
1. 访问 https://dash.cloudflare.com
2. 登录你的账户

#### 步骤2：创建Worker
1. 左侧菜单点击 **Workers & Pages**
2. 点击 **Create application**
3. 选择 **Create Worker**

#### 步骤3：配置Worker
1. **名称**: `taobao-mall`（或自定义）
2. **HTTP handler**: 选择默认
3. 点击 **Create Worker**

#### 步骤4：粘贴代码
1. 复制 `cloudflare-deploy/worker.js` 的全部内容
2. 粘贴到Worker编辑器中
3. 点击 **Save and deploy**

#### 步骤5：测试部署
访问你的Worker URL：
```
https://taobao-mall.your-username.workers.dev
```

### 方法2：Wrangler CLI（命令行）

#### 步骤1：安装Wrangler
```bash
npm install -g wrangler
```

#### 步骤2：登录
```bash
wrangler login
```
这会打开浏览器进行OAuth登录。

#### 步骤3：部署
```bash
cd cloudflare-deploy
wrangler deploy
```

#### 步骤4：使用API令牌（如果登录失败）
```bash
# 设置环境变量
export CLOUDFLARE_API_TOKEN="你的API令牌"
export CLOUDFLARE_ACCOUNT_ID="你的账户ID"

# 部署
wrangler deploy
```

### 方法3：GitHub Actions（自动化）

#### 步骤1：创建GitHub Secrets
在GitHub仓库设置中添加：
- `CF_API_TOKEN`: Cloudflare API令牌
- `CF_ACCOUNT_ID`: Cloudflare账户ID

#### 步骤2：创建工作流
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
      - uses: cloudflare/wrangler-action@v2
        with:
          apiToken: ${{ secrets.CF_API_TOKEN }}
```

## 🔍 测试部署

### 测试端点
部署成功后，测试以下端点：

1. **健康检查**
   ```
   GET https://your-worker.workers.dev/api/health
   ```

2. **商品列表**
   ```
   GET https://your-worker.workers.dev/api/products
   ```

3. **商品分类**
   ```
   GET https://your-worker.workers.dev/api/categories
   ```

4. **用户登录**
   ```
   POST https://your-worker.workers.dev/api/auth/login
   Content-Type: application/json
   
   {
     "username": "testuser",
     "password": "123456"
   }
   ```

### 测试账号
- 用户名: `testuser`
- 密码: `123456`

## 🛠️ 故障排除

### 问题1：API令牌无效
**症状**: 错误代码10001
**解决方案**:
1. 生成新的API令牌
2. 确保有足够权限
3. 检查令牌是否过期

### 问题2：Worker部署失败
**症状**: 部署时出错
**解决方案**:
1. 检查代码语法
2. 确保Worker名称唯一
3. 检查账户限制

### 问题3：无法访问Worker
**症状**: 404错误
**解决方案**:
1. 确认Worker已部署
2. 检查URL是否正确
3. 查看Worker日志

### 问题4：CORS错误
**症状**: 前端无法调用API
**解决方案**:
1. 在Worker代码中添加CORS头
2. 配置正确的来源域名

## 📊 部署后配置

### 1. 自定义域名
1. 在Worker设置中添加自定义域名
2. 配置DNS记录
3. 等待SSL证书颁发

### 2. 环境变量
在Worker设置中添加：
- `JWT_SECRET`: JWT密钥
- `API_BASE_URL`: API基础URL
- `ENVIRONMENT`: 环境标识

### 3. 监控和日志
1. 启用Worker日志
2. 设置告警
3. 监控性能指标

### 4. 数据库集成（可选）
如果需要真实数据库：
1. 创建Cloudflare D1数据库
2. 导入 `database/schema.sql`
3. 修改Worker使用D1

## 🔗 相关资源

### 文档
- [Cloudflare Workers文档](https://developers.cloudflare.com/workers/)
- [Wrangler CLI文档](https://developers.cloudflare.com/workers/wrangler/)
- [D1数据库文档](https://developers.cloudflare.com/d1/)

### 工具
- [Cloudflare Dashboard](https://dash.cloudflare.com)
- [Wrangler GitHub](https://github.com/cloudflare/workers-sdk)
- [Workers Playground](https://cloudflareworkers.com)

### 社区支持
- [Cloudflare社区](https://community.cloudflare.com/)
- [GitHub Issues](https://github.com/cloudflare/workers-sdk/issues)
- [Discord服务器](https://discord.cloudflare.com/)

## 🎯 快速检查清单

### 部署前
- [ ] 有效的Cloudflare账户
- [ ] 正确的API令牌
- [ ] 网络连接正常
- [ ] 代码无语法错误

### 部署中
- [ ] Worker名称唯一
- [ ] 代码正确粘贴
- [ ] 配置环境变量
- [ ] 保存并部署

### 部署后
- [ ] 测试健康检查
- [ ] 验证API端点
- [ ] 检查前端访问
- [ ] 配置监控告警

## 📞 获取帮助

如果仍然遇到问题：

1. **检查日志**
   ```bash
   wrangler tail
   ```

2. **查看文档**
   - `CLOUDFLARE_DEPLOY.md`
   - `BACKEND_SETUP.md`

3. **社区支持**
   - GitHub Issues
   - Cloudflare社区
   - Stack Overflow

4. **联系维护者**
   - 通过GitHub Issues
   - 项目文档中的联系方式

---
**最后更新**: 2026-03-02  
**部署状态**: 准备就绪  
**支持**: 完整文档和工具已提供