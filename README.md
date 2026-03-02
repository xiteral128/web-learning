# 🛒 淘宝商城 - 全栈电商项目

一个完整的淘宝风格电商网站，包含前端界面、后端API和数据库系统。

## 🚀 项目状态

**✅ 最新更新：2026-03-02**
- 🎉 **已成功部署到Cloudflare Workers + D1数据库**
- 添加完整的后端数据库系统（10个表）
- 实现RESTful API服务（50+端点）
- 提供Cloudflare Workers全栈部署方案
- 创建一键部署脚本和完整文档

### 🌐 在线访问
- **生产环境**: [https://taobao-d1-807504.ywqih1206979-06f.workers.dev](https://xiteral128.github.io/web-learning/)
- **API健康检查**: https://taobao-d1-807504.ywqih1206979-06f.workers.dev/api/health
- **商品API**: https://taobao-d1-807504.ywqih1206979-06f.workers.dev/api/products

## 📁 项目结构

```
web-learning/
├── frontend/              # 前端代码
│   ├── index.html        # 主页面
│   ├── css/              # 样式文件
│   ├── js/               # JavaScript
│   └── img/              # 图片资源
├── backend/              # 后端API服务
│   ├── server.js         # Express.js服务器
│   ├── package.json      # 依赖配置
│   └── README.md         # API文档
├── database/             # 数据库系统
│   ├── schema.sql        # 数据库设计
│   ├── db.js             # 数据库操作
│   ├── init.js           # 初始化脚本
│   └── package.json      # 数据库依赖
├── cloudflare-deploy/    # Cloudflare部署
│   ├── worker.js         # 全栈Worker
│   └── wrangler.toml     # 部署配置
├── BACKEND_SETUP.md      # 后端设置指南
├── CLOUDFLARE_DEPLOY.md  # Cloudflare部署指南
└── 更多工具和脚本...
```

## 🎯 核心功能

### 🛍️ 电商功能
- ✅ 用户注册/登录（JWT认证）
- ✅ 商品浏览和搜索
- ✅ 购物车管理
- ✅ 收藏功能
- ✅ 订单系统
- ✅ 收货地址管理
- ✅ 商品评价

### 🗄️ 数据库设计（10个表）
1. **users** - 用户账户
2. **products** - 商品信息
3. **categories** - 商品分类
4. **cart_items** - 购物车
5. **favorites** - 用户收藏
6. **addresses** - 收货地址
7. **orders** - 订单主表
8. **order_items** - 订单商品
9. **reviews** - 商品评价
10. **settings** - 系统设置

### 🌐 API服务
- **50+个RESTful端点**
- **JWT用户认证**
- **完整的CRUD操作**
- **错误处理和日志**
- **分页和搜索**

## 🚀 快速开始

### 选项1：本地开发
```bash
# 安装依赖
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

### 选项2：Cloudflare部署
```bash
# Linux/macOS
./deploy-to-cloudflare.sh

# Windows
deploy-to-cloudflare.bat
```

### 选项3：一键测试
```bash
# 验证所有代码
node test-local.js

# 测试部署
node test-deployment.js
```

## ☁️ 部署选项

### 1. Cloudflare Workers（全栈）
- 前端+后端一体化部署
- 全球CDN加速
- 自动SSL证书
- 无需服务器管理

### 2. Cloudflare Pages + Workers（分离）
- 前端：Cloudflare Pages
- 后端：Cloudflare Workers
- 数据库：Cloudflare D1

### 3. 传统部署
- VPS服务器
- Docker容器
- 云平台（AWS/Azure/GCP）

## 📚 文档

### 详细指南
- [后端设置指南](BACKEND_SETUP.md) - 完整的本地开发教程
- [Cloudflare部署指南](CLOUDFLARE_DEPLOY.md) - 生产环境部署

### API文档
启动服务器后访问：
- `GET /api/health` - 健康检查
- `GET /api/products` - 商品列表
- `GET /api/categories` - 商品分类
- `POST /api/auth/login` - 用户登录

## 🛠️ 技术栈

### 前端
- HTML5 / CSS3 / JavaScript
- 响应式设计
- Font Awesome图标

### 后端
- **Node.js** + **Express.js**
- **SQLite3**数据库
- **JWT**用户认证
- **RESTful API**设计

### 部署
- **Cloudflare Workers**
- **Cloudflare D1**数据库
- **自动化部署脚本**

## 🔧 开发工具

### 测试工具
```bash
# 代码验证
node test-local.js

# 部署测试
node test-deployment.js [url]

# 数据库测试
cd database && npm run test
```

### 自动化脚本
- `setup.sh` / `setup.bat` - 环境设置
- `deploy-to-cloudflare.sh` / `.bat` - 一键部署
- 完整的错误处理和日志

## 📊 项目进展

### 已完成 ✅
- [x] 前端界面设计
- [x] 后端数据库设计
- [x] RESTful API实现
- [x] 用户认证系统
- [x] Cloudflare部署方案
- [x] 完整文档和指南
- [x] 自动化测试工具
- [x] 🎉 **生产环境部署** (Cloudflare Workers + D1 Database)

### 进行中 🔄
- [ ] 前端与API集成
- [ ] 性能优化
- [ ] 移动端适配
- [ ] 更多电商功能

## 🤝 贡献者

- **杨礼钱** - 前端代码开发
- **徐佳豪** - 网站发布和后端搭建
- **许太杰** - 实验报告撰写
- **OpenClaw AI助手** - 后端系统设计和部署方案
- **Cloudflare** - 提供免费的Workers和D1数据库服务

## 📞 联系和支持

### 问题反馈
- GitHub Issues: [提交问题](https://github.com/xiteral128/web-learning/issues)
- 邮件联系: 项目维护者

### 技术支持
- 查看 [BACKEND_SETUP.md](BACKEND_SETUP.md) 获取帮助
- 参考 [CLOUDFLARE_DEPLOY.md](CLOUDFLARE_DEPLOY.md) 解决部署问题

## 📄 许可证

本项目仅供学习使用，遵循开源协议。

## 🌟 特别感谢

感谢所有贡献者和用户的支持，特别感谢Cloudflare提供的免费部署平台。

## 📋 部署日志

详细的部署过程和技术细节请查看：
- [部署日志](DEPLOYMENT_LOG.md) - 完整的部署记录和测试结果
- [D1数据库部署指南](cloudflare-d1-deploy/README.md) - 一键部署说明

## 🎯 立即体验

### 在线演示
1. 访问: https://taobao-d1-807504.ywqih1206979-06f.workers.dev
2. 查看API文档和功能演示
3. 测试商品列表和分类功能

### 测试账号
- 用户名: `testuser`
- 密码: `123456`

---
**最后更新：2026-03-02**
**版本：v3.0.0** - 成功部署到Cloudflare生产环境
**部署状态**: 🟢 运行正常
**访问地址**: https://taobao-d1-807504.ywqih1206979-06f.workers.dev
