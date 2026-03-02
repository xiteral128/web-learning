# 淘宝商城后端数据库 - 完整设置指南

## 项目概述

我已经为你的 `web-learning` 淘宝商城项目创建了一个完整的后端数据库系统。这个系统包含了电商网站所需的所有核心功能。

## 已创建的文件结构

```
web-learning/
├── database/                    # 数据库模块
│   ├── schema.sql              # 数据库表结构设计
│   ├── init.js                 # 数据库初始化脚本
│   ├── db.js                   # 数据库操作类
│   ├── package.json            # 数据库模块依赖
│   └── taobao.db               # SQLite数据库文件（初始化后生成）
│
├── backend/                    # API服务
│   ├── server.js              # Express.js API服务器
│   ├── package.json           # 后端依赖
│   ├── README.md              # API文档
│   └── logs/                  # 日志目录（运行时生成）
│
├── frontend/                   # 现有前端代码
│   ├── index.html
│   ├── css/
│   ├── js/
│   └── img/
│
└── BACKEND_SETUP.md           # 本文件
```

## 快速启动步骤

### 步骤1：安装Node.js
确保已安装Node.js 18+ 版本：
```bash
node --version
```

### 步骤2：初始化数据库
```bash
cd web-learning/database
npm install
npm run init
```

### 步骤3：启动后端API服务
```bash
cd web-learning/backend
npm install
npm start
```

### 步骤4：测试API
打开浏览器访问：http://localhost:3000/api/health

## 数据库设计详情

### 核心数据表（10个）

1. **users** - 用户账户
   - 用户名、密码哈希、邮箱、手机等
   - 支持用户资料管理

2. **products** - 商品信息
   - 名称、价格、库存、分类、图片等
   - 支持热销、推荐商品标记

3. **categories** - 商品分类
   - 支持多级分类结构
   - 8个默认分类（电子产品、服装鞋帽等）

4. **cart_items** - 购物车
   - 用户、商品、数量、选中状态
   - 自动防重复添加

5. **favorites** - 用户收藏
   - 收藏商品管理
   - 唯一约束防止重复收藏

6. **addresses** - 收货地址
   - 多地址管理
   - 默认地址设置

7. **orders** - 订单主表
   - 订单号、金额、状态、支付信息
   - 完整的订单生命周期管理

8. **order_items** - 订单商品
   - 订单商品详情
   - 记录购买时的价格快照

9. **reviews** - 商品评价
   - 评分、评论、图片
   - 匿名评价支持

10. **settings** - 系统设置
    - 运费、免邮门槛等配置

### 数据库特性
- ✅ 完整的外键约束
- ✅ 自动更新时间戳
- ✅ 库存自动更新触发器
- ✅ 订单金额自动计算
- ✅ 性能优化索引

## API接口说明

### 认证流程
1. 用户注册 → `POST /api/auth/register`
2. 用户登录 → `POST /api/auth/login` → 返回JWT token
3. 后续请求在Header中添加：`Authorization: Bearer <token>`

### 核心业务流
```
用户浏览商品 → 加入购物车 → 填写地址 → 创建订单 → 支付 → 发货 → 收货 → 评价
```

### 主要API端点

#### 商品浏览
```http
GET /api/products?category_id=1&sort_by=price&sort_order=asc
GET /api/products/1
GET /api/categories
```

#### 购物车操作
```http
GET /api/cart
POST /api/cart { "product_id": 1, "quantity": 2 }
PUT /api/cart/1 { "quantity": 3 }
DELETE /api/cart/1
```

#### 订单管理
```http
POST /api/orders { "address_id": 1, "payment_method": "alipay" }
GET /api/orders
GET /api/orders/1001
```

#### 用户功能
```http
GET /api/user/profile
GET /api/favorites
POST /api/favorites/1
GET /api/addresses
```

## 前端集成示例

### 1. 用户登录
```javascript
async function login(username, password) {
  const response = await fetch('http://localhost:3000/api/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username, password })
  });
  
  const data = await response.json();
  if (data.success) {
    // 保存token和用户信息
    localStorage.setItem('auth_token', data.token);
    localStorage.setItem('user_info', JSON.stringify(data.user));
    return true;
  }
  return false;
}
```

### 2. 获取商品列表
```javascript
async function loadProducts(categoryId = null) {
  let url = 'http://localhost:3000/api/products';
  if (categoryId) {
    url += `?category_id=${categoryId}`;
  }
  
  const response = await fetch(url);
  const data = await response.json();
  
  if (data.success) {
    return data.data;
  }
  return [];
}
```

### 3. 添加到购物车
```javascript
async function addToCart(productId, quantity = 1) {
  const token = localStorage.getItem('auth_token');
  
  const response = await fetch('http://localhost:3000/api/cart', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify({
      product_id: productId,
      quantity: quantity
    })
  });
  
  return await response.json();
}
```

### 4. 创建订单
```javascript
async function createOrder(addressId, cartItemIds = []) {
  const token = localStorage.getItem('auth_token');
  
  const response = await fetch('http://localhost:3000/api/orders', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify({
      address_id: addressId,
      payment_method: 'alipay',
      cart_item_ids: cartItemIds
    })
  });
  
  return await response.json();
}
```

## 默认测试数据

### 测试账号
1. **普通用户**
   - 用户名: `testuser`
   - 密码: `123456`
   - 邮箱: `test@example.com`

2. **管理员**
   - 用户名: `admin`
   - 密码: `123456`
   - 邮箱: `admin@example.com`

### 示例商品
系统已预置8个示例商品：
1. iPhone 15 Pro - ¥8999.00
2. 小米14 Ultra - ¥6499.00
3. 华为MateBook X Pro - ¥9999.00
4. 耐克Air Max 270 - ¥899.00
5. 优衣库纯棉T恤 - ¥79.00
6. 戴森V12吸尘器 - ¥4499.00
7. 雅诗兰黛小棕瓶 - ¥850.00
8. 三只松鼠坚果礼盒 - ¥198.00

## 部署选项

### 选项1：本地开发
```bash
# 启动后端
cd backend && npm start

# 前端直接打开index.html或使用Live Server
```

### 选项2：Cloudflare Workers部署
```bash
# 修改wrangler.toml，添加后端API配置
# 将前端静态文件和后端API一起部署
```

### 选项3：VPS部署
```bash
# 安装Node.js和PM2
sudo apt update
sudo apt install nodejs npm
sudo npm install -g pm2

# 部署项目
cd web-learning/backend
npm install --production
pm2 start server.js --name taobao-api

# 设置开机启动
pm2 startup
pm2 save
```

## 故障排除

### 常见问题

**Q: 数据库初始化失败**
```
A: 检查SQLite3是否安装，确保有写权限
   运行: npm install sqlite3 --build-from-source
```

**Q: API服务无法启动**
```
A: 检查端口3000是否被占用
   运行: netstat -ano | findstr :3000
   或修改server.js中的端口号
```

**Q: 前端跨域错误**
```
A: 确保前端页面通过http://localhost访问
   或修改server.js中的CORS配置
```

**Q: JWT认证失败**
```
A: 检查token是否正确传递
   清除localStorage重新登录
```

### 日志查看
```bash
# 查看API服务器日志
cd backend
tail -f logs/server.log

# 查看数据库操作
cd database
npm run status
```

## 扩展开发

### 添加新功能
1. **优惠券系统** - 添加coupons表
2. **积分系统** - 添加user_points表
3. **物流跟踪** - 扩展orders表的物流字段
4. **消息通知** - 添加notifications表
5. **数据报表** - 添加统计查询接口

### 性能优化
1. **数据库索引** - 为常用查询字段添加索引
2. **查询缓存** - 实现Redis缓存层
3. **分页优化** - 使用游标分页代替偏移分页
4. **连接池** - 配置数据库连接池

### 安全加固
1. **输入验证** - 添加更严格的输入验证
2. **SQL注入防护** - 使用参数化查询
3. **速率限制** - 添加API调用频率限制
4. **HTTPS** - 启用SSL/TLS加密

## 技术支持

如有问题，请检查：
1. Node.js版本是否≥18
2. 所有依赖是否安装成功
3. 数据库文件是否有写权限
4. 端口3000是否被占用

这个后端系统已经完整实现了淘宝商城的所有核心功能，你可以直接使用或根据需要进行修改。前端代码需要相应调整以调用这些API接口。