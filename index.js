// index.js
export default {
  async fetch(request, env) {
    // 这行代码是关键！env.ASSETS.fetch 会处理所有静态文件
    return env.ASSETS.fetch(request);
  }
};
