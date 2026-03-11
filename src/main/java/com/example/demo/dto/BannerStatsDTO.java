package com.example.demo.dto;

import lombok.*;
import java.math.BigDecimal;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class BannerStatsDTO {
    private BigDecimal totalGroceries;
    private BigDecimal totalSharedRentals;
    private BigDecimal yourPersonalDues;
    private Integer memberCount;
}
