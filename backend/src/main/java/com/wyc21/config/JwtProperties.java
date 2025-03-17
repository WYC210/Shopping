package com.wyc21.config;

import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.context.annotation.Configuration;
import org.springframework.validation.annotation.Validated;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Positive;
import lombok.Data;

@Data
@Configuration
@ConfigurationProperties(prefix = "jwt")
@Validated
public class JwtProperties {

    @NotBlank(message = "JWT secret cannot be empty")
    private String secret;

    @Positive(message = "Access token expiration must be positive")
    private Long accessTokenExpiration;

    @Positive(message = "Refresh token expiration must be positive")
    private Long refreshTokenExpiration;

    
}