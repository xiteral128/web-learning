// Cloudflare直接部署脚本
const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🚀 开始Cloudflare部署...');
console.log('=' .repeat(50));

// Cloudflare配置
const CLOUDFLARE_API_TOKEN = 'VQEaQytJFd3Mzlii_WxeSTrTzzMo5j_9NF_MiGvt';
const WORKER_NAME = 'taobao-mall-' + Date.now().toString().slice(-6);
const DEPLOY_DIR = 'cloudflare-deploy';

// 设置环境变量
process.env.CLOUDFLARE_API_TOKEN = CLOUDFLARE_API_TOKEN;

try {
    // 1. 检查wrangler
    console.log('🔍 检查wrangler...');
    try {
        execSync('wrangler --version', { stdio: 'pipe' });
        console.log('✅ wrangler已安装');
    } catch (error) {
        console.log('⚠️  安装wrangler...');
        execSync('npm install -g wrangler', { stdio: 'inherit' });
    }

    // 2. 配置wrangler
    console.log('\n⚙️  配置wrangler...');
    const wranglerConfig = `
name = "${WORKER_NAME}"
main = "worker.js"
compatibility_date = "2025-12-23"
workers_dev = true

[vars]
API_VERSION = "1.0.0"
ENVIRONMENT = "production"
DEPLOY_TIME = "${new Date().toISOString()}"

[build]
command = "echo 'Building for Cloudflare...'"

[build.upload]
format = "service-worker"
`;

    fs.writeFileSync(path.join(DEPLOY_DIR, 'wrangler-deploy.toml'), wranglerConfig);
    console.log('✅ wrangler配置创建完成');

    // 3. 设置API令牌
    console.log('\n🔐 设置API令牌...');
    const envContent = `CLOUDFLARE_API_TOKEN=${CLOUDFLARE_API_TOKEN}`;
    fs.writeFileSync('.env', envContent);
    console.log('✅ API令牌已设置');

    // 4. 部署到Cloudflare
    console.log('\n🚀 部署到Cloudflare Workers...');
    console.log(`Worker名称: ${WORKER_NAME}`);
    
    const deployCommand = `cd ${DEPLOY_DIR} && wrangler deploy --config wrangler-deploy.toml --name ${WORKER_NAME}`;
    
    console.log('执行命令:', deployCommand);
    console.log('正在部署，请稍候...');
    
    const result = execSync(deployCommand, { 
        encoding: 'utf8',
        stdio: 'pipe',
        env: { ...process.env, CLOUDFLARE_API_TOKEN }
    });
    
    console.log('✅ 部署输出:');
    console.log(result);

    // 5. 获取部署URL
    console.log('\n🔗 获取部署信息...');
    try {
        const infoCommand = `cd ${DEPLOY_DIR} && wrangler info --config wrangler-deploy.toml`;
        const info = execSync(infoCommand, { encoding: 'utf8', stdio: 'pipe' });
        console.log('Worker信息:');
        console.log(info);
    } catch (infoError) {
        console.log('ℹ️  使用默认URL格式');
    }

    // 6. 生成部署报告
    console.log('\n📋 生成部署报告...');
    const deploymentReport = `
# Cloudflare部署报告

## 部署信息
- **部署时间**: ${new Date().toISOString()}
- **Worker名称**: ${WORKER_NAME}
- **环境**: production
- **API版本**: 1.0.0

## 访问地址
你的淘宝商城已部署到Cloudflare Workers：

### 主要URL
- **前端页面**: https://${WORKER_NAME}.your-username.workers.dev/
- **健康检查**: https://${WORKER_NAME}.your-username.workers.dev/api/health
- **商品API**: https://${WORKER_NAME}.your-username.workers.dev/api/products
- **分类API**: https://${WORKER_NAME}.your-username.workers.dev/api/categories

### API端点
- \`GET /\` - 前端页面
- \`GET /api/health\` - 健康检查
- \`GET /api/products\` - 商品列表
- \`GET /api/products/:id\` - 单个商品
- \`GET /api/categories\` - 商品分类
- \`POST /api/auth/login\` - 用户登录
- \`POST /api/auth/register\` - 用户注册

### 测试账号
- 用户名: \`testuser\`
- 密码: \`123456\`

## 技术详情
- **部署方式**: Cloudflare Workers全栈部署
- **数据库**: 模拟数据（可升级到D1）
- **认证**: JWT令牌
- **缓存**: Cloudflare CDN缓存

## 下一步
1. 访问上面的URL测试部署
2. 在Cloudflare Dashboard查看监控
3. 配置自定义域名（可选）
4. 升级到真实数据库（D1）

## 安全说明
- API令牌已用于本次部署
- 建议在Cloudflare Dashboard轮换令牌
- 生产环境请配置自定义域名和SSL

---
*部署完成时间: ${new Date().toLocaleString()}*
`;

    fs.writeFileSync('CLOUDFLARE_DEPLOYMENT_REPORT.md', deploymentReport);
    console.log('✅ 部署报告已生成: CLOUDFLARE_DEPLOYMENT_REPORT.md');

    // 7. 显示成功信息
    console.log('\n' + '=' .repeat(50));
    console.log('🎉 Cloudflare部署成功！');
    console.log('=' .repeat(50));
    console.log('\n你的淘宝商城已部署到:');
    console.log(`https://${WORKER_NAME}.your-username.workers.dev`);
    console.log('\n立即访问测试:');
    console.log(`1. 前端页面: https://${WORKER_NAME}.your-username.workers.dev/`);
    console.log(`2. API健康检查: https://${WORKER_NAME}.your-username.workers.dev/api/health`);
    console.log(`3. 商品列表: https://${WORKER_NAME}.your-username.workers.dev/api/products`);
    console.log('\n测试账号:');
    console.log('  用户名: testuser');
    console.log('  密码: 123456');
    console.log('\n查看完整报告: CLOUDFLARE_DEPLOYMENT_REPORT.md');

} catch (error) {
    console.error('\n❌ 部署失败:');
    console.error(error.message);
    
    if (error.stdout) {
        console.error('输出:', error.stdout.toString());
    }
    if (error.stderr) {
        console.error('错误:', error.stderr.toString());
    }
    
    process.exit(1);
}