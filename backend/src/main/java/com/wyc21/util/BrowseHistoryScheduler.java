package com.wyc21.util;

import com.wyc21.service.BrowseHistoryService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

@Component
public class BrowseHistoryScheduler {
    
    @Autowired
    private BrowseHistoryService browseHistoryService;
    
    // 每50分钟执行一次同步
    @Scheduled(fixedRate = 3000000)
    public void scheduleSyncBrowseHistory() {
        browseHistoryService.syncBrowseHistoryToDatabase();
    }
} 