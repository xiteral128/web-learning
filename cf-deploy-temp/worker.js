// Cloudflare Workers 全栈部署
// 同时提供静态文件服务和API服务

// 静态文件缓存
const staticCache = caches.default;

// API路由处理器
const apiHandler = {
  async handleRequest(request) {
    const url = new URL(request.url);
    const path = url.pathname;
    
    // API路由
    if (path.startsWith('/api/')) {
      return await handleAPI(request);
    }
    
    // 静态文件服务
    return await serveStatic(request);
  },
  
  // 处理API请求
  async handleAPI(request) {
    const url = new URL(request.url);
    const path = url.pathname;
    
    // 健康检查
    if (path === '/api/health' || path === '/api/health/') {
      return new Response(JSON.stringify({
        success: true,
        message: '淘宝商城API服务运行正常（Cloudflare Workers）',
        timestamp: new Date().toISOString(),
        version: '1.0.0',
        environment: 'cloudflare-workers'
      }), {
        headers: { 'Content-Type': 'application/json' }
      });
    }
    
    // 商品API - 模拟数据
    if (path === '/api/products' || path === '/api/products/') {
      const products = getMockProducts();
      return new Response(JSON.stringify({
        success: true,
        data: products,
        pagination: {
          total: products.length,
          limit: 20,
          offset: 0,
          hasMore: false
        }
      }), {
        headers: { 'Content-Type': 'application/json' }
      });
    }
    
    // 单个商品
    if (path.match(/^\/api\/products\/\d+$/)) {
      const id = parseInt(path.split('/').pop());
      const product = getMockProduct(id);
      
      if (product) {
        return new Response(JSON.stringify({
          success: true,
          data: product
        }), {
          headers: { 'Content-Type': 'application/json' }
        });
      } else {
        return new Response(JSON.stringify({
          success: false,
          message: '商品不存在'
        }), {
          status: 404,
          headers: { 'Content-Type': 'application/json' }
        });
      }
    }
    
    // 分类
    if (path === '/api/categories' || path === '/api/categories/') {
      const categories = getMockCategories();
      return new Response(JSON.stringify({
        success: true,
        data: categories
      }), {
        headers: { 'Content-Type': 'application/json' }
      });
    }
    
    // 用户认证模拟
    if (path === '/api/auth/login' && request.method === 'POST') {
      try {
        const body = await request.json();
        const { username, password } = body;
        
        // 模拟认证
        if (username && password) {
          const token = btoa(`${username}:${Date.now()}`);
          return new Response(JSON.stringify({
            success: true,
            message: '登录成功',
            token: `cf_${token}`,
            user: {
              id: 1,
              username: username,
              email: `${username}@example.com`,
              created_at: new Date().toISOString()
            }
          }), {
            headers: { 'Content-Type': 'application/json' }
          });
        } else {
          return new Response(JSON.stringify({
            success: false,
            message: '用户名和密码不能为空'
          }), {
            status: 400,
            headers: { 'Content-Type': 'application/json' }
          });
        }
      } catch (error) {
        return new Response(JSON.stringify({
          success: false,
          message: '请求格式错误'
        }), {
          status: 400,
          headers: { 'Content-Type': 'application/json' }
        });
      }
    }
    
    // 注册
    if (path === '/api/auth/register' && request.method === 'POST') {
      return new Response(JSON.stringify({
        success: true,
        message: '注册成功'
      }), {
        headers: { 'Content-Type': 'application/json' }
      });
    }
    
    // 未找到的API
    return new Response(JSON.stringify({
      success: false,
      message: 'API端点不存在',
      available_endpoints: [
        'GET /api/health',
        'GET /api/products',
        'GET /api/products/:id',
        'GET /api/categories',
        'POST /api/auth/login',
        'POST /api/auth/register'
      ]
    }), {
      status: 404,
      headers: { 'Content-Type': 'application/json' }
    });
  }
};

// 静态文件服务
async function serveStatic(request) {
  const url = new URL(request.url);
  let path = url.pathname;
  
  // 默认页面
  if (path === '/' || path === '') {
    path = '/index.html';
  }
  
  // 检查缓存
  let response = await staticCache.match(request);
  
  if (!response) {
    // 从KV存储或内置资源获取
    response = await fetchStaticFile(path);
    
    if (response) {
      // 缓存静态资源（除了HTML）
      if (!path.endsWith('.html')) {
        const cacheResponse = response.clone();
        cacheResponse.headers.append('Cache-Control', 'public, max-age=86400');
        event.waitUntil(staticCache.put(request, cacheResponse));
      }
    } else {
      // 返回404页面
      response = new Response('Not Found', { status: 404 });
    }
  }
  
  return response;
}

// 获取静态文件（模拟）
async function fetchStaticFile(path) {
  // 这里在实际部署中会从KV存储获取
  // 现在返回一个简单的响应表示文件存在
  return new Response(`Static file: ${path}`, {
    headers: { 'Content-Type': 'text/plain' }
  });
}

// 模拟商品数据
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
      category_name: '电子产品',
      main_image_url: 'https://example.com/iphone15.jpg',
      image_urls: ['https://example.com/iphone15_1.jpg', 'https://example.com/iphone15_2.jpg'],
      tags: ['手机', '苹果', '旗舰'],
      sales_count: 150,
      view_count: 500,
      is_hot: true,
      is_recommended: true,
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
      category_name: '电子产品',
      main_image_url: 'https://example.com/xiaomi14.jpg',
      image_urls: ['https://example.com/xiaomi14_1.jpg', 'https://example.com/xiaomi14_2.jpg'],
      tags: ['手机', '小米', '摄影'],
      sales_count: 200,
      view_count: 800,
      is_hot: true,
      is_recommended: true,
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
      category_name: '服装鞋帽',
      main_image_url: 'https://example.com/nike270.jpg',
      image_urls: ['https://example.com/nike270_1.jpg', 'https://example.com/nike270_2.jpg'],
      tags: ['运动鞋', '耐克', '气垫'],
      sales_count: 300,
      view_count: 1200,
      is_hot: true,
      is_recommended: false,
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
      category_name: '服装鞋帽',
      main_image_url: 'https://example.com/uniqlo.jpg',
      image_urls: ['https://example.com/uniqlo_1.jpg', 'https://example.com/uniqlo_2.jpg'],
      tags: ['T恤', '纯棉', '基础款'],
      sales_count: 800,
      view_count: 2500,
      is_hot: false,
      is_recommended: true,
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
      category_name: '家居生活',
      main_image_url: 'https://example.com/dyson.jpg',
      image_urls: ['https://example.com/dyson_1.jpg', 'https://example.com/dyson_2.jpg'],
      tags: ['吸尘器', '戴森', '家电'],
      sales_count: 120,
      view_count: 600,
      is_hot: true,
      is_recommended: true,
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
      sort_order: 1,
      subcategory_count: 3,
      subcategories: [
        { id: 11, name: '手机', description: '智能手机', sort_order: 1 },
        { id: 12, name: '电脑', description: '笔记本、台式机', sort_order: 2 },
        { id: 13, name: '平板', description: '平板电脑', sort_order: 3 }
      ]
    },
    {
      id: 2,
      name: '服装鞋帽',
      description: '男女服装、鞋子、配饰',
      sort_order: 2,
      subcategory_count: 4,
      subcategories: [
        { id: 21, name: '男装', description: '男士服装', sort_order: 1 },
        { id: 22, name: '女装', description: '女士服装', sort_order: 2 },
        { id: 23, name: '鞋子', description: '各种鞋类', sort_order: 3 },
        { id: 24, name: '配饰', description: '包包、帽子等', sort_order: 4 }
      ]
    },
    {
      id: 3,
      name: '家居生活',
      description: '家具、家纺、厨具',
      sort_order: 3,
      subcategory_count: 3,
      subcategories: [
        { id: 31, name: '家具', description: '桌椅床柜', sort_order: 1 },
        { id: 32, name: '家纺', description: '床上用品', sort_order: 2 },
        { id: 33, name: '厨具', description: '厨房用品', sort_order: 3 }
      ]
    }
  ];
}

// Cloudflare Workers入口点
export default {
  async fetch(request, env, ctx) {
    try {
      const handler = Object.create(apiHandler);
      return await handler.handleRequest(request);
    } catch (error) {
      console.error('Worker error:', error);
      return new Response(JSON.stringify({
        success: false,
        message: '服务器内部错误',
        error: error.message
      }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      });
    }
  }
};