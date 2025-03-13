USE store;

-- 清空所有表数据（按照外键依赖的反序清空）
SET FOREIGN_KEY_CHECKS = 0;

TRUNCATE TABLE wz_order_items;
TRUNCATE TABLE wz_orders;
TRUNCATE TABLE wz_cart_items;
TRUNCATE TABLE wz_carts;
TRUNCATE TABLE wz_browse_history;
TRUNCATE TABLE wz_browser_fingerprints;
TRUNCATE TABLE wz_product_images;
TRUNCATE TABLE wz_products;
TRUNCATE TABLE wz_categories;
TRUNCATE TABLE wz_users;
TRUNCATE TABLE wz_id_generator;

SET FOREIGN_KEY_CHECKS = 1;

-- 1. 初始化ID生成器
INSERT INTO wz_id_generator (id_type, current_max_id, step, version) VALUES
('user', 100, 100, 1),
('category', 100, 100, 1),
('product', 100, 100, 1),
('cart', 100, 100, 1),
('order', 100, 100, 1),
('cart_item', 100, 100, 1),
('order_item', 100, 100, 1);

-- 2. 初始化用户数据
INSERT INTO wz_users (uid, username, password, power, phone, email, gender, avatar, created_user, created_time) VALUES
('1', 'admin', '$2a$10$N.ZOn9G6/YLFixAOPMg/h.z7pCu6v2XyFDtC4q.jeeGM/TEZhPy7i', 'admin', '13800138000', 'admin@example.com', 1, 'admin.jpg', 'system', NOW()),
('2', 'test', '$2a$10$N.ZOn9G6/YLFixAOPMg/h.z7pCu6v2XyFDtC4q.jeeGM/TEZhPy7i', 'user', '13800138001', 'test@example.com', 0, 'default.jpg', 'system', NOW()),
('3', 'wz', '$2a$10$L9Ncd3EhHBeUBRyC4kN6t.ZMdWulVpwU38DF4R0n.q.ExZaSxLHTy', 'user', '6666666666', 'wz@example.com', 0, 'default.jpg', 'system', NOW());

-- 3. 初始化分类数据（使用事务确保数据一致性）
START TRANSACTION;

-- 先插入父分类
INSERT INTO wz_categories (category_id, name, parent_id, level, sort_order, created_user, created_time, modified_time) VALUES
('1', '电子产品', NULL, 1, 1, 'system', NOW(), NOW()),
('2', '服装', NULL, 1, 2, 'system', NOW(), NOW()),
('3', '食品', NULL, 1, 3, 'system', NOW(), NOW());

-- 然后插入子分类
INSERT INTO wz_categories (category_id, name, parent_id, level, sort_order, created_user, created_time, modified_time) VALUES
('11', '手机', '1', 2, 1, 'system', NOW(), NOW()),
('12', '电脑', '1', 2, 2, 'system', NOW(), NOW()),
('21', '男装', '2', 2, 1, 'system', NOW(), NOW()),
('22', '女装', '2', 2, 2, 'system', NOW(), NOW());

COMMIT;

-- 4. 初始化商品数据
INSERT INTO wz_products (product_id, name, description, price, stock, category_id, brand, tags, rating, review_count, image_url, is_active, created_user, created_time) VALUES
('1', 'iPhone 14', '最新款iPhone手机', 6999.00, 100, '11', 'Apple', 'phone,apple', 4.5, 100, '/images/iphone14.jpeg', 1, 'system', NOW()),
('2', 'MacBook Pro', '专业级笔记本电脑', 12999.00, 50, '12', 'Apple', 'laptop,apple', 4.8, 50, '/images/macbook.jpeg', 1, 'system', NOW()),
('3', 'Huawei P50', '华为旗舰手机', 5999.00, 80, '11', 'Huawei', 'phone,huawei', 4.6, 80, '/images/huawei.jpeg', 1, 'system', NOW());

-- 5. 初始化商品图片数据
INSERT INTO wz_product_images (image_id, product_id, image_url, is_primary, created_user) VALUES
('1', '1', '/images/iphone14.jpeg', 1, 'system'),
('2', '2', '/images/macbook.jpeg', 1, 'system'),
('3', '3', '/images/huawei.jpeg', 1, 'system');

-- 6. 初始化购物车数据
INSERT INTO wz_carts (cart_id, user_id, created_user, created_time) VALUES
('1', '1', 'system', NOW()),
('2', '2', 'system', NOW());

-- 7. 初始化购物车项数据
INSERT INTO wz_cart_items (cart_item_id, cart_id, product_id, quantity, price, product_name, created_user, created_time, paid_quantity) VALUES
('1', '1', '1', 1, 6999.00, 'iPhone 14', 'system', NOW(), 0),
('2', '1', '2', 1, 12999.00, 'MacBook Pro', 'system', NOW(), 0);

-- 8. 初始化订单数据
INSERT INTO wz_orders (order_id, user_id, total_amount, status, payment_id, created_user, created_time) VALUES
('1', '1', 19998.00, 'PAID', 'PAY123456', 'system', NOW()),
('2', '2', 6999.00, 'PENDING_PAY', NULL, 'system', NOW());

-- 9. 初始化订单项数据
INSERT INTO wz_order_items (
    order_item_id, 
    order_id, 
    product_id, 
    product_name, 
    quantity, 
    price, 
    created_user, 
    created_time,
    modified_user,
    modified_time
) VALUES
('1', '1', '1', 'iPhone 14', 1, 6999.00, 'system', NOW(), 'system', NOW()),
('2', '1', '2', 'MacBook Pro', 1, 12999.00, 'system', NOW(), 'system', NOW()),
('3', '2', '1', 'iPhone 14', 1, 6999.00, 'system', NOW(), 'system', NOW());


INSERT INTO wz_reviews (review_id, product_id, user_id, rating, content, created_time,  modified_time) VALUES
('1', '1', '2', 4.5, '手机运行流畅，拍照效果很棒！', NOW() - INTERVAL 5 DAY , NOW() - INTERVAL 5 DAY),
('2', '1', '3', 5.0, '苹果的生态果然强大，值得购买！', NOW() - INTERVAL 4 DAY, NOW() - INTERVAL 5 DAY),
('3', '1', '2', 3.5, '电池续航一般，其他还好。', NOW() - INTERVAL 3 DAY, NOW() - INTERVAL 5 DAY),
('4', '1', '3', 4.0, '屏幕显示效果细腻，手感一流。', NOW() - INTERVAL 2 DAY, NOW() - INTERVAL 5 DAY),
('5', '1', '2', 2.5, '价格有点高，性价比一般。', NOW() - INTERVAL 1 DAY, NOW() - INTERVAL 5 DAY),
('6', '1', '3', 4.5, '物流很快，包装完好！', NOW(), NOW() - INTERVAL 5 DAY),
('7', '1', '2', 5.0, 'iOS系统稳定，无卡顿。', NOW() - INTERVAL 6 DAY, NOW() - INTERVAL 5 DAY),
('8', '1', '3', 3.0, '充电速度慢，希望改进。', NOW() - INTERVAL 7 DAY, NOW() - INTERVAL 5 DAY),
('9', '1', '2', 4.0, '适合长期使用，推荐！', NOW() - INTERVAL 8 DAY, NOW() - INTERVAL 5 DAY),
('10', '1', '3', 4.5, '颜色很漂亮，满意！', NOW() - INTERVAL 9 DAY, NOW() - INTERVAL 5 DAY),
('11', '1', '2', 1.5, '用了两天就死机，差评！', NOW() - INTERVAL 10 DAY, NOW() - INTERVAL 5 DAY),
('12', '1', '3', 5.0, '性能强劲，游戏无压力！', NOW() - INTERVAL 11 DAY, NOW() - INTERVAL 5 DAY),
('13', '1', '2', 4.0, '音质不错，外放清晰。', NOW() - INTERVAL 12 DAY, NOW() - INTERVAL 5 DAY),
('14', '1', '3', 3.5, '发热有点严重，其他还行。', NOW() - INTERVAL 13 DAY, NOW() - INTERVAL 5 DAY),
('15', '1', '2', 5.0, '客服态度好，解决问题快。', NOW() - INTERVAL 14 DAY, NOW() - INTERVAL 5 DAY),
('16', '1', '3', 4.5, '系统更新后更流畅了。', NOW() - INTERVAL 15 DAY, NOW() - INTERVAL 5 DAY),
('17', '1', '2', 2.0, '信号不稳定，经常断网。', NOW() - INTERVAL 16 DAY, NOW() - INTERVAL 5 DAY),
('18', '1', '3', 4.0, '设计简洁大方，喜欢！', NOW() - INTERVAL 17 DAY, NOW() - INTERVAL 5 DAY),
('19', '1', '2', 5.0, '物超所值，下次还来买！', NOW() - INTERVAL 18 DAY, NOW() - INTERVAL 5 DAY),
('20', '1', '3', 3.0, '配件太少，只有充电线。', NOW() - INTERVAL 19 DAY, NOW() - INTERVAL 5 DAY),
('21', '2', '2', 5.0, '编程神器，运行速度快！', NOW() - INTERVAL 5 DAY, NOW() - INTERVAL 5 DAY),
('22', '2', '3', 4.5, '屏幕色彩准确，适合设计。', NOW() - INTERVAL 4 DAY, NOW() - INTERVAL 5 DAY),
('23', '2', '2', 4.0, '重量稍重，但性能无敌。', NOW() - INTERVAL 3 DAY, NOW() - INTERVAL 5 DAY),
('24', '2', '3', 2.5, '价格太贵，学生党劝退。', NOW() - INTERVAL 2 DAY, NOW() - INTERVAL 5 DAY),
('25', '2', '2', 5.0, '键盘手感舒适，码字高效。', NOW() - INTERVAL 1 DAY, NOW() - INTERVAL 5 DAY),
('26', '2', '3', 4.0, '续航时间长，外出方便。', NOW(), NOW() - INTERVAL 5 DAY),
('27', '2', '2', 3.5, '接口太少，需要转接器。', NOW() - INTERVAL 6 DAY, NOW() - INTERVAL 5 DAY),
('28', '2', '3', 5.0, 'M1芯片性能炸裂！', NOW() - INTERVAL 7 DAY, NOW() - INTERVAL 5 DAY),
('29', '2', '2', 4.5, '散热效果好，噪音低。', NOW() - INTERVAL 8 DAY, NOW() - INTERVAL 5 DAY),
('30', '2', '3', 1.0, '收到货有划痕，品控差！', NOW() - INTERVAL 9 DAY, NOW() - INTERVAL 5 DAY),
('31', '2', '2', 5.0, '视频剪辑毫无压力！', NOW() - INTERVAL 10 DAY, NOW() - INTERVAL 5 DAY),
('32', '2', '3', 3.0, '系统兼容性有待提高。', NOW() - INTERVAL 11 DAY, NOW() - INTERVAL 5 DAY),
('33', '2', '2', 4.5, '外观高级，适合商务。', NOW() - INTERVAL 12 DAY, NOW() - INTERVAL 5 DAY),
('34', '2', '3', 4.0, '开机速度秒杀Windows。', NOW() - INTERVAL 13 DAY, NOW() - INTERVAL 5 DAY),
('35', '2', '2', 2.0, '维修费用太高，慎买！', NOW() - INTERVAL 14 DAY, NOW() - INTERVAL 5 DAY),
('36', '3', '2', 4.5, '国产之光，支持华为！', NOW() - INTERVAL 5 DAY, NOW() - INTERVAL 5 DAY),
('37', '3', '3', 5.0, '拍照效果堪比单反！', NOW() - INTERVAL 4 DAY, NOW() - INTERVAL 5 DAY),
('38', '3', '2', 3.0, '不支持5G是硬伤。', NOW() - INTERVAL 3 DAY, NOW() - INTERVAL 5 DAY),
('39', '3', '3', 4.0, '鸿蒙系统流畅，好用！', NOW() - INTERVAL 2 DAY, NOW() - INTERVAL 5 DAY),
('40', '3', '2', 4.5, '充电速度超级快！', NOW() - INTERVAL 1 DAY, NOW() - INTERVAL 5 DAY),
('41', '3', '3', 2.5, '屏幕容易沾指纹。', NOW(),NOW()),
('42', '3', '2', 5.0, '信号强，电梯里也能用。', NOW() - INTERVAL 6 DAY, NOW() - INTERVAL 5 DAY),
('43', '3', '3', 4.0, '性价比高，推荐入手。', NOW() - INTERVAL 7 DAY, NOW() - INTERVAL 5 DAY),
('44', '3', '2', 3.5, '系统广告有点多。', NOW() - INTERVAL 8 DAY, NOW() - INTERVAL 5 DAY),
('45', '3', '3', 5.0, '续航给力，一天一充。', NOW() - INTERVAL 9 DAY, NOW() - INTERVAL 5 DAY),
('46', '3', '2', 4.0, '手感轻薄，携带方便。', NOW() - INTERVAL 10 DAY, NOW() - INTERVAL 5 DAY),
('47', '3', '3', 1.5, '预装软件太多，占内存。', NOW() - INTERVAL 11 DAY, NOW() - INTERVAL 5 DAY),
('48', '3', '2', 4.5, '售后服务很贴心！', NOW() - INTERVAL 12 DAY, NOW() - INTERVAL 5 DAY),
('49', '3', '3', 3.0, '游戏发热明显。', NOW() - INTERVAL 13 DAY, NOW() - INTERVAL 5 DAY),
('50', '3', '2', 5.0, '支持国产，华为加油！', NOW() - INTERVAL 14 DAY, NOW() - INTERVAL 5 DAY);