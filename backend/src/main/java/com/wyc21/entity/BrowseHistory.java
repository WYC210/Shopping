package com.wyc21.entity;

import lombok.Data;
import java.util.Date;

@Data
public class BrowseHistory {
    private String historyId;
    private String fingerprintId;
    private String userId;
    private String productId;
    private Date browseTime;
}