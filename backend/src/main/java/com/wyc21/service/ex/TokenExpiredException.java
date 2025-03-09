package com.wyc21.service.ex;

public class TokenExpiredException extends ServiceException {
    public TokenExpiredException() {
        super();
    }

    public TokenExpiredException(String message) {
        super(message);
    }
} 