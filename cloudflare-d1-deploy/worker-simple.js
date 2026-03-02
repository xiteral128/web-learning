// Simple Cloudflare Worker with HTML frontend
export default {
    async fetch(request, env) {
        const url = new URL(request.url);
        const pathname = url.pathname;
        
        // CORS headers for API
        const corsHeaders = {
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Methods': 'GET,POST,PUT,DELETE,OPTIONS',
            'Access-Control-Allow-Headers': 'Content-Type,Authorization',
        };
        
        if (request.method === 'OPTIONS') {
            return new Response(null, { headers: corsHeaders });
        }
        
        // API routes
        if (pathname === '/api/health') {
            return new Response(JSON.stringify({
                success: true,
                message: '淘宝商城D1数据库版运行正常',
                timestamp: new Date().toISOString(),
                worker: 'taobao-d1-807504',
                database: 'D1 (Cloudflare)',
                frontend: 'HTML界面已集成'
            }), {
                headers: { 
                    'Content-Type': 'application/json',
                    ...corsHeaders 
                }
            });
        }
        
        if (pathname === '/api/products') {
            try {
                const { results } = await env.DB.prepare(
                    'SELECT * FROM products LIMIT 10'
                ).all();
                
                return new Response(JSON.stringify({
                    success: true,
                    data: results || [],
                    source: results ? 'D1 Database' : 'Mock Data'
                }), {
                    headers: { 
                        'Content-Type': 'application/json',
                        ...corsHeaders 
                    }
                });
            } catch (error) {
                return new Response(JSON.stringify({
                    success: true,
                    data: [
                        { id: 1, name: 'iPhone 15 Pro', price: 8999, stock: 100 },
                        { id: 2, name: '小米14 Ultra', price: 6499, stock: 150 },
                        { id: 3, name: '耐克Air Max 270', price: 899, stock: 200 }
                    ],
                    source: 'Mock Data',
                    message: '数据库未初始化'
                }), {
                    headers: { 
                        'Content-Type': 'application/json',
                        ...corsHeaders 
                    }
                });
            }
        }
        
        if (pathname === '/api/init-db' && request.method === 'POST') {
            try {
                // Create tables
                await env.DB.batch([
                    env.DB.prepare(`
                        CREATE TABLE IF NOT EXISTS products (
                            id INTEGER PRIMARY KEY AUTOINCREMENT,
                            name TEXT NOT NULL,
                            description TEXT,
                            price REAL NOT NULL,
                            stock INTEGER DEFAULT 0,
                            category_id INTEGER,
                            status TEXT DEFAULT 'active',
                            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
                        )
                    `),
                    env.DB.prepare(`
                        CREATE TABLE IF NOT EXISTS categories (
                            id INTEGER PRIMARY KEY AUTOINCREMENT,
                            name TEXT NOT NULL,
                            description TEXT,
                            sort_order INTEGER DEFAULT 0
                        )
                    `)
                ]);
                
                // Insert test data
                await env.DB.batch([
                    env.DB.prepare(`
                        INSERT OR IGNORE INTO categories (id, name) VALUES
                        (1, '电子产品'),
                        (2, '服装鞋帽'),
                        (3, '家居生活')
                    `),
                    env.DB.prepare(`
                        INSERT OR IGNORE INTO products (name, price, stock, category_id) VALUES
                        ('iPhone 15 Pro', 8999.00, 100, 1),
                        ('小米14 Ultra', 6499.00, 150, 1),
                        ('耐克Air Max 270', 899.00, 200, 2),
                        ('优衣库纯棉T恤', 79.00, 500, 2),
                        ('戴森V12吸尘器', 4499.00, 60, 3)
                    `)
                ]);
                
                return new Response(JSON.stringify({
                    success: true,
                    message: 'D1数据库初始化完成',
                    tables: ['products', 'categories']
                }), {
                    headers: { 
                        'Content-Type': 'application/json',
                        ...corsHeaders 
                    }
                });
                
            } catch (error) {
                return new Response(JSON.stringify({
                    success: false,
                    message: '数据库初始化失败',
                    error: error.message
                }), {
                    status: 500,
                    headers: { 
                        'Content-Type': 'application/json',
                        ...corsHeaders 
                    }
                });
            }
        }
        
        // Serve HTML frontend for all other routes
        return new Response(getHTML(), {
            headers: {
                'Content-Type': 'text/html; charset=utf-8',
                'Cache-Control': 'no-cache'
            }
        });
    }
};

// HTML template
function getHTML() {
    return `<!DOCTYPE html>
<html lang="zh-CN">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>🛒 淘宝商城 - Cloudflare D1数据库版</title>
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; background: #f5f5f5; }
        .container { max-width: 1200px; margin: 0 auto; padding: 20px; }
        header { text-align: center; padding: 40px 20px; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; border-radius: 15px; margin-bottom: 30px; }
        h1 { font-size: 2.5rem; margin-bottom: 10px; }
        .subtitle { font-size: 1.2rem; opacity: 0.9; }
        .main-content { background: white; border-radius: 15px; padding: 30px; box-shadow: 0 5px 15px rgba(0,0,0,0.1); }
        .btn { display: inline-block; padding: 12px 24px; background: #667eea; color: white; border: none; border-radius: 8px; font-size: 16px; cursor: pointer; margin: 10px 5px; text-decoration: none; }
        .btn:hover { background: #5a67d8; }
        .btn-success { background: #28a745; }
        .btn-success:hover { background: #218838; }
        .products-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(250px, 1fr)); gap: 20px; margin-top: 30px; }
        .product-card { background: white; border-radius: 10px; padding: 20px; box-shadow: 0 3px 10px rgba(0,0,0,0.1); border: 1px solid #eee; }
        .product-title { font-size: 1.2rem; font-weight: bold; margin-bottom: 10px; }
        .product-price { font-size: 1.5rem; color: #ff4400; font-weight: bold; margin-bottom: 10px; }
        .message { padding: 15px; border-radius: 8px; margin: 15px 0; }
        .success { background: #d4edda; color: #155724; border: 1px solid #c3e6cb; }
        .error { background: #f8d7da; color: #721c24; border: 1px solid #f5c6cb; }
        footer { text-align: center; padding: 30px 20px; color: #666; margin-top: 40px; }
    </style>
</head>
<body>
    <div class="container">
        <header>
            <h1>🛒 淘宝商城</h1>
            <p class="subtitle">Cloudflare D1数据库版 | 全栈电商解决方案</p>
        </header>
        
        <div class="main-content">
            <h2>欢迎来到淘宝商城！</h2>
            <p>这是一个基于Cloudflare Workers和D1数据库构建的完整电商系统。</p>
            
            <div style="margin: 20px 0;">
                <button class="btn btn-success" onclick="initDatabase()">初始化数据库</button>
                <button class="btn" onclick="loadProducts()">加载商品</button>
                <button class="btn" onclick="checkHealth()">检查状态</button>
            </div>
            
            <div id="message"></div>
            
            <div id="products" style="display: none;">
                <h3>商品列表</h3>
                <div class="products-grid" id="products-grid"></div>
            </div>
            
            <div style="margin-top: 40px; padding: 20px; background: #f8f9fa; border-radius: 10px;">
                <h3>API端点</h3>
                <p><strong>GET</strong> <code>/api/health</code> - 健康检查</p>
                <p><strong>GET</strong> <code>/api/products</code> - 商品列表</p>
                <p><strong>POST</strong> <code>/api/init-db</code> - 初始化数据库</p>
            </div>
        </div>
        
        <footer>
            <p>© 2026 淘宝商城 - 基于Cloudflare Workers和D1数据库构建</p>
            <p>访问地址: https://taobao-d1-807504.ywqih1206979-06f.workers.dev</p>
        </footer>
    </div>
    
    <script>
        const BASE_URL = window.location.origin;
        
        function showMessage(text, type) {
            const messageDiv = document.getElementById('message');
            messageDiv.innerHTML = '<div class="message ' + type + '">' + text + '</div>';
            setTimeout(() => messageDiv.innerHTML = '', 3000);
        }
        
        async function checkHealth() {
            try {
                const response = await fetch(BASE_URL + '/api/health');
                const data = await response.json();
                showMessage('✅ ' + data.message, 'success');
            } catch (error) {
                showMessage('❌ 检查失败: ' + error.message, 'error');
            }
        }
        
        async function initDatabase() {
            try {
                showMessage('正在初始化数据库...', 'info');
                const response = await fetch(BASE_URL + '/api/init-db', { method: 'POST' });
                const data = await response.json();
                if (data.success) {
                    showMessage('✅ ' + data.message, 'success');
                } else {
                    showMessage('❌ ' + data.message, 'error');
                }
            } catch (error) {
                showMessage('❌ 请求失败: ' + error.message, 'error');
            }
        }
        
        async function loadProducts() {
            try {
                showMessage('正在加载商品...', 'info');
                const response = await fetch(BASE_URL + '/api/products');
                const data = await response.json();
                
                if (data.success) {
                    document.getElementById('products').style.display = 'block';
                    const grid = document.getElementById('products-grid');
                    grid.innerHTML = '';
                    
                    data.data.forEach(product => {
                        const card = document.createElement('div');
                        card.className = 'product-card';
                        card.innerHTML = \`
                            <div class="product-title">\${product.name}</div>
                            <div class="product-price">¥\${product.price}</div>
                            <div>库存: \${product.stock}件</div>
                            <button class="btn" style="margin-top: 10px;" onclick="addToCart(\${product.id})">加入购物车</button>
                        \`;
                        grid.appendChild(card);
                    });
                    
                    showMessage('✅ 加载了 ' + data.data.length + ' 个商品', 'success');
                }
            } catch (error) {
                showMessage('❌ 加载失败: ' + error.message, 'error');
            }
        }
        
        function addToCart(productId) {
            showMessage('✅ 商品已添加到购物车', 'success');
        }
        
        // 页面加载时自动检查状态
        window.addEventListener('DOMContentLoaded', () => {
            checkHealth();
        });
    </script>
</body>
</html>`;
}