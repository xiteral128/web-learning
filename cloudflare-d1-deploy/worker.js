
// Cloudflare Worker with D1 Database
export default {
    async fetch(request, env) {
        const url = new URL(request.url);
        const pathname = url.pathname;
        
        // CORS headers
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
                database: 'D1 (Cloudflare)'
            }), {
                headers: { 
                    'Content-Type': 'application/json',
                    ...corsHeaders 
                }
            });
        }
        
        if (pathname === '/api/products') {
            try {
                // Try to get from D1 database
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
                // Return mock data if table doesn't exist
                return new Response(JSON.stringify({
                    success: true,
                    data: [
                        { id: 1, name: 'iPhone 15 Pro', price: 8999, stock: 100 },
                        { id: 2, name: '小米14 Ultra', price: 6499, stock: 150 },
                        { id: 3, name: '耐克Air Max 270', price: 899, stock: 200 }
                    ],
                    source: 'Mock Data (Database not initialized)',
                    message: 'Use POST /api/init-db to initialize database'
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
                    `),
                    env.DB.prepare(`
                        CREATE TABLE IF NOT EXISTS users (
                            id INTEGER PRIMARY KEY AUTOINCREMENT,
                            username TEXT UNIQUE NOT NULL,
                            email TEXT,
                            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
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
                    `),
                    env.DB.prepare(`
                        INSERT OR IGNORE INTO users (username, email) VALUES
                        ('testuser', 'test@example.com'),
                        ('admin', 'admin@example.com')
                    `)
                ]);
                
                return new Response(JSON.stringify({
                    success: true,
                    message: 'D1数据库初始化完成',
                    tables: ['products', 'categories', 'users']
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
        
        // Default response
        return new Response(JSON.stringify({
            success: true,
            message: '淘宝商城API',
            endpoints: [
                'GET /api/health',
                'GET /api/products',
                'POST /api/init-db',
                'POST /api/auth/login'
            ],
            worker: 'taobao-d1-807504'
        }), {
            headers: { 
                'Content-Type': 'application/json',
                ...corsHeaders 
            }
        });
    }
};
