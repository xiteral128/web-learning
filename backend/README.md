# 淘宝商城后端API服务

基于Node.js + Express + SQLite的完整电商后端系统，为web-learning项目提供数据支持。

## 功能特性

- ✅ 用户认证（注册/登录/JWT）
- ✅ 商品管理（CRUD、分类、搜索）
- ✅ 购物车功能
- ✅ 收藏功能
- ✅ 订单系统
- ✅ 收货地址管理
- ✅ 商品评价
- ✅ 管理员后台
- ✅ 数据统计

## 快速开始

### 1. 安装依赖

```bash
cd backend
npm install
```

### 2. 初始化数据库

```bash
npm run init-db
```

### 3. 启动服务器

```bash
npm start
# 或开发模式
npm run dev
```

服务器将在 http://localhost:3000 启动

## API文档

### 基础信息
- `GET /api/health` - 健康检查

### 用户认证
- `POST /api/auth/register` - 用户注册
- `POST /api/auth/login` - 用户登录

### 商品相关
- `GET /api/products` - 获取商品列表
- `GET /api/products/:id` - 获取单个商品
- `GET /api/categories` - 获取分类
- `GET /api/products/:id/reviews` - 获取商品评价

### 需要认证的API（需在Header中添加 `Authorization: Bearer <token>`）

#### 用户相关
- `GET /api/user/profile` - 获取用户资料
- `PUT /api/user/profile` - 更新用户资料

#### 购物车
- `GET /api/cart` - 获取购物车
- `POST /api/cart` - 添加到购物车
- `PUT /api/cart/:id` - 更新购物车商品数量
- `DELETE /api/cart/:id` - 移除购物车商品
- `DELETE /api/cart` - 清空购物车

#### 收藏
- `GET /api/favorites` - 获取收藏列表
- `POST /api/favorites/:productId` - 添加收藏
- `DELETE /api/favorites/:productId` - 移除收藏

#### 地址
- `GET /api/addresses` - 获取收货地址
- `POST /api/addresses` - 添加收货地址
- `PUT /api/addresses/:id` - 更新收货地址
- `DELETE /api/addresses/:id` - 删除收货地址

#### 订单
- `GET /api/orders` - 获取订单列表
- `GET /api/orders/:id` - 获取单个订单
- `POST /api/orders` - 创建订单

#### 评价
- `POST /api/reviews` - 添加商品评价

### 管理员API（需要管理员权限）

- `GET /api/admin/stats` - 获取统计信息
- `GET /api/admin/orders` - 获取所有订单
- `PUT /api/admin/orders/:id/status` - 更新订单状态
- `POST /api/admin/products` - 创建商品
- `PUT /api/admin/products/:id` - 更新商品

## 数据库结构

### 主要数据表
1. **users** - 用户表
2. **products** - 商品表
3. **categories** - 分类表
4. **cart_items** - 购物车表
5. **favorites** - 收藏表
6. **addresses** - 收货地址表
7. **orders** - 订单表
8. **order_items** - 订单商品表
9. **reviews** - 评价表
10. **settings** - 系统设置表

### 数据库管理命令

```bash
# 初始化数据库
npm run init-db

# 重置数据库
npm run reset-db

# 查看数据库状态
npm run status

# 测试数据库连接
npm run test-db

# 备份数据库
npm run backup
```

## 配置

### 环境变量
```bash
PORT=3000                    # 服务器端口
JWT_SECRET=your-secret-key   # JWT密钥
NODE_ENV=development         # 环境模式
```

### 默认测试账号
- 用户名: `testuser` / 密码: `123456`
- 用户名: `admin` / 密码: `123456`

## 前端集成示例

### 用户登录
```javascript
const login = async (username, password) => {
  const response = await fetch('http://localhost:3000/api/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username, password })
  });
  
  const data = await response.json();
  if (data.success) {
    localStorage.setItem('token', data.token);
    localStorage.setItem('user', JSON.stringify(data.user));
  }
  return data;
};
```

### 获取商品列表
```javascript
const getProducts = async () => {
  const response = await fetch('http://localhost:3000/api/products');
  return await response.json();
};
```

### 添加到购物车（需要认证）
```javascript
const addToCart = async (productId, quantity = 1) => {
  const token = localStorage.getItem('token');
  const response = await fetch('http://localhost:3000/api/cart', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify({ product_id: productId, quantity })
  });
  
  return await response.json();
};
```

## 部署

### 本地部署
```bash
npm install
npm run init-db
npm start
```

### PM2部署（生产环境）
```bash
npm install -g pm2
pm2 start server.js --name "taobao-backend"
pm2 save
pm2 startup
```

### Docker部署
```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm install --production
COPY . .
EXPOSE 3000
CMD ["npm", "start"]
```

## 故障排除

### 常见问题

1. **数据库连接失败**
   - 检查数据库文件权限
   - 确保有足够的磁盘空间
   - 重启数据库服务

2. **JWT认证失败**
   - 检查token是否过期
   - 验证JWT_SECRET配置
   - 清除浏览器缓存重新登录

3. **跨域问题**
   - 确保前端地址在CORS白名单中
   - 检查nginx/Apache代理配置

### 日志查看
```bash
# 查看服务器日志
tail -f logs/server.log

# 查看数据库操作日志
tail -f logs/database.log
```

## 技术栈

- **运行时**: Node.js 18+
- **Web框架**: Express.js
- **数据库**: SQLite3
- **认证**: JWT + bcryptjs
- **中间件**: cors, body-parser
- **开发工具**: nodemon

## 许可证

MIT License