#!/bin/bash

# 淘宝商城后端一键安装脚本
# 适用于Linux/macOS系统

echo "========================================"
echo "淘宝商城后端系统安装脚本"
echo "========================================"

# 检查Node.js
if ! command -v node &> /dev/null; then
    echo "❌ 未找到Node.js，请先安装Node.js 18+"
    echo "访问: https://nodejs.org/"
    exit 1
fi

NODE_VERSION=$(node -v | cut -d'v' -f2 | cut -d'.' -f1)
if [ "$NODE_VERSION" -lt 18 ]; then
    echo "❌ Node.js版本过低，需要18+，当前版本: $(node -v)"
    exit 1
fi
echo "✅ Node.js版本: $(node -v)"

# 检查npm
if ! command -v npm &> /dev/null; then
    echo "❌ 未找到npm"
    exit 1
fi
echo "✅ npm版本: $(npm -v)"

# 创建必要的目录
echo "📁 创建目录结构..."
mkdir -p backend/logs
mkdir -p database/backups

# 安装数据库模块依赖
echo "📦 安装数据库模块依赖..."
cd database
npm install
if [ $? -ne 0 ]; then
    echo "❌ 数据库模块依赖安装失败"
    exit 1
fi
echo "✅ 数据库模块依赖安装完成"

# 初始化数据库
echo "🗄️ 初始化数据库..."
npm run init
if [ $? -ne 0 ]; then
    echo "❌ 数据库初始化失败"
    exit 1
fi
echo "✅ 数据库初始化完成"

# 测试数据库
echo "🧪 测试数据库连接..."
npm run test
if [ $? -ne 0 ]; then
    echo "❌ 数据库测试失败"
    exit 1
fi
echo "✅ 数据库测试通过"

cd ..

# 安装后端API依赖
echo "📦 安装后端API依赖..."
cd backend
npm install
if [ $? -ne 0 ]; then
    echo "❌ 后端API依赖安装失败"
    exit 1
fi
echo "✅ 后端API依赖安装完成"

cd ..

echo ""
echo "========================================"
echo "🎉 安装完成！"
echo "========================================"
echo ""
echo "接下来可以："
echo ""
echo "1. 启动后端API服务："
echo "   cd backend && npm start"
echo ""
echo "2. 开发模式启动（自动重启）："
echo "   cd backend && npm run dev"
echo ""
echo "3. 访问API文档："
echo "   http://localhost:3000/api/health"
echo ""
echo "4. 测试账号："
echo "   用户名: testuser 密码: 123456"
echo "   用户名: admin    密码: 123456"
echo ""
echo "5. 查看完整文档："
echo "   查看 BACKEND_SETUP.md 文件"
echo ""
echo "========================================"