package com.example.demo.config;

import com.example.demo.model.InventoryItem;
import com.example.demo.repository.InventoryItemRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.stereotype.Component;

import java.math.BigDecimal;
import java.util.List;

@Component
@RequiredArgsConstructor
public class DataLoader implements ApplicationRunner {

    private final InventoryItemRepository inventoryItemRepository;

    @Override
    public void run(ApplicationArguments args) {
        if (inventoryItemRepository.count() > 0) return;

        inventoryItemRepository.saveAll(List.of(
            item("Milk (1L)",          "55.00",  "https://placehold.co/200x200/60a5fa/white?text=Milk"),
            item("Bread",              "40.00",  "https://placehold.co/200x200/f97316/white?text=Bread"),
            item("Eggs (12 pack)",     "90.00",  "https://placehold.co/200x200/facc15/white?text=Eggs"),
            item("Rice (1kg)",         "70.00",  "https://placehold.co/200x200/a3e635/white?text=Rice"),
            item("Cooking Oil (1L)",   "150.00", "https://placehold.co/200x200/fb923c/white?text=Oil"),
            item("Tomatoes (500g)",    "30.00",  "https://placehold.co/200x200/ef4444/white?text=Tomatoes"),
            item("Onions (1kg)",       "40.00",  "https://placehold.co/200x200/c084fc/white?text=Onions"),
            item("Potatoes (1kg)",     "35.00",  "https://placehold.co/200x200/d97706/white?text=Potatoes"),
            item("Butter (100g)",      "55.00",  "https://placehold.co/200x200/fde68a/333?text=Butter"),
            item("Cheese (200g)",      "120.00", "https://placehold.co/200x200/fbbf24/white?text=Cheese"),
            item("Pasta (500g)",       "60.00",  "https://placehold.co/200x200/6366f1/white?text=Pasta"),
            item("Coffee (100g)",      "200.00", "https://placehold.co/200x200/92400e/white?text=Coffee"),
            item("Green Tea (25 bags)","120.00", "https://placehold.co/200x200/4ade80/white?text=Tea"),
            item("Yogurt (400g)",      "65.00",  "https://placehold.co/200x200/38bdf8/white?text=Yogurt"),
            item("Dish Soap",          "45.00",  "https://placehold.co/200x200/22d3ee/white?text=Soap"),
            item("Toothpaste",         "80.00",  "https://placehold.co/200x200/818cf8/white?text=Paste"),
            item("Shampoo (200ml)",    "180.00", "https://placehold.co/200x200/e879f9/white?text=Shampoo"),
            item("Detergent (1kg)",    "130.00", "https://placehold.co/200x200/34d399/white?text=Detergent"),
            item("Bananas (6 pack)",   "40.00",  "https://placehold.co/200x200/fde047/333?text=Bananas"),
            item("Cereal (500g)",      "160.00", "https://placehold.co/200x200/fb7185/white?text=Cereal")
        ));
    }

    private InventoryItem item(String name, String price, String imageUrl) {
        return InventoryItem.builder()
                .name(name)
                .price(new BigDecimal(price))
                .imageUrl(imageUrl)
                .build();
    }
}
