// 页面加载完成后执行
document.addEventListener('DOMContentLoaded', function() {
  // ===================== 1. 分类商品数据 =====================
  // 定义各分类对应的商品数据
  const goodsData = {
    all: [
      { id: 1, name: '2024新款夏季连衣裙女气质显瘦碎花长裙', price: 129, img:'./img/长裙.avif' },
      { id: 2, name: '苹果15Pro Max官方正品全新未拆封5G手机', price: 8999, img: './img/华为.avif' },
      { id: 3, name: '小米空气净化器4Pro家用除甲醛除菌除异味', price: 899, img: './img/小米.avif' },
      { id: 4, name: '2024新款男士短袖T恤纯棉宽松百搭打底衫', price: 59, img: './img/T恤男.avif' }
    ],
    women: [
      { id: 101, name: '2024夏季新款碎花连衣裙法式收腰显瘦长裙', price: 159, img: './img/长裙.avif' },
      { id: 102, name: '冰丝短袖T恤女2024新款宽松显瘦百搭上衣', price: 69, img: './img/T恤女.avif' },
      { id: 103, name: '高腰牛仔短裤女2024夏季薄款显瘦a字热裤', price: 89, img: './img/牛仔裤女.avif' },
      { id: 104, name: '防晒衣女2024新款冰丝透气防紫外线薄款外套', price: 99, img:'./img/防晒衣女.avif' }
    ],
    men: [
      { id: 201, name: '2024新款男士纯棉短袖T恤宽松大码打底衫', price: 49, img: './img/T恤男.avif' },
      { id: 202, name: '夏季薄款牛仔裤男直筒宽松百搭休闲长裤', price: 139, img: './img/牛仔裤男.avif' },
      { id: 203, name: '男士冰丝速干短袖衬衫商务休闲免烫衬衣', price: 129, img: './img/衬衫男.avif' },
      { id: 204, name: '运动短裤男夏季速干透气宽松五分裤', price: 59, img: './img/五分裤.avif' }
    ],
    digital: [
      { id: 301, name: '华为Mate60 Pro官方正品5G智能手机', price: 6999, img: './img/华为.avif' },
      { id: 302, name: '小米平板6 Pro 11.2英寸骁龙8+平板电脑', price: 2499, img: './img/小米平板.avif' },
      { id: 303, name: 'AirPods Pro第二代无线蓝牙耳机主动降噪', price: 1499, img: './img/耳机.avif' },
      { id: 304, name: '罗技G502电竞游戏鼠标有线机械宏编程', price: 199, img: './img/鼠标.avif' }
    ],
    homeAppliance: [
      { id: 401, name: '美的10公斤全自动滚筒洗衣机变频节能', price: 2599, img: '/img/洗衣机.avif' },
      { id: 402, name: '格力1.5匹一级能效变频冷暖壁挂式空调', price: 3299, img: './img/空调.avif' },
      { id: 403, name: '海尔476升十字对开门冰箱风冷无霜一级能效', price: 4599, img: './img/冰箱.avif' },
      { id: 404, name: '苏泊尔电饭煲5L大容量智能预约球釜内胆', price: 399, img: '/img/电饭煲.avif' }
    ],
    cosmetics: [
      { id: 501, name: '兰蔻小黑瓶精华肌底液修护保湿抗老', price: 1080, img: './img/小黑瓶.avif' },
      { id: 502, name: '雅诗兰黛DW持妆粉底液遮瑕控油不脱妆', price: 420, img: './img/粉底液.avif' },
      { id: 503, name: '纪梵希N37口红丝绒哑光唇膏显白不挑皮', price: 350, img: './img/唇膏.avif' },
      { id: 504, name: 'SK-II前男友面膜补水保湿提亮肤色', price: 790, img: './img/面膜.avif' }
    ],
    baby: [
      { id: 601, name: '帮宝适一级帮纸尿裤NB码新生儿超薄透气', price: 129, img: './img/纸尿裤.avif' },
      { id: 602, name: '贝亲奶瓶宽口径玻璃新生儿防胀气奶瓶', price: 89, img: './img/奶瓶.avif' },
      { id: 603, name: '乐高积木儿童益智拼装玩具男孩女孩礼物', price: 299, img: './img/乐高.avif' },
      { id: 604, name: '巴拉巴拉儿童短袖T恤纯棉夏季男女童上衣', price: 59, img: './img/童装.avif' }
    ],
    home: [
      { id: 701, name: '无印良品纯棉四件套全棉床单被套简约风', price: 399, img: './img/被套.avif' },
      { id: 702, name: '宜家同款实木餐桌椅组合小户型吃饭桌子', price: 899, img: './img/桌子.avif' },
      { id: 703, name: '小熊加湿器家用静音卧室大雾量孕妇婴儿', price: 199, img: './img/加湿器.avif' },
      { id: 704, name: '懒人沙发榻榻米单人小户型阳台休闲躺椅', price: 299, img: './img/躺椅.avif' }
    ]
  };

  // ===================== 2. 渲染商品列表 =====================
  const goodsListEl = document.getElementById('goods-list');
  const goodsTitleEl = document.getElementById('goods-title');
  const categoryItems = document.querySelectorAll('.category-item');

  // 渲染商品函数
  function renderGoods(category) {
    // 获取对应分类的商品数据
    const goods = goodsData[category] || goodsData.all;
    // 更新标题
    const categoryName = {
      all: '猜你喜欢',
      women: '女装专区',
      men: '男装专区',
      digital: '数码专区',
      homeAppliance: '家电专区',
      cosmetics: '美妆专区',
      baby: '母婴专区',
      home: '家居专区'
    }[category] || '猜你喜欢';
    goodsTitleEl.textContent = categoryName;

    // 清空原有商品
    goodsListEl.innerHTML = '';
    // 渲染新商品
    goods.forEach(item => {
      const goodsItem = document.createElement('div');
      goodsItem.className = 'goods-item';
      goodsItem.dataset.id = item.id;
      goodsItem.innerHTML = `
        <img src="${item.img}" alt="${item.name}">
        <p class="goods-name">${item.name}</p>
        <p class="goods-price">¥<span>${item.price}</span>.00</p>
        <button class="add-cart-btn"><i class="fas fa-shopping-cart"></i> 加入购物车</button>
      `;
      goodsListEl.appendChild(goodsItem);
    });

    // 重新绑定加入购物车事件（因为商品是动态生成的）
    bindAddCartEvent();
  }

  // ===================== 3. 分类切换事件 =====================
  // 初始化默认显示全部商品
  renderGoods('all');
  // 给首页分类添加激活样式
  categoryItems.forEach(item => {
    if (item.dataset.category === 'all') {
      item.classList.add('active');
    }
  });

  // 分类点击事件
  categoryItems.forEach(item => {
    item.addEventListener('click', function(e) {
      e.preventDefault();
      // 移除所有分类的激活样式
      categoryItems.forEach(li => li.classList.remove('active'));
      // 给当前分类添加激活样式
      this.classList.add('active');
      // 获取当前分类标识
      const category = this.dataset.category;
      // 渲染对应商品
      renderGoods(category);
    });
  });

  // ===================== 4. 轮播图功能 =====================
  const sliderItems = document.querySelectorAll('.slider-item');
  const indicatorItems = document.querySelectorAll('.indicator-item');
  const prevBtn = document.querySelector('.prev-btn');
  const nextBtn = document.querySelector('.next-btn');
  let currentIndex = 0;
  let sliderTimer = null;

  function switchSlider(index) {
    sliderItems.forEach(item => item.classList.remove('active'));
    indicatorItems.forEach(item => item.classList.remove('active'));
    sliderItems[index].classList.add('active');
    indicatorItems[index].classList.add('active');
    currentIndex = index;
  }

  function nextSlider() {
    currentIndex = (currentIndex + 1) % sliderItems.length;
    switchSlider(currentIndex);
  }

  function prevSlider() {
    currentIndex = (currentIndex - 1 + sliderItems.length) % sliderItems.length;
    switchSlider(currentIndex);
  }

  function autoSlider() {
    sliderTimer = setInterval(nextSlider, 3000);
  }

  autoSlider();

  prevBtn.addEventListener('click', function() {
    clearInterval(sliderTimer);
    prevSlider();
    autoSlider();
  });

  nextBtn.addEventListener('click', function() {
    clearInterval(sliderTimer);
    nextSlider();
    autoSlider();
  });

  indicatorItems.forEach(item => {
    item.addEventListener('click', function() {
      clearInterval(sliderTimer);
      const index = parseInt(this.dataset.index);
      switchSlider(index);
      autoSlider();
    });
  });

  document.querySelector('.banner-slider').addEventListener('mouseenter', function() {
    clearInterval(sliderTimer);
  });

  document.querySelector('.banner-slider').addEventListener('mouseleave', function() {
    autoSlider();
  });

  // ===================== 5. 登录功能 =====================
  const topLoginBtn = document.getElementById('top-submit-login');
  const topUsername = document.getElementById('top-username');
  const topPassword = document.getElementById('top-password');
  const loginLink = document.querySelector('.login-link');

  topLoginBtn.addEventListener('click', function() {
    const username = topUsername.value.trim();
    const password = topPassword.value.trim();

    if (!username) {
      alert('请输入用户名！');
      topUsername.focus();
      return;
    }

    if (!password) {
      alert('请输入密码！');
      topPassword.focus();
      return;
    }

    alert(`欢迎您，${username}！登录成功`);
    loginLink.innerHTML = `<i class="fas fa-user"></i> ${username}`;
    topUsername.value = '';
    topPassword.value = '';
  });

  // ===================== 6. 加入购物车功能 =====================
  function bindAddCartEvent() {
    const addCartBtns = document.querySelectorAll('.add-cart-btn');
    const cartNum = document.querySelector('.cart-num');
    let cartCount = parseInt(cartNum.innerText) || 0;

    addCartBtns.forEach(btn => {
      btn.addEventListener('click', function() {
        const goodsItem = this.closest('.goods-item');
        const goodsName = goodsItem.querySelector('.goods-name').innerText;
        
        cartCount++;
        cartNum.innerText = cartCount;
        alert(`商品「${goodsName}」已成功加入购物车！`);
      });
    });
  }

  // ===================== 7. 搜索功能 =====================
  const searchBtn = document.getElementById('search-btn');
  const searchInput = document.getElementById('search-input');

  function searchGoods() {
    const keyword = searchInput.value.trim();
    if (!keyword) {
      alert('请输入搜索关键词！');
      searchInput.focus();
      return;
    }
    alert(`正在搜索「${keyword}」相关商品...`);
  }

  searchBtn.addEventListener('click', searchGoods);

  searchInput.addEventListener('keypress', function(e) {
    if (e.key === 'Enter') {
      searchGoods();
    }
  });
});