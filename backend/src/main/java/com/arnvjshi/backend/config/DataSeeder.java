package com.arnvjshi.backend.config;

import java.util.List;
import java.util.Set;

import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.math.BigDecimal;

import com.arnvjshi.backend.entity.AppUser;
import com.arnvjshi.backend.entity.InventoryItem;
import com.arnvjshi.backend.entity.MenuItem;
import com.arnvjshi.backend.entity.Restaurant;
import com.arnvjshi.backend.repository.AppUserRepository;
import com.arnvjshi.backend.repository.InventoryItemRepository;
import com.arnvjshi.backend.repository.MenuItemRepository;
import com.arnvjshi.backend.repository.RestaurantRepository;

@Configuration
public class DataSeeder {

    @Bean
    CommandLineRunner seedData(AppUserRepository userRepository,
                               InventoryItemRepository inventoryItemRepository,
                               RestaurantRepository restaurantRepository,
                               MenuItemRepository menuItemRepository,
                               PasswordEncoder passwordEncoder) {
        return args -> {
            if (userRepository.count() == 0) {
                userRepository.saveAll(List.of(
                        user("admin", "Admin123!", "Avery Admin", Set.of("ADMIN"), passwordEncoder),
                        user("manager", "Manager123!", "Mia Manager", Set.of("MANAGER"), passwordEncoder),
                        user("staff", "Staff123!", "Sam Staff", Set.of("STAFF"), passwordEncoder)));
            }

            if (inventoryItemRepository.count() == 0) {
                inventoryItemRepository.saveAll(List.of(
                        item("SKU-1001", "Steel Fasteners", "Hardware", "Aisle 3", "Northwind Supply", 240, 80,
                                "Bulk bin for assembly line"),
                        item("SKU-1002", "Label Printer Ribbons", "Office", "Shelf B2", "PaperTrail", 38, 20,
                                "Used by shipping desk"),
                        item("SKU-1003", "Protective Gloves", "Safety", "Aisle 1", "SafeWork", 12, 25,
                                "Reorder before next audit"),
                        item("SKU-1004", "Barcode Scanners", "Equipment", "Cage 4", "ScanPro", 7, 10,
                                "Track loaned devices carefully")));
            }

            if (restaurantRepository.count() == 0) {
                Restaurant luna = restaurantRepository.save(restaurant("Luna Spice House", "Indian", "Downtown", 4.6));
                Restaurant bistro = restaurantRepository.save(restaurant("Harbor Street Bistro", "Continental", "Seaside", 4.4));
                Restaurant ramen = restaurantRepository.save(restaurant("Kyoto Ramen Lab", "Japanese", "Midtown", 4.7));

                menuItemRepository.saveAll(List.of(
                        menuItem(luna, "Butter Chicken", "Creamy tomato gravy", new BigDecimal("14.50"), "Main", 18, true),
                        menuItem(luna, "Garlic Naan", "Tandoor baked", new BigDecimal("3.50"), "Sides", 6, true),
                        menuItem(luna, "Paneer Tikka", "Char-grilled cottage cheese", new BigDecimal("10.00"), "Starters", 14, true),
                        menuItem(bistro, "Truffle Mushroom Pasta", "Parmesan cream sauce", new BigDecimal("16.80"), "Main", 16, true),
                        menuItem(bistro, "Grilled Salmon", "Lemon herb glaze", new BigDecimal("19.20"), "Main", 20, true),
                        menuItem(bistro, "Chocolate Lava Cake", "Warm with berry coulis", new BigDecimal("6.75"), "Dessert", 8, true),
                        menuItem(ramen, "Tonkotsu Ramen", "Rich pork broth", new BigDecimal("13.40"), "Main", 15, true),
                        menuItem(ramen, "Gyoza", "Pan-seared dumplings", new BigDecimal("5.60"), "Sides", 7, true),
                        menuItem(ramen, "Matcha Cheesecake", "Silky green tea", new BigDecimal("6.10"), "Dessert", 6, true)));
            }
        };
    }

    private AppUser user(String username, String password, String fullName, Set<String> roles,
                         PasswordEncoder passwordEncoder) {
        AppUser user = new AppUser();
        user.setUsername(username);
        user.setPassword(passwordEncoder.encode(password));
        user.setFullName(fullName);
        user.setRoles(roles);
        return user;
    }

    private InventoryItem item(String sku, String name, String category, String location,
                               String supplier, int quantity, int reorderLevel, String notes) {
        InventoryItem item = new InventoryItem();
        item.setSku(sku);
        item.setName(name);
        item.setCategory(category);
        item.setLocation(location);
        item.setSupplier(supplier);
        item.setQuantity(quantity);
        item.setReorderLevel(reorderLevel);
        item.setNotes(notes);
        return item;
    }

    private Restaurant restaurant(String name, String cuisine, String location, double rating) {
        Restaurant restaurant = new Restaurant();
        restaurant.setName(name);
        restaurant.setCuisine(cuisine);
        restaurant.setLocation(location);
        restaurant.setRating(rating);
        restaurant.setActive(true);
        return restaurant;
    }

    private MenuItem menuItem(Restaurant restaurant, String name, String description, BigDecimal price,
                              String category, int prepMinutes, boolean available) {
        MenuItem item = new MenuItem();
        item.setRestaurant(restaurant);
        item.setName(name);
        item.setDescription(description);
        item.setPrice(price);
        item.setCategory(category);
        item.setPrepMinutes(prepMinutes);
        item.setAvailable(available);
        return item;
    }
}