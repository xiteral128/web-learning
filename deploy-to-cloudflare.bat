@echo off
chcp 65001 > nul
title 淘宝商城Cloudflare部署脚本

echo ========================================
echo 淘宝商城Cloudflare部署脚本
echo ========================================

REM 检查Node.js
where node >nul 2>nul
if %errorlevel% neq 0 (
    echo ❌ 请先安装Node.js 18+
    echo 访问: https://nodejs.org/
    pause
    exit /b 1
)

REM 检查npm
where npm >nul 2>nul
if %errorlevel% neq 0 (
    echo ❌ 请先安装npm
    pause
    exit /b 1
)

REM 检查wrangler
echo 🔍 检查wrangler...
where wrangler >nul 2>nul
if %errorlevel% neq 0 (
    echo ⚠️  wrangler未安装，正在安装...
    npm install -g wrangler
    if %errorlevel% neq 0 (
        echo ❌ wrangler安装失败
        pause
        exit /b 1
    )
)
echo ✅ wrangler已安装

REM 登录Cloudflare
echo 🔐 登录Cloudflare...
wrangler login
if %errorlevel% neq 0 (
    echo ❌ Cloudflare登录失败
    pause
    exit /b 1
)
echo ✅ Cloudflare登录成功

REM 准备部署文件
echo 📁 准备部署文件...
if not exist cloudflare-deploy mkdir cloudflare-deploy
if not exist cloudflare-deploy\static mkdir cloudflare-deploy\static

copy cloudflare-deploy\worker.js cloudflare-deploy\ >nul
copy cloudflare-deploy\wrangler.toml cloudflare-deploy\ >nul
copy index.html cloudflare-deploy\static\ >nul

if exist css (
    xcopy css cloudflare-deploy\static\css /E /I /Y >nul
)
if exist js (
    xcopy js cloudflare-deploy\static\js /E /I /Y >nul
)
if exist img (
    xcopy img cloudflare-deploy\static\img /E /I /Y >nul
)
echo ✅ 部署文件准备完成

REM 配置项目
echo ⚙️  配置项目...
set /p worker_name="请输入Worker名称（默认: taobao-mall）: "
if "%worker_name%"=="" set worker_name=taobao-mall

set /p environment="请输入环境（dev/staging/production，默认: production）: "
if "%environment%"=="" set environment=production

REM 更新wrangler.toml（简单版本）
echo name = "%worker_name%" > cloudflare-deploy\wrangler-new.toml
echo main = "worker.js" >> cloudflare-deploy\wrangler-new.toml
echo compatibility_date = "2025-12-23" >> cloudflare-deploy\wrangler-new.toml
echo workers_dev = true >> cloudflare-deploy\wrangler-new.toml
copy cloudflare-deploy\wrangler-new.toml cloudflare-deploy\wrangler.toml /Y >nul
del cloudflare-deploy\wrangler-new.toml >nul

echo ✅ 项目配置完成
echo    Worker名称: %worker_name%
echo    环境: %environment%

REM 部署到Cloudflare
echo 🚀 部署到Cloudflare...
cd cloudflare-deploy
echo 正在部署，这可能需要几分钟...
wrangler deploy
if %errorlevel% neq 0 (
    echo ❌ 部署失败
    cd ..
    pause
    exit /b 1
)
cd ..

echo ✅ 部署成功！

REM 显示部署信息
echo.
echo 📋 部署信息
echo ========================================
echo.
echo 🎉 部署完成！
echo.
echo 你的淘宝商城已部署到Cloudflare Workers
echo.
echo 访问你的Worker（URL在部署输出中显示）
echo 通常格式为：https://%worker_name%.your-username.workers.dev
echo.
echo 可用端点：
echo   前端页面: https://%worker_name%.your-username.workers.dev/
echo   健康检查: https://%worker_name%.your-username.workers.dev/api/health
echo   商品列表: https://%worker_name%.your-username.workers.dev/api/products
echo   商品分类: https://%worker_name%.your-username.workers.dev/api/categories
echo.
echo 测试账号：
echo   用户名: testuser
echo   密码: 123456
echo.
echo 下一步：
echo   1. 访问上面的URL查看网站
echo   2. 测试API端点是否正常工作
echo   3. 在Cloudflare Dashboard配置自定义域名（可选）
echo   4. 查看Cloudflare Dashboard监控数据
echo.
echo ========================================
echo 部署流程完成！
echo ========================================
pause