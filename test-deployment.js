// 淘宝商城部署测试脚本
// 测试本地和Cloudflare部署

const fetch = require('node-fetch');

class DeploymentTester {
    constructor(baseUrl) {
        this.baseUrl = baseUrl;
        this.results = [];
    }

    async testEndpoint(name, path, method = 'GET', body = null) {
        const url = `${this.baseUrl}${path}`;
        const startTime = Date.now();
        
        try {
            const options = {
                method,
                headers: { 'Content-Type': 'application/json' }
            };
            
            if (body) {
                options.body = JSON.stringify(body);
            }
            
            const response = await fetch(url, options);
            const responseTime = Date.now() - startTime;
            const data = await response.json().catch(() => ({}));
            
            const result = {
                name,
                url,
                status: response.status,
                ok: response.ok,
                responseTime: `${responseTime}ms`,
                success: response.ok
            };
            
            this.results.push(result);
            
            return result;
            
        } catch (error) {
            const result = {
                name,
                url,
                status: 0,
                ok: false,
                responseTime: `${Date.now() - startTime}ms`,
                error: error.message,
                success: false
            };
            
            this.results.push(result);
            return result;
        }
    }

    async runAllTests() {
        console.log(`\n🔍 测试部署: ${this.baseUrl}`);
        console.log('=' .repeat(50));
        
        // 健康检查
        await this.testEndpoint('健康检查', '/api/health');
        
        // 商品API
        await this.testEndpoint('商品列表', '/api/products');
        await this.testEndpoint('单个商品', '/api/products/1');
        
        // 分类API
        await this.testEndpoint('商品分类', '/api/categories');
        
        // 用户认证
        await this.testEndpoint('用户登录', '/api/auth/login', 'POST', {
            username: 'testuser',
            password: '123456'
        });
        
        await this.testEndpoint('用户注册', '/api/auth/register', 'POST', {
            username: 'newuser',
            password: '123456',
            email: 'newuser@example.com'
        });
        
        // 显示结果
        this.printResults();
    }

    printResults() {
        console.log('\n📊 测试结果:');
        console.log('-' .repeat(80));
        
        let passed = 0;
        let failed = 0;
        
        this.results.forEach((result, index) => {
            const status = result.success ? '✅' : '❌';
            console.log(`${status} ${result.name}`);
            console.log(`   地址: ${result.url}`);
            console.log(`   状态: ${result.status} ${result.ok ? 'OK' : 'ERROR'}`);
            console.log(`   时间: ${result.responseTime}`);
            
            if (result.error) {
                console.log(`   错误: ${result.error}`);
            }
            
            console.log();
            
            if (result.success) passed++;
            else failed++;
        });
        
        console.log('=' .repeat(50));
        console.log(`总计: ${this.results.length} 个测试`);
        console.log(`通过: ${passed} ✅`);
        console.log(`失败: ${failed} ❌`);
        console.log(`成功率: ${((passed / this.results.length) * 100).toFixed(1)}%`);
        
        if (failed === 0) {
            console.log('\n🎉 所有测试通过！部署成功！');
        } else {
            console.log('\n⚠️  部分测试失败，请检查部署配置。');
        }
    }
}

// 命令行接口
async function main() {
    const args = process.argv.slice(2);
    let baseUrl = 'http://localhost:3000';
    
    if (args.length > 0) {
        baseUrl = args[0];
        // 确保URL以http://或https://开头
        if (!baseUrl.startsWith('http')) {
            baseUrl = `https://${baseUrl}`;
        }
        // 移除末尾的斜杠
        baseUrl = baseUrl.replace(/\/$/, '');
    }
    
    console.log('淘宝商城部署测试工具');
    console.log('=' .repeat(50));
    console.log(`测试目标: ${baseUrl}`);
    console.log('提示: 可以指定URL，如: node test-deployment.js https://your-worker.workers.dev');
    
    const tester = new DeploymentTester(baseUrl);
    await tester.runAllTests();
    
    // 提供建议
    console.log('\n💡 部署建议:');
    
    if (baseUrl.includes('localhost')) {
        console.log('1. 本地测试通过，可以部署到Cloudflare');
        console.log('2. 运行: ./deploy-to-cloudflare.sh (Linux/macOS)');
        console.log('   或: deploy-to-cloudflare.bat (Windows)');
    } else if (baseUrl.includes('workers.dev')) {
        console.log('1. Cloudflare Workers部署成功！');
        console.log('2. 可以考虑配置自定义域名');
        console.log('3. 在Cloudflare Dashboard启用监控');
    } else {
        console.log('1. 部署测试完成');
        console.log('2. 确保所有API端点正常工作');
        console.log('3. 检查前端页面是否能正常访问');
    }
    
    console.log('\n📚 文档:');
    console.log('- 查看 CLOUDFLARE_DEPLOY.md 获取完整部署指南');
    console.log('- 查看 BACKEND_SETUP.md 获取本地开发指南');
}

// 运行测试
if (require.main === module) {
    main().catch(error => {
        console.error('测试失败:', error);
        process.exit(1);
    });
}

module.exports = DeploymentTester;