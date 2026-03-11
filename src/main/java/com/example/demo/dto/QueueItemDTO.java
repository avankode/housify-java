package com.example.demo.dto;

import lombok.*;
import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class QueueItemDTO {
    private Long id;
    private InventoryItemDTO inventoryItem;
    private String addedBy;
    private Integer quantity;
    private String provider;
    private LocalDateTime addedAt;
}
