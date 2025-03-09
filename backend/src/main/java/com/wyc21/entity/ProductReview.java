package com.wyc21.entity;

import lombok.Data;
import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
public class ProductReview {
    private Long productId;
    private String name;
    private BigDecimal price;
    private String description;
    private BigDecimal rating;
    private Integer reviewCount;
    private LocalDateTime createdTime;
}