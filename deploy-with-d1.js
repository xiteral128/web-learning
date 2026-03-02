        \`, {
            headers: { 'Content-Type': 'text/html; charset=utf-8' }
        });
    }
    
    // 其他静态文件请求
    return new Response('Not Found', { status: 404 });
}

// 模拟数据（备用）
function getMockProducts() {
    return [
        {
            id: 1,
            name: 'iPhone 15 Pro',
            description: '苹果最新旗舰手机，A17 Pro芯片，钛金属边框',
            price: 8999.00,
            original_price: 9999.00,
            stock: 100,
            category_id: 1,
            main_image_url: 'https://example.com/iphone15.jpg',
            status: 'active',
            created_at: '2024-01-01T00:00:00Z'
        },
        {
            id: 2,
            name: '小米14 Ultra',
            description: '徕卡影像，骁龙8 Gen3，专业摄影手机',
            price: 6499.00,
            original_price: 6999.00,
            stock: 150,
            category_id: 1,
            main_image_url: 'https://example.com/xiaomi14.jpg',
            status: 'active',
            created_at: '2024-01-15T00:00:00Z'
        },
        {
            id: 3,
            name: '耐克Air Max 270',
            description: '气垫运动鞋，舒适缓震，时尚设计',
            price: 899.00,
            original_price: 1099.00,
            stock: 200,
            category_id: 2,
            main_image_url: 'https://example.com/nike270.jpg',
            status: 'active',
            created_at: '2024-02-01T00:00:00Z'
        },
        {
            id: 4,
            name: '优衣库纯棉T恤',
            description: '100%纯棉，舒适透气，多色可选',
            price: 79.00,
            original_price: 99.00,
            stock: 500,
            category_id: 2,
            main_image_url: 'https://example.com/uniqlo.jpg',
            status: 'active',
            created_at: '2024-02-15T00:00:00Z'
        },
        {
            id: 5,
            name: '戴森V12吸尘器',
            description: '激光探测，轻量化设计，强劲吸力',
            price: 4499.00,
            original_price: 4999.00,
            stock: 60,
            category_id: 3,
            main_image_url: 'https://example.com/dyson.jpg',
            status: 'active',
            created_at: '2024-03-01T00:00:00Z'
        }
    ];
}

function getMockProduct(id) {
    const products = getMockProducts();
    return products.find(p => p.id === id);
}

function getMockCategories() {
    return [
        {
            id: 1,
            name: '电子产品',
            description: '手机、电脑、平板等',
            sort_order: 1
        },
        {
            id: 2,
            name: '服装鞋帽',
            description: '男女服装、鞋子、配饰',
            sort_order: 2
        },
        {
            id: 3,
            name: '家居生活',
            description: '家具、家纺、厨具',
            sort_order: 3
        }
    ];
}
`;

    fs.writeFileSync(path.join(DEPLOY_DIR, 'worker.js'), d1WorkerContent);
    console.log('✅ D1 Worker文件创建完成');

    // 2. 创建wrangler.toml配置
    const wranglerConfig = `
name = "${WORKER_NAME}"
main = "worker.js"
compatibility_date = "2025-12-23"
workers_dev = true

# D1数据库配置
[[d1_databases]]
binding = "DB"
database_name = "taobao-database"
database_id = ""  # 部署后会自动创建或指定现有ID

[vars]
API_VERSION = "2.0.0"
ENVIRONMENT = "production"
JWT_SECRET = "taobao-d1-secret-${Date.now()}"

[build]
command = "echo 'Building with D1 Database...'"

[build.upload]
format = "service-worker"

# 日志
[logpush]
enabled = true
`;

    fs.writeFileSync(path.join(DEPLOY_DIR, 'wrangler.toml'), wranglerConfig);
    console.log('✅ wrangler配置创建完成');

    // 3. 创建部署脚本
    const deployScript = `
#!/bin/bash
# Cloudflare D1数据库部署脚本

echo "🚀 部署淘宝商城到Cloudflare D1..."
echo "=" .repeat(50)

# 设置API令牌
export CLOUDFLARE_API_TOKEN="${CLOUDFLARE_API_TOKEN}"

# 1. 创建D1数据库
echo "🗄️ 创建D1数据库..."
npx wrangler d1 create taobao-database

if [ $? -eq 0 ]; then
    echo "✅ D1数据库创建成功"
    
    # 获取数据库ID
    DB_INFO=\$(npx wrangler d1 list --json | jq -r '.[] | select(.name=="taobao-database") | .uuid')
    echo "数据库ID: \$DB_INFO"
    
    # 更新配置文件
    sed -i "s/database_id = \"\"/database_id = \"\$DB_INFO\"/" wrangler.toml
    echo "✅ 配置文件已更新"
    
    # 2. 导入数据库schema
    echo "📋 导入数据库结构..."
    npx wrangler d1 execute taobao-database --file=../database/schema.sql
    
    # 3. 部署Worker
    echo "🚀 部署Worker..."
    npx wrangler deploy
    
    if [ $? -eq 0 ]; then
        echo "✅ 部署成功！"
        echo ""
        echo "🎉 淘宝商城已部署到Cloudflare D1"
        echo "🔗 访问地址: https://${WORKER_NAME}.your-username.workers.dev"
        echo "🗄️ 数据库: Cloudflare D1 (taobao-database)"
        echo ""
        echo "测试端点:"
        echo "  - 健康检查: /api/health"
        echo "  - 商品列表: /api/products"
        echo "  - 初始化DB: POST /api/admin/init-db"
    else
        echo "❌ Worker部署失败"
    fi
else
    echo "❌ D1数据库创建失败"
    echo "ℹ️  使用现有数据库或检查API令牌"
fi
`;

    fs.writeFileSync(path.join(DEPLOY_DIR, 'deploy.sh'), deployScript);
    console.log('✅ 部署脚本创建完成');

    // 4. 创建手动部署指南
    const manualGuide = `
# 🚀 Cloudflare D1数据库部署指南

## 部署信息
- **Worker名称**: ${WORKER_NAME}
- **数据库**: Cloudflare D1
- **API令牌**: 已配置
- **部署时间**: ${new Date().toLocaleString()}

## 手动部署步骤

### 步骤1: 创建D1数据库
\`\`\`bash
# 设置API令牌
export CLOUDFLARE_API_TOKEN="${CLOUDFLARE_API_TOKEN}"

# 创建数据库
npx wrangler d1 create taobao-database
\`\`\`

### 步骤2: 导入数据库结构
\`\`\`bash
# 导入schema
npx wrangler d1 execute taobao-database --file=../database/schema.sql

# 或使用SQL文件
npx wrangler d1 execute taobao-database --file=./init-db.sql
\`\`\`

### 步骤3: 部署Worker
\`\`\`bash
# 进入部署目录
cd ${DEPLOY_DIR}

# 部署
npx wrangler deploy
\`\`\`

### 步骤4: 初始化数据库
访问以下端点初始化数据库：
\`\`\`
POST https://${WORKER_NAME}.your-username.workers.dev/api/admin/init-db
\`\`\`

## 测试端点

### 1. 健康检查
\`\`\`
GET https://${WORKER_NAME}.your-username.workers.dev/api/health
\`\`\`

### 2. 商品列表
\`\`\`
GET https://${WORKER_NAME}.your-username.workers.dev/api/products
\`\`\`

### 3. 数据库管理
\`\`\`
POST https://${WORKER_NAME}.your-username.workers.dev/api/admin/init-db
\`\`\`

## 数据库Schema
D1数据库使用以下核心表：
1. **users** - 用户账户
2. **products** - 商品信息  
3. **categories** - 商品分类
4. **orders** - 订单系统
5. **cart_items** - 购物车

## 故障排除

### 问题1: API令牌无效
- 检查令牌权限
- 确认令牌未过期
- 验证账户状态

### 问题2: 数据库创建失败
- 检查D1配额
- 确认网络连接
- 查看Cloudflare Dashboard

### 问题3: Worker部署失败
- 检查代码语法
- 验证配置文件
- 查看部署日志

## 监控和维护

### 1. 查看数据库
\`\`\`bash
npx wrangler d1 list
npx wrangler d1 info taobao-database
\`\`\`

### 2. 执行SQL查询
\`\`\`bash
npx wrangler d1 execute taobao-database --command="SELECT * FROM products"
\`\`\`

### 3. 备份数据库
\`\`\`bash
npx wrangler d1 export taobao-database --output=backup.sql
\`\`\`

## 生产环境建议

### 1. 安全配置
- 使用环境变量存储密钥
- 配置CORS白名单
- 启用HTTPS

### 2. 性能优化
- 添加数据库索引
- 启用缓存
- 监控查询性能

### 3. 扩展性
- 分表分库策略
- 读写分离
- 数据归档

---
*部署文件位置: ${path.join(__dirname, DEPLOY_DIR)}*
*最后更新: ${new Date().toLocaleString()}*
`;

    fs.writeFileSync(path.join(DEPLOY_DIR, 'DEPLOY_GUIDE.md'), manualGuide);
    console.log('✅ 部署指南创建完成');

    // 5. 创建数据库初始化脚本
    const initDbScript = `
-- D1数据库初始化脚本
-- 淘宝商城核心表结构

-- 用户表
CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    email TEXT UNIQUE,
    phone TEXT,
    avatar_url TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    last_login TIMESTAMP,
    is_active BOOLEAN DEFAULT 1
);

-- 商品分类表
CREATE TABLE IF NOT EXISTS categories (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    description TEXT,
    parent_id INTEGER DEFAULT NULL,
    sort_order INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 商品表
CREATE TABLE IF NOT EXISTS products (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    description TEXT,
    price REAL NOT NULL,
    original_price REAL,
    stock INTEGER DEFAULT 0,
    category_id INTEGER,
    main_image_url TEXT,
    image_urls TEXT,
    tags TEXT,
    sales_count INTEGER DEFAULT 0,
    view_count INTEGER DEFAULT 0,
    is_hot BOOLEAN DEFAULT 0,
    is_recommended BOOLEAN DEFAULT 0,
    status TEXT DEFAULT 'active',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 购物车表
CREATE TABLE IF NOT EXISTS cart_items (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    product_id INTEGER NOT NULL,
    quantity INTEGER DEFAULT 1,
    selected BOOLEAN DEFAULT 1,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(user_id, product_id)
);

-- 订单表
CREATE TABLE IF NOT EXISTS orders (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    order_no TEXT UNIQUE NOT NULL,
    user_id INTEGER NOT NULL,
    total_amount REAL NOT NULL,
    discount_amount REAL DEFAULT 0,
    shipping_fee REAL DEFAULT 0,
    final_amount REAL NOT NULL,
    address_id INTEGER NOT NULL,
    payment_method TEXT,
    payment_status TEXT DEFAULT 'pending',
    order_status TEXT DEFAULT 'pending',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 插入测试数据
INSERT OR IGNORE INTO categories (id, name, description, sort_order) VALUES
(1, '电子产品', '手机、电脑、平板等', 1),
(2, '服装鞋帽', '男女服装、鞋子、配饰', 2),
(3, '家居生活', '家具、家纺、厨具', 3);

INSERT OR IGNORE INTO products (name, description, price, stock, category_id, status) VALUES
('iPhone 15 Pro', '苹果最新旗舰手机', 8999.00, 100, 1, 'active'),
('小米14 Ultra', '徕卡影像专业摄影手机', 6499.00, 150, 1, 'active'),
('耐克Air Max 270', '气垫运动鞋时尚设计', 899.00, 200, 2, 'active'),
('优衣库纯棉T恤', '100%纯棉舒适透气', 79.00, 500, 2, 'active'),
('戴森V12吸尘器', '激光探测强劲吸力', 4499.00, 60, 3, 'active');

INSERT OR IGNORE INTO users (username, password_hash, email) VALUES
('testuser', 'hashed_password_123', 'test@example.com'),
('admin', 'hashed_password_456', 'admin@example.com');

-- 创建索引
CREATE INDEX IF NOT EXISTS idx_products_category ON products(category_id);
CREATE INDEX IF NOT EXISTS idx_products_status ON products(status);
CREATE INDEX IF NOT EXISTS idx_users_username ON users(username);
CREATE INDEX IF NOT EXISTS idx_orders_user ON orders(user_id);

-- 显示表信息
SELECT name FROM sqlite_master WHERE type='table' ORDER BY name;
`;

    fs.writeFileSync(path.join(DEPLOY_DIR, 'init-db.sql'), initDbScript);
    console.log('✅ 数据库初始化脚本创建完成');

    // 6. 显示部署信息
    console.log('\n' + '=' .repeat(50));
    console.log('🎉 D1数据库部署准备完成！');
    console.log('=' .repeat(50));
    
    console.log('\n📁 生成的文件:');
    console.log(`1. Worker文件: ${DEPLOY_DIR}/worker.js`);
    console.log(`2. 配置文件: ${DEPLOY_DIR}/wrangler.toml`);
    console.log(`3. 部署脚本: ${DEPLOY_DIR}/deploy.sh`);
    console.log(`4. 部署指南: ${DEPLOY_DIR}/DEPLOY_GUIDE.md`);
    console.log(`5. 数据库脚本: ${DEPLOY_DIR}/init-db.sql`);
    
    console.log('\n🚀 部署步骤:');
    console.log('1. 设置API令牌环境变量:');
    console.log(`   export CLOUDFLARE_API_TOKEN="${CLOUDFLARE_API_TOKEN}"`);
    console.log('2. 进入部署目录:');
    console.log(`   cd ${DEPLOY_DIR}`);
    console.log('3. 运行部署脚本:');
    console.log('   bash deploy.sh');
    
    console.log('\n🔗 预计访问地址:');
    console.log(`https://${WORKER_NAME}.your-username.workers.dev`);
    
    console.log('\n📊 功能特性:');
    console.log('✅ 完整的D1数据库集成');
    console.log('✅ 自动数据库初始化');
    console.log('✅ 模拟数据备用');
    console.log('✅ CORS支持');
    console.log('✅ 错误处理');
    console.log('✅ 管理界面');
    
    console.log('\n💡 提示:');
    console.log('- 首次访问需要初始化数据库');
    console.log('- 使用 /api/admin/init-db 端点');
    console.log('- 查看 DEPLOY_GUIDE.md 获取详细指南');

} catch (error) {
    console.error('\n❌ 部署准备失败:');
    console.error(error.message);
    console.error('\n堆栈:', error.stack);
}