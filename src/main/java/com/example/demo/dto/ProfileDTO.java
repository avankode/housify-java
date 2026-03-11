package com.example.demo.dto;

import lombok.*;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ProfileDTO {
    private String displayName;
    private String phoneNumber;
    private String profilePhoto;
    private String profilePhotoUrl;
}
