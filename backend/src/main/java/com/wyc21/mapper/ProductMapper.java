package com.wyc21.mapper;

import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

import com.wyc21.entity.Product;
import com.wyc21.entity.ProductReview;
import com.wyc21.entity.Category;

import java.time.LocalDateTime;
import java.util.List;

@Mapper
public interface ProductMapper {
        // 获取商品列表（支持分页和条件查询）
        List<Product> findProducts(@Param("categoryId") Long categoryId,
                        @Param("keyword") String keyword,
                        @Param("offset") int offset,
                        @Param("limit") int limit,
                        @Param("imageUrl") String imageUrl);

        // 获取所有商品（按创建时间倒序）
        List<Product> findAll();

        // 获取商品总数
        long countProducts(@Param("categoryId") Long categoryId,
                        @Param("keyword") String keyword,
                        @Param("imageUrl") String imageUrl);

        // 获取商品详情（包括图片）
        Product findById(String id);

        // 获取商品评论
        List<ProductReview> findReviewsByProductId(@Param("productId") String productId,
                        @Param("offset") int offset,
                        @Param("limit") int limit);

        // 添加这个方法
        int countReviewsByProductId(@Param("productId") String productId);

        void insertProduct(Product product);

        void updateProduct(Product product);

        Product findProductById(String productId);

        // 更新商品库存
        void updateStock(@Param("productId") Long productId, @Param("stock") Integer stock);

        /**
         * 扣减库存
         */
        void decreaseStock(@Param("productId") String productId, @Param("quantity") Integer quantity);

        /**
         * 恢复库存
         */
        void increaseStock(@Param("productId") String productId, @Param("quantity") Integer quantity);

        /**
         * 锁定商品
         */
        Product findByIdForUpdate(Long productId);

        /**
         * 获取商品的所有图片URL
         * 
         * @param productId 商品ID
         * @return 图片URL列表
         */
        List<String> findProductImages(@Param("productId") Long productId);

        List<Product> searchProducts(@Param("keyword") String keyword, 
                                   @Param("offset") int offset, 
                                   @Param("size") int size);
        
        int countSearchProducts(@Param("keyword") String keyword);

        List<Product> findProductsByUserId(@Param("userId") String userId);

        void insertCategory(Category category);

        Category findCategoryByName(String name);

        // 添加评论
        void insertReview(ProductReview review);

        // 删除评论
        void deleteReview(@Param("reviewId") String reviewId, 
                         @Param("userId") String userId,
                         @Param("modifiedTime") LocalDateTime modifiedTime);
}