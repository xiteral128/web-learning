    // === 事务处理 ===
    
    async transaction(callback) {
        return new Promise((resolve, reject) => {
            this.db.run('BEGIN TRANSACTION', async (err) => {
                if (err) {
                    reject(err);
                    return;
                }
                
                try {
                    const result = await callback(this);
                    this.db.run('COMMIT', (err) => {
                        if (err) {
                            this.db.run('ROLLBACK');
                            reject(err);
                        } else {
                            resolve(result);
                        }
                    });
                } catch (error) {
                    this.db.run('ROLLBACK');
                    reject(error);
                }
            });
        });
    }

    // 创建订单（带事务）
    async createOrderWithItems(orderData, items) {
        return this.transaction(async (db) => {
            // 1. 创建订单
            const orderResult = await db.createOrder(orderData);
            const orderId = orderResult.lastID;
            
            // 2. 添加订单商品
            for (const item of items) {
                await db.addOrderItem(orderId, item);
            }
            
            // 3. 清空购物车（如果是从购物车创建）
            if (orderData.clear_cart) {
                await db.clearCart(orderData.user_id);
            }
            
            return { orderId, orderNo: orderData.order_no };
        });
    }

    // === 系统配置 ===
    
    async getSetting(key) {
        const sql = 'SELECT value FROM settings WHERE key = ?';
        const result = await this.get(sql, [key]);
        return result ? result.value : null;
    }

    async updateSetting(key, value) {
        const sql = 'INSERT OR REPLACE INTO settings (key, value, updated_at) VALUES (?, ?, CURRENT_TIMESTAMP)';
        return this.run(sql, [key, value]);
    }

    // === 工具方法 ===
    
    async tableExists(tableName) {
        const sql = "SELECT name FROM sqlite_master WHERE type='table' AND name = ?";
        const result = await this.get(sql, [tableName]);
        return !!result;
    }

    async getTableInfo(tableName) {
        const sql = `PRAGMA table_info(${tableName})`;
        return this.query(sql);
    }

    async backupDatabase(backupPath) {
        return new Promise((resolve, reject) => {
            const backupDb = new sqlite3.Database(backupPath);
            this.db.backup(backupDb, {
                step: (pages) => {
                    console.log(`备份进度: ${pages} 页`);
                },
                finish: () => {
                    backupDb.close();
                    resolve();
                },
                error: (err) => {
                    backupDb.close();
                    reject(err);
                }
            });
        });
    }
}

// 导出单例实例
let dbInstance = null;

async function getDatabase() {
    if (!dbInstance) {
        dbInstance = new Database();
        await dbInstance.connect();
    }
    return dbInstance;
}

// 测试函数
async function testDatabase() {
    try {
        const db = await getDatabase();
        
        console.log('=== 数据库测试 ===');
        
        // 测试连接
        const version = await db.get('SELECT sqlite_version() as version');
        console.log(`SQLite版本: ${version.version}`);
        
        // 测试表是否存在
        const tables = ['users', 'products', 'orders'];
        for (const table of tables) {
            const exists = await db.tableExists(table);
            console.log(`表 ${table}: ${exists ? '存在' : '不存在'}`);
        }
        
        // 测试查询
        const userCount = await db.get('SELECT COUNT(*) as count FROM users');
        console.log(`用户数量: ${userCount.count}`);
        
        const productCount = await db.get('SELECT COUNT(*) as count FROM products');
        console.log(`商品数量: ${productCount.count}`);
        
        // 测试获取商品
        const products = await db.getProducts({ limit: 3 });
        console.log('\n前3个商品:');
        products.forEach(p => {
            console.log(`  ${p.id}. ${p.name} - ¥${p.price}`);
        });
        
        // 测试统计
        const stats = await db.getDashboardStats();
        console.log('\n统计信息:');
        console.log(`  用户总数: ${stats.userCount}`);
        console.log(`  商品总数: ${stats.productCount}`);
        console.log(`  订单总数: ${stats.orderCount}`);
        console.log(`  总销售额: ¥${stats.totalSales}`);
        
        await db.close();
        console.log('\n数据库测试完成！');
        
    } catch (error) {
        console.error('数据库测试失败:', error);
    }
}

// 命令行接口
if (require.main === module) {
    const command = process.argv[2] || 'test';
    
    switch (command) {
        case 'test':
            testDatabase();
            break;
            
        case 'backup':
            const backupPath = process.argv[3] || 'taobao_backup.db';
            getDatabase().then(async (db) => {
                await db.backupDatabase(backupPath);
                console.log(`数据库已备份到: ${backupPath}`);
                await db.close();
            });
            break;
            
        default:
            console.log('可用命令:');
            console.log('  node db.js test          - 测试数据库连接和功能');
            console.log('  node db.js backup [path] - 备份数据库');
            break;
    }
}

module.exports = {
    Database,
    getDatabase,
    testDatabase
};