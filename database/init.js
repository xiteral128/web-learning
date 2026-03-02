// 数据库初始化脚本
// 使用SQLite数据库

const fs = require('fs');
const path = require('path');
const sqlite3 = require('sqlite3').verbose();

class DatabaseInitializer {
    constructor() {
        this.dbPath = path.join(__dirname, 'taobao.db');
        this.schemaPath = path.join(__dirname, 'schema.sql');
        this.db = null;
    }

    // 初始化数据库
    async init() {
        try {
            console.log('开始初始化数据库...');
            
            // 创建数据库目录
            const dbDir = path.dirname(this.dbPath);
            if (!fs.existsSync(dbDir)) {
                fs.mkdirSync(dbDir, { recursive: true });
            }

            // 连接数据库
            this.db = new sqlite3.Database(this.dbPath, (err) => {
                if (err) {
                    console.error('数据库连接失败:', err.message);
                    throw err;
                }
                console.log('已连接到SQLite数据库');
            });

            // 启用外键约束
            await this.runQuery('PRAGMA foreign_keys = ON;');

            // 读取并执行SQL schema
            const schema = fs.readFileSync(this.schemaPath, 'utf8');
            await this.exec(schema);

            // 插入测试数据
            await this.insertTestData();

            console.log('数据库初始化完成！');
            console.log(`数据库文件: ${this.dbPath}`);
            
            return true;
        } catch (error) {
            console.error('数据库初始化失败:', error);
            return false;
        }
    }

    // 执行SQL语句
    runQuery(sql, params = []) {
        return new Promise((resolve, reject) => {
            this.db.run(sql, params, function(err) {
                if (err) {
                    reject(err);
                } else {
                    resolve(this);
                }
            });
        });
    }

    // 执行多条SQL语句
    exec(sql) {
        return new Promise((resolve, reject) => {
            this.db.exec(sql, (err) => {
                if (err) {
                    reject(err);
                } else {
                    resolve();
                }
            });
        });
    }

    // 查询数据
    query(sql, params = []) {
        return new Promise((resolve, reject) => {
            this.db.all(sql, params, (err, rows) => {
                if (err) {
                    reject(err);
                } else {
                    resolve(rows);
                }
            });
        });
    }

    // 插入测试数据
    async insertTestData() {
        try {
            console.log('插入测试数据...');

            // 插入测试用户（密码：123456，使用bcrypt加密后的值示例）
            const testUsers = [
                ['testuser', '$2b$10$N9qo8uLOickgx2ZMRZoMy.MrqK.3.8.8.8.8.8.8.8.8.8.8.8', 'test@example.com', '13800138000'],
                ['admin', '$2b$10$N9qo8uLOickgx2ZMRZoMy.MrqK.3.8.8.8.8.8.8.8.8.8.8.8', 'admin@example.com', '13900139000']
            ];

            for (const user of testUsers) {
                await this.runQuery(
                    'INSERT OR IGNORE INTO users (username, password_hash, email, phone) VALUES (?, ?, ?, ?)',
                    user
                );
            }

            // 插入测试收货地址
            const testAddresses = [
                [1, '张三', '13800138000', '北京市', '北京市', '朝阳区', '建国路88号', '100000', 1],
                [2, '李四', '13900139000', '上海市', '上海市', '浦东新区', '陆家嘴环路100号', '200000', 1]
            ];

            for (const addr of testAddresses) {
                await this.runQuery(
                    `INSERT OR IGNORE INTO addresses 
                    (user_id, recipient_name, phone, province, city, district, detail_address, postal_code, is_default) 
                    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
                    addr
                );
            }

            // 插入测试购物车数据
            const testCartItems = [
                [1, 1, 2],  // 用户1，商品1，数量2
                [1, 3, 1],  // 用户1，商品3，数量1
                [2, 2, 1]   // 用户2，商品2，数量1
            ];

            for (const item of testCartItems) {
                await this.runQuery(
                    'INSERT OR IGNORE INTO cart_items (user_id, product_id, quantity) VALUES (?, ?, ?)',
                    item
                );
            }

            // 插入测试收藏数据
            const testFavorites = [
                [1, 1],
                [1, 4],
                [2, 2],
                [2, 6]
            ];

            for (const fav of testFavorites) {
                await this.runQuery(
                    'INSERT OR IGNORE INTO favorites (user_id, product_id) VALUES (?, ?)',
                    fav
                );
            }

            console.log('测试数据插入完成');
        } catch (error) {
            console.error('插入测试数据失败:', error);
        }
    }

    // 显示数据库状态
    async showStatus() {
        try {
            console.log('\n=== 数据库状态 ===');
            
            const tables = [
                'users', 'categories', 'products', 'cart_items', 
                'favorites', 'addresses', 'orders', 'order_items', 'reviews', 'settings'
            ];

            for (const table of tables) {
                const result = await this.query(`SELECT COUNT(*) as count FROM ${table}`);
                console.log(`${table}: ${result[0].count} 条记录`);
            }

            // 显示示例数据
            console.log('\n=== 示例商品 ===');
            const products = await this.query('SELECT id, name, price, stock FROM products LIMIT 5');
            products.forEach(p => {
                console.log(`  ${p.id}. ${p.name} - ¥${p.price} (库存: ${p.stock})`);
            });

            console.log('\n=== 示例用户 ===');
            const users = await this.query('SELECT id, username, email FROM users LIMIT 3');
            users.forEach(u => {
                console.log(`  ${u.id}. ${u.username} (${u.email})`);
            });

        } catch (error) {
            console.error('获取数据库状态失败:', error);
        }
    }

    // 关闭数据库连接
    close() {
        if (this.db) {
            this.db.close((err) => {
                if (err) {
                    console.error('关闭数据库连接失败:', err.message);
                } else {
                    console.log('数据库连接已关闭');
                }
            });
        }
    }
}

// 命令行接口
if (require.main === module) {
    const init = new DatabaseInitializer();
    
    const command = process.argv[2] || 'init';
    
    switch (command) {
        case 'init':
            init.init().then(async (success) => {
                if (success) {
                    await init.showStatus();
                }
                init.close();
            });
            break;
            
        case 'status':
            init.init().then(async () => {
                await init.showStatus();
                init.close();
            });
            break;
            
        case 'reset':
            console.log('重置数据库...');
            if (fs.existsSync(init.dbPath)) {
                fs.unlinkSync(init.dbPath);
                console.log('已删除旧数据库文件');
            }
            init.init().then(async (success) => {
                if (success) {
                    await init.showStatus();
                }
                init.close();
            });
            break;
            
        default:
            console.log('可用命令:');
            console.log('  node init.js init     - 初始化数据库');
            console.log('  node init.js status   - 查看数据库状态');
            console.log('  node init.js reset    - 重置数据库');
            break;
    }
}

module.exports = DatabaseInitializer;