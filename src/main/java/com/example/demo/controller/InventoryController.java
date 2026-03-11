package com.example.demo.controller;

import com.example.demo.dto.InventoryItemDTO;
import com.example.demo.repository.InventoryItemRepository;
import com.example.demo.service.MappingService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/inventory")
@RequiredArgsConstructor
public class InventoryController {

    private final InventoryItemRepository inventoryItemRepository;
    private final MappingService mappingService;

    @GetMapping("/")
    public ResponseEntity<List<InventoryItemDTO>> getInventory() {
        return ResponseEntity.ok(inventoryItemRepository.findAll().stream()
                .map(mappingService::mapToInventoryItemDTO)
                .collect(Collectors.toList()));
    }
}
