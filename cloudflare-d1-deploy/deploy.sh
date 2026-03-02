#!/bin/bash
echo "🚀 部署淘宝商城到Cloudflare D1..."
echo "========================================"

# 设置API令牌
export CLOUDFLARE_API_TOKEN="12d48135-9d9c-43cd-bec6-843dfb22e665"

echo "1. 创建D1数据库..."
npx wrangler d1 create taobao-d1-db

if [ $? -eq 0 ]; then
    echo "✅ D1数据库创建成功"
    
    echo "2. 获取数据库ID..."
    DB_ID=$(npx wrangler d1 list --json | jq -r '.[0].uuid')
    echo "数据库ID: $DB_ID"
    
    echo "3. 更新配置文件..."
    sed -i "s/database_id = ""/database_id = "$DB_ID"/" wrangler.toml
    
    echo "4. 部署Worker..."
    npx wrangler deploy
    
    if [ $? -eq 0 ]; then
        echo ""
        echo "🎉 部署成功！"
        echo "========================================"
        echo "Worker名称: taobao-d1-807504"
        echo "数据库: taobao-d1-db"
        echo "API令牌: 12d48135-9d9c-43cd-bec6-843dfb22e665"
        echo ""
        echo "🔗 访问地址:"
        echo "https://taobao-d1-807504.your-username.workers.dev"
        echo ""
        echo "📋 测试端点:"
        echo "GET  /api/health"
        echo "GET  /api/products"
        echo "POST /api/init-db"
        echo ""
        echo "💡 首次使用:"
        echo "1. 访问上面的URL"
        echo "2. 调用 POST /api/init-db 初始化数据库"
        echo "3. 测试 GET /api/products 查看数据"
    else
        echo "❌ Worker部署失败"
    fi
else
    echo "❌ D1数据库创建失败"
    echo "请检查API令牌和账户权限"
fi
