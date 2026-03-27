package com.example.demo.service;

import com.example.demo.dto.*;
import com.example.demo.model.*;
import org.springframework.stereotype.Service;
import java.util.stream.Collectors;

@Service
public class MappingService {

    public UserDTO mapToUserDTOWithoutHouse(User user) {
        if (user == null) return null;
        return UserDTO.builder()
                .id(user.getId())
                .username(user.getUsername())
                .email(user.getEmail())
                .profile(mapToProfileDTO(user.getProfile()))
                .displayName(user.getProfile() != null ? user.getProfile().getDisplayName() : null)
                .profilePhotoUrl(user.getProfile() != null ? user.getProfile().getProfilePhotoUrl() : null)
                .build();
    }

    public UserDTO mapToUserDTO(User user) {
        if (user == null) return null;
        UserDTO dto = mapToUserDTOWithoutHouse(user);
        dto.setHouse(mapToHouseDTO(user.getHouse()));
        return dto;
    }

    public HouseDTO mapToHouseDTOWithoutMembers(House house) {
        if (house == null) return null;
        return HouseDTO.builder()
                .id(house.getId())
                .name(house.getName())
                .admin(mapToUserDTOWithoutHouse(house.getAdmin()))
                .build();
    }

    public HouseDTO mapToHouseDTO(House house) {
        if (house == null) return null;
        return HouseDTO.builder()
                .id(house.getId())
                .name(house.getName())
                .admin(mapToUserDTOWithoutHouse(house.getAdmin()))
                .members(house.getMembers() != null ? house.getMembers().stream()
                        .map(this::mapToUserDTOWithoutHouse)
                        .collect(Collectors.toList()) : null)
                .build();
    }

    public ProfileDTO mapToProfileDTO(Profile profile) {
        if (profile == null) return null;
        return ProfileDTO.builder()
                .displayName(profile.getDisplayName())
                .phoneNumber(profile.getPhoneNumber())
                .profilePhoto(profile.getProfilePhoto())
                .profilePhotoUrl(profile.getProfilePhotoUrl())
                .build();
    }

    public InventoryItemDTO mapToInventoryItemDTO(InventoryItem item) {
        if (item == null) return null;
        return InventoryItemDTO.builder()
                .id(item.getId())
                .name(item.getName())
                .price(item.getPrice())
                .imageUrl(item.getImageUrl())
                .build();
    }

    public QueueItemDTO mapToQueueItemDTO(QueueItem item) {
        if (item == null) return null;
        return QueueItemDTO.builder()
                .id(item.getId())
                .inventoryItem(mapToInventoryItemDTO(item.getInventoryItem()))
                .addedBy(item.getAddedBy() != null ? item.getAddedBy().getUsername() : null)
                .quantity(item.getQuantity())
                .provider(item.getProvider().name().charAt(0) + item.getProvider().name().substring(1).toLowerCase())
                .addedAt(item.getAddedAt())
                .build();
    }

    public ExpenseDTO mapToExpenseDTO(Expense expense) {
        if (expense == null) return null;
        return ExpenseDTO.builder()
                .id(expense.getId())
                .houseId(expense.getHouse() != null ? expense.getHouse().getId() : null)
                .userWhoPaid(mapToUserDTO(expense.getUserWhoPaid()))
                .name(expense.getName())
                .amount(expense.getAmount())
                .category(expense.getCategory().name())
                .date(expense.getDate())
                .isRecurring(expense.isRecurring())
                .dueDayOfMonth(expense.getDueDayOfMonth())
                .details(expense.getDetails())
                .build();
    }
}
