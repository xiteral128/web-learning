// 存储工具类
const Storage = {
  get(key) {
    return JSON.parse(localStorage.getItem(key) || 'null');
  },
  set(key, value) {
    localStorage.setItem(key, JSON.stringify(value));
  },
  remove(key) {
    localStorage.removeItem(key);
  }
};

// 初始化数据
if (!Storage.get('users')) Storage.set('users', []);
if (!Storage.get('cart')) Storage.set('cart', []);
if (!Storage.get('collect')) Storage.set('collect', []);
if (!Storage.get('user')) Storage.set('user', null);

// 商品数据
const goodsData = {
  all: [
    { id: 1, name: '2024新款夏季连衣裙女气质显瘦碎花长裙', price: 129, img: './img/长裙.avif', cate: 'women' },
    { id: 2, name: '苹果15Pro Max官方正品全新未拆封5G手机', price: 8999, img: './img/苹果15.avif', cate: 'digital' },
    { id: 3, name: '小米空气净化器4Pro家用除甲醛除菌除异味', price: 899, img: './img/小米.avif', cate: 'home' },
    { id: 4, name: '2024新款男士短袖T恤纯棉宽松百搭打底衫', price: 59, img: './img/T恤男.avif', cate: 'men' },
    { id: 5, name: '冰丝短袖T恤女2024新款宽松显瘦百搭上衣', price: 69, img: './img/T恤女.avif', cate: 'women' },
    { id: 6, name: '夏季薄款牛仔裤男直筒宽松百搭休闲长裤', price: 139, img: './img/牛仔裤男.avif', cate: 'men' },
    { id: 7, name: '华为Mate60 Pro官方正品5G智能手机', price: 6999, img: './img/华为.avif', cate: 'digital' },
    { id: 8, name: '无印良品纯棉四件套全棉床单被套简约风', price: 399, img: './img/被套.avif', cate: 'home' }
  ],
  women: [
    { id: 1, name: '2024新款夏季连衣裙女气质显瘦碎花长裙', price: 129, img: './img/长裙.avif', cate: 'women' },
    { id: 5, name: '冰丝短袖T恤女2024新款宽松显瘦百搭上衣', price: 69, img: './img/T恤女.avif', cate: 'women' },
    { id: 9, name: '高腰牛仔短裤女2024夏季薄款显瘦a字热裤', price: 89, img: './img/牛仔裤女.avif', cate: 'women' },
    { id: 10, name: '防晒衣女2024新款冰丝透气防紫外线薄款外套', price: 99, img: './img/防晒衣女.avif', cate: 'women' }
  ],
  men: [
    { id: 4, name: '2024新款男士短袖T恤纯棉宽松百搭打底衫', price: 59, img: './img/T恤男.avif', cate: 'men' },
    { id: 6, name: '夏季薄款牛仔裤男直筒宽松百搭休闲长裤', price: 139, img: './img/牛仔裤男.avif', cate: 'men' },
    { id: 11, name: '男士冰丝速干短袖衬衫商务休闲免烫衬衣', price: 129, img: './img/衬衫男.avif', cate: 'men' },
    { id: 12, name: '运动短裤男夏季速干透气宽松五分裤', price: 59, img: './img/五分裤.avif', cate: 'men' }
  ],
  digital: [
    { id: 2, name: '苹果15Pro Max官方正品全新未拆封5G手机', price: 8999, img: './img/苹果15.avif', cate: 'digital' },
    { id: 7, name: '华为Mate60 Pro官方正品5G智能手机', price: 6999, img: './img/华为.avif', cate: 'digital' },
    { id: 13, name: '小米平板6 Pro 11.2英寸骁龙8+平板电脑', price: 2499, img: './img/小米平板.avif', cate: 'digital' },
    { id: 14, name: 'AirPods Pro第二代无线蓝牙耳机主动降噪', price: 1499, img: './img/耳机.avif', cate: 'digital' }
  ],
  home: [
    { id: 3, name: '小米空气净化器4Pro家用除甲醛除菌除异味', price: 899, img: './img/小米.avif', cate: 'home' },
    { id: 8, name: '无印良品纯棉四件套全棉床单被套简约风', price: 399, img: './img/被套.avif', cate: 'home' },
    { id: 15, name: '宜家同款实木餐桌椅组合小户型吃饭桌子', price: 899, img: './img/桌子.avif', cate: 'home' },
    { id: 16, name: '小熊加湿器家用静音卧室大雾量孕妇婴儿', price: 199, img: './img/加湿器.avif', cate: 'home' }
  ]
};

// DOM加载完成后执行
document.addEventListener('DOMContentLoaded', function() {
  // ===== 轮播图功能 =====
  const sliderItems = document.querySelectorAll('.slider-item');
  const indicators = document.querySelectorAll('.slider-indicator span');
  const prevBtn = document.querySelector('.prev-btn');
  const nextBtn = document.querySelector('.next-btn');
  let currentSlide = 0;
  let slideTimer;

  // 切换轮播图
  function switchSlide(index) {
    // 移除所有active类
    sliderItems.forEach(item => item.classList.remove('active'));
    indicators.forEach(ind => ind.classList.remove('active'));
    
    // 设置当前轮播图
    currentSlide = index % sliderItems.length;
    if (currentSlide < 0) currentSlide = sliderItems.length - 1;
    
    sliderItems[currentSlide].classList.add('active');
    indicators[currentSlide].classList.add('active');
  }

  // 自动轮播
  function autoSlide() {
    slideTimer = setInterval(() => {
      switchSlide(currentSlide + 1);
    }, 3000);
  }

  // 初始化轮播图
  autoSlide();

  // 手动切换
  prevBtn.addEventListener('click', () => {
    clearInterval(slideTimer);
    switchSlide(currentSlide - 1);
    autoSlide();
  });

  nextBtn.addEventListener('click', () => {
    clearInterval(slideTimer);
    switchSlide(currentSlide + 1);
    autoSlide();
  });

  // 指示器点击
  indicators.forEach((ind, index) => {
    ind.addEventListener('click', () => {
      clearInterval(slideTimer);
      switchSlide(index);
      autoSlide();
    });
  });

  // ===== 分类切换 =====
  const cateItems = document.querySelectorAll('.category-nav li');
  const goodsList = document.getElementById('goods-list');

  // 渲染商品列表
  function renderGoods(cate) {
    const goods = goodsData[cate] || goodsData.all;
    goodsList.innerHTML = '';
    
    goods.forEach(item => {
      const isCollected = Storage.get('collect')?.some(c => c.id === item.id) || false;
      
      const goodsItem = document.createElement('div');
      goodsItem.className = 'goods-item';
      // 新增图片容器，实现悬停放大
      goodsItem.innerHTML = `
        <div class="goods-img-wrap">
          <img src="${item.img}" alt="${item.name}">
        </div>
        <div class="goods-name">${item.name}</div>
        <div class="goods-price">¥${item.price}.00</div>
        <div class="goods-actions">
          <button class="goods-btn add-cart" data-id="${item.id}">加入购物车</button>
          <button class="goods-btn add-collect" data-id="${item.id}" ${isCollected ? 'style="background-color:#ff4400;color:#fff;"' : ''}>
            ${isCollected ? '已收藏' : '收藏'}
          </button>
        </div>
      `;
      goodsList.appendChild(goodsItem);
    });

    // 绑定商品操作事件
    bindGoodsEvents();
  }

  // 初始化商品列表
  renderGoods('all');

  // 分类点击切换
  cateItems.forEach(item => {
    item.addEventListener('click', function() {
      // 移除所有active
      cateItems.forEach(li => li.classList.remove('active'));
      // 添加当前active
      this.classList.add('active');
      // 渲染对应分类商品
      renderGoods(this.dataset.cate);
    });
  });

  // ===== 弹窗控制 =====
  const modals = {
    login: document.getElementById('login-modal'),
    register: document.getElementById('register-modal'),
    cart: document.getElementById('cart-modal'),
    collect: document.getElementById('collect-modal'),
    success: document.getElementById('success-modal')
  };

  const closeBtns = {
    login: document.getElementById('close-login'),
    register: document.getElementById('close-register'),
    cart: document.getElementById('close-cart'),
    collect: document.getElementById('close-collect'),
    success: document.getElementById('close-success')
  };

  // 打开弹窗
  document.getElementById('show-login').addEventListener('click', () => {
    // 显示登录弹窗（独立悬浮层）
    modals.login.style.display = 'block';
    // 禁止body滚动
    document.body.style.overflow = 'hidden';
  });

  document.getElementById('show-register').addEventListener('click', () => {
    // 显示注册弹窗（独立悬浮层）
    modals.register.style.display = 'block';
    // 禁止body滚动
    document.body.style.overflow = 'hidden';
  });

  document.getElementById('show-cart').addEventListener('click', () => {
    // 检查登录状态
    if (!checkLogin()) return;
    modals.cart.style.display = 'block';
    document.body.style.overflow = 'hidden';
    renderCart();
  });

  document.getElementById('show-collect').addEventListener('click', () => {
    // 检查登录状态
    if (!checkLogin()) return;
    modals.collect.style.display = 'block';
    document.body.style.overflow = 'hidden';
    renderCollect();
  });

  // 关闭弹窗
  Object.keys(closeBtns).forEach(key => {
    closeBtns[key].addEventListener('click', () => {
      modals[key].style.display = 'none';
      // 恢复body滚动
      document.body.style.overflow = 'auto';
    });
  });

  // 点击遮罩层关闭弹窗
  document.querySelectorAll('.modal-overlay').forEach(overlay => {
    overlay.addEventListener('click', function() {
      this.parentElement.style.display = 'none';
      // 恢复body滚动
      document.body.style.overflow = 'auto';
    });
  });

  // ===== 登录/注册/退出功能 =====
  // 生成随机验证码
  function generateCode() {
    return Math.floor(1000 + Math.random() * 9000).toString();
  }

  // 刷新验证码
  document.getElementById('login-code-box').addEventListener('click', function() {
    this.textContent = generateCode();
  });

  document.getElementById('reg-code-box').addEventListener('click', function() {
    this.textContent = generateCode();
  });

  // 登录验证
  document.getElementById('do-login').addEventListener('click', function() {
    const username = document.getElementById('login-username').value.trim();
    const password = document.getElementById('login-password').value.trim();
    const code = document.getElementById('login-code').value.trim();
    const codeBox = document.getElementById('login-code-box').textContent;

    if (!username) {
      alert('请输入用户名！');
      return;
    }

    if (!password) {
      alert('请输入密码！');
      return;
    }

    if (code !== codeBox) {
      alert('验证码错误！');
      return;
    }

    const users = Storage.get('users') || [];
    const user = users.find(u => u.username === username && u.password === password);

    if (user) {
      // 登录成功
      Storage.set('user', user);
      alert('登录成功！');
      modals.login.style.display = 'none';
      document.body.style.overflow = 'auto';
      // 清空登录表单
      document.getElementById('login-username').value = '';
      document.getElementById('login-password').value = '';
      document.getElementById('login-code').value = '';
      document.getElementById('login-code-box').textContent = generateCode();
      // 更新用户状态
      updateUserStatus();
    } else {
      alert('用户名或密码错误！');
    }
  });

  // 注册功能
  document.getElementById('do-register').addEventListener('click', function() {
    const username = document.getElementById('reg-username').value.trim();
    const password = document.getElementById('reg-password').value.trim();
    const repassword = document.getElementById('reg-repassword').value.trim();
    const code = document.getElementById('reg-code').value.trim();
    const codeBox = document.getElementById('reg-code-box').textContent;

    if (!username) {
      alert('请设置用户名！');
      return;
    }

    if (!password) {
      alert('请设置密码！');
      return;
    }

    if (password !== repassword) {
      alert('两次密码不一致！');
      return;
    }

    if (code !== codeBox) {
      alert('验证码错误！');
      return;
    }

    const users = Storage.get('users') || [];
    if (users.some(u => u.username === username)) {
      alert('用户名已存在！');
      return;
    }

    // 注册成功
    users.push({ username, password });
    Storage.set('users', users);
    alert('注册成功！请登录');
    modals.register.style.display = 'none';
    document.body.style.overflow = 'auto';
    // 清空注册表单
    document.getElementById('reg-username').value = '';
    document.getElementById('reg-password').value = '';
    document.getElementById('reg-repassword').value = '';
    document.getElementById('reg-code').value = '';
    document.getElementById('reg-code-box').textContent = generateCode();
  });

  // 退出登录功能
  document.getElementById('show-logout').addEventListener('click', function() {
    if (confirm('确定要退出登录吗？')) {
      // 清除登录状态
      Storage.set('user', null);
      // 更新用户状态
      updateUserStatus();
      // 关闭所有弹窗
      Object.keys(modals).forEach(key => {
        modals[key].style.display = 'none';
      });
      document.body.style.overflow = 'auto';
      // 刷新商品列表（重置收藏状态显示）
      renderGoods(document.querySelector('.category-nav li.active').dataset.cate);
      alert('已成功退出登录！');
    }
  });

  // 检查登录状态
  function checkLogin() {
    const user = Storage.get('user');
    if (!user) {
      alert('请先登录！');
      modals.login.style.display = 'block';
      document.body.style.overflow = 'hidden';
      return false;
    }
    return true;
  }

  // 更新用户状态
  function updateUserStatus() {
    const user = Storage.get('user');
    const loginBtn = document.getElementById('show-login');
    const registerBtn = document.getElementById('show-register');
    const logoutBtn = document.getElementById('show-logout');
    
    if (user) {
      // 已登录状态
      loginBtn.textContent = `欢迎：${user.username}`;
      loginBtn.style.pointerEvents = 'none';
      registerBtn.style.display = 'none';
      logoutBtn.style.display = 'inline';
    } else {
      // 未登录状态
      loginBtn.textContent = '请登录';
      loginBtn.style.pointerEvents = 'auto';
      registerBtn.style.display = 'inline';
      logoutBtn.style.display = 'none';
    }
    
    // 更新购物车数量
    updateCartCount();
  }

  // ===== 购物车功能 =====
  // 更新购物车数量
  function updateCartCount() {
    const cart = Storage.get('cart') || [];
    const count = cart.reduce((sum, item) => sum + item.num, 0);
    document.querySelector('.cart-count').textContent = count;
  }

  // 绑定商品操作事件
  function bindGoodsEvents() {
    // 加入购物车
    document.querySelectorAll('.add-cart').forEach(btn => {
      btn.addEventListener('click', function() {
        if (!checkLogin()) return;
        
        const goodsId = parseInt(this.dataset.id);
        const goods = findGoodsById(goodsId);
        
        if (!goods) return;
        
        let cart = Storage.get('cart') || [];
        const cartItem = cart.find(item => item.id === goodsId);
        
        if (cartItem) {
          // 数量+1
          cartItem.num += 1;
        } else {
          // 新增商品
          cart.push({ ...goods, num: 1 });
        }
        
        Storage.set('cart', cart);
        alert(`「${goods.name}」已加入购物车！`);
        updateCartCount();
      });
    });

    // 收藏商品
    document.querySelectorAll('.add-collect').forEach(btn => {
      btn.addEventListener('click', function() {
        if (!checkLogin()) return;
        
        const goodsId = parseInt(this.dataset.id);
        const goods = findGoodsById(goodsId);
        
        if (!goods) return;
        
        let collect = Storage.get('collect') || [];
        const isCollected = collect.some(item => item.id === goodsId);
        
        if (isCollected) {
          // 取消收藏
          collect = collect.filter(item => item.id !== goodsId);
          this.textContent = '收藏';
          this.style.backgroundColor = '#f5f5f5';
          this.style.color = '#333';
          alert(`已取消收藏「${goods.name}」`);
        } else {
          // 添加收藏
          collect.push(goods);
          this.textContent = '已收藏';
          this.style.backgroundColor = '#ff4400';
          this.style.color = '#fff';
          alert(`已收藏「${goods.name}」`);
        }
        
        Storage.set('collect', collect);
      });
    });
  }

  // 根据ID查找商品
  function findGoodsById(id) {
    // 遍历所有分类查找商品
    for (const cate in goodsData) {
      const goods = goodsData[cate].find(item => item.id === id);
      if (goods) return goods;
    }
    return null;
  }

  // 渲染购物车
  function renderCart() {
    const cart = Storage.get('cart') || [];
    const cartList = document.getElementById('cart-list');
    const cartEmpty = document.getElementById('cart-empty');
    const cartFooter = document.getElementById('cart-footer');
    const totalPriceEl = document.getElementById('total-price');
    
    if (cart.length === 0) {
      cartEmpty.style.display = 'block';
      cartList.style.display = 'none';
      cartFooter.style.display = 'none';
      return;
    }
    
    cartEmpty.style.display = 'none';
    cartList.style.display = 'block';
    cartFooter.style.display = 'flex';
    
    cartList.innerHTML = '';
    let totalPrice = 0;
    
    cart.forEach(item => {
      totalPrice += item.price * item.num;
      
      const cartItem = document.createElement('div');
      cartItem.className = 'cart-item';
      cartItem.innerHTML = `
        <img src="${item.img}" alt="${item.name}">
        <div class="cart-item-info">
          <div class="cart-item-name">${item.name}</div>
          <div class="cart-item-price">¥${item.price}.00</div>
        </div>
        <div class="cart-item-ctrl">
          <div class="cart-num">
            <button class="cart-num-btn minus" data-id="${item.id}">-</button>
            <input type="text" class="cart-num-input" value="${item.num}" readonly>
            <button class="cart-num-btn plus" data-id="${item.id}">+</button>
          </div>
          <div class="cart-del-btn" data-id="${item.id}">删除</div>
        </div>
      `;
      cartList.appendChild(cartItem);
    });
    
    totalPriceEl.textContent = totalPrice.toFixed(2);
    
    // 绑定购物车操作事件
    bindCartEvents();
  }

  // 绑定购物车操作事件
  function bindCartEvents() {
    // 数量减
    document.querySelectorAll('.cart-num-btn.minus').forEach(btn => {
      btn.addEventListener('click', function() {
        const goodsId = parseInt(this.dataset.id);
        let cart = Storage.get('cart') || [];
        const cartItem = cart.find(item => item.id === goodsId);
        
        if (cartItem.num > 1) {
          cartItem.num -= 1;
        } else {
          // 数量为1时删除
          cart = cart.filter(item => item.id !== goodsId);
        }
        
        Storage.set('cart', cart);
        renderCart();
        updateCartCount();
      });
    });

    // 数量加
    document.querySelectorAll('.cart-num-btn.plus').forEach(btn => {
      btn.addEventListener('click', function() {
        const goodsId = parseInt(this.dataset.id);
        let cart = Storage.get('cart') || [];
        const cartItem = cart.find(item => item.id === goodsId);
        
        cartItem.num += 1;
        Storage.set('cart', cart);
        renderCart();
        updateCartCount();
      });
    });

    // 删除商品
    document.querySelectorAll('.cart-del-btn').forEach(btn => {
      btn.addEventListener('click', function() {
        if (!confirm('确定删除该商品吗？')) return;
        
        const goodsId = parseInt(this.dataset.id);
        let cart = Storage.get('cart') || [];
        cart = cart.filter(item => item.id !== goodsId);
        
        Storage.set('cart', cart);
        renderCart();
        updateCartCount();
      });
    });

    // 结算
    document.getElementById('do-checkout').addEventListener('click', function() {
      const cart = Storage.get('cart') || [];
      if (cart.length === 0) return;
      
      if (confirm('确定结算吗？')) {
        // 生成订单号
        const orderNo = 'ORD' + Date.now();
        document.getElementById('order-no').textContent = orderNo;
        
        // 清空购物车
        Storage.set('cart', []);
        
        // 显示成功弹窗
        modals.cart.style.display = 'none';
        modals.success.style.display = 'block';
        
        // 更新购物车数量
        updateCartCount();
      }
    });
  }

  // ===== 收藏功能 =====
  function renderCollect() {
    const collect = Storage.get('collect') || [];
    const collectList = document.getElementById('collect-list');
    const collectEmpty = document.getElementById('collect-empty');
    
    if (collect.length === 0) {
      collectEmpty.style.display = 'block';
      collectList.style.display = 'none';
      return;
    }
    
    collectEmpty.style.display = 'none';
    collectList.style.display = 'block';
    
    collectList.innerHTML = '';
    
    collect.forEach(item => {
      const collectItem = document.createElement('div');
      collectItem.className = 'cart-item';
      collectItem.innerHTML = `
        <img src="${item.img}" alt="${item.name}">
        <div class="cart-item-info">
          <div class="cart-item-name">${item.name}</div>
          <div class="cart-item-price">¥${item.price}.00</div>
        </div>
        <div class="cart-item-ctrl">
          <button class="goods-btn add-cart" data-id="${item.id}">加入购物车</button>
          <div class="cart-del-btn" data-id="${item.id}">取消收藏</div>
        </div>
      `;
      collectList.appendChild(collectItem);
    });
    
    // 绑定收藏操作事件
    bindCollectEvents();
  }

  // 绑定收藏操作事件
  function bindCollectEvents() {
    // 加入购物车
    document.querySelectorAll('#collect-list .add-cart').forEach(btn => {
      btn.addEventListener('click', function() {
        const goodsId = parseInt(this.dataset.id);
        const goods = findGoodsById(goodsId);
        
        if (!goods) return;
        
        let cart = Storage.get('cart') || [];
        const cartItem = cart.find(item => item.id === goodsId);
        
        if (cartItem) {
          cartItem.num += 1;
        } else {
          cart.push({ ...goods, num: 1 });
        }
        
        Storage.set('cart', cart);
        alert(`「${goods.name}」已加入购物车！`);
        updateCartCount();
      });
    });

    // 取消收藏
    document.querySelectorAll('#collect-list .cart-del-btn').forEach(btn => {
      btn.addEventListener('click', function() {
        if (!confirm('确定取消收藏吗？')) return;
        
        const goodsId = parseInt(this.dataset.id);
        let collect = Storage.get('collect') || [];
        collect = collect.filter(item => item.id !== goodsId);
        
        Storage.set('collect', collect);
        renderCollect();
        
        // 更新商品列表中的收藏状态
        renderGoods(document.querySelector('.category-nav li.active').dataset.cate);
      });
    });
  }

  // 返回首页
  document.getElementById('back-home').addEventListener('click', function() {
    modals.success.style.display = 'none';
    document.body.style.overflow = 'auto';
    // 回到顶部
    window.scrollTo(0, 0);
  });

  // 初始化
  updateUserStatus();
});
