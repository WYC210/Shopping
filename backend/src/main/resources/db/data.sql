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
('1', 'admin', '$2a$10$N.ZOn9G6/YLFixAOPMg/h.z7pCu6v2XyFDtC4q.jeeGM/TEZhPy7i', 'admin', '13800138000', 'admin@example.com', 1, 'admin.jpeg', 'system', NOW()),
('2', 'test', '$2a$10$N.ZOn9G6/YLFixAOPMg/h.z7pCu6v2XyFDtC4q.jeeGM/TEZhPy7i', 'user', '13800138001', 'test@example.com', 0, 'default.jpeg', 'system', NOW()),
('3', 'wz', '$2a$10$L9Ncd3EhHBeUBRyC4kN6t.ZMdWulVpwU38DF4R0n.q.ExZaSxLHTy', 'user', '6666666666', 'wz@example.com', 0, 'default.jpeg', 'system', NOW());

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
('21', '2', '2', 5.0, '神器，运行速度快！', NOW() - INTERVAL 5 DAY, NOW() - INTERVAL 5 DAY),
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



-- 添加新父分类
INSERT INTO wz_categories (category_id, name, parent_id, level, sort_order, created_user, created_time, modified_time) VALUES
('4', '家居用品', NULL, 1, 4, 'system', NOW(), NOW()),
('5', '图书', NULL, 1, 5, 'system', NOW(), NOW());

-- 添加新子分类（每个父分类下添加若干子分类）
INSERT INTO wz_categories VALUES
-- 电子产品子分类（父分类id为'1'）
('13', '智能手表', '1', 2, 3, 1, 'system', NOW(), NOW()),
('14', '平板电脑', '1', 2, 4, 1, 'system', NOW(), NOW()),
('15', '摄影器材', '1', 2, 5, 1, 'system', NOW(), NOW()),

-- 服装子分类（父分类id为'2'）
('23', '童装', '2', 2, 3, 1, 'system', NOW(), NOW()),
('24', '运动装', '2', 2, 4, 1, 'system', NOW(), NOW()),

-- 食品子分类（父分类id为'3'）
('31', '零食', '3', 2, 1, 1, 'system', NOW(), NOW()),
('32', '饮料', '3', 2, 2, 1, 'system', NOW(), NOW()),

-- 家居子分类（父分类id为'4'）
('41', '厨房用具', '4', 2, 1, 1, 'system', NOW(), NOW()),
('42', '家具', '4', 2, 2, 1, 'system', NOW(), NOW()),

-- 图书子分类（父分类id为'5'）
('51', '科技图书', '5', 2, 1, 1, 'system', NOW(), NOW()),
('52', '文学小说', '5', 2, 2, 1, 'system', NOW(), NOW());

COMMIT;

 
-- 生成商品数据（共102个商品）
 
-- 智能手表（20个，类别 '13'，产品ID：4~23）
INSERT INTO wz_products (product_id, name, description, price, stock, category_id, brand, tags, image_url, created_user) VALUES
('4', 'Apple Watch Series 8', '全天候视网膜显示屏', 2999.00, 50, '13', 'Apple', 'smartwatch', '/images/AppleWatchSeries8.jpeg', 'system'),
('5', 'Huawei Watch GT3', '两周超长续航', 1299.00, 80, '13', 'Huawei', 'sport', '/images/HuaweiWatchGT3.jpeg', 'system'),
('6', 'Xiaomi Mi Watch Color', '丰富多彩，智能健康监测', 899.00, 70, '13', 'Xiaomi', 'smartwatch', '/images/XiaomiMiWatchColor.jpeg', 'system'),
('7', 'Garmin Forerunner 265', '专为运动设计，精准计时', 1999.00, 60, '13', 'Garmin', 'fitness', '/images/AppleWatchSeries8.jpeg', 'system'),
('8', 'Fossil Gen 6', '时尚设计，搭载Wear OS', 1799.00, 55, '13', 'Fossil', 'classic', '/images/AppleWatchSeries8.jpeg', 'system'),
('9', 'Samsung Galaxy Watch 5', '先进健康监控，时尚外观', 2199.00, 65, '13', 'Samsung', 'smartwatch', '/images/HuaweiWatchGT3.jpeg', 'system'),
('10', 'Fitbit Versa 3', '全天候健康追踪，轻便设计', 1599.00, 75, '13', 'Fitbit', 'fitness', '/images/XiaomiMiWatchColor.jpeg', 'system'),
('11', 'Amazfit GTR 3', '超长续航，运动与健康兼顾', 1399.00, 85, '13', 'Amazfit', 'smartwatch', '/images/XiaomiMiWatchColor.jpeg', 'system'),
('12', 'Suunto 7', '精准GPS定位，强悍耐用', 1899.00, 50, '13', 'Suunto', 'outdoor', '/images/XiaomiMiWatchColor.jpeg', 'system'),
('13', 'Mobvoi TicWatch Pro 3', '双层显示屏设计，省电耐用', 1499.00, 60, '13', 'Mobvoi', 'smartwatch', '/images/AppleWatchSeries8.jpeg', 'system'),
('14', 'Withings Steel HR', '混合智能手表，经典外观', 1299.00, 70, '13', 'Withings', 'hybrid', '/images/AppleWatchSeries8.jpeg', 'system'),
('15', 'Oppo Watch 2', '多功能智能手表，时尚轻便', 1599.00, 65, '13', 'Oppo', 'smartwatch', '/images/XiaomiMiWatchColor.jpeg', 'system'),
('16', 'Realme Watch S Pro', '健康监测全面，运动数据精准', 1099.00, 80, '13', 'Realme', 'fitness', '/images/XiaomiMiWatchColor.jpeg', 'system'),
('17', 'Honor MagicWatch 2', '大屏幕设计，功能丰富', 1399.00, 70, '13', 'Honor', 'smartwatch', '/images/XiaomiMiWatchColor.jpeg', 'system'),
('18', 'Lenovo Carme', '经济实惠，功能实用', 999.00, 90, '13', 'Lenovo', 'smartwatch', '/images/HuaweiWatchGT3.jpeg', 'system'),
('19', 'OnePlus Watch', '简约设计，高效能量管理', 1299.00, 85, '13', 'OnePlus', 'smartwatch', '/images/HuaweiWatchGT3.jpeg', 'system'),
('20', 'LG Watch Sport', '运动模式多样，设计前卫', 1199.00, 75, '13', 'LG', 'fitness', '/images/HuaweiWatchGT3.jpeg', 'system'),
('21', 'Casio Pro Trek Smart', '坚固耐用，适合户外探险', 1499.00, 55, '13', 'Casio', 'outdoor', '/images/AppleWatchSeries8.jpeg', 'system'),
('22', 'Timex Metropolitan R', '复古风格，智能与经典融合', 1099.00, 65, '13', 'Timex', 'hybrid', '/images/AppleWatchSeries8.jpeg', 'system'),
('23', 'Moto 360', '圆形表盘设计，时尚与实用兼备', 1199.00, 70, '13', 'Moto', 'smartwatch', '/images/AppleWatchSeries8.jpeg', 'system');

 
-- 平板电脑（20个，类别 '14'，产品ID：24~43）
INSERT INTO wz_products (product_id, name, description, price, stock, category_id, brand, tags, image_url, created_user) VALUES
('24', 'iPad Pro 2023', 'M2芯片 12.9英寸', 8999.00, 30, '14', 'Apple', 'tablet', '/images/iPadPro2023.jpeg', 'system'),
('25', 'MatePad Pro', '120Hz OLED屏', 4999.00, 60, '14', 'Huawei', 'office', '/images/MatePadPro.jpeg', 'system'),
('26', 'Samsung Galaxy Tab S8', '高分辨率显示，强劲性能', 6799.00, 40, '14', 'Samsung', 'tablet', '/images/SamsungGalaxyTabS8.jpeg', 'system'),
('27', 'Microsoft Surface Pro 8', '二合一平板与笔记本', 7599.00, 35, '14', 'Microsoft', 'tablet', '/images/iPadPro2023.jpeg', 'system'),
('28', 'Lenovo Tab P11', '家庭娱乐及办公两相宜', 2999.00, 50, '14', 'Lenovo', 'tablet', '/images/MatePadPro.jpeg', 'system'),
('29', 'Amazon Fire HD 10', '经济实惠，适合家庭使用', 1899.00, 80, '14', 'Amazon', 'tablet', '/images/SamsungGalaxyTabS8.jpeg', 'system'),
('30', 'Huawei MatePad 11', '高效多任务处理', 3999.00, 45, '14', 'Huawei', 'tablet', '/images/iPadPro2023.jpeg', 'system'),
('31', 'Xiaomi Mi Pad 5', '极致性价比，娱乐办公兼备', 2599.00, 55, '14', 'Xiaomi', 'tablet', '/images/MatePadPro.jpeg', 'system'),
('32', 'Dell Latitude 7220', '商务平板，轻便耐用', 4299.00, 30, '14', 'Dell', 'tablet', '/images/SamsungGalaxyTabS8.jpeg', 'system'),
('33', 'HP Elite x2', '高性能，适合企业用户', 4599.00, 25, '14', 'HP', 'tablet', '/images/SamsungGalaxyTabS8.jpeg', 'system'),
('34', 'Acer Enduro T1', '坚固耐用，适合户外工作', 3199.00, 40, '14', 'Acer', 'tablet', '/images/iPadPro2023.jpeg', 'system'),
('35', 'ASUS Transformer Pad', '创新设计，多模式使用', 3899.00, 35, '14', 'ASUS', 'tablet', '/images/iPadPro2023.jpeg', 'system'),
('36', 'Google Pixel Slate', 'Chrome OS系统，轻松办公', 4999.00, 30, '14', 'Google', 'tablet', '/images/iPadPro2023.jpeg', 'system'),
('37', 'Toshiba Portege M10', '便携商务，续航持久', 3399.00, 45, '14', 'Toshiba', 'tablet', '/images/SamsungGalaxyTabS8.jpeg', 'system'),
('38', 'Sony Xperia Tablet Z4', '高品质影音体验', 4299.00, 40, '14', 'Sony', 'tablet', '/images/SamsungGalaxyTabS8.jpeg', 'system'),
('39', 'LG G Pad X', '轻薄便携，娱乐办公两相宜', 2799.00, 50, '14', 'LG', 'tablet', '/images/SamsungGalaxyTabS8.jpeg', 'system'),
('40', 'Nokia T10', '时尚设计，实用性强', 2399.00, 60, '14', 'Nokia', 'tablet', '/images/MatePadPro.jpeg', 'system'),
('41', 'ZTE Blade V8', '高性能，性价比之选', 2599.00, 55, '14', 'ZTE', 'tablet', '/images/MatePadPro.jpeg', 'system'),
('42', 'Oppo Pad Air', '轻盈设计，持久续航', 2799.00, 50, '14', 'Oppo', 'tablet', '/images/MatePadPro.jpeg', 'system'),
('43', 'Realme Pad Mini', '便携小巧，功能全面', 1999.00, 65, '14', 'Realme', 'tablet', '/images/MatePadPro.jpeg', 'system');

 
-- 摄影器材（20个，类别 '15'，产品ID：44~63）
INSERT INTO wz_products (product_id, name, description, price, stock, category_id, brand, tags, image_url, created_user) VALUES
('44', 'Sony A7IV', '全画幅微单相机', 18999.00, 15, '15', 'Sony', 'camera', '/images/SonyA7IV.jpeg', 'system'),
('45', 'Canon R6', '20fps连拍', 15999.00, 20, '15', 'Canon', 'mirrorless', '/images/SonyA7IV.jpeg', 'system'),
('46', 'Nikon Z6 II', '高分辨率与高速连拍', 16999.00, 18, '15', 'Nikon', 'mirrorless', '/images/NikonZ6II.jpeg', 'system'),
('47', 'Fujifilm X-T4', '复古设计，出色色彩还原', 15999.00, 22, '15', 'Fujifilm', 'mirrorless', '/images/NikonZ6II.jpeg', 'system'),
('48', 'Panasonic Lumix S5', '专业视频拍摄与高质量静态', 14999.00, 20, '15', 'Panasonic', 'camera', '/images/NikonZ6II.jpeg', 'system'),
('49', 'Olympus OM-D E-M1 Mark III', '高性能微单，稳定性优异', 13999.00, 25, '15', 'Olympus', 'mirrorless', '/images/NikonZ6II.jpeg', 'system'),
('50', 'Sigma fp L', '紧凑设计，全画幅传感器', 18999.00, 15, '15', 'Sigma', 'camera', '/images/SonyA7IV.jpeg', 'system'),
('51', 'Leica SL2', '顶级工艺与画质表现', 24999.00, 10, '15', 'Leica', 'camera', '/images/SonyA7IV.jpeg', 'system'),
('52', 'Pentax K-1 Mark II', '坚固机身，适合野外拍摄', 12999.00, 20, '15', 'Pentax', 'DSLR', '/images/SonyA7IV.jpeg', 'system'),
('53', 'GoPro HERO11', '极限运动，防水耐摔', 3999.00, 50, '15', 'GoPro', 'action', '/images/SonyA7IV.jpeg', 'system'),
('54', 'DJI Osmo Pocket', '便携稳定器，轻松拍摄视频', 2999.00, 30, '15', 'DJI', 'camera', '/images/SonyA7IV.jpeg', 'system'),
('55', 'Blackmagic Pocket Cinema Camera 6K', '专业级视频拍摄', 25999.00, 8, '15', 'Blackmagic', 'cinema', '/images/NikonZ6II.jpeg', 'system'),
('56', 'Ricoh GR III', '街拍神器，超便携', 9999.00, 35, '15', 'Ricoh', 'compact', '/images/NikonZ6II.jpeg', 'system'),
('57', 'Hasselblad X1D II', '中画幅相机，极致画质', 35999.00, 5, '15', 'Hasselblad', 'medium format', '/images/NikonZ6II.jpeg', 'system'),
('58', 'Canon EOS M50', '入门级微单，易于上手', 7999.00, 40, '15', 'Canon', 'mirrorless', '/images/NikonZ6II.jpeg', 'system'),
('59', 'Sony RX100 VII', '便携数码相机，高速连拍', 10999.00, 30, '15', 'Sony', 'compact', '/images/NikonZ6II.jpeg', 'system'),
('60', 'Nikon D850', '全画幅单反，高解析度', 27999.00, 12, '15', 'Nikon', 'DSLR', '/images/NikonZ6II.jpeg', 'system'),
('61', 'Fujifilm GFX 50R', '中画幅无反，卓越色彩', 34999.00, 8, '15', 'Fujifilm', 'medium format', '/images/NikonZ6II.jpeg', 'system'),
('62', 'Sigma sd Quattro H', '独特设计，高品质成像', 11999.00, 15, '15', 'Sigma', 'DSLR', '/images/NikonZ6II.jpeg', 'system'),
('63', 'Panasonic GH5', '视频创作首选，无与伦比', 13999.00, 20, '15', 'Panasonic', 'mirrorless', '/images/NikonZ6II.jpeg', 'system');

 
-- 运动装（10个，类别 '24'，产品ID：64~73）
INSERT INTO wz_products (product_id, name, description, price, stock, category_id, brand, tags, image_url, created_user) VALUES
('64', 'Nikeclothes', '速干透气材质', 599.00, 100, '24', 'Nike', 'sportswear', '/images/Nikeclothes.jpeg', 'system'),
('65', 'Adidasclothes', '弹性腰围设计', 299.00, 150, '24', 'Adidas', 'gym', '/images/Adidasclothes.jpeg', 'system'),
('66', 'Pumaclothes', '轻便舒适，透气设计', 199.00, 120, '24', 'Puma', 'sportswear', '/images/Pumaclothes.jpeg', 'system'),
('67', 'Under Armourclothes', '吸湿排汗，保持干爽', 249.00, 140, '24', 'Under Armour', 'gym', '/images/Nikeclothes.jpeg', 'system'),
('68', 'Reebokclothes', '经典设计，适合日常训练', 229.00, 130, '24', 'Reebok', 'workout', '/images/Adidasclothes.jpeg', 'system'),
('69', 'New Balanceshoe', '舒适缓震，适合长跑', 499.00, 90, '24', 'New Balance', 'footwear', '/images/Pumaclothes.jpeg', 'system'),
('70', 'ASICSsocks', '优质棉料，抗菌防臭', 99.00, 200, '24', 'ASICS', 'accessory', '/images/Nikeclothes.jpeg', 'system'),
('71', 'Columbiaclothes', '防风防水，适合多种天气', 699.00, 80, '24', 'Columbia', 'outerwear', '/images/Nikeclothes.jpeg', 'system'),
('72', 'Skechersshoe', '舒适轻便，适合日常穿着', 399.00, 110, '24', 'Skechers', 'footwear', '/images/Adidasclothes.jpeg', 'system'),
('73', 'Filahat', '防晒透气，时尚百搭', 149.00, 160, '24', 'Fila', 'accessory', '/images/Adidasclothes.jpeg', 'system');

 
-- 零食（12个，类别 '31'，产品ID：74~85）
INSERT INTO wz_products (product_id, name, description, price, stock, category_id, brand, tags, image_url, created_user) VALUES
('74', 'sanzhisongshu', '每日坚果750g', 89.00, 200, '31', '三只松鼠', 'snacks', '/images/sanzhisongshu.jpeg', 'system'),
('75', 'liangpin', '独立小包装', 39.90, 300, '31', '良品铺子', 'jerky', '/images/liangpin.jpeg', 'system'),
('76', '百草味果脯混合装', '精选果干混合装', 59.90, 250, '31', '百草味', 'snacks', '/images/sanzhisongshu.jpeg', 'system'),
('77', 'Oishi薯片', '薄脆薯片，香脆可口', 19.90, 400, '31', 'Oishi', 'chips', '/images/Oishi薯片.jpeg', 'system'),
('78', '康师傅方便面零食包', '多种口味可选', 9.90, 500, '31', '康师傅', 'instant', '/images/liangpin.jpeg', 'system'),
('79', '良品铺子牛肉干', '香辣牛肉干，口感丰富', 49.90, 350, '31', '良品铺子', 'jerky', '/images/Oishi薯片.jpeg', 'system'),
('80', '三只松鼠巧克力坚果', '坚果与巧克力的完美结合', 99.00, 220, '31', '三只松鼠', 'snacks', '/images/Oishi薯片.jpeg', 'system'),
('81', '卫龙辣条', '经典辣条，回味无穷', 29.90, 450, '31', '卫龙', 'spicy', '/images/liangpin.jpeg', 'system'),
('82', '小浣熊曲奇饼干', '香脆饼干，甜蜜滋味', 15.90, 300, '31', '小浣熊', 'cookies', '/images/liangpin.jpeg', 'system'),
('83', '卡乐比燕麦棒', '健康营养，便携能量棒', 12.90, 320, '31', '卡乐比', 'snacks', '/images/liangpin.jpeg', 'system'),
('84', '今麦郎小包装饼干', '传统口味，经典回味', 8.90, 380, '31', '今麦郎', 'cookies', '/images/sanzhisongshu.jpeg', 'system'),
('85', '心相印茶叶蛋零食', '香浓茶味，独特风味', 6.90, 500, '31', '心相印', 'snacks', '/images/sanzhisongshu.jpeg', 'system');

 
-- 科技图书（20个，类别 '51'，产品ID：86~105）
INSERT INTO wz_products (product_id, name, description, price, stock, category_id, brand, tags, image_url, created_user) VALUES
('86', 'Python入门', '零基础学习指南', 69.90, 80, '51', '人民邮电', 'programming', '/images/Python入门.jpeg', 'system'),
('87', '人工智能原理', '深度学习实战', 99.00, 50, '51', '机械工业', 'AI', '/images/Python入门.jpeg', 'system'),
('88', '数据结构与算法分析', '计算机基础核心知识', 79.90, 70, '51', '清华大学出版社', 'programming', '/images/Python入门.jpeg', 'system'),
('89', '机器学习实战', '实战案例解析', 89.90, 60, '51', '机械工业出版社', 'machine learning', '/images/Python入门.jpeg', 'system'),
('90', '深度学习基础', '神经网络入门', 109.90, 55, '51', '电子工业出版社', 'deep learning', '/images/Python入门.jpeg', 'system'),
('91', '范式探索', '多种思想解析', 59.90, 75, '51', '人民邮电出版社', 'programming', '/images/Python入门.jpeg', 'system'),
('92', '网络安全指南', '全面覆盖网络防护', 99.90, 50, '51', '电子工业出版社', 'security', '/images/Python入门.jpeg', 'system'),
('93', '大数据处理技术', '海量数据解决方案', 119.90, 40, '51', '清华大学出版社', 'big data', '/images/Python入门.jpeg', 'system'),
('94', '云计算实战', '企业级云服务实践', 129.90, 35, '51', '机械工业出版社', 'cloud', '/images/Python入门.jpeg', 'system'),
('95', '物联网技术解析', '智能设备互联', 89.90, 45, '51', '电子工业出版社', 'IoT', '/images/Python入门.jpeg', 'system'),
('96', '区块链技术应用', '分布式账本技术', 139.90, 30, '51', '清华大学出版社', 'blockchain', '/images/Python入门.jpeg', 'system'),
('97', '虚拟现实与增强现实', '沉浸式体验技术', 149.90, 25, '51', '人民邮电出版社', 'VR AR', '/images/Python入门.jpeg', 'system'),
('98', '语言设计', '语言理论与实践', 79.90, 60, '51', '机械工业出版社', 'programming', '/images/Python入门.jpeg', 'system'),
('99', '软件工程实践', '开发流程与管理', 99.90, 50, '51', '电子工业出版社', 'software', '/images/Python入门.jpeg', 'system'),
('100', '计算机系统结构', '硬件与软件协同', 119.90, 40, '51', '清华大学出版社', 'systems', '/images/Python入门.jpeg', 'system'),
('101', '操作系统原理', '底层系统解析', 89.90, 55, '51', '人民邮电出版社', 'OS', '/images/Python入门.jpeg', 'system'),
('102', '数据库系统概念', '关系型与非关系型', 79.90, 65, '51', '机械工业出版社', 'database', '/images/Python入门.jpeg', 'system'),
('103', '前端开发实战', 'HTML, CSS, JavaScript', 69.90, 70, '51', '电子工业出版社', 'frontend', '/images/Python入门.jpeg', 'system'),
('104', '移动开发全攻略', 'Android与iOS开发', 99.90, 60, '51', '清华大学出版社', 'mobile', '/images/Python入门.jpeg', 'system'),
('105', '人机交互设计', '用户体验与界面设计', 89.90, 50, '51', '人民邮电出版社', 'UX', '/images/Python入门.jpeg', 'system');

 
-- 生成商品图片（每个商品1张主图，根据产品的 image_url 字段生成对应图片记录）
INSERT INTO wz_product_images (image_id, product_id, image_url, is_primary, created_user) VALUES
-- 智能手表图片（产品ID 4~23）
('4', '4', '/images/AppleWatchSeries8.jpeg', 1, 'system'),
('5', '5', '/images/HuaweiWatchGT3.jpeg', 1, 'system'),
('6', '6', '/images/XiaomiMiWatchColor.jpeg', 1, 'system'),
('7', '7', '/images/AppleWatchSeries8.jpeg', 1, 'system'),
('8', '8', '/images/AppleWatchSeries8.jpeg', 1, 'system'),
('9', '9', '/images/HuaweiWatchGT3.jpeg', 1, 'system'),
('10', '10', '/images/XiaomiMiWatchColor.jpeg', 1, 'system'),
('11', '11', '/images/XiaomiMiWatchColor.jpeg', 1, 'system'),
('12', '12', '/images/XiaomiMiWatchColor.jpeg', 1, 'system'),
('13', '13', '/images/AppleWatchSeries8.jpeg', 1, 'system'),
('14', '14', '/images/AppleWatchSeries8.jpeg', 1, 'system'),
('15', '15', '/images/XiaomiMiWatchColor.jpeg', 1, 'system'),
('16', '16', '/images/XiaomiMiWatchColor.jpeg', 1, 'system'),
('17', '17', '/images/XiaomiMiWatchColor.jpeg', 1, 'system'),
('18', '18', '/images/HuaweiWatchGT3.jpeg', 1, 'system'),
('19', '19', '/images/HuaweiWatchGT3.jpeg', 1, 'system'),
('20', '20', '/images/HuaweiWatchGT3.jpeg', 1, 'system'),
('21', '21', '/images/AppleWatchSeries8.jpeg', 1, 'system'),
('22', '22', '/images/AppleWatchSeries8.jpeg', 1, 'system'),
('23', '23', '/images/AppleWatchSeries8.jpeg', 1, 'system'),

-- 平板电脑图片（产品ID 24~43）
('24', '24', '/images/iPadPro2023.jpeg', 1, 'system'),
('25', '25', '/images/MatePadPro.jpeg', 1, 'system'),
('26', '26', '/images/SamsungGalaxyTabS8.jpeg', 1, 'system'),
('27', '27', '/images/iPadPro2023.jpeg', 1, 'system'),
('28', '28', '/images/MatePadPro.jpeg', 1, 'system'),
('29', '29', '/images/SamsungGalaxyTabS8.jpeg', 1, 'system'),
('30', '30', '/images/iPadPro2023.jpeg', 1, 'system'),
('31', '31', '/images/MatePadPro.jpeg', 1, 'system'),
('32', '32', '/images/SamsungGalaxyTabS8.jpeg', 1, 'system'),
('33', '33', '/images/SamsungGalaxyTabS8.jpeg', 1, 'system'),
('34', '34', '/images/iPadPro2023.jpeg', 1, 'system'),
('35', '35', '/images/iPadPro2023.jpeg', 1, 'system'),
('36', '36', '/images/iPadPro2023.jpeg', 1, 'system'),
('37', '37', '/images/SamsungGalaxyTabS8.jpeg', 1, 'system'),
('38', '38', '/images/SamsungGalaxyTabS8.jpeg', 1, 'system'),
('39', '39', '/images/SamsungGalaxyTabS8.jpeg', 1, 'system'),
('40', '40', '/images/MatePadPro.jpeg', 1, 'system'),
('41', '41', '/images/MatePadPro.jpeg', 1, 'system'),
('42', '42', '/images/MatePadPro.jpeg', 1, 'system'),
('43', '43', '/images/MatePadPro.jpeg', 1, 'system'),

-- 摄影器材图片（产品ID 44~63）
('44', '44', '/images/SonyA7IV.jpeg', 1, 'system'),
('45', '45', '/images/SonyA7IV.jpeg', 1, 'system'),
('46', '46', '/images/NikonZ6II.jpeg', 1, 'system'),
('47', '47', '/images/NikonZ6II.jpeg', 1, 'system'),
('48', '48', '/images/NikonZ6II.jpeg', 1, 'system'),
('49', '49', '/images/NikonZ6II.jpeg', 1, 'system'),
('50', '50', '/images/SonyA7IV.jpeg', 1, 'system'),
('51', '51', '/images/sSonyA7IVl2.jpeg', 1, 'system'),
('52', '52', '/images/SonyA7IV.jpeg', 1, 'system'),
('53', '53', '/images/SonyA7IV.jpeg', 1, 'system'),
('54', '54', '/images/SonyA7IV.jpeg', 1, 'system'),
('55', '55', '/images/NikonZ6II.jpeg', 1, 'system'),
('56', '56', '/images/NikonZ6II.jpeg', 1, 'system'),
('57', '57', '/images/NikonZ6II.jpeg', 1, 'system'),
('58', '58', '/images/NikonZ6II.jpeg', 1, 'system'),
('59', '59', '/images/NikonZ6II.jpeg', 1, 'system'),
('60', '60', '/images/NikonZ6II.jpeg', 1, 'system'),
('61', '61', '/images/NikonZ6II.jpeg', 1, 'system'),
('62', '62', '/images/NikonZ6II.jpeg', 1, 'system'),
('63', '63', '/images/NikonZ6II.jpeg', 1, 'system'),

-- 运动装图片（产品ID 64~73）
('64', '64', '/images/Nikeclothes.jpeg', 1, 'system'),
('65', '65', '/images/Adidasclothes.jpeg', 1, 'system'),
('66', '66', '/images/Pumaclothes.jpeg', 1, 'system'),
('67', '67', '/images/Nikeclothes.jpeg', 1, 'system'),
('68', '68', '/images/Adidasclothes.jpeg', 1, 'system'),
('69', '69', '/images/Pumaclothes.jpeg', 1, 'system'),
('70', '70', '/images/Nikeclothes.jpeg', 1, 'system'),
('71', '71', '/images/Nikeclothes.jpeg', 1, 'system'),
('72', '72', '/images/Adidasclothes.jpeg', 1, 'system'),
('73', '73', '/images/Adidasclothes.jpeg', 1, 'system'),

-- 零食图片（产品ID 74~85）
('74', '74', '/images/sanzhisongshu.jpeg', 1, 'system'),
('75', '75', '/images/liangpin.jpeg', 1, 'system'),
('76', '76', '/images/sanzhisongshu.jpeg', 1, 'system'),
('77', '77', '/images/Oishi薯片.jpeg', 1, 'system'),
('78', '78', '/images/liangpin.jpeg', 1, 'system'),
('79', '79', '/images/Oishi薯片.jpeg', 1, 'system'),
('80', '80', '/images/Oishi薯片.jpeg', 1, 'system'),
('81', '81', '/images/liangpin.jpeg', 1, 'system'),
('82', '82', '/images/liangpin.jpeg', 1, 'system'),
('83', '83', '/images/liangpin.jpeg', 1, 'system'),
('84', '84', '/images/sanzhisongshu.jpeg', 1, 'system'),
('85', '85', '/images/sanzhisongshu.jpeg', 1, 'system'),

-- 科技图书图片（产品ID 86~105）
('86', '86', '/images/Python入门.jpeg', 1, 'system'),
('87', '87', '/images/Python入门.jpeg', 1, 'system'),
('88', '88', '/images/Python入门.jpeg', 1, 'system'),
('89', '89', '/images/Python入门.jpeg', 1, 'system'),
('90', '90', '/images/Python入门.jpeg', 1, 'system'),
('91', '91', '/images/Python入门.jpeg', 1, 'system'),
('92', '92', '/images/Python入门.jpeg', 1, 'system'),
('93', '93', '/images/Python入门.jpeg', 1, 'system'),
('94', '94', '/images/Python入门.jpeg', 1, 'system'),
('95', '95', '/images/Python入门.jpeg', 1, 'system'),
('96', '96', '/images/Python入门.jpeg', 1, 'system'),
('97', '97', '/images/Python入门.jpeg', 1, 'system'),
('98', '98', '/images/Python入门.jpeg', 1, 'system'),
('99', '99', '/images/Python入门.jpeg', 1, 'system'),
('100', '100', '/images/Python入门.jpeg', 1, 'system'),
('101', '101', '/images/Python入门.jpeg', 1, 'system'),
('102', '102', '/images/Python入门.jpeg', 1, 'system'),
('103', '103', '/images/Python入门.jpeg', 1, 'system'),
('104', '104', '/images/Python入门.jpeg', 1, 'system'),
('105', '105', '/images/Python入门.jpeg', 1, 'system');

 
-- 更新ID生成器（确保下次插入不会冲突）
UPDATE wz_id_generator SET current_max_id = 200 WHERE id_type IN ('product', 'category');
