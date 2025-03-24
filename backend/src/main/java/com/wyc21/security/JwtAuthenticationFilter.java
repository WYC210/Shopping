package com.wyc21.security;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.web.authentication.WebAuthenticationDetailsSource;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;
import org.springframework.beans.factory.annotation.Autowired;
import com.wyc21.util.JwtTokenUtil; 
import java.io.IOException;
import lombok.extern.slf4j.Slf4j;
import com.wyc21.util.JsonResult;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.wyc21.service.ex.TokenExpiredException;
import com.wyc21.service.ex.TokenInvalidException;
import io.jsonwebtoken.Claims;
import java.util.Collections;

@Slf4j
@Component
public class JwtAuthenticationFilter extends OncePerRequestFilter {

    @Autowired
    private JwtTokenUtil jwtTokenUtil; // 使用重命名后的JwtTokenUtil

    @Override
    protected void doFilterInternal(HttpServletRequest request,
            HttpServletResponse response,
            FilterChain filterChain) throws ServletException, IOException {

    

        try {
            String token = extractToken(request);
            
            if (token != null) {
            

             
                Claims claims = jwtTokenUtil.validateToken(token);

                if (claims != null) {
                 
                    String userId = jwtTokenUtil.getUserIdFromToken(token);
                  

                    // 创建认证对象
                    UsernamePasswordAuthenticationToken authentication = 
                        new UsernamePasswordAuthenticationToken(userId, null, null);
                    authentication.setDetails(new WebAuthenticationDetailsSource().buildDetails(request));
                    SecurityContextHolder.getContext().setAuthentication(authentication);
                    request.setAttribute("uid", userId);
                  
                }
            }
            
            filterChain.doFilter(request, response);
            
        } catch (TokenExpiredException | TokenInvalidException e) {
            log.error("Token异常: {}", e.getMessage());
            sendErrorResponse(response, HttpServletResponse.SC_UNAUTHORIZED, e.getMessage());
        } catch (Exception e) {
            log.error("无法设置用户认证: {}", e.getMessage());
            sendErrorResponse(response, HttpServletResponse.SC_UNAUTHORIZED, "token验证失败");
        }
    }

    private boolean isRefreshToken(HttpServletRequest request) {
        // 通过请求路径判断是否是刷新令牌的请求
        return request.getRequestURI().contains("/refresh");
    }

    private void sendErrorResponse(HttpServletResponse response, int status, String message)
            throws IOException {
        response.setStatus(status);
        response.setContentType("application/json;charset=UTF-8");
        response.setHeader("Access-Control-Allow-Origin", "*");
        response.setHeader("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
        response.setHeader("Access-Control-Allow-Headers", "*");
        response.setHeader("Access-Control-Allow-Credentials", "true");

        JsonResult<Void> result = new JsonResult<>(status, null, message);
        String jsonResponse = new ObjectMapper().writeValueAsString(result);
        response.getWriter().write(jsonResponse);
    }

    private String extractToken(HttpServletRequest request) {
        String bearerToken = request.getHeader("Authorization");
        if (bearerToken != null && bearerToken.startsWith("Bearer ")) {
            return bearerToken.substring(7);
        }
        return null;
    }
}