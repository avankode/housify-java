package com.example.demo.dto;

import lombok.*;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class HouseDTO {
    private Long id;
    private String name;
    private UserDTO admin;
    private List<UserDTO> members;
}
