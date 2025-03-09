package com.wyc21.controller;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.ExceptionHandler;

import com.wyc21.service.ex.ServiceException;
import com.wyc21.util.JsonResult;

import jakarta.servlet.http.HttpSession;

import com.wyc21.service.ex.UsernameDuplicatedException;
import com.wyc21.service.ex.InsertException;
import com.wyc21.service.ex.UserNotFoundException;
import com.wyc21.service.ex.PasswordNotMatchException;
import com.wyc21.service.ex.TokenExpiredException;
import com.wyc21.service.ex.TokenInvalidException;

// 表示基类
public class BaseController {
    // 表示操作成功的状态码
    public static final int OK = 200;

    // 处理异常
    // 表示当Controller层发生异常时，会调用handleException方法
    @ExceptionHandler(ServiceException.class)
    public ResponseEntity<JsonResult<Void>> handleException(Throwable e) {
        JsonResult<Void> result = new JsonResult<>(e);
        HttpStatus httpStatus = HttpStatus.INTERNAL_SERVER_ERROR; // 默认状态码

        if (e instanceof UsernameDuplicatedException) {
            result.setStatus(4000);
            result.setMessage("用户名被占用");
            httpStatus = HttpStatus.BAD_REQUEST;
        } else if (e instanceof UserNotFoundException) {
            result.setStatus(5001);
            result.setMessage("用户不存在");
            httpStatus = HttpStatus.NOT_FOUND;
        } else if (e instanceof PasswordNotMatchException) {
            result.setStatus(5002);
            result.setMessage("密码不匹配");
            httpStatus = HttpStatus.BAD_REQUEST;
        } else if (e instanceof TokenExpiredException) {
            result.setStatus(4001);
            result.setMessage("访问令牌已过期，请使用刷新令牌");
            httpStatus = HttpStatus.UNAUTHORIZED;
        } else if (e instanceof TokenInvalidException) {
            result.setStatus(4002);
            result.setMessage("令牌无效，请重新登录");
            httpStatus = HttpStatus.UNAUTHORIZED;
        } else if (e instanceof InsertException) {
            result.setStatus(5000);
            result.setMessage("注册时发生未知错误");
            httpStatus = HttpStatus.INTERNAL_SERVER_ERROR;
        }

        return new ResponseEntity<>(result, httpStatus);
    }
    // 从HttpSession对象中获取uid   
    protected final Long getuidFromSession(HttpSession session) {
        return Long.valueOf(session.getAttribute("uid").toString());
    }
    // 从HttpSession对象中获取username
    protected final String getUsernameFromSession(HttpSession session) {
        return session.getAttribute("username").toString();
    }
}

