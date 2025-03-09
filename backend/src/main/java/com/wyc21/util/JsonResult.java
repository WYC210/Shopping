package com.wyc21.util;

import java.io.Serializable;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
// 统一响应结果的类型
public class JsonResult<E> implements Serializable {
    // 状态码
    private Integer status;
    // 状态描述信息
    private String message;
    // 数据
    private E data;

    public JsonResult() {

    }

    public JsonResult(Integer status, E data) {
        this.status = status;
        this.data = data;
    }

    public JsonResult(Integer status, E data, String message) {
        this.status = status;
        this.data = data;
        this.message = message;
    }

    public JsonResult(Integer status) {
        this.status = status;
    }

    public JsonResult(Throwable e) {
        this.message = e.getMessage();
    }
}
