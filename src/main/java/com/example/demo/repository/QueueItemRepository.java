package com.example.demo.repository;

import com.example.demo.model.House;
import com.example.demo.model.InventoryItem;
import com.example.demo.model.QueueItem;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
import java.util.Optional;

public interface QueueItemRepository extends JpaRepository<QueueItem, Long> {
    List<QueueItem> findByHouse(House house);
    Optional<QueueItem> findByHouseAndInventoryItemAndProvider(House house, InventoryItem inventoryItem, QueueItem.Provider provider);
    void deleteByHouse(House house);
}
