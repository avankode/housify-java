package com.example.demo.dto;

import lombok.*;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class UserDTO {
    private Long id;
    private String username;
    private String email;
    private HouseDTO house;
    private ProfileDTO profile;
    private String displayName;
    private String profilePhotoUrl;
}
