package com.wyc21.entity;

import lombok.Data;
import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
public class ProductReview {
    private String reviewId;
    private String productId;
    private String userId;
    private String content;
    private BigDecimal rating;
    private Integer reviewCount;
    private LocalDateTime createdTime;
    private LocalDateTime modifiedTime;
}