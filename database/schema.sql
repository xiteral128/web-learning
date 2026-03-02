-- web-learning 淘宝商城数据库设计
-- 创建时间：2026-03-02
-- 作者：OpenClaw AI Assistant

-- 用户表
CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username VARCHAR(50) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    email VARCHAR(100) UNIQUE,
    phone VARCHAR(20),
    avatar_url TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    last_login TIMESTAMP,
    is_active BOOLEAN DEFAULT 1
);

-- 商品分类表
CREATE TABLE IF NOT EXISTS categories (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name VARCHAR(50) NOT NULL,
    description TEXT,
    parent_id INTEGER DEFAULT NULL,
    sort_order INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (parent_id) REFERENCES categories(id) ON DELETE SET NULL
);

-- 商品表
CREATE TABLE IF NOT EXISTS products (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name VARCHAR(200) NOT NULL,
    description TEXT,
    price DECIMAL(10, 2) NOT NULL,
    original_price DECIMAL(10, 2),
    stock INTEGER DEFAULT 0,
    category_id INTEGER,
    main_image_url TEXT,
    image_urls TEXT, -- JSON数组存储多张图片
    tags TEXT, -- JSON数组存储标签
    sales_count INTEGER DEFAULT 0,
    view_count INTEGER DEFAULT 0,
    is_hot BOOLEAN DEFAULT 0,
    is_recommended BOOLEAN DEFAULT 0,
    status VARCHAR(20) DEFAULT 'active', -- active, out_of_stock, discontinued
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE SET NULL
);

-- 购物车表
CREATE TABLE IF NOT EXISTS cart_items (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    product_id INTEGER NOT NULL,
    quantity INTEGER DEFAULT 1,
    selected BOOLEAN DEFAULT 1, -- 是否选中结算
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE,
    UNIQUE(user_id, product_id) -- 防止重复添加
);

-- 用户收藏表
CREATE TABLE IF NOT EXISTS favorites (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    product_id INTEGER NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE,
    UNIQUE(user_id, product_id) -- 防止重复收藏
);

-- 收货地址表
CREATE TABLE IF NOT EXISTS addresses (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    recipient_name VARCHAR(50) NOT NULL,
    phone VARCHAR(20) NOT NULL,
    province VARCHAR(50) NOT NULL,
    city VARCHAR(50) NOT NULL,
    district VARCHAR(50) NOT NULL,
    detail_address TEXT NOT NULL,
    postal_code VARCHAR(10),
    is_default BOOLEAN DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- 订单表
CREATE TABLE IF NOT EXISTS orders (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    order_no VARCHAR(50) UNIQUE NOT NULL, -- 订单号
    user_id INTEGER NOT NULL,
    total_amount DECIMAL(10, 2) NOT NULL,
    discount_amount DECIMAL(10, 2) DEFAULT 0,
    shipping_fee DECIMAL(10, 2) DEFAULT 0,
    final_amount DECIMAL(10, 2) NOT NULL,
    address_id INTEGER NOT NULL,
    payment_method VARCHAR(20), -- alipay, wechat, bank_card
    payment_status VARCHAR(20) DEFAULT 'pending', -- pending, paid, failed, refunded
    order_status VARCHAR(20) DEFAULT 'pending', -- pending, processing, shipped, delivered, completed, cancelled
    shipping_company VARCHAR(50),
    tracking_no VARCHAR(100),
    note TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    paid_at TIMESTAMP,
    shipped_at TIMESTAMP,
    delivered_at TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (address_id) REFERENCES addresses(id) ON DELETE CASCADE
);

-- 订单商品详情表
CREATE TABLE IF NOT EXISTS order_items (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    order_id INTEGER NOT NULL,
    product_id INTEGER NOT NULL,
    product_name VARCHAR(200) NOT NULL,
    product_price DECIMAL(10, 2) NOT NULL,
    quantity INTEGER NOT NULL,
    subtotal DECIMAL(10, 2) NOT NULL,
    product_image_url TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE,
    FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE SET NULL
);

-- 商品评论表
CREATE TABLE IF NOT EXISTS reviews (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    product_id INTEGER NOT NULL,
    order_item_id INTEGER,
    rating INTEGER CHECK (rating >= 1 AND rating <= 5),
    content TEXT,
    images TEXT, -- JSON数组存储评论图片
    is_anonymous BOOLEAN DEFAULT 0,
    like_count INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE,
    FOREIGN KEY (order_item_id) REFERENCES order_items(id) ON DELETE SET NULL
);

-- 系统配置表
CREATE TABLE IF NOT EXISTS settings (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    key VARCHAR(100) UNIQUE NOT NULL,
    value TEXT,
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 创建索引以提高查询性能
CREATE INDEX idx_users_username ON users(username);
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_products_category ON products(category_id);
CREATE INDEX idx_products_status ON products(status);
CREATE INDEX idx_cart_items_user ON cart_items(user_id);
CREATE INDEX idx_favorites_user ON favorites(user_id);
CREATE INDEX idx_orders_user ON orders(user_id);
CREATE INDEX idx_orders_order_no ON orders(order_no);
CREATE INDEX idx_orders_status ON orders(order_status);
CREATE INDEX idx_order_items_order ON order_items(order_id);
CREATE INDEX idx_reviews_product ON reviews(product_id);

-- 插入默认分类数据
INSERT OR IGNORE INTO categories (id, name, description, sort_order) VALUES
(1, '电子产品', '手机、电脑、平板等', 1),
(2, '服装鞋帽', '男女服装、鞋子、配饰', 2),
(3, '家居生活', '家具、家纺、厨具', 3),
(4, '美妆个护', '化妆品、护肤品、个人护理', 4),
(5, '食品饮料', '零食、饮料、生鲜', 5),
(6, '运动户外', '运动器材、户外装备', 6),
(7, '图书音像', '图书、音乐、影视', 7),
(8, '母婴玩具', '母婴用品、儿童玩具', 8);

-- 插入示例商品数据
INSERT OR IGNORE INTO products (name, description, price, original_price, stock, category_id, main_image_url, tags, is_hot, is_recommended) VALUES
('iPhone 15 Pro', '苹果最新旗舰手机，A17 Pro芯片，钛金属边框', 8999.00, 9999.00, 100, 1, 'https://example.com/iphone15.jpg', '["手机", "苹果", "旗舰"]', 1, 1),
('小米14 Ultra', '徕卡影像，骁龙8 Gen3，专业摄影手机', 6499.00, 6999.00, 150, 1, 'https://example.com/xiaomi14.jpg', '["手机", "小米", "摄影"]', 1, 1),
('华为MateBook X Pro', '13代酷睿，3.1K触控屏，轻薄笔记本', 9999.00, 10999.00, 80, 1, 'https://example.com/matebook.jpg', '["笔记本", "华为", "轻薄"]', 0, 1),
('耐克Air Max 270', '气垫运动鞋，舒适缓震，时尚设计', 899.00, 1099.00, 200, 2, 'https://example.com/nike270.jpg', '["运动鞋", "耐克", "气垫"]', 1, 0),
('优衣库纯棉T恤', '100%纯棉，舒适透气，多色可选', 79.00, 99.00, 500, 2, 'https://example.com/uniqlo.jpg', '["T恤", "纯棉", "基础款"]', 0, 1),
('戴森V12吸尘器', '激光探测，轻量化设计，强劲吸力', 4499.00, 4999.00, 60, 3, 'https://example.com/dyson.jpg', '["吸尘器", "戴森", "家电"]', 1, 1),
('雅诗兰黛小棕瓶', '修护精华，改善肤质，抗衰老', 850.00, 950.00, 300, 4, 'https://example.com/estee.jpg', '["精华", "护肤", "抗老"]', 1, 1),
('三只松鼠坚果礼盒', '多种坚果组合，年货送礼佳品', 198.00, 258.00, 400, 5, 'https://example.com/szs.jpg', '["坚果", "零食", "礼盒"]', 0, 1);

-- 插入系统配置
INSERT OR IGNORE INTO settings (key, value, description) VALUES
('site_name', '淘宝商城', '网站名称'),
('site_description', '一站式购物平台', '网站描述'),
('shipping_fee', '10', '默认运费（元）'),
('free_shipping_threshold', '99', '免运费门槛（元）'),
('customer_service_phone', '400-123-4567', '客服电话'),
('return_policy_days', '7', '退货政策天数');

-- 创建触发器：更新商品库存
CREATE TRIGGER IF NOT EXISTS update_product_stock
AFTER INSERT ON order_items
BEGIN
    UPDATE products 
    SET stock = stock - NEW.quantity,
        sales_count = sales_count + NEW.quantity,
        updated_at = CURRENT_TIMESTAMP
    WHERE id = NEW.product_id;
END;

-- 创建触发器：更新订单总金额
CREATE TRIGGER IF NOT EXISTS update_order_total
AFTER INSERT ON order_items
BEGIN
    UPDATE orders 
    SET total_amount = (
        SELECT SUM(subtotal) 
        FROM order_items 
        WHERE order_id = NEW.order_id
    ),
    final_amount = total_amount - discount_amount + shipping_fee,
    updated_at = CURRENT_TIMESTAMP
    WHERE id = NEW.order_id;
END;

-- 创建触发器：自动更新updated_at时间戳
CREATE TRIGGER IF NOT EXISTS update_users_timestamp 
AFTER UPDATE ON users
BEGIN
    UPDATE users SET updated_at = CURRENT_TIMESTAMP WHERE id = NEW.id;
END;

CREATE TRIGGER IF NOT EXISTS update_products_timestamp 
AFTER UPDATE ON products
BEGIN
    UPDATE products SET updated_at = CURRENT_TIMESTAMP WHERE id = NEW.id;
END;

CREATE TRIGGER IF NOT EXISTS update_orders_timestamp 
AFTER UPDATE ON orders
BEGIN
    UPDATE orders SET updated_at = CURRENT_TIMESTAMP WHERE id = NEW.id;
END;