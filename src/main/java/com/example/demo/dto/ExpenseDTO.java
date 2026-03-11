package com.example.demo.dto;

import lombok.*;
import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ExpenseDTO {
    private Long id;
    private Long houseId;
    private UserDTO userWhoPaid;
    private String name;
    private BigDecimal amount;
    private String category;
    private LocalDateTime date;
    private boolean isRecurring;
    private Integer dueDayOfMonth;
    private Object details;
}
