package com.wyc21.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;
import com.wyc21.entity.User;
import com.wyc21.service.IUserService;
import com.wyc21.util.JsonResult;
import com.wyc21.util.RedisUtil;
import com.wyc21.util.CookieUtil;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import java.util.Map;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import com.wyc21.service.TokenService;
import com.wyc21.service.BrowseHistoryService;
import com.wyc21.entity.BrowseHistory;
import com.wyc21.model.PageResult;

@RestController
@RequestMapping("/users")
@CrossOrigin
public class UserController extends BaseController {
    @Autowired
    private IUserService userService;

    @Autowired
    private RedisUtil redisUtil;

    @Autowired
    private TokenService tokenService; // 处理 token 逻辑
    @Autowired
    private BrowseHistoryService browseHistoryService;

    @Autowired
    private CookieUtil cookieUtil;
    private static final Logger log = LoggerFactory.getLogger(UserController.class);

    @PostMapping("/register")
    public JsonResult<Void> register(@RequestBody User user) {
        // 参数验证
        if (user.getUsername() == null || user.getUsername().trim().isEmpty()) {
            return new JsonResult<>(400, null, "用户名不能为空");
        }
        if (user.getPassword() == null || user.getPassword().trim().isEmpty()) {
            return new JsonResult<>(400, null, "密码不能为空");
        }

        // 设置默认值
        user.setIsDelete(0);
        user.setPower("user");
        user.setAvatar("default.jpg");
        user.setGender(0);

        userService.reg(user);
        return new JsonResult<>(OK, null, "注册成功");
    }

    @PostMapping("/login")
    public JsonResult<User> login(@RequestBody User user,
            HttpServletRequest request,
            HttpServletResponse response,
            @RequestHeader(value = "X-Device-Fingerprint", required = false) String fingerprint) {
        // 参数验证
        if (user.getUsername() == null || user.getUsername().trim().isEmpty()) {
            return new JsonResult<>(400, null, "用户名不能为空");
        }
        if (user.getPassword() == null || user.getPassword().trim().isEmpty()) {
            return new JsonResult<>(400, null, "密码不能为空");
        }

        // 登录并获取完整的用户信息
        User data = userService.login(user.getUsername(), user.getPassword(), request, response);

        // 登录成功后，关联用户ID和浏览器指纹
        if (fingerprint != null) {
            browseHistoryService.associateUserWithFingerprint(data.getUid(), fingerprint);
        }

        return new JsonResult<>(OK, data, "登录成功");
    }

    @PostMapping("/logout")
    public JsonResult<Void> logout(HttpServletRequest request, HttpServletResponse response) {
        String uid = request.getAttribute("uid").toString(); // 改为String类型
        if (uid != null) {
            // 从Redis中删除token
            redisUtil.deleteToken("token:" + uid);
            // 清除Cookie
            cookieUtil.clearTokenCookie(response);
            return new JsonResult<>(OK, null, "登出成功");
        }
        return new JsonResult<>(OK, null, "用户未登录");
    }

    @GetMapping("/info")
    public JsonResult<User> getUserInfo(HttpServletRequest request) {
        try {
            // 从 request 中获取 uid 并转换为 String
            String uid = request.getAttribute("uid").toString();

            // 获取用户信息
            User user = userService.getUserById(uid);

            // 创建一个新的用户对象，只包含需要返回给前端的信息
            User responseUser = new User();
            responseUser.setUid(user.getUid());
            responseUser.setUsername(user.getUsername());
            responseUser.setPower(user.getPower());
            responseUser.setPhone(user.getPhone() != null ? user.getPhone() : "");
            responseUser.setEmail(user.getEmail() != null ? user.getEmail() : "");
            responseUser.setGender(user.getGender() != null ? user.getGender() : 0);
            responseUser.setAvatar(user.getAvatar() != null ? user.getAvatar() : "default.jpg");
            responseUser.setCreatedTime(user.getCreatedTime());
            responseUser.setModifiedTime(user.getModifiedTime());

            return new JsonResult<>(OK, responseUser);
        } catch (Exception e) {
            e.printStackTrace();
            return new JsonResult<>(500, null, "获取用户信息失败：" + e.getMessage());
        }
    }

    @PatchMapping("/update")
    public JsonResult<User> updateUserInfo(@RequestBody User user, HttpServletRequest request) {
        try {
            String uid = request.getAttribute("uid").toString();
            user.setUid(uid);

            // 调用service层更新用户信息
            User updatedUser = userService.updateUserInfo(user);

            // 创建响应对象
            User responseUser = new User();
            responseUser.setUid(updatedUser.getUid());
            responseUser.setUsername(updatedUser.getUsername());
            responseUser.setPower(updatedUser.getPower());
            responseUser.setPhone(updatedUser.getPhone() != null ? updatedUser.getPhone() : "");
            responseUser.setEmail(updatedUser.getEmail() != null ? updatedUser.getEmail() : "");
            responseUser.setGender(updatedUser.getGender() != null ? updatedUser.getGender() : 0);
            responseUser.setAvatar(updatedUser.getAvatar() != null ? updatedUser.getAvatar() : "default.jpg");
            responseUser.setCreatedTime(updatedUser.getCreatedTime());
            responseUser.setModifiedTime(updatedUser.getModifiedTime());

            return new JsonResult<>(OK, responseUser, "用户信息更新成功");
        } catch (Exception e) {
            e.printStackTrace();
            return new JsonResult<>(500, null, "更新用户信息失败：" + e.getMessage());
        }
    }

    @PatchMapping("/password")
    public JsonResult<Void> updatePassword(@RequestBody Map<String, String> params, HttpServletRequest request) {
        try {
            String uid = request.getAttribute("uid").toString();
            String oldPassword = params.get("oldPassword");
            String newPassword = params.get("newPassword");

            // 参数验证
            if (oldPassword == null || oldPassword.trim().isEmpty()) {
                return new JsonResult<>(400, null, "旧密码不能为空");
            }
            if (newPassword == null || newPassword.trim().isEmpty()) {
                return new JsonResult<>(400, null, "新密码不能为空");
            }

            // 调用service层更新密码
            userService.updatePassword(uid, oldPassword, newPassword);

            return new JsonResult<>(OK, null, "密码修改成功");
        } catch (Exception e) {
            e.printStackTrace();
            return new JsonResult<>(500, null, "修改密码失败：" + e.getMessage());
        }

    }

    /**
     * 刷新 token
     */
    @PostMapping("/refresh")
    public JsonResult<String> refreshToken(@RequestBody Map<String, String> request) {
        String refreshToken = request.get("refreshToken");
        log.info("Received我是续签token,续签的是哈哈哈-- refresh token: {}", refreshToken);
        if (refreshToken == null) {
            return new JsonResult<>(400, null, "Refresh token is required");
        }

        String newAccessToken = tokenService.refreshAccessToken(refreshToken);
        if (newAccessToken == null) {
            log.warn("Invalid refresh token: {}", refreshToken);
            return new JsonResult<>(401, null, "Invalid refresh token");
        }

        return new JsonResult<>(200, newAccessToken, "Token refreshed successfully");
    }

    @GetMapping("/browse/history")
    public JsonResult<PageResult<BrowseHistory>> getBrowseHistory(
            @RequestParam(defaultValue = "1") int page,
            @RequestParam(defaultValue = "20") int size,
            @RequestHeader(value = "X-Device-Fingerprint", required = false) String fingerprint,
            HttpServletRequest request) {

        String userId = null;
        try {
            // 尝试获取用户ID，如果未登录则为null
            userId = request.getAttribute("uid") != null ? request.getAttribute("uid").toString() : null;
        } catch (Exception e) {
            log.debug("User not logged in");
        }

        // 输出浏览器指纹到控制台
        log.info("收到的浏览器指纹收到的浏览器指纹: {}", fingerprint);

        PageResult<BrowseHistory> result;
        if (userId != null) {
            // 用户已登录，获取关联的浏览记录
            result = browseHistoryService.getBrowseHistoryByUserId(userId, page, size);
        } else if (fingerprint != null) {
            // 用户未登录，通过浏览器指纹获取记录
            result = browseHistoryService.getBrowseHistoryByFingerprint(fingerprint, page, size);
        } else {
            return new JsonResult<>(400, null, "无法识别用户");
        }

        // 输出从Redis读取的记录到控制台
        log.info("Retrieved browse history: {}", result.getRecords());

        return new JsonResult<>(OK, result);
    }
}
