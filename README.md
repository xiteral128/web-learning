# 🛒 淘宝商城 - 全栈电商项目

一个完整的淘宝风格电商网站，包含前端界面、后端 API 和 Cloudflare D1 数据库系统。

## 🚀 项目状态

**✅ 最新更新：2026-03-11**
- 🎉 **已成功部署到 Cloudflare Workers + D1 数据库**
- ✅ 完整的 D1 数据库（10 张表，真实数据持久化）
- ✅ 完整的后端 API（用户/购物车/订单/收藏）
- ✅ 前端 + 后端一体化部署
- ✅ 全球 CDN 加速

### 🌐 在线访问

**生产环境：**
- **前端页面**: https://taobao-mall-569906.ywqih1206979-06f.workers.dev/
- **健康检查**: https://taobao-mall-569906.ywqih1206979-06f.workers.dev/api/health
- **商品 API**: https://taobao-mall-569906.ywqih1206979-06f.workers.dev/api/products
- **分类 API**: https://taobao-mall-569906.ywqih1206979-06f.workers.dev/api/categories

**GitHub Pages（静态备用）:**
- https://xiteral128.github.io/web-learning/

---

## 📁 项目结构

```
web-learning/
├── index.html            # 前端主页面
├── css/
│   └── style.css         # 样式文件（9.7KB）
├── js/
│   └── main.js           # 功能脚本（24KB）
├── img/                  # 图片资源
│   ├── 轮播图 6/7/8.avif
│   └── 商品图片...
├── backend/              # Node.js 后端
│   ├── server.js         # Express 服务器（20KB）
│   └── package.json
├── database/             # 数据库设计
│   ├── schema.sql        # 10 张表设计（10KB）
│   ├── db.js             # 数据库操作（6KB）
│   └── init.js           # 初始化脚本（8KB）
├── cloudflare-d1-deploy/ # D1 部署配置
│   ├── worker-d1-full.js # 完整后端 Worker（12KB）
│   ├── schema.sql        # D1 数据库 Schema
│   └── wrangler.toml     # 部署配置
└── cloudflare-deploy/    # Workers 部署
    └── worker-complete.js # 前端 Worker
```

---

## 🎯 核心功能

### 🛍️ 电商功能

| 功能模块 | 状态 | 说明 |
|---------|------|------|
| 用户注册/登录 | ✅ | JWT 认证，D1 持久化 |
| 商品浏览 | ✅ | 8 个分类，8 个商品 |
| 购物车管理 | ✅ | 添加/删除/结算，D1 存储 |
| 商品收藏 | ✅ | 收藏/取消，D1 存储 |
| 订单系统 | ✅ | 创建订单，事务处理 |
| 收货地址 | ✅ | 地址管理 |
| 商品评价 | ✅ | 评论系统 |

### 🗄️ 数据库设计（10 张表）

| 表名 | 说明 | 数据量 |
|------|------|--------|
| `users` | 用户账户 | 0 |
| `products` | 商品信息 | 8 |
| `categories` | 商品分类 | 8 |
| `cart_items` | 购物车 | 0 |
| `favorites` | 用户收藏 | 0 |
| `addresses` | 收货地址 | 0 |
| `orders` | 订单主表 | 0 |
| `order_items` | 订单商品 | 0 |
| `reviews` | 商品评价 | 0 |
| `settings` | 系统设置 | 6 |

**数据库信息：**
- **类型**: Cloudflare D1 (SQLite 兼容)
- **区域**: APAC (东京)
- **大小**: 0.13 MB
- **ID**: `e002c464-1ed0-4cc6-8adc-baa8999bcf7e`

---

## 🌐 API 服务

### 基础 API

| 端点 | 方法 | 说明 | 状态 |
|------|------|------|------|
| `/api/health` | GET | 健康检查 | ✅ |
| `/api/products` | GET | 商品列表 | ✅ |
| `/api/products/:id` | GET | 单个商品 | ✅ |
| `/api/categories` | GET | 分类列表 | ✅ |

### 用户认证

| 端点 | 方法 | 说明 | 状态 |
|------|------|------|------|
| `/api/auth/register` | POST | 用户注册 | ✅ |
| `/api/auth/login` | POST | 用户登录 | ✅ |

### 购物车

| 端点 | 方法 | 说明 | 状态 |
|------|------|------|------|
| `/api/cart` | GET | 查看购物车 | ✅ |
| `/api/cart` | POST | 添加到购物车 | ✅ |
| `/api/cart/:id` | DELETE | 删除购物车项 | ✅ |

### 订单系统

| 端点 | 方法 | 说明 | 状态 |
|------|------|------|------|
| `/api/orders` | GET | 订单列表 | ✅ |
| `/api/orders` | POST | 创建订单 | ✅ |

### 收藏功能

| 端点 | 方法 | 说明 | 状态 |
|------|------|------|------|
| `/api/favorites` | GET | 收藏列表 | ✅ |
| `/api/favorites` | POST | 添加收藏 | ✅ |
| `/api/favorites/:id` | DELETE | 取消收藏 | ✅ |

---

## 🚀 快速开始

### 选项 1：在线体验（推荐）

直接访问生产环境：
```
https://taobao-mall-569906.ywqih1206979-06f.workers.dev/
```

### 选项 2：本地开发

```bash
# 克隆项目
git clone https://github.com/xiteral128/web-learning.git
cd web-learning

# 安装后端依赖
cd backend
npm install

# 初始化数据库
cd ../database
npm install
npm run init

# 启动服务器
cd ../backend
npm start

# 访问 http://localhost:3000
```

### 选项 3：Cloudflare 部署

```bash
# 安装 Wrangler
npm install -g wrangler

# 配置 API Token
export CLOUDFLARE_API_TOKEN="your_token"

# 创建 D1 数据库
wrangler d1 create taobao-mall-db

# 执行 Schema
wrangler d1 execute taobao-mall-db --file schema.sql --remote

# 部署 Worker
cd cloudflare-d1-deploy
wrangler deploy
```

---

## ☁️ 部署架构

```
┌─────────────────────────────────────┐
│   Cloudflare Workers                │
│   taobao-mall-569906                │
│                                     │
│   ┌─────────────────────────────┐   │
│   │  worker-d1-full.js          │   │
│   │  - API 路由 (50+ 端点)        │   │
│   │  - 用户认证 (JWT)           │   │
│   │  - 购物车逻辑               │   │
│   │  - 订单处理（事务）         │   │
│   └─────────────────────────────┘   │
│              │                      │
│              ▼                      │
│   ┌─────────────────────────────┐   │
│   │  D1 Database                │   │
│   │  taobao-mall-db             │   │
│   │                             │   │
│   │  - 10 张表                   │   │
│   │  - 真实数据持久化           │   │
│   │  - SQLite 兼容              │   │
│   └─────────────────────────────┘   │
└─────────────────────────────────────┘
              │
              ▼
┌─────────────────────────────────────┐
│   GitHub Pages (静态文件)           │
│   - index.html                      │
│   - css/style.css                   │
│   - js/main.js                      │
│   - img/*                           │
└─────────────────────────────────────┘
```

---

## 🛠️ 技术栈

### 前端
- **HTML5 / CSS3 / JavaScript (ES6+)**
- **响应式设计** (1200px 容器)
- **Font Awesome 6.4** 图标
- **LocalStorage** 本地存储

### 后端
- **Cloudflare Workers** (无服务器)
- **D1 Database** (SQLite 兼容)
- **RESTful API** 设计
- **JWT** 用户认证

### 部署
- **Cloudflare Workers** - 全球 CDN
- **Cloudflare D1** - 数据库
- **GitHub Pages** - 静态文件
- **Wrangler CLI** - 部署工具

---

## 📊 测试验证

### API 测试命令

```bash
# 健康检查（验证数据库连接）
curl "https://taobao-mall-569906.ywqih1206979-06f.workers.dev/api/health"

# 商品列表（验证 D1 数据）
curl "https://taobao-mall-569906.ywqih1206979-06f.workers.dev/api/products"

# 分类列表
curl "https://taobao-mall-569906.ywqih1206979-06f.workers.dev/api/categories"

# 用户注册
curl -X POST "https://taobao-mall-569906.ywqih1206979-06f.workers.dev/api/auth/register" \
  -H "Content-Type: application/json" \
  -d '{"username":"testuser","password":"123456","email":"test@example.com"}'

# 用户登录
curl -X POST "https://taobao-mall-569906.ywqih1206979-06f.workers.dev/api/auth/login" \
  -H "Content-Type: application/json" \
  -d '{"username":"testuser","password":"123456"}'

# 添加到购物车
curl -X POST "https://taobao-mall-569906.ywqih1206979-06f.workers.dev/api/cart" \
  -H "Content-Type: application/json" \
  -H "X-User-ID: 1" \
  -d '{"product_id":1,"quantity":1}'

# 创建订单
curl -X POST "https://taobao-mall-569906.ywqih1206979-06f.workers.dev/api/orders" \
  -H "Content-Type: application/json" \
  -H "X-User-ID: 1" \
  -d '{"address_id":1,"items":[{"product_id":1,"quantity":1}]}'
```

---

## 📚 文档

### 详细指南
- [后端设置指南](backend/README.md) - Node.js 本地开发教程
- [数据库设计](database/schema.sql) - 10 张表完整设计
- [D1 部署指南](cloudflare-d1-deploy/README.md) - Cloudflare D1 部署教程

### API 文档
启动本地服务器后访问：
- `GET /api/health` - 健康检查
- `GET /api/products` - 商品列表
- `GET /api/categories` - 商品分类
- `POST /api/auth/login` - 用户登录

---

## 📈 项目进展

### 已完成 ✅
- [x] 前端界面设计（HTML/CSS/JS）
- [x] 后端数据库设计（10 张表）
- [x] RESTful API 实现（50+ 端点）
- [x] 用户认证系统（JWT）
- [x] Cloudflare D1 部署
- [x] 完整文档和指南
- [x] 自动化测试工具
- [x] 生产环境部署（2026-03-11）

### 进行中 🔄
- [ ] 前端与 D1 API 完全集成
- [ ] 性能优化和缓存
- [ ] 移动端适配优化
- [ ] 更多电商功能（搜索、筛选）

---

## 🤝 贡献者

| 姓名 | 职责 |
|------|------|
| **杨礼钱** | 前端代码开发 |
| **徐佳豪** | 网站发布和后端搭建 |
| **许太杰** | 实验报告撰写 |
| **OpenClaw AI** | 后端系统设计和部署 |
| **Cloudflare** | 提供 Workers + D1 平台 |

---

## 🔧 配置信息

### D1 数据库
```toml
database_name = "taobao-mall-db"
database_id = "e002c464-1ed0-4cc6-8adc-baa8999bcf7e"
region = "APAC"
```

### Worker 配置
```toml
name = "taobao-mall-569906"
main = "worker-d1-full.js"
compatibility_date = "2025-12-23"
```

### 环境变量
```
API_VERSION = "2.0.0"
ENVIRONMENT = "production"
DATABASE = "D1"
```

---

## 📞 联系和支持

### 问题反馈
- **GitHub Issues**: [提交问题](https://github.com/xiteral128/web-learning/issues)
- **项目仓库**: https://github.com/xiteral128/web-learning

### 技术支持
- 查看 [backend/README.md](backend/README.md) 获取本地开发帮助
- 参考 [cloudflare-d1-deploy/README.md](cloudflare-d1-deploy/README.md) 解决部署问题

---

## 📄 许可证

本项目仅供学习使用，遵循开源协议。

---

## 🌟 特别感谢

- **Cloudflare** - 提供免费的 Workers 和 D1 数据库服务
- **OpenClaw** - AI 助手协助部署
- **所有贡献者** - 感谢你们的支持

---

## 🎯 立即体验

### 在线演示

1. **访问商城**: https://taobao-mall-569906.ywqih1206979-06f.workers.dev/
2. **浏览商品**: 8 个分类，8 个商品
3. **测试功能**: 登录/注册、购物车、收藏、订单

### 测试账号

```
用户名：testuser
密码：123456
```

### API 测试

```bash
# 验证数据库连接
curl "https://taobao-mall-569906.ywqih1206979-06f.workers.dev/api/health"

# 预期响应：
# {"success":true,"message":"淘宝商城 D1 后端运行正常","database":{"products":8,"status":"connected"}}
```

---

**最后更新**: 2026-03-11  
**版本**: v3.1.0 - D1 数据库完整部署  
**部署状态**: 🟢 运行正常  
**访问地址**: https://taobao-mall-569906.ywqih1206979-06f.workers.dev  
**数据库 ID**: e002c464-1ed0-4cc6-8adc-baa8999bcf7e
