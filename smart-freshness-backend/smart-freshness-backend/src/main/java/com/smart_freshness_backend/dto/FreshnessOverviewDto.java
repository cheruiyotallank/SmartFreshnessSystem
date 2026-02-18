package com.smart_freshness_backend.dto;

import lombok.Data;
import java.time.LocalDateTime;

@Data
public class FreshnessOverviewDto {
    private Long unitId;
    private String unitName;
    private String productName;
    private Integer latestFreshnessScore;
    private Double currentPrice;
    private Integer inventoryCount;
    private Double voc;
    private Double temperature;
    private Double humidity;
    private LocalDateTime latestReadingTimestamp;
    private String freshnessStatus;
    private Integer discountPercentage;
}
