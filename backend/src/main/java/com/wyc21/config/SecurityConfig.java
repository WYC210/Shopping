package com.wyc21.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;
import java.util.Arrays;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import com.wyc21.security.JwtAuthenticationFilter;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

@Configuration
@EnableWebSecurity
public class SecurityConfig {

        @Autowired
        private JwtAuthenticationFilter jwtAuthenticationFilter;

        private static final Logger log = LoggerFactory.getLogger(SecurityConfig.class);

        @Bean
        public BCryptPasswordEncoder passwordEncoder() {
                return new BCryptPasswordEncoder();
        }

        @Bean
        public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
                http
                                .csrf(csrf -> csrf.disable())
                                .cors(cors -> cors.configurationSource(request -> {
                                        CorsConfiguration config = new CorsConfiguration();
                                        config.setAllowedOrigins(
                                                        Arrays.asList("http://localhost:8080",
                                                                        "http://192.168.0.106:8080",
                                                                        "http://localhost:5173"));

                                        config.setAllowedMethods(
                                                        Arrays.asList("GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"));
                                        config.setAllowedHeaders(Arrays.asList("*"));
                                        config.setExposedHeaders(Arrays.asList("*"));
                                        config.setAllowCredentials(true);
                                        config.setMaxAge(3600L);
                                        return config;
                                }))
                                .sessionManagement(session -> session
                                                .sessionCreationPolicy(SessionCreationPolicy.STATELESS))
                                .authorizeHttpRequests(auth -> auth
                                                // 允许匿名访问的路径
                                                .requestMatchers(
                                                                "/products/images/**",
                                                                "/products/search",
                                                                "/products/{productId}/reviews",
                                                                "/products/{id}",
                                                                "/products",
                                                                "/users/login",
                                                                "/users/register",
                                                                "/error",
                                                                "/swagger-ui/**",
                                                                "/v3/api-docs/**",
                                                                "/categories/**",
                                                                "/browse/history",
                                                                "/users/")
                                                .permitAll()
                                                // 需要认证的路径
                                                .requestMatchers("/products/create",
                                                                "/products/update",
                                                                "/products/deactivate/{productId}",
                                                                "/products/my/products/**",
                                                                "/cart/**",
                                                                "/orders/**",
                                                                "/users/info",
                                                                "/users/refresh",
                                                                                "/users/update","/users/password"
                                                               )
                                                .authenticated()
                                                .anyRequest().authenticated())
                                // 添加 JWT 过滤器
                                .addFilterBefore(
                                                jwtAuthenticationFilter,
                                                UsernamePasswordAuthenticationFilter.class);

                return http.build();
        }
}