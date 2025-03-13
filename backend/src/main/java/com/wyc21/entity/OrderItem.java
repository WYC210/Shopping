package com.wyc21.entity;

import lombok.Data;
import java.math.BigDecimal;


@Data
public class OrderItem extends BaseEntity {
    private String orderItemId;
    private String orderId;
    private String productId;
    private String productName;
    private Integer quantity;
    private BigDecimal price;
 
}