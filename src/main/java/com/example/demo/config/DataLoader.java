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
            item("Milk (Toned)",       "68.00",  "https://upload.wikimedia.org/wikipedia/commons/a/a5/Glass_of_Milk_%2833657535532%29.jpg"),
            item("Curd (1kg)",         "133.00", "https://www.bbassets.com/media/uploads/p/l/40003156_9-milky-mist-natural-set-curd.jpg"),
            item("Tonic",              "60.00",  "https://m.media-amazon.com/images/I/516P3BD9nTL.jpg"),
            item("Eggs (Henfruit)",    "330.00", "https://instamart-media-assets.swiggy.com/swiggy/image/upload/fl_lossy,f_auto,q_auto/NI_CATALOG/IMAGES/CIW/2026/2/6/bd2f9693-615c-4f45-b41e-47c7b7114517_4001_1.png"),
            item("Aluminium Foil",     "169.00", "https://m.media-amazon.com/images/I/61+rRbG+LWL._AC_UF1000,1000_QL80_.jpg"),
            item("Strawberries",       "99.00",  "https://www.thesophisticatedcaveman.com/wp-content/uploads/2017/06/Strawberries.jpg"),
            item("Blueberries",        "199.00", "https://foodmarble.com/more/wp-content/uploads/2021/09/joanna-kosinska-4qujjbj3srs-unsplash-scaled.jpg"),
            item("Tomato (500g)",      "11.00",  "https://upload.wikimedia.org/wikipedia/commons/8/89/Tomato_je.jpg"),
            item("Bananas",            "27.00",  "https://upload.wikimedia.org/wikipedia/commons/8/8a/Banana-Single.jpg"),
            item("Tortilla",           "175.00", "https://static01.nyt.com/images/2024/08/06/multimedia/11EATrex-flour-tortillas-mvfk/11EATrex-flour-tortillas-mvfk-googleFourByThree.jpg"),
            item("Bread (Sourdough)",  "110.00", "https://theobroma.in/cdn/shop/files/WheatSourdoughLoaf.jpg?v=1711606024"),
            item("Chicken",            "289.00", "https://www.greenchickchop.in/cdn/shop/files/ChickenBreastBoneless.webp?v=1682572347"),
            item("Coffee (Bru Gold)",  "275.00", "https://www.jiomart.com/images/product/original/493626846/bru-gold-edition-rich-flavour-coffee-100-g-product-images-o493626846-p599173064-0-202510101730.jpg?im=Resize=(1000,1000)"),
            item("Protein Oats",       "657.00", "https://rukmini1.flixcart.com/image/1500/1500/xif0q/cereal-flake/v/j/m/400-high-protein-oats-with-added-probiotic-gluten-free-dark-original-imahdfv9gvhtf2ab.jpeg"),
            item("Tissue Paper",       "85.00",  "https://5.imimg.com/data5/SELLER/Default/2024/11/464118516/VU/UE/NO/235614108/100-pulls-soft-pack-ft-jpg-500x500.jpg"),
            item("Toilet Paper",       "69.00",  "https://suspire.in/cdn/shop/files/front_3_1080x.png?v=1746680432"),
            item("All Out Refill (4)", "259.00", "https://rukmini1.flixcart.com/image/1500/1500/xif0q/mosquito-vaporise-refill/b/u/s/180-ultra-pack-of-4-refills-4-380891-all-out-original-imagw5n3zhgkphgj.jpeg?q=70"),
            item("ToothPaste",         "155.00", "https://m.media-amazon.com/images/I/717qpxX82kL._AC_UF1000,1000_QL80_.jpg"),
            item("Cetaphil Face Wash", "427.00", "https://dermatics.in/cdn/shop/files/CetaphilGentleSkinCleanser_DrytoNormal_SensitiveSkin_3000x_a12c6c70-cd04-4833-9369-fd3fbe123036.png?v=1735277731&width=1946"),
            item("Onions (500g)",      "36.00",  "https://tiimg.tistatic.com/fp/2/007/798/raw-processed-round-shaped-medium-size-original-fresh-red-onion-1-kg-987.jpg")
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
