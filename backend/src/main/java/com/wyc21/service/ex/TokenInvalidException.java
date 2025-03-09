package com.wyc21.service.ex;

public class TokenInvalidException extends ServiceException {
    public TokenInvalidException() {
        super();
    }

    public TokenInvalidException(String message) {
        super(message);
    }
} 