// 淘宝商城 - Cloudflare D1 完整后端
// 包含：D1 数据库 + 真实 API + 用户认证 + 购物车 + 订单

export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);
    const path = url.pathname;
    
    // 检查数据库
    if (!env.DB) {
      return jsonResponse({ 
        success: false, 
        message: 'D1 数据库未配置' 
      }, 500);
    }
    
    // API 路由
    if (path.startsWith('/api/')) {
      return handleAPI(request, env, path);
    }
    
    // 静态文件
    return serveStatic(path, ctx);
  }
};

// API 路由处理
async function handleAPI(request, env, path) {
  const method = request.method;
  
  try {
    // ===== 健康检查 =====
    if (path === '/api/health' && method === 'GET') {
      const { count } = await env.DB.prepare('SELECT COUNT(*) as count FROM products').first();
      return jsonResponse({
        success: true,
        message: '淘宝商城 D1 后端运行正常',
        timestamp: new Date().toISOString(),
        database: {
          products: count || 0,
          status: 'connected'
        }
      });
    }
    
    // ===== 商品 API =====
    if (path === '/api/products' && method === 'GET') {
      const products = await env.DB.prepare('SELECT * FROM products WHERE status = "active"').all();
      return jsonResponse({
        success: true,
        data: products.results || [],
        total: products.results?.length || 0
      });
    }
    
    // 单个商品
    if (path.match(/^\/api\/products\/\d+$/) && method === 'GET') {
      const id = path.split('/').pop();
      const product = await env.DB.prepare('SELECT * FROM products WHERE id = ?').bind(id).first();
      
      if (product) {
        return jsonResponse({ success: true, data: product });
      }
      return jsonResponse({ success: false, message: '商品不存在' }, 404);
    }
    
    // ===== 分类 API =====
    if (path === '/api/categories' && method === 'GET') {
      const categories = await env.DB.prepare('SELECT * FROM categories ORDER BY sort_order').all();
      return jsonResponse({
        success: true,
        data: categories.results || []
      });
    }
    
    // ===== 用户认证 =====
    if (path === '/api/auth/login' && method === 'POST') {
      const body = await request.json();
      const { username, password } = body;
      
      if (!username || !password) {
        return jsonResponse({ success: false, message: '用户名和密码不能为空' }, 400);
      }
      
      // 简单验证（生产环境应该用 bcrypt 加密）
      const user = await env.DB.prepare(
        'SELECT id, username, email, created_at FROM users WHERE username = ? AND password_hash = ?'
      ).bind(username, password).first();
      
      if (user) {
        // 更新最后登录时间
        await env.DB.prepare('UPDATE users SET last_login = CURRENT_TIMESTAMP WHERE id = ?').bind(user.id).run();
        
        return jsonResponse({
          success: true,
          message: '登录成功',
          token: `jwt_${user.id}_${Date.now()}`,
          user: user
        });
      }
      
      return jsonResponse({ success: false, message: '用户名或密码错误' }, 401);
    }
    
    // 用户注册
    if (path === '/api/auth/register' && method === 'POST') {
      const body = await request.json();
      const { username, password, email } = body;
      
      if (!username || !password) {
        return jsonResponse({ success: false, message: '用户名和密码必填' }, 400);
      }
      
      try {
        const result = await env.DB.prepare(
          'INSERT INTO users (username, password_hash, email) VALUES (?, ?, ?)'
        ).bind(username, password, email || null).run();
        
        return jsonResponse({
          success: true,
          message: '注册成功',
          user: { id: result.meta.last_row_id, username }
        });
      } catch (e) {
        if (e.message.includes('UNIQUE')) {
          return jsonResponse({ success: false, message: '用户名已存在' }, 400);
        }
        throw e;
      }
    }
    
    // ===== 购物车 API =====
    if (path === '/api/cart' && method === 'GET') {
      // 需要用户 ID（从 token 获取，这里简化）
      const userId = request.headers.get('X-User-ID') || 1;
      const items = await env.DB.prepare(`
        SELECT ci.*, p.name, p.price, p.main_image_url 
        FROM cart_items ci 
        JOIN products p ON ci.product_id = p.id 
        WHERE ci.user_id = ?
      `).bind(userId).all();
      
      return jsonResponse({
        success: true,
        data: items.results || []
      });
    }
    
    // 添加到购物车
    if (path === '/api/cart' && method === 'POST') {
      const userId = request.headers.get('X-User-ID') || 1;
      const body = await request.json();
      const { product_id, quantity = 1 } = body;
      
      try {
        // 检查是否已存在
        const existing = await env.DB.prepare(
          'SELECT * FROM cart_items WHERE user_id = ? AND product_id = ?'
        ).bind(userId, product_id).first();
        
        if (existing) {
          await env.DB.prepare(
            'UPDATE cart_items SET quantity = quantity + ?, updated_at = CURRENT_TIMESTAMP WHERE user_id = ? AND product_id = ?'
          ).bind(quantity, userId, product_id).run();
        } else {
          await env.DB.prepare(
            'INSERT INTO cart_items (user_id, product_id, quantity) VALUES (?, ?, ?)'
          ).bind(userId, product_id, quantity).run();
        }
        
        return jsonResponse({ success: true, message: '已添加到购物车' });
      } catch (e) {
        return jsonResponse({ success: false, message: '添加失败：' + e.message }, 500);
      }
    }
    
    // 从购物车删除
    if (path.match(/^\/api\/cart\/\d+$/) && method === 'DELETE') {
      const userId = request.headers.get('X-User-ID') || 1;
      const itemId = path.split('/').pop();
      
      const result = await env.DB.prepare(
        'DELETE FROM cart_items WHERE id = ? AND user_id = ?'
      ).bind(itemId, userId).run();
      
      if (result.changes > 0) {
        return jsonResponse({ success: true, message: '已删除' });
      }
      return jsonResponse({ success: false, message: '购物车项目不存在' }, 404);
    }
    
    // ===== 订单 API =====
    if (path === '/api/orders' && method === 'GET') {
      const userId = request.headers.get('X-User-ID') || 1;
      const orders = await env.DB.prepare(`
        SELECT o.*, a.recipient_name, a.phone, a.detail_address
        FROM orders o
        JOIN addresses a ON o.address_id = a.id
        WHERE o.user_id = ?
        ORDER BY o.created_at DESC
      `).bind(userId).all();
      
      return jsonResponse({
        success: true,
        data: orders.results || []
      });
    }
    
    // 创建订单
    if (path === '/api/orders' && method === 'POST') {
      const userId = request.headers.get('X-User-ID') || 1;
      const body = await request.json();
      const { address_id, items = [] } = body;
      
      if (!address_id || items.length === 0) {
        return jsonResponse({ success: false, message: '地址和商品必填' }, 400);
      }
      
      // 生成订单号
      const orderNo = 'ORD' + Date.now();
      
      // 计算总金额
      let totalAmount = 0;
      for (const item of items) {
        const product = await env.DB.prepare('SELECT price, stock FROM products WHERE id = ?').bind(item.product_id).first();
        if (!product || product.stock < item.quantity) {
          return jsonResponse({ success: false, message: '商品库存不足' }, 400);
        }
        totalAmount += product.price * item.quantity;
      }
      
      // 创建订单（使用事务）
      try {
        await env.DB.exec('BEGIN TRANSACTION');
        
        // 插入订单
        const orderResult = await env.DB.prepare(`
          INSERT INTO orders (order_no, user_id, total_amount, final_amount, address_id, payment_status, order_status)
          VALUES (?, ?, ?, ?, ?, 'pending', 'pending')
        `).bind(orderNo, userId, totalAmount, totalAmount, address_id).run();
        
        const orderId = orderResult.meta.last_row_id;
        
        // 插入订单商品
        for (const item of items) {
          const product = await env.DB.prepare('SELECT price, name FROM products WHERE id = ?').bind(item.product_id).first();
          await env.DB.prepare(`
            INSERT INTO order_items (order_id, product_id, product_name, product_price, quantity, subtotal)
            VALUES (?, ?, ?, ?, ?, ?)
          `).bind(orderId, item.product_id, product.name, product.price, item.quantity, product.price * item.quantity).run();
          
          // 更新库存
          await env.DB.prepare('UPDATE products SET stock = stock - ? WHERE id = ?').bind(item.quantity, item.product_id).run();
        }
        
        // 清空购物车
        await env.DB.prepare('DELETE FROM cart_items WHERE user_id = ?').bind(userId).run();
        
        await env.DB.exec('COMMIT');
        
        return jsonResponse({
          success: true,
          message: '订单创建成功',
          data: { order_id: orderId, order_no: orderNo, total: totalAmount }
        });
      } catch (e) {
        await env.DB.exec('ROLLBACK');
        return jsonResponse({ success: false, message: '订单创建失败：' + e.message }, 500);
      }
    }
    
    // ===== 收藏 API =====
    if (path === '/api/favorites' && method === 'GET') {
      const userId = request.headers.get('X-User-ID') || 1;
      const items = await env.DB.prepare(`
        SELECT f.*, p.name, p.price, p.main_image_url
        FROM favorites f
        JOIN products p ON f.product_id = p.id
        WHERE f.user_id = ?
      `).bind(userId).all();
      
      return jsonResponse({
        success: true,
        data: items.results || []
      });
    }
    
    // 添加收藏
    if (path === '/api/favorites' && method === 'POST') {
      const userId = request.headers.get('X-User-ID') || 1;
      const body = await request.json();
      const { product_id } = body;
      
      try {
        await env.DB.prepare(
          'INSERT OR IGNORE INTO favorites (user_id, product_id) VALUES (?, ?)'
        ).bind(userId, product_id).run();
        
        return jsonResponse({ success: true, message: '已收藏' });
      } catch (e) {
        return jsonResponse({ success: false, message: '收藏失败' }, 500);
      }
    }
    
    // 取消收藏
    if (path.match(/^\/api\/favorites\/\d+$/) && method === 'DELETE') {
      const userId = request.headers.get('X-User-ID') || 1;
      const productId = path.split('/').pop();
      
      const result = await env.DB.prepare(
        'DELETE FROM favorites WHERE user_id = ? AND product_id = ?'
      ).bind(userId, productId).run();
      
      return jsonResponse({ success: true, message: '已取消收藏' });
    }
    
    // 404
    return jsonResponse({ 
      success: false, 
      message: 'API 不存在',
      path: path,
      method: method
    }, 404);
    
  } catch (error) {
    console.error('API Error:', error);
    return jsonResponse({ 
      success: false, 
      message: '服务器错误：' + error.message 
    }, 500);
  }
}

// 静态文件服务
async function serveStatic(path, ctx) {
  if (path === '/' || path === '') path = '/index.html';
  
  const githubUrl = `https://raw.githubusercontent.com/xiteral128/web-learning/main${path}`;
  
  try {
    const response = await fetch(githubUrl);
    if (!response.ok) return new Response('Not Found', { status: 404 });
    
    const contentType = getContentType(path);
    const headers = new Headers({
      'Content-Type': contentType,
      'Cache-Control': 'public, max-age=3600'
    });
    
    return new Response(response.body, { status: 200, headers });
  } catch (e) {
    return new Response('Error', { status: 500 });
  }
}

// 辅助函数
function jsonResponse(data, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { 'Content-Type': 'application/json' }
  });
}

function getContentType(path) {
  const ext = path.split('.').pop().toLowerCase();
  const types = {
    'html': 'text/html; charset=utf-8',
    'css': 'text/css; charset=utf-8',
    'js': 'application/javascript; charset=utf-8',
    'json': 'application/json; charset=utf-8',
    'png': 'image/png',
    'jpg': 'image/jpeg',
    'jpeg': 'image/jpeg',
    'gif': 'image/gif',
    'svg': 'image/svg+xml',
    'avif': 'image/avif',
    'webp': 'image/webp'
  };
  return types[ext] || 'application/octet-stream';
}
