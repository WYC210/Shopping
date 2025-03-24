package com.wyc21.config;

import com.wyc21.service.impl.OrderServiceImpl;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Configuration;
import org.springframework.scheduling.annotation.EnableScheduling;
import org.springframework.scheduling.annotation.SchedulingConfigurer;
import org.springframework.scheduling.config.ScheduledTaskRegistrar;
import org.springframework.boot.context.event.ApplicationReadyEvent;
import org.springframework.context.event.EventListener;

import java.util.concurrent.Executors;
import java.util.concurrent.ScheduledExecutorService;
import java.util.concurrent.TimeUnit;

@Configuration
@EnableScheduling
public class SchedulingConfig implements SchedulingConfigurer {

    @Autowired
    private OrderServiceImpl orderService;

    private ScheduledExecutorService executor;

    @Override
    public void configureTasks(ScheduledTaskRegistrar taskRegistrar) {
        // 配置线程池
        executor = Executors.newScheduledThreadPool(1);
        taskRegistrar.setScheduler(executor);
    }

    @EventListener(ApplicationReadyEvent.class)
    public void startScheduledTasks() {
        // 应用完全启动后，等待10秒再开始执行定时任务
        executor.schedule(() -> {
            // 开始定时执行任务
            executor.scheduleWithFixedDelay(
                () -> orderService.checkExpiredOrders(),
                0,  // 初始延迟0秒
                1000000, // 每次执行间隔1000秒
                TimeUnit.MILLISECONDS
            );
        }, 10, TimeUnit.SECONDS);
    }
} 