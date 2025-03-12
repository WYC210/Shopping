package com.wyc21.service.impl;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.wyc21.entity.BrowseHistory;
import com.wyc21.mapper.BrowseHistoryMapper;
import com.wyc21.model.PageResult;
import com.wyc21.service.BrowseHistoryService;
import com.wyc21.util.RedisUtil;
import com.wyc21.util.SnowflakeIdGenerator;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.util.Date;
import java.util.*;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.data.redis.core.RedisTemplate;
import java.util.concurrent.TimeUnit;

@Service
public class BrowseHistoryServiceImpl implements BrowseHistoryService {

    private static final Logger log = LoggerFactory.getLogger(BrowseHistoryServiceImpl.class);

    @Autowired
    private JdbcTemplate jdbcTemplate;

    @Autowired
    private RedisUtil redisUtil;

    @Autowired
    private SnowflakeIdGenerator idGenerator;

    @Autowired
    private ObjectMapper objectMapper;

    @Autowired
    private BrowseHistoryMapper browseHistoryMapper;

    @Autowired
    private RedisTemplate<String, String> redisTemplate;

    private static final String REDIS_BROWSE_HISTORY_KEY = "browse:history:";
    private static final long REDIS_EXPIRE_TIME = 3600000; // 1小时

    @Override
    @Transactional
    public void addBrowseHistory(String userId, String fingerprint, String productId) {
        // 使用当前时间戳作为score
        double score = System.currentTimeMillis();
        String key = REDIS_BROWSE_HISTORY_KEY + fingerprint;
        
        log.info("添加浏览记录 - 指纹: {}, 商品: {}, 时间戳: {}", fingerprint, productId, score);
        
        // 添加到Redis的ZSet中
        redisTemplate.opsForZSet().add(key, productId, score);
        
        // 设置过期时间
        redisTemplate.expire(key, REDIS_EXPIRE_TIME, TimeUnit.MILLISECONDS);
    }

    @Override
    public PageResult<BrowseHistory> getBrowseHistoryByUserId(String userId, int page, int size) {
        List<BrowseHistory> histories = new ArrayList<>();
        
        // 1. 先查找所有与该用户关联的浏览器指纹
        String sql = "SELECT fingerprint_id FROM wz_browser_fingerprints WHERE user_id = ?";
        List<String> fingerprints = jdbcTemplate.queryForList(sql, String.class, userId);
        log.info("用户 {} 关联的浏览器指纹: {}", userId, fingerprints);

        // 2. 遍历每个指纹，获取其浏览记录
        for (String fingerprint : fingerprints) {
            String key = REDIS_BROWSE_HISTORY_KEY + fingerprint;
            Set<String> productIds = redisTemplate.opsForZSet().reverseRange(key, 0, -1);
            log.info("指纹 {} 的浏览记录: {}", fingerprint, productIds);

            if (productIds != null && !productIds.isEmpty()) {
                for (String productId : productIds) {
                    Double score = redisTemplate.opsForZSet().score(key, productId);
                    if (score != null) {
                        BrowseHistory history = new BrowseHistory();
                        history.setHistoryId(String.valueOf(idGenerator.nextId()));
                        history.setUserId(userId);
                        history.setFingerprintId(fingerprint);
                        history.setProductId(productId);
                        history.setBrowseTime(new Date(score.longValue()));
                        histories.add(history);
                    }
                }
            }
        }

        // 3. 如果Redis中数据不足，从数据库补充
        if (histories.size() < size) {
            log.info("Redis中只有 {} 条记录，从数据库补充", histories.size());
            List<BrowseHistory> dbHistories = browseHistoryMapper.getBrowseHistoryByUserId(
                userId, 
                size - histories.size(), 
                (page - 1) * size + histories.size()
            );
            histories.addAll(dbHistories);
        }

        // 4. 排序并分页
        histories.sort((h1, h2) -> h2.getBrowseTime().compareTo(h1.getBrowseTime()));
        int fromIndex = (page - 1) * size;
        int toIndex = Math.min(fromIndex + size, histories.size());
        List<BrowseHistory> pagedHistories = histories.subList(fromIndex, toIndex);

        int total = browseHistoryMapper.getCountByUserId(userId);
        log.info("用户 {} 的浏览记录总数: {}, 本次返回: {} 条", userId, total, pagedHistories.size());
        
        return new PageResult<>(pagedHistories, total, page, size);
    }

    @Override
    public PageResult<BrowseHistory> getBrowseHistoryByFingerprint(String fingerprint, int page, int size) {
        List<BrowseHistory> histories = new ArrayList<>();
        
        // 直接使用指纹查询
        String key = REDIS_BROWSE_HISTORY_KEY + fingerprint;
        log.info("正在查询指纹的浏览记录，Redis键: {}", key);
        
        // 使用ZSet操作，获取指定范围的记录（按score降序）
        Set<String> productInfos = redisTemplate.opsForZSet().reverseRange(key, 0, size - 1);
        log.info("从Redis中获取到的商品信息: {}", productInfos);
        
        if (productInfos != null && !productInfos.isEmpty()) {
            for (String productInfo : productInfos) {
                // 解析JSON字符串
                try {
                    Map<String, String> productData = objectMapper.readValue(productInfo, new TypeReference<Map<String, String>>() {});
                    String productId = productData.get("id");
                    String productName = productData.get("name");
                    String productPrice = productData.get("price");
                    String productImageUrl = productData.get("imageUrl");
                    String productDescription = productData.get("description");
                    
                    // 获取score（时间戳）
                    Double score = redisTemplate.opsForZSet().score(key, productInfo);
                    if (score != null) {
                        BrowseHistory history = new BrowseHistory();
                        history.setHistoryId(String.valueOf(idGenerator.nextId()));
                        history.setFingerprintId(fingerprint);
                        history.setProductId(productId);
                        history.setBrowseTime(new Date(score.longValue()));
                        // 这里可以添加其他信息到history中
                        // 例如：history.setProductName(productName);
                        // 例如：history.setProductPrice(productPrice);
                        histories.add(history);
                        log.info("构建浏览记录: fingerprint={}, productId={}, time={}", 
                            fingerprint, productId, new Date(score.longValue()));
                    }
                } catch (JsonProcessingException e) {
                    log.error("解析商品信息失败: {}", e.getMessage());
                }
            }
        } else {
            log.info("Redis中没有找到指纹 {} 的浏览记录", fingerprint);
            
            // 如果Redis中没有数据，从数据库查询
            String sql = "SELECT * FROM wz_browse_history WHERE fingerprint_id = ? " +
                        "ORDER BY browse_time DESC LIMIT ? OFFSET ?";
            List<BrowseHistory> dbHistories = jdbcTemplate.query(sql,
                    (rs, rowNum) -> {
                        BrowseHistory history = new BrowseHistory();
                        history.setHistoryId(rs.getString("history_id"));
                        history.setUserId(rs.getString("user_id"));
                        history.setFingerprintId(rs.getString("fingerprint_id"));
                        history.setProductId(rs.getString("product_id"));
                        history.setBrowseTime(rs.getTimestamp("browse_time"));
                        return history;
                    },
                    fingerprint, size, (page - 1) * size);
            
            log.info("从数据库中获取到 {} 条记录", dbHistories.size());
            histories.addAll(dbHistories);
        }

        // 获取总记录数
        long total = redisTemplate.opsForZSet().size(key);
        if (total == 0) {
            // 如果Redis中没有数据，从数据库获取总数
            String countSql = "SELECT COUNT(*) FROM wz_browse_history WHERE fingerprint_id = ?";
            total = jdbcTemplate.queryForObject(countSql, Integer.class, fingerprint);
        }

        log.info("浏览记录查询完成，总记录数: {}, 本次返回: {} 条", total, histories.size());
        return new PageResult<>(histories, (int)total, page, size);
    }

    @Override
    @Transactional
    public void syncBrowseHistoryToDatabase() {
        Set<String> allKeys = redisUtil.keys(REDIS_BROWSE_HISTORY_KEY + "*");
        if (allKeys == null || allKeys.isEmpty()) {
            return;
        }

        for (String key : allKeys) {
            String value = redisUtil.get(key);
            try {
                BrowseHistory history = objectMapper.readValue(value, BrowseHistory.class);

                String sql = "INSERT INTO wz_browse_history (history_id, fingerprint_id, user_id, product_id, browse_time) "
                        +
                        "VALUES (?, ?, ?, ?, ?) ON DUPLICATE KEY UPDATE browse_time = VALUES(browse_time)";

                jdbcTemplate.update(sql,
                        history.getHistoryId(),
                        history.getFingerprintId(),
                        history.getUserId(),
                        history.getProductId(),
                        history.getBrowseTime());

            } catch (JsonProcessingException e) {
                // 记录日志但继续处理其他记录
            }
        }
    }

    @Override
    @Transactional
    public void associateUserWithFingerprint(String userId, String fingerprint) {
        browseHistoryMapper.insertFingerprintRecord(fingerprint, userId);
    }
}