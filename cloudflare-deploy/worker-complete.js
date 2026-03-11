// Cloudflare Workers - 淘宝商城完整部署
// 服务原始 HTML + CSS + JS + 图片

export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);
    const path = url.pathname;
    
    // API 请求处理
    if (path.startsWith('/api/')) {
      return handleAPI(request, path);
    }
    
    // 静态文件服务 - 从 GitHub 获取
    return serveStatic(path, ctx);
  }
};

// 处理 API 请求
async function handleAPI(request, path) {
  // 健康检查
  if (path === '/api/health') {
    return jsonResponse({
      success: true,
      message: '淘宝商城 API 服务运行正常',
      timestamp: new Date().toISOString()
    });
  }
  
  // 商品列表
  if (path === '/api/products') {
    return jsonResponse({
      success: true,
      data: getMockProducts()
    });
  }
  
  // 分类
  if (path === '/api/categories') {
    return jsonResponse({
      success: true,
      data: getMockCategories()
    });
  }
  
  // 登录
  if (path === '/api/auth/login' && request.method === 'POST') {
    const body = await request.json();
    if (body.username && body.password) {
      return jsonResponse({
        success: true,
        message: '登录成功',
        user: { id: 1, username: body.username }
      });
    }
    return jsonResponse({ success: false, message: '用户名和密码不能为空' }, 400);
  }
  
  // 注册
  if (path === '/api/auth/register' && request.method === 'POST') {
    return jsonResponse({ success: true, message: '注册成功' });
  }
  
  // 404
  return jsonResponse({ success: false, message: 'API 不存在' }, 404);
}

// 服务静态文件
async function serveStatic(path, ctx) {
  // 根路径
  if (path === '/' || path === '') {
    path = '/index.html';
  }
  
  // 从 GitHub 获取文件
  const githubUrl = `https://raw.githubusercontent.com/xiteral128/web-learning/main${path}`;
  
  try {
    const response = await fetch(githubUrl);
    
    if (!response.ok) {
      return new Response('Not Found: ' + path, { status: 404 });
    }
    
    // 设置正确的 Content-Type
    const contentType = getContentType(path);
    const headers = new Headers({
      'Content-Type': contentType,
      'Cache-Control': 'public, max-age=3600'
    });
    
    const body = await response.arrayBuffer();
    
    return new Response(body, {
      status: 200,
      headers: headers
    });
  } catch (error) {
    console.error('Error fetching static file:', error);
    return new Response('Error loading file', { status: 500 });
  }
}

// 获取 Content-Type
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
    'ico': 'image/x-icon',
    'avif': 'image/avif',
    'webp': 'image/webp'
  };
  return types[ext] || 'application/octet-stream';
}

// 辅助函数：JSON 响应
function jsonResponse(data, status = 200) {
  return new Response(JSON.stringify(data), {
    status: status,
    headers: { 'Content-Type': 'application/json' }
  });
}

// 模拟商品数据
function getMockProducts() {
  return [
    { id: 1, name: '2024 新款夏季连衣裙女', price: 129, img: './img/长裙.avif' },
    { id: 2, name: '苹果 15Pro Max 官方正品', price: 8999, img: './img/苹果 15.avif' },
    { id: 3, name: '小米空气净化器 4Pro', price: 899, img: './img/小米.avif' },
    { id: 4, name: '2024 新款男士短袖 T 恤', price: 59, img: './img/T 恤男.avif' },
    { id: 5, name: '冰丝短袖 T 恤女', price: 69, img: './img/T 恤女.avif' },
    { id: 6, name: '夏季薄款牛仔裤男', price: 139, img: './img/牛仔裤男.avif' },
    { id: 7, name: '华为 Mate60 Pro', price: 6999, img: './img/华为.avif' },
    { id: 8, name: '无印良品纯棉四件套', price: 399, img: './img/被套.avif' }
  ];
}

// 模拟分类
function getMockCategories() {
  return [
    { id: 1, name: '电子产品', icon: '📱' },
    { id: 2, name: '服装鞋帽', icon: '👕' },
    { id: 3, name: '家居生活', icon: '🏠' },
    { id: 4, name: '美妆个护', icon: '💄' },
    { id: 5, name: '食品饮料', icon: '🍔' }
  ];
}
