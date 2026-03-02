@echo off
chcp 65001 > nul
echo ========================================
echo 淘宝商城后端系统安装脚本（Windows）
echo ========================================

REM 检查Node.js
where node >nul 2>nul
if %errorlevel% neq 0 (
    echo ❌ 未找到Node.js，请先安装Node.js 18+
    echo 访问: https://nodejs.org/
    pause
    exit /b 1
)

for /f "tokens=1 delims=." %%i in ('node -v') do set NODE_VERSION=%%i
set NODE_VERSION=%NODE_VERSION:~1%
if %NODE_VERSION% LSS 18 (
    echo ❌ Node.js版本过低，需要18+，当前版本: 
    node -v
    pause
    exit /b 1
)
echo ✅ Node.js版本: 
node -v

REM 检查npm
where npm >nul 2>nul
if %errorlevel% neq 0 (
    echo ❌ 未找到npm
    pause
    exit /b 1
)
echo ✅ npm版本: 
npm -v

REM 创建必要的目录
echo 📁 创建目录结构...
if not exist backend\log mkdir backend\log
if not exist database\backups mkdir database\backups

REM 安装数据库模块依赖
echo 📦 安装数据库模块依赖...
cd database
call npm install
if %errorlevel% neq 0 (
    echo ❌ 数据库模块依赖安装失败
    pause
    exit /b 1
)
echo ✅ 数据库模块依赖安装完成

REM 初始化数据库
echo 🗄️ 初始化数据库...
call npm run init
if %errorlevel% neq 0 (
    echo ❌ 数据库初始化失败
    pause
    exit /b 1
)
echo ✅ 数据库初始化完成

REM 测试数据库
echo 🧪 测试数据库连接...
call npm run test
if %errorlevel% neq 0 (
    echo ❌ 数据库测试失败
    pause
    exit /b 1
)
echo ✅ 数据库测试通过

cd ..

REM 安装后端API依赖
echo 📦 安装后端API依赖...
cd backend
call npm install
if %errorlevel% neq 0 (
    echo ❌ 后端API依赖安装失败
    pause
    exit /b 1
)
echo ✅ 后端API依赖安装完成

cd ..

echo.
echo ========================================
echo 🎉 安装完成！
echo ========================================
echo.
echo 接下来可以：
echo.
echo 1. 启动后端API服务：
echo    cd backend ^&^& npm start
echo.
echo 2. 开发模式启动（自动重启）：
echo    cd backend ^&^& npm run dev
echo.
echo 3. 访问API文档：
echo    http://localhost:3000/api/health
echo.
echo 4. 测试账号：
echo    用户名: testuser 密码: 123456
echo    用户名: admin    密码: 123456
echo.
echo 5. 查看完整文档：
echo    查看 BACKEND_SETUP.md 文件
echo.
echo ========================================
pause