    // 更新收货地址
    async updateAddress(req, res, next) {
        try {
            const addressId = parseInt(req.params.id);
            const updateData = req.body;
            
            const result = await this.db.updateAddress(addressId, {
                ...updateData,
                user_id: req.user.id
            });
            
            if (result.changes === 0) {
                return res.status(404).json({
                    success: false,
                    message: '地址不存在'
                });
            }

            res.json({
                success: true,
                message: '地址更新成功'
            });
        } catch (error) {
            next(error);
        }
    }

    // 删除收货地址
    async deleteAddress(req, res, next) {
        try {
            const addressId = parseInt(req.params.id);
            
            const result = await this.db.deleteAddress(addressId, req.user.id);
            
            if (result.changes === 0) {
                return res.status(404).json({
                    success: false,
                    message: '地址不存在'
                });
            }

            res.json({
                success: true,
                message: '地址删除成功'
            });
        } catch (error) {
            next(error);
        }
    }

    // 创建订单
    async createOrder(req, res, next) {
        try {
            const {
                address_id,
                payment_method = 'alipay',
                note = '',
                cart_item_ids = []
            } = req.body;
            
            // 验证地址
            const address = await this.db.get(`
                SELECT * FROM addresses WHERE id = ? AND user_id = ?
            `, [address_id, req.user.id]);
            
            if (!address) {
                return res.status(400).json({
                    success: false,
                    message: '收货地址不存在'
                });
            }

            // 获取购物车商品
            let cartItems;
            if (cart_item_ids && cart_item_ids.length > 0) {
                // 只结算选中的商品
                cartItems = await this.db.query(`
                    SELECT ci.*, p.name, p.price, p.main_image_url, p.stock 
                    FROM cart_items ci 
                    JOIN products p ON ci.product_id = p.id 
                    WHERE ci.id IN (${cart_item_ids.map(() => '?').join(',')}) 
                    AND ci.user_id = ? AND ci.selected = 1
                `, [...cart_item_ids, req.user.id]);
            } else {
                // 结算所有选中的商品
                cartItems = await this.db.query(`
                    SELECT ci.*, p.name, p.price, p.main_image_url, p.stock 
                    FROM cart_items ci 
                    JOIN products p ON ci.product_id = p.id 
                    WHERE ci.user_id = ? AND ci.selected = 1
                `, [req.user.id]);
            }

            if (cartItems.length === 0) {
                return res.status(400).json({
                    success: false,
                    message: '购物车中没有选中的商品'
                });
            }

            // 检查库存
            for (const item of cartItems) {
                if (item.stock < item.quantity) {
                    return res.status(400).json({
                        success: false,
                        message: `商品 "${item.name}" 库存不足，仅剩 ${item.stock} 件`
                    });
                }
            }

            // 计算总金额
            let totalAmount = 0;
            const orderItems = cartItems.map(item => {
                const subtotal = item.price * item.quantity;
                totalAmount += subtotal;
                
                return {
                    product_id: item.product_id,
                    product_name: item.name,
                    product_price: item.price,
                    quantity: item.quantity,
                    product_image_url: item.main_image_url
                };
            });

            // 获取运费设置
            const shippingFee = parseFloat(await this.db.getSetting('shipping_fee') || '10');
            const freeShippingThreshold = parseFloat(await this.db.getSetting('free_shipping_threshold') || '99');
            
            const finalShippingFee = totalAmount >= freeShippingThreshold ? 0 : shippingFee;

            // 创建订单
            const orderData = {
                user_id: req.user.id,
                address_id,
                total_amount: totalAmount,
                shipping_fee: finalShippingFee,
                payment_method,
                note,
                clear_cart: true
            };

            const result = await this.db.createOrderWithItems(orderData, orderItems);

            res.status(201).json({
                success: true,
                message: '订单创建成功',
                data: {
                    order_id: result.orderId,
                    order_no: result.orderNo,
                    total_amount: totalAmount,
                    shipping_fee: finalShippingFee,
                    final_amount: totalAmount + finalShippingFee
                }
            });
        } catch (error) {
            next(error);
        }
    }

    // 获取订单列表
    async getOrders(req, res, next) {
        try {
            const filters = {
                order_status: req.query.status,
                payment_status: req.query.payment_status,
                limit: req.query.limit ? parseInt(req.query.limit) : 10
            };

            const orders = await this.db.getOrders(req.user.id, filters);
            
            // 获取每个订单的商品
            for (const order of orders) {
                order.items = await this.db.getOrderItems(order.id);
            }

            res.json({
                success: true,
                data: orders
            });
        } catch (error) {
            next(error);
        }
    }

    // 获取单个订单
    async getOrderById(req, res, next) {
        try {
            const orderId = parseInt(req.params.id);
            
            const order = await this.db.getOrderById(orderId, req.user.id);
            if (!order) {
                return res.status(404).json({
                    success: false,
                    message: '订单不存在'
                });
            }

            order.items = await this.db.getOrderItems(orderId);

            res.json({
                success: true,
                data: order
            });
        } catch (error) {
            next(error);
        }
    }

    // 获取分类
    async getCategories(req, res, next) {
        try {
            const categories = await this.db.getCategories();
            
            // 获取子分类
            for (const category of categories) {
                category.subcategories = await this.db.getSubcategories(category.id);
            }

            res.json({
                success: true,
                data: categories
            });
        } catch (error) {
            next(error);
        }
    }

    // 获取商品评论
    async getProductReviews(req, res, next) {
        try {
            const productId = parseInt(req.params.id);
            const filters = {
                min_rating: req.query.min_rating ? parseInt(req.query.min_rating) : undefined,
                limit: req.query.limit ? parseInt(req.query.limit) : 10
            };

            const reviews = await this.db.getProductReviews(productId, filters);
            
            // 解析图片JSON
            reviews.forEach(review => {
                if (review.images) {
                    try {
                        review.images = JSON.parse(review.images);
                    } catch (e) {
                        review.images = [];
                    }
                }
            });

            res.json({
                success: true,
                data: reviews
            });
        } catch (error) {
            next(error);
        }
    }

    // 添加评论
    async addReview(req, res, next) {
        try {
            const {
                product_id,
                order_item_id,
                rating,
                content,
                images = [],
                is_anonymous = false
            } = req.body;
            
            if (!product_id || !rating || rating < 1 || rating > 5) {
                return res.status(400).json({
                    success: false,
                    message: '请提供有效的商品ID和评分（1-5分）'
                });
            }

            // 检查用户是否购买过该商品
            if (order_item_id) {
                const orderItem = await this.db.get(`
                    SELECT oi.* FROM order_items oi
                    JOIN orders o ON oi.order_id = o.id
                    WHERE oi.id = ? AND o.user_id = ? AND o.order_status = 'completed'
                `, [order_item_id, req.user.id]);
                
                if (!orderItem) {
                    return res.status(400).json({
                        success: false,
                        message: '只能对已完成的订单商品进行评价'
                    });
                }
            }

            await this.db.addReview({
                user_id: req.user.id,
                product_id,
                order_item_id,
                rating,
                content,
                images,
                is_anonymous
            });

            res.status(201).json({
                success: true,
                message: '评价提交成功'
            });
        } catch (error) {
            next(error);
        }
    }

    // === 管理员API ===

    // 获取仪表板统计
    async getDashboardStats(req, res, next) {
        try {
            const stats = await this.db.getDashboardStats();
            
            res.json({
                success: true,
                data: stats
            });
        } catch (error) {
            next(error);
        }
    }

    // 获取所有订单（管理员）
    async getAllOrders(req, res, next) {
        try {
            const filters = {
                order_status: req.query.status,
                payment_status: req.query.payment_status,
                limit: req.query.limit ? parseInt(req.query.limit) : 50,
                offset: req.query.offset ? parseInt(req.query.offset) : 0
            };

            let sql = `
                SELECT o.*, u.username, u.email 
                FROM orders o 
                JOIN users u ON o.user_id = u.id 
                WHERE 1=1
            `;
            const params = [];
            
            if (filters.order_status) {
                sql += ' AND o.order_status = ?';
                params.push(filters.order_status);
            }
            
            if (filters.payment_status) {
                sql += ' AND o.payment_status = ?';
                params.push(filters.payment_status);
            }
            
            sql += ' ORDER BY o.created_at DESC LIMIT ? OFFSET ?';
            params.push(filters.limit, filters.offset);

            const orders = await this.db.query(sql, params);
            
            // 获取总数
            const countResult = await this.db.get(`
                SELECT COUNT(*) as total FROM orders
                ${filters.order_status || filters.payment_status ? 'WHERE 1=1' : ''}
                ${filters.order_status ? ' AND order_status = ?' : ''}
                ${filters.payment_status ? ' AND payment_status = ?' : ''}
            `, [filters.order_status, filters.payment_status].filter(Boolean));

            res.json({
                success: true,
                data: orders,
                pagination: {
                    total: countResult.total,
                    limit: filters.limit,
                    offset: filters.offset
                }
            });
        } catch (error) {
            next(error);
        }
    }

    // 更新订单状态（管理员）
    async updateOrderStatus(req, res, next) {
        try {
            const orderId = parseInt(req.params.id);
            const { status } = req.body;
            
            if (!status) {
                return res.status(400).json({
                    success: false,
                    message: '请提供状态值'
                });
            }

            const validStatuses = ['pending', 'processing', 'shipped', 'delivered', 'completed', 'cancelled'];
            if (!validStatuses.includes(status)) {
                return res.status(400).json({
                    success: false,
                    message: '无效的状态值'
                });
            }

            const result = await this.db.updateOrderStatus(orderId, status);
            
            if (result.changes === 0) {
                return res.status(404).json({
                    success: false,
                    message: '订单不存在'
                });
            }

            res.json({
                success: true,
                message: '订单状态更新成功'
            });
        } catch (error) {
            next(error);
        }
    }

    // 创建商品（管理员）
    async createProduct(req, res, next) {
        try {
            const productData = req.body;
            
            // 验证必填字段
            if (!productData.name || !productData.price || !productData.stock) {
                return res.status(400).json({
                    success: false,
                    message: '请填写商品名称、价格和库存'
                });
            }

            // 处理图片和标签JSON
            if (productData.image_urls && Array.isArray(productData.image_urls)) {
                productData.image_urls = JSON.stringify(productData.image_urls);
            }
            
            if (productData.tags && Array.isArray(productData.tags)) {
                productData.tags = JSON.stringify(productData.tags);
            }

            const sql = `
                INSERT INTO products (
                    name, description, price, original_price, stock, category_id,
                    main_image_url, image_urls, tags, is_hot, is_recommended, status
                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            `;
            
            const params = [
                productData.name,
                productData.description || '',
                productData.price,
                productData.original_price || productData.price,
                productData.stock,
                productData.category_id || null,
                productData.main_image_url || '',
                productData.image_urls || null,
                productData.tags || null,
                productData.is_hot ? 1 : 0,
                productData.is_recommended ? 1 : 0,
                productData.status || 'active'
            ];

            const result = await this.db.run(sql, params);

            res.status(201).json({
                success: true,
                message: '商品创建成功',
                data: { id: result.lastID }
            });
        } catch (error) {
            next(error);
        }
    }

    // 更新商品（管理员）
    async updateProduct(req, res, next) {
        try {
            const productId = parseInt(req.params.id);
            const productData = req.body;
            
            // 处理图片和标签JSON
            if (productData.image_urls && Array.isArray(productData.image_urls)) {
                productData.image_urls = JSON.stringify(productData.image_urls);
            }
            
            if (productData.tags && Array.isArray(productData.tags)) {
                productData.tags = JSON.stringify(productData.tags);
            }

            const fields = [];
            const values = [];
            
            const allowedFields = [
                'name', 'description', 'price', 'original_price', 'stock', 'category_id',
                'main_image_url', 'image_urls', 'tags', 'is_hot', 'is_recommended', 'status'
            ];
            
            allowedFields.forEach(field => {
                if (productData[field] !== undefined) {
                    fields.push(`${field} = ?`);
                    values.push(productData[field]);
                }
            });
            
            if (fields.length === 0) {
                return res.status(400).json({
                    success: false,
                    message: '没有提供更新数据'
                });
            }
            
            values.push(productId);
            const sql = `UPDATE products SET ${fields.join(', ')} WHERE id = ?`;
            
            const result = await this.db.run(sql, values);
            
            if (result.changes === 0) {
                return res.status(404).json({
                    success: false,
                    message: '商品不存在'
                });
            }

            res.json({
                success: true,
                message: '商品更新成功'
            });
        } catch (error) {
            next(error);
        }
    }

    // 启动服务器
    async start() {
        try {
            // 连接数据库
            this.db = await getDatabase();
            console.log('数据库连接成功');

            // 启动服务器
            this.server = this.app.listen(this.port, () => {
                console.log(`淘宝商城API服务已启动`);
                console.log(`地址: http://localhost:${this.port}`);
                console.log(`API文档: http://localhost:${this.port}/api/health`);
                console.log('\n可用API端点:');
                console.log('  GET  /api/health           - 健康检查');
                console.log('  POST /api/auth/register    - 用户注册');
                console.log('  POST /api/auth/login       - 用户登录');
                console.log('  GET  /api/products         - 获取商品列表');
                console.log('  GET  /api/products/:id     - 获取单个商品');
                console.log('  GET  /api/categories       - 获取分类');
                console.log('\n需要认证的API:');
                console.log('  GET  /api/user/profile     - 获取用户资料');
                console.log('  GET  /api/cart             - 获取购物车');
                console.log('  POST /api/cart             - 添加到购物车');
                console.log('  GET  /api/orders           - 获取订单列表');
                console.log('  POST /api/orders           - 创建订单');
            });
        } catch (error) {
            console.error('服务器启动失败:', error);
            process.exit(1);
        }
    }

    // 停止服务器
    async stop() {
        if (this.server) {
            this.server.close();
            console.log('服务器已停止');
        }
        
        if (this.db) {
            await this.db.close();
            console.log('数据库连接已关闭');
        }
    }
}

// 命令行接口
if (require.main === module) {
    const server = new TaobaoServer();
    
    // 处理退出信号
    process.on('SIGINT', async () => {
        console.log('\n收到退出信号，正在关闭服务器...');
        await server.stop();
        process.exit(0);
    });
    
    process.on('SIGTERM', async () => {
        console.log('\n收到终止信号，正在关闭服务器...');
        await server.stop();
        process.exit(0);
    });
    
    server.start();
}

module.exports = TaobaoServer;