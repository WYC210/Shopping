package com.wyc21.service.impl;

import com.wyc21.entity.Product;
import com.wyc21.entity.ProductReview;
import com.wyc21.service.ProductService;
import com.wyc21.entity.PageResult;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import com.wyc21.mapper.ProductMapper;
import java.util.List;
import java.time.LocalDateTime;
import org.springframework.transaction.annotation.Transactional;
import com.wyc21.entity.Category;

import com.wyc21.util.SnowflakeIdGenerator;
import java.math.BigDecimal;
import java.math.RoundingMode;

@Service
@Slf4j
public class ProductServiceImpl implements ProductService {

    @Autowired
    private ProductMapper productMapper;

    @Autowired
    private SnowflakeIdGenerator idGenerator;

    @Override
    public PageResult<Product> getProducts(Long categoryId, String keyword, int pageNum, int pageSize,
            String imageUrl) {
        // 验证并修正分页参数
        pageNum = Math.max(1, pageNum); // 页码最小为1
        pageSize = Math.max(1, pageSize); // 每页大小最小为1
        System.out.println(pageNum + pageSize);
        // 计算偏移量
        int offset = (pageNum - 1) * pageSize;
        System.out.println("==================== " + offset);
        // 查询数据
        List<Product> products = productMapper.findProducts(categoryId, keyword, offset, pageSize, imageUrl);
        long total = productMapper.countProducts(categoryId, keyword, imageUrl);
        System.out.println("==================== " + products);
        // 返回分页结果
        return new PageResult<>(products, total, pageNum, pageSize);
    }

    @Override
    public Product getProduct(String productId) {
        return productMapper.findById(productId);
    }

    @Override
    public List<ProductReview> getProductReviews(String productId, int limit) {
        // 调用 mapper 获取评论列表
        return productMapper.findReviewsByProductId(productId, 0, limit);
    }

    @Override
    @Transactional
    public void createProduct(Product product) {
        // 参数验证
        if (product.getCategoryId() == null || product.getCategoryId().trim().isEmpty()) {
            throw new IllegalArgumentException("分类不能为空");
        }

        // 处理分类
        String[] categories = product.getCategoryId().split(",");
        String mainCategoryId = null;
        String parentId = null;

        for (int i = 0; i < categories.length; i++) {
            String categoryName = categories[i].trim();
            Category existingCategory = productMapper.findCategoryByName(categoryName);

            if (existingCategory == null) {
                // 创建新分类
                Category newCategory = new Category();
                newCategory.setCategoryId(String.valueOf(idGenerator.nextId()));
                newCategory.setName(categoryName);
                newCategory.setParentId(parentId);
                newCategory.setLevel(i + 1);
                newCategory.setSortOrder(1);
                newCategory.setIsActive(true);
                newCategory.setCreatedTime(LocalDateTime.now());
                newCategory.setModifiedTime(LocalDateTime.now());

                productMapper.insertCategory(newCategory);

                if (i == 0) {
                    mainCategoryId = newCategory.getCategoryId();
                }
                parentId = newCategory.getCategoryId();
            } else {
                if (i == 0) {
                    mainCategoryId = existingCategory.getCategoryId();
                }
                parentId = existingCategory.getCategoryId();
            }
        }

        // 设置商品信息
        product.setProductId(String.valueOf(idGenerator.nextId()));
        product.setCategoryId(mainCategoryId);
        product.setIsActive(1);
        product.setCreatedTime(LocalDateTime.now());
        product.setModifiedTime(LocalDateTime.now());
        product.setRating(new BigDecimal("0"));
        product.setReviewCount(0);

        // 插入商品
        productMapper.insertProduct(product);
    }

    @Override
    @Transactional
    public void updateProduct(Product product) {
        // 校验商品是否存在
        Product existingProduct = productMapper.findById(product.getProductId());
        if (existingProduct == null) {
            throw new RuntimeException("商品不存在");
        }
        // 更新修改时间和用户
        product.setModifiedTime(LocalDateTime.now());
        productMapper.updateProduct(product);
    }

    @Override
    @Transactional
    public void deactivateProduct(String productId) {
        Product product = productMapper.findById(productId);
        if (product == null) {
            throw new RuntimeException("商品不存在");
        }
        product.setIsActive(0);
        productMapper.updateProduct(product);
    }

    @Override
    public PageResult<Product> searchProducts(String keyword, int page, int size) {
        // 计算分页偏移量
        int offset = (page - 1) * size;
        System.out.println("==================== "+offset);
        // 获取匹配的商品列表
        List<Product> products = productMapper.searchProducts(keyword, offset, size);
        System.out.println("==================== " + products);
        // 获取总记录数
        int total = productMapper.countSearchProducts(keyword);

        // 构建分页结果
        return new PageResult<>(products, total, page, size);
    }

    @Override
    public List<Product> getProductsByUserId(String userId) {
        return productMapper.findProductsByUserId(userId); // 调用Mapper方法
    }

    @Override
    public PageResult<ProductReview> getProductReviews(String productId, int page, int size) {
        int offset = (page - 1) * size;
        List<ProductReview> reviews = productMapper.findReviewsByProductId(productId, offset, size);
        int total = productMapper.countReviewsByProductId(productId);
        return new PageResult<>(reviews, total, page, size);
    }

    @Override
    @Transactional
    public void addReview(ProductReview review) {
        review.setReviewId(String.valueOf(idGenerator.nextId()));
        review.setCreatedTime(LocalDateTime.now());
        review.setModifiedTime(LocalDateTime.now());
        productMapper.insertReview(review);

        // 更新商品的评分和评论数
        Product product = productMapper.findById(review.getProductId());
        if (product != null) {
            product.setReviewCount(product.getReviewCount() + 1);
            // 更新平均评分
            BigDecimal newRating = calculateNewRating(product, review.getRating());
            product.setRating(newRating);
            productMapper.updateProduct(product);
        }
    }

    @Override
    @Transactional
    public void deleteReview(String reviewId, String userId) {
        productMapper.deleteReview(reviewId, userId, LocalDateTime.now());
    }

    private BigDecimal calculateNewRating(Product product, BigDecimal newRating) {
        BigDecimal currentRating = product.getRating();
        int currentCount = product.getReviewCount();

        return currentRating.multiply(new BigDecimal(currentCount))
                .add(newRating)
                .divide(new BigDecimal(currentCount + 1), 1, RoundingMode.HALF_UP);
    }
}