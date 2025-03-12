package com.wyc21.mapper;

import com.wyc21.entity.BrowseHistory;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;
import java.util.Date;
import java.util.List;

@Mapper
public interface BrowseHistoryMapper {
    void insertFingerprintRecord(@Param("fingerprintId") String fingerprintId, @Param("userId") String userId);

    void insertBrowseHistory(@Param("historyId") String historyId,
            @Param("fingerprintId") String fingerprintId,
            @Param("userId") String userId,
            @Param("productId") String productId,
            @Param("browseTime") Date browseTime);

    List<BrowseHistory> getBrowseHistoryByUserId(@Param("userId") String userId, 
                                                @Param("size") int size, 
                                                @Param("offset") int offset);
    
    int getCountByUserId(@Param("userId") String userId);
}