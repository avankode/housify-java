package com.example.demo.controller;

import com.example.demo.dto.QueueItemDTO;
import com.example.demo.model.*;
import com.example.demo.repository.*;
import com.example.demo.service.MappingService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.core.user.OAuth2User;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Slf4j
@RestController
@RequestMapping("/api/queues")
@RequiredArgsConstructor
public class QueueController {

    private final QueueItemRepository queueItemRepository;
    private final InventoryItemRepository inventoryItemRepository;
    private final UserRepository userRepository;
    private final MappingService mappingService;

    @GetMapping("/")
    public ResponseEntity<List<QueueItemDTO>> getQueueItems(@AuthenticationPrincipal OAuth2User oAuth2User) {
        User user = getUser(oAuth2User);
        if (user.getHouse() == null) {
            return ResponseEntity.ok(List.of());
        }
        List<QueueItem> items = queueItemRepository.findByHouse(user.getHouse());
        return ResponseEntity.ok(items.stream()
                .map(mappingService::mapToQueueItemDTO)
                .collect(Collectors.toList()));
    }

    @PostMapping("/add/")
    public ResponseEntity<?> addQueueItem(@AuthenticationPrincipal OAuth2User oAuth2User, @RequestBody Map<String, Object> payload) {
        User user = getUser(oAuth2User);
        if (user.getHouse() == null) {
            return ResponseEntity.badRequest().body(Map.of("error", "User does not belong to a house."));
        }

        Long inventoryItemId = Long.valueOf(payload.get("inventory_item_id").toString());
        Integer quantityToAdd = Integer.valueOf(payload.getOrDefault("quantity", 1).toString());
        QueueItem.Provider provider = QueueItem.Provider.valueOf(payload.get("provider").toString().toUpperCase());

        InventoryItem inventoryItem = inventoryItemRepository.findById(inventoryItemId)
                .orElseThrow(() -> new RuntimeException("Inventory item not found"));

        return queueItemRepository.findByHouseAndInventoryItemAndProvider(user.getHouse(), inventoryItem, provider)
                .map(existingItem -> {
                    existingItem.setQuantity(existingItem.getQuantity() + quantityToAdd);
                    queueItemRepository.save(existingItem);
                    return ResponseEntity.ok(mappingService.mapToQueueItemDTO(existingItem));
                })
                .orElseGet(() -> {
                    QueueItem newItem = QueueItem.builder()
                            .house(user.getHouse())
                            .addedBy(user)
                            .inventoryItem(inventoryItem)
                            .quantity(quantityToAdd)
                            .provider(provider)
                            .build();
                    queueItemRepository.save(newItem);
                    log.info("Queue: {} added {}x '{}' via {} to house '{}'", user.getEmail(), quantityToAdd, inventoryItem.getName(), provider, user.getHouse().getName());
                    return ResponseEntity.status(HttpStatus.CREATED).body(mappingService.mapToQueueItemDTO(newItem));
                });
    }

    @DeleteMapping("/{pk}/delete/")
    public ResponseEntity<?> deleteQueueItem(@AuthenticationPrincipal OAuth2User oAuth2User, @PathVariable("pk") Long pk) {
        User user = getUser(oAuth2User);
        QueueItem item = queueItemRepository.findById(pk)
                .orElseThrow(() -> new RuntimeException("Item not found"));

        if (!item.getHouse().equals(user.getHouse())) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
        }

        queueItemRepository.delete(item);
        log.info("Queue: item {} deleted by {}", pk, user.getEmail());
        return ResponseEntity.noContent().build();
    }

    @PostMapping("/clear/")
    public ResponseEntity<?> clearQueue(@AuthenticationPrincipal OAuth2User oAuth2User) {
        User user = getUser(oAuth2User);
        if (user.getHouse() == null) {
            return ResponseEntity.badRequest().body(Map.of("detail", "User does not belong to a house."));
        }
        queueItemRepository.deleteByHouse(user.getHouse());
        log.info("Queue cleared for house '{}' by {}", user.getHouse().getName(), user.getEmail());
        return ResponseEntity.noContent().build();
    }

    private User getUser(OAuth2User oAuth2User) {
        String email = oAuth2User.getAttribute("email");
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));
    }
}
