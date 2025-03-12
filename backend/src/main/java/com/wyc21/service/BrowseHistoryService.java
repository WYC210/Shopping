package com.wyc21.service;

import com.wyc21.entity.BrowseHistory;
import com.wyc21.model.PageResult;

public interface BrowseHistoryService {
    void addBrowseHistory(String userId, String fingerprint, String productId);

    PageResult<BrowseHistory> getBrowseHistoryByUserId(String userId, int page, int size);

    PageResult<BrowseHistory> getBrowseHistoryByFingerprint(String fingerprint, int page, int size);

    void syncBrowseHistoryToDatabase();

    void associateUserWithFingerprint(String userId, String fingerprint);
}