package com.wyc21.service.ex;

// 用户名重复异常
public class UsernameDuplicatedException extends ServiceException {
    public UsernameDuplicatedException() {
        super();
    }

    public UsernameDuplicatedException(String message) {
        super(message);
    }

    public UsernameDuplicatedException(Throwable cause) {
        super(cause);
    }
    public UsernameDuplicatedException(String message, Throwable cause) {
        super(message, cause);
    }
    public UsernameDuplicatedException(String message, Throwable cause, boolean enableSuppression, boolean writableStackTrace) {
        super(message, cause, enableSuppression, writableStackTrace);
    }
}
