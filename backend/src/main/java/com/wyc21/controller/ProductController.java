package com.wyc21.controller;

import com.wyc21.entity.Product;
import com.wyc21.entity.ProductReview;
import com.wyc21.entity.PageResult;
import com.wyc21.service.ProductService;
import com.wyc21.util.JsonResult;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.core.io.Resource;
import org.springframework.core.io.ResourceLoader;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.data.redis.core.StringRedisTemplate;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.core.JsonProcessingException;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import java.io.File;
import java.util.List;
import java.util.Map;
import java.util.HashMap;
import java.util.stream.Collectors;
import com.wyc21.mapper.ProductMapper;
import com.wyc21.service.ex.ProductNotFoundException;

import jakarta.servlet.http.HttpServletRequest;

@RestController
@RequestMapping("/products")
public class ProductController extends BaseController {

    private static final Logger log = LoggerFactory.getLogger(ProductController.class);

    @Autowired
    private ProductService productService;

    @Autowired
    private ProductMapper productMapper;

    @Autowired
    private ResourceLoader resourceLoader; // 用于加载资源

    @Autowired
    private StringRedisTemplate redisTemplate;

    @Autowired
    private ObjectMapper objectMapper;

    private static final String BROWSE_HISTORY_KEY = "browse:history:";

    @GetMapping
    public PageResult<Product> getProducts(
            @RequestParam(required = false) Long categoryId,
            @RequestParam(required = false) String keyword,
            @RequestParam(required = false) String imageUrl,
            @RequestParam(defaultValue = "1") int pageNum,
            @RequestParam(defaultValue = "10") int pageSize) {

        return productService.getProducts(categoryId, keyword, pageNum, pageSize, imageUrl);
    }

    @GetMapping("/{id}")
    public JsonResult<Map<String, Object>> getProduct(
            @PathVariable Long id,
            @RequestHeader(value = "X-Device-Fingerprint", required = false) String fingerprint) {
        // 获取商品基本信息
        Product product = productService.getProduct(String.valueOf(id));

        // 记录浏览历史到Redis
        if (fingerprint != null) {
            String key = BROWSE_HISTORY_KEY + fingerprint;
            double score = System.currentTimeMillis();

            // 存储商品信息到Redis
            Map<String, String> productInfo = new HashMap<>();
            productInfo.put("id", String.valueOf(id));
            productInfo.put("name", product.getName());
            productInfo.put("price", String.valueOf(product.getPrice()));
            productInfo.put("imageUrl", product.getImageUrl());
            productInfo.put("description", product.getDescription());

            // 将商品信息转换为JSON字符串
            try {
                String value = objectMapper.writeValueAsString(productInfo);
                redisTemplate.opsForZSet().add(key, value, score);
            } catch (JsonProcessingException e) {
                log.error("存储商品信息到Redis失败: {}", e.getMessage());
                // 可以选择返回一个错误响应
            }
        }

        // 获取商品所有图片
        List<String> images = productMapper.findProductImages(id);

        if (product != null) {
            // 补充图片的完整访问路径
            String imageUrl = product.getImageUrl();
            if (imageUrl != null && !imageUrl.startsWith("http")) {
                product.setImageUrl("http://localhost:8088/products" + imageUrl);
            }

            // 处理所有图片的URL
            List<String> fullImageUrls = images.stream()
                    .map(img -> {
                        if (img != null && !img.startsWith("http")) {
                            return "http://localhost:8088/products" + img;
                        }
                        return img;
                    })
                    .collect(Collectors.toList());

            // 构建返回结果
            Map<String, Object> result = new HashMap<>();
            result.put("product", product);
            result.put("images", fullImageUrls);
            result.put("stock", product.getStock()); // 添加库存数量
            return new JsonResult<>(OK, result);
        }

        throw new ProductNotFoundException("商品不存在");
    }

    @GetMapping("/{productId}/reviews")
    public JsonResult<PageResult<ProductReview>> getProductReviews(
            @PathVariable String productId,
            @RequestParam(defaultValue = "1") int page,
            @RequestParam(defaultValue = "20") int size) {
        PageResult<ProductReview> reviews = productService.getProductReviews(productId, page, size);
        return new JsonResult<>(OK, reviews);
    }

    @GetMapping("/images/{imageName:.+}")
    public ResponseEntity<Resource> getImage(@PathVariable String imageName) {
        try {
            Resource resource = resourceLoader.getResource("classpath:images/" + imageName);
            return ResponseEntity.ok()
                    .header(HttpHeaders.CONTENT_TYPE, "image/jpeg") // 添加正确的Content-Type
                    .header(HttpHeaders.CONTENT_DISPOSITION, "inline; filename=\"" + resource.getFilename() + "\"")
                    .body(resource);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).build();
        }
    }

    // 上架商品
    @PostMapping("/create")
    public ResponseEntity<?> createProduct(@RequestBody Product product) {
        // 输出接收到的商品信息到控制台
        log.info("接收到的商品信息: {}", product);

        // 调用服务层方法创建商品
        productService.createProduct(product);
        return ResponseEntity.ok("商品上架成功");
    }

    // 更新商品
    @PutMapping("/update")
    public ResponseEntity<?> updateProduct(@RequestBody Product product) {
        productService.updateProduct(product);
        return ResponseEntity.ok("商品更新成功");
    }

    // 下架商品
    @PutMapping("/deactivate/{productId}")
    public ResponseEntity<?> deactivateProduct(@PathVariable String productId) {
        productService.deactivateProduct(productId);
        return ResponseEntity.ok("商品已下架");
    }

    @GetMapping("/search")
    public ResponseEntity<PageResult<Product>> searchProducts(
            @RequestParam String keyword,
            @RequestParam(defaultValue = "1") int page,
            @RequestParam(defaultValue = "10") int size) {
        try {
            // URL 解码
            String decodedKeyword = java.net.URLDecoder.decode(keyword, "UTF-8");
            PageResult<Product> result = productService.searchProducts(decodedKeyword, page, size);
            return ResponseEntity.ok(result);
        } catch (java.io.UnsupportedEncodingException e) {
            return ResponseEntity.badRequest().build();
        }
    }

    @GetMapping("/my/products")
    public JsonResult<List<Product>> getMyProducts(HttpServletRequest request) {
        String userId = null;
        if (request.getAttribute("uid") != null) {
            userId = request.getAttribute("uid").toString(); // 获取当前用户ID
        } else {
            return new JsonResult<>(400, null, "用户未登录"); // 返回错误响应
        }

        List<Product> products = productService.getProductsByUserId(userId); // 调用服务层方法
        return new JsonResult<>(OK, products);
    }

    // 添加评论
    @PostMapping("/{productId}/reviews")
    public JsonResult<Void> addReview(
            @PathVariable String productId,
            @RequestBody ProductReview review,
            HttpServletRequest request) {
        String userId = request.getAttribute("uid").toString();
        review.setUserId(userId);
        review.setProductId(productId);
        productService.addReview(review);
        return new JsonResult<>(OK);
    }

    // 删除评论
    @DeleteMapping("/reviews/{reviewId}")
    public JsonResult<Void> deleteReview(
            @PathVariable String reviewId,
            HttpServletRequest request) {
        String userId = request.getAttribute("uid").toString();
        productService.deleteReview(reviewId, userId);
        return new JsonResult<>(OK);
    }
}