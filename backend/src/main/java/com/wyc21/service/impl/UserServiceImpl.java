package com.wyc21.service.impl;


import java.time.LocalDateTime;
import java.util.Set;


import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import com.wyc21.util.PasswordUtils;
import com.wyc21.entity.User;
import com.wyc21.mapper.UserMapper;
import com.wyc21.service.IUserService;
import com.wyc21.service.ex.InsertException;
import com.wyc21.service.ex.UsernameDuplicatedException;
import com.wyc21.service.ex.UserNotFoundException;
import com.wyc21.service.ex.PasswordNotMatchException;
import com.wyc21.util.JwtUtil;
import com.wyc21.util.RedisUtil;
import com.wyc21.util.IpUtil;
import com.wyc21.util.CookieUtil;
import com.wyc21.util.SnowflakeIdGenerator;
import com.wyc21.mapper.IdGeneratorMapper;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.transaction.annotation.Transactional;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import com.wyc21.mapper.BrowseHistoryMapper;
import org.springframework.data.redis.core.RedisTemplate;
import com.wyc21.entity.BrowseHistory; // Adjust the package name if necessary
import com.fasterxml.jackson.databind.ObjectMapper;

@Service
public class UserServiceImpl implements IUserService {

    private static final Logger log = LoggerFactory.getLogger(UserServiceImpl.class);

    private static final String REDIS_BROWSE_HISTORY_KEY = "browse_history:";

    @Autowired
    private UserMapper userMapper;

    @Autowired
    private JwtUtil jwtUtil;

    @Autowired
    private RedisUtil redisUtil;

    @Autowired
    private IpUtil ipUtil;



    @Autowired
    private SnowflakeIdGenerator snowflakeIdGenerator;


    @Autowired
    private BrowseHistoryMapper browseHistoryMapper;

   

    @Autowired
    private ObjectMapper objectMapper;

    @Override
    public void reg(User user) {
        // 根据用户名查询用户数据,判断用户是否被注册过
        User result = userMapper.findByUsername(user.getUsername());
        if (result != null) {
            throw new UsernameDuplicatedException("用户名已被注册");
        }

        // 生成用户ID
        String uid = String.valueOf(snowflakeIdGenerator.nextId()); // 转换为String
        user.setUid(uid);
        log.debug("hahahahaahahsssss用户ID: {}", uid);

        // 密码加密
        user.setPassword(PasswordUtils.hashPassword(user.getPassword()));

        // 补全数据
        user.setIsDelete(0);
        user.setCreatedUser(user.getUsername());
        user.setModifiedUser(user.getUsername());
        LocalDateTime now = LocalDateTime.now();
        user.setCreatedTime(now);
        user.setModifiedTime(now);
        user.setPower("user");
        user.setAvatar("default.jpg");
        user.setGender(0);
        user.setPhone("");
        user.setEmail("");

        // 执行注册
        Integer rows = userMapper.insert(user);
        if (rows != 1) {
            throw new InsertException("注册时发生未知错误");
        }
    }

    @Override
    public User login(String username, String password, HttpServletRequest request, HttpServletResponse response) {
        // 根据用户名查询用户数据
        User result = userMapper.findByUsername(username);
        if (result == null) {
            throw new UserNotFoundException("用户不存在");
        }

        // 判断用户是否被删除
        if (result.getIsDelete() == 1) {
            throw new UserNotFoundException("用户不存在");
        }

        // 判断密码是否匹配
        String hashedPassword = result.getPassword();
        if (!PasswordUtils.checkPassword(password, hashedPassword)) {
            throw new PasswordNotMatchException("密码错误");
        }

        // 获取IP和地理位置
        String ip = ipUtil.getIpAddress(request);
        String ipLocation = ipUtil.getIpLocation(ip);
        log.info("uid地址: {}", result.getUid());

        // 获取浏览器指纹
        String fingerprint = request.getHeader("X-Device-Fingerprint");
        log.info("获取到的浏览器指纹: {}", fingerprint);

        if (fingerprint != null) {
            try {
                // 1. 先插入或更新浏览器指纹记录
                browseHistoryMapper.insertFingerprintRecord(fingerprint, result.getUid());

                // 2. 将Redis中的浏览记录同步到数据库
                String fingerprintKey = REDIS_BROWSE_HISTORY_KEY + fingerprint;
                Set<String> keys = redisUtil.keys(fingerprintKey + ":*");

                if (keys != null && !keys.isEmpty()) {
                    for (String key : keys) {
                        String value = redisUtil.get(key);
                        try {
                            BrowseHistory history = objectMapper.readValue(value, BrowseHistory.class);
                            browseHistoryMapper.insertBrowseHistory(
                                    history.getHistoryId(),
                                    history.getFingerprintId(),
                                    result.getUid(),
                                    history.getProductId(),
                                    history.getBrowseTime());
                        } catch (Exception e) {
                            log.error("插入浏览记录失败: {}", e.getMessage());
                        }
                    }
                }
            } catch (Exception e) {
                log.error("处理浏览记录时发生错误: {}", e.getMessage());
                // 继续登录流程，不影响用户登录
            }
        }

        // 生成访问令牌和刷新令牌
        String accessToken = jwtUtil.generateAccessToken(
                result.getUid(),
                result.getUsername(),
                ip,
                ipLocation);

        String refreshToken = jwtUtil.generateRefreshToken(
                result.getUid(),
                result.getUsername());

        // 存储访问令牌到Redis，设置15分钟过期
        String accessTokenKey = "access_token:" + result.getUid();
        redisUtil.setToken(accessTokenKey, accessToken, 15 * 60 * 1000L);

        // 存储刷新令牌到Redis，设置7天过期
        String refreshTokenKey = "refresh_token:" + result.getUid();
        redisUtil.setToken(refreshTokenKey, refreshToken, 7 * 24 * 60 * 60 * 1000L);

        // 设置返回的用户对象
        User user = new User();
        user.setUid(result.getUid());
        user.setUsername(result.getUsername());
        user.setAvatar(result.getAvatar());
        user.setAccessToken(accessToken);
        user.setRefreshToken(refreshToken);
        user.setPhone(result.getPhone());
        user.setEmail(result.getEmail());
        user.setGender(result.getGender());
        user.setPower(result.getPower());

        return user;
    }

    @Override
    public User getUserById(String uid) {
        log.info("查询用户信息，uid: {}", uid);
        User user = userMapper.findByUid(uid);
        if (user == null || user.getIsDelete() == 1) {
            throw new UserNotFoundException("用户不存在");
        }
        return user;
    }

    @Override
    @Transactional
    public User updateUserInfo(User user) {
        // 获取原用户信息
        User result = userMapper.findByUid(user.getUid()); // user.getUid()现在返回String
        if (result == null || result.getIsDelete() == 1) {
            throw new UserNotFoundException("用户不存在");
        }

        // 更新用户信息
        User updateUser = new User();
        updateUser.setUid(user.getUid()); // 现在是String类型
        updateUser.setPhone(user.getPhone());
        updateUser.setEmail(user.getEmail());
        updateUser.setGender(user.getGender());
        updateUser.setAvatar(user.getAvatar());
        updateUser.setModifiedUser(result.getUsername());
        updateUser.setModifiedTime(LocalDateTime.now());

        // 执行更新
        Integer rows = userMapper.updateInfo(updateUser);
        if (rows != 1) {
            throw new RuntimeException("更新用户信息时出现未知错误");
        }

        // 获取更新后的用户信息
        return userMapper.findByUid(user.getUid()); // 现在是String类型
    }

    @Override
    public void updatePassword(String uid, String oldPassword, String newPassword) {
        // 获取用户信息
        User result = userMapper.findByUid(uid); // 现在是String类型
        if (result == null || result.getIsDelete() == 1) {
            throw new UserNotFoundException("用户不存在");
        }

        // 验证旧密码
        if (!PasswordUtils.checkPassword(oldPassword, result.getPassword())) {
            throw new PasswordNotMatchException("原密码错误");
        }

        // 加密新密码
        String hashedPassword = PasswordUtils.hashPassword(newPassword);

        // 创建更新对象
        User updateUser = new User();
        updateUser.setUid(uid); // 现在是String类型
        updateUser.setPassword(hashedPassword);
        updateUser.setModifiedUser(result.getUsername());
        updateUser.setModifiedTime(LocalDateTime.now());

        // 执行更新
        Integer rows = userMapper.updatePassword(updateUser);
        if (rows != 1) {
            throw new RuntimeException("更新密码时出现未知错误");
        }
    }
}
