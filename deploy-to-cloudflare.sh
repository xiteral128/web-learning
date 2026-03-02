#!/bin/bash

# 淘宝商城Cloudflare一键部署脚本

echo "========================================"
echo "淘宝商城Cloudflare部署脚本"
echo "========================================"

# 颜色定义
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# 检查wrangler
check_wrangler() {
    if ! command -v wrangler &> /dev/null; then
        echo -e "${YELLOW}⚠️  wrangler未安装，正在安装...${NC}"
        npm install -g wrangler
        if [ $? -ne 0 ]; then
            echo -e "${RED}❌ wrangler安装失败${NC}"
            exit 1
        fi
    fi
    echo -e "${GREEN}✅ wrangler已安装${NC}"
}

# 登录Cloudflare
login_cloudflare() {
    echo -e "${YELLOW}🔐 登录Cloudflare...${NC}"
    wrangler login
    if [ $? -ne 0 ]; then
        echo -e "${RED}❌ Cloudflare登录失败${NC}"
        exit 1
    fi
    echo -e "${GREEN}✅ Cloudflare登录成功${NC}"
}

# 准备部署文件
prepare_files() {
    echo -e "${YELLOW}📁 准备部署文件...${NC}"
    
    # 创建部署目录
    mkdir -p cloudflare-deploy
    
    # 复制必要文件
    cp cloudflare-deploy/worker.js cloudflare-deploy/
    cp cloudflare-deploy/wrangler.toml cloudflare-deploy/
    
    # 复制前端文件
    mkdir -p cloudflare-deploy/static
    cp index.html cloudflare-deploy/static/
    cp -r css cloudflare-deploy/static/
    cp -r js cloudflare-deploy/static/
    cp -r img cloudflare-deploy/static/
    
    echo -e "${GREEN}✅ 部署文件准备完成${NC}"
}

# 配置项目
configure_project() {
    echo -e "${YELLOW}⚙️  配置项目...${NC}"
    
    read -p "请输入Worker名称（默认: taobao-mall）: " worker_name
    worker_name=${worker_name:-taobao-mall}
    
    read -p "请输入环境（dev/staging/production，默认: production）: " environment
    environment=${environment:-production}
    
    # 更新wrangler.toml
    sed -i.bak "s/name = \".*\"/name = \"$worker_name\"/" cloudflare-deploy/wrangler.toml
    
    echo -e "${GREEN}✅ 项目配置完成${NC}"
    echo -e "   Worker名称: ${worker_name}"
    echo -e "   环境: ${environment}"
}

# 部署到Cloudflare
deploy_to_cloudflare() {
    echo -e "${YELLOW}🚀 部署到Cloudflare...${NC}"
    
    cd cloudflare-deploy
    
    echo -e "${YELLOW}正在部署，这可能需要几分钟...${NC}"
    
    # 部署Worker
    wrangler deploy
    
    if [ $? -ne 0 ]; then
        echo -e "${RED}❌ 部署失败${NC}"
        cd ..
        exit 1
    fi
    
    cd ..
    
    echo -e "${GREEN}✅ 部署成功！${NC}"
}

# 显示部署信息
show_deployment_info() {
    echo -e "\n${YELLOW}📋 部署信息${NC}"
    echo -e "========================================"
    
    # 获取Worker信息
    cd cloudflare-deploy
    worker_url=$(wrangler info --json | jq -r '.routes[0].pattern' 2>/dev/null || echo "未知")
    cd ..
    
    if [ "$worker_url" = "未知" ]; then
        worker_url="https://taobao-mall.your-username.workers.dev"
    fi
    
    echo -e "${GREEN}🎉 部署完成！${NC}"
    echo -e ""
    echo -e "你的淘宝商城已部署到："
    echo -e "  ${YELLOW}${worker_url}${NC}"
    echo -e ""
    echo -e "可用端点："
    echo -e "  ${GREEN}前端页面${NC}: ${worker_url}/"
    echo -e "  ${GREEN}健康检查${NC}: ${worker_url}/api/health"
    echo -e "  ${GREEN}商品列表${NC}: ${worker_url}/api/products"
    echo -e "  ${GREEN}商品分类${NC}: ${worker_url}/api/categories"
    echo -e ""
    echo -e "测试账号："
    echo -e "  用户名: testuser"
    echo -e "  密码: 123456"
    echo -e ""
    echo -e "下一步："
    echo -e "  1. 访问 ${worker_url} 查看网站"
    echo -e "  2. 测试API端点是否正常工作"
    echo -e "  3. 配置自定义域名（可选）"
    echo -e "  4. 查看Cloudflare Dashboard监控"
}

# 主函数
main() {
    echo -e "${GREEN}开始淘宝商城Cloudflare部署...${NC}"
    
    # 检查依赖
    check_wrangler
    
    # 登录Cloudflare
    login_cloudflare
    
    # 准备文件
    prepare_files
    
    # 配置项目
    configure_project
    
    # 部署
    deploy_to_cloudflare
    
    # 显示信息
    show_deployment_info
    
    echo -e "\n${GREEN}========================================${NC}"
    echo -e "${GREEN}部署流程完成！${NC}"
    echo -e "${GREEN}========================================${NC}"
}

# 安装jq（如果需要）
install_jq() {
    if ! command -v jq &> /dev/null; then
        echo -e "${YELLOW}安装jq...${NC}"
        if [[ "$OSTYPE" == "darwin"* ]]; then
            brew install jq
        elif [[ -f /etc/debian_version ]]; then
            sudo apt-get install -y jq
        elif [[ -f /etc/redhat-release ]]; then
            sudo yum install -y jq
        else
            echo -e "${YELLOW}请手动安装jq: https://stedolan.github.io/jq/${NC}"
        fi
    fi
}

# 检查系统
check_system() {
    echo -e "${YELLOW}检查系统环境...${NC}"
    
    # 检查Node.js
    if ! command -v node &> /dev/null; then
        echo -e "${RED}❌ 请先安装Node.js 18+${NC}"
        exit 1
    fi
    
    # 检查npm
    if ! command -v npm &> /dev/null; then
        echo -e "${RED}❌ 请先安装npm${NC}"
        exit 1
    fi
    
    # 安装jq
    install_jq
    
    echo -e "${GREEN}✅ 系统环境检查通过${NC}"
}

# 执行
check_system
main