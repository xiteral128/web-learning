 请求失败: ' + error.message, 'error');
            }
        }
        
        // 加载商品
        async function loadProducts() {
            try {
                showMessage('正在加载商品...', 'info');
                
                const response = await fetch(BASE_URL + '/api/products');
                const data = await response.json();
                
                if (data.success) {
                    displayProducts(data.data);
                    showMessage('✅ 加载了 ' + data.data.length + ' 个商品', 'success');
                } else {
                    showMessage('❌ 加载商品失败', 'error');
                }
            } catch (error) {
                showMessage('❌ 请求失败: ' + error.message, 'error');
            }
        }
        
        // 显示商品
        function displayProducts(products) {
            const productsSection = document.getElementById('products-section');
            const productsGrid = document.getElementById('products-grid');
            
            productsSection.style.display = 'block';
            productsGrid.innerHTML = '';
            
            if (!products || products.length === 0) {
                productsGrid.innerHTML = '<div class="loading">暂无商品数据</div>';
                return;
            }
            
            products.forEach(product => {
                const stockClass = product.stock > 50 ? 'in-stock' : 
                                 product.stock > 0 ? 'low-stock' : 'out-of-stock';
                const stockText = product.stock > 50 ? '充足' : 
                                 product.stock > 0 ? '仅剩' + product.stock + '件' : '缺货';
                
                const productCard = document.createElement('div');
                productCard.className = 'product-card';
                productCard.innerHTML = \`
                    <div class="product-image">
                        \${getProductEmoji(product.category_id)}
                    </div>
                    <div class="product-info">
                        <h3 class="product-title">\${product.name}</h3>
                        <div class="product-price">¥\${product.price.toFixed(2)}</div>
                        <div class="product-stock \${stockClass}">库存: \${stockText}</div>
                        <button class="btn" onclick="addToCart(\${product.id})">加入购物车</button>
                    </div>
                \`;
                productsGrid.appendChild(productCard);
            });
        }
        
        // 获取商品表情符号
        function getProductEmoji(categoryId) {
            const emojis = {
                1: '📱', // 电子产品
                2: '👕', // 服装鞋帽
                3: '🏠', // 家居生活
                default: '🛒'
            };
            return emojis[categoryId] || emojis.default;
        }
        
        // 加载分类
        async function loadCategories() {
            try {
                const response = await fetch(BASE_URL + '/api/categories');
                const data = await response.json();
                
                if (data.success) {
                    let message = '商品分类: ';
                    data.data.forEach(cat => {
                        message += \`\${cat.name} (\${getProductEmoji(cat.id)}) \`;
                    });
                    showMessage(message, 'success');
                }
            } catch (error) {
                showMessage('❌ 加载分类失败: ' + error.message, 'error');
            }
        }
        
        // 添加到购物车（模拟）
        function addToCart(productId) {
            showMessage('✅ 商品已添加到购物车（功能演示）', 'success');
        }
        
        // 页面加载时自动检查状态
        window.addEventListener('DOMContentLoaded', () => {
            checkHealth();
            // 2秒后自动加载商品
            setTimeout(loadProducts, 2000);
        });
    </script>
</body>
</html>`;

    return new Response(html, {
        headers: {
            'Content-Type': 'text/html; charset=utf-8',
            'Cache-Control': 'no-cache'
        }
    });
}

// Initialize database
async function initDatabase(db) {
    try {
        // Create tables
        await db.batch([
            db.prepare(`
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
                )
            `),
            db.prepare(`
                CREATE TABLE IF NOT EXISTS categories (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    name TEXT NOT NULL,
                    description TEXT,
                    parent_id INTEGER DEFAULT NULL,
                    sort_order INTEGER DEFAULT 0,
                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
                )
            `),
            db.prepare(`
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
                )
            `)
        ]);
        
        // Insert test data
        await db.batch([
            db.prepare(`
                INSERT OR IGNORE INTO categories (id, name, description, sort_order) VALUES
                (1, '电子产品', '手机、电脑、平板等', 1),
                (2, '服装鞋帽', '男女服装、鞋子、配饰', 2),
                (3, '家居生活', '家具、家纺、厨具', 3)
            `),
            db.prepare(`
                INSERT OR IGNORE INTO products (name, description, price, stock, category_id, status) VALUES
                ('iPhone 15 Pro', '苹果最新旗舰手机，A17 Pro芯片，钛金属边框', 8999.00, 100, 1, 'active'),
                ('小米14 Ultra', '徕卡影像，骁龙8 Gen3，专业摄影手机', 6499.00, 150, 1, 'active'),
                ('耐克Air Max 270', '气垫运动鞋，舒适缓震，时尚设计', 899.00, 200, 2, 'active'),
                ('优衣库纯棉T恤', '100%纯棉，舒适透气，多色可选', 79.00, 500, 2, 'active'),
                ('戴森V12吸尘器', '激光探测，轻量化设计，强劲吸力', 4499.00, 60, 3, 'active'),
                ('华为Mate 60 Pro', '卫星通话，昆仑玻璃，鸿蒙系统', 6999.00, 80, 1, 'active'),
                ('阿迪达斯Ultraboost', 'Boost中底，舒适跑步鞋', 1299.00, 120, 2, 'active'),
                ('宜家书桌', '简约设计，多功能办公桌', 599.00, 50, 3, 'active')
            `),
            db.prepare(`
                INSERT OR IGNORE INTO users (username, password_hash, email) VALUES
                ('testuser', 'hashed_password_123', 'test@example.com'),
                ('admin', 'hashed_password_456', 'admin@example.com')
            `)
        ]);
        
        return true;
    } catch (error) {
        console.error('Database initialization error:', error);
        throw error;
    }
}

// Mock data functions
function getMockProducts() {
    return [
        {
            id: 1,
            name: 'iPhone 15 Pro',
            description: '苹果最新旗舰手机',
            price: 8999.00,
            stock: 100,
            category_id: 1,
            status: 'active',
            created_at: '2024-01-01T00:00:00Z'
        },
        {
            id: 2,
            name: '小米14 Ultra',
            description: '徕卡影像专业摄影手机',
            price: 6499.00,
            stock: 150,
            category_id: 1,
            status: 'active',
            created_at: '2024-01-15T00:00:00Z'
        },
        {
            id: 3,
            name: '耐克Air Max 270',
            description: '气垫运动鞋时尚设计',
            price: 899.00,
            stock: 200,
            category_id: 2,
            status: 'active',
            created_at: '2024-02-01T00:00:00Z'
        },
        {
            id: 4,
            name: '优衣库纯棉T恤',
            description: '100%纯棉舒适透气',
            price: 79.00,
            stock: 500,
            category_id: 2,
            status: 'active',
            created_at: '2024-02-15T00:00:00Z'
        },
        {
            id: 5,
            name: '戴森V12吸尘器',
            description: '激光探测强劲吸力',
            price: 4499.00,
            stock: 60,
            category_id: 3,
            status: 'active',
            created_at: '2024-03-01T00:00:00Z'
        }
    ];
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