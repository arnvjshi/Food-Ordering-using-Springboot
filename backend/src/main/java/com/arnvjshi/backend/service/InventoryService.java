package com.arnvjshi.backend.service;

import java.util.List;

import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import com.arnvjshi.backend.dto.InventoryAdjustmentRequest;
import com.arnvjshi.backend.dto.InventoryItemRequest;
import com.arnvjshi.backend.dto.InventoryItemResponse;
import com.arnvjshi.backend.dto.InventorySummaryResponse;
import com.arnvjshi.backend.entity.InventoryItem;
import com.arnvjshi.backend.repository.InventoryItemRepository;

@Service
public class InventoryService {

    private final InventoryItemRepository inventoryItemRepository;

    public InventoryService(InventoryItemRepository inventoryItemRepository) {
        this.inventoryItemRepository = inventoryItemRepository;
    }

    public List<InventoryItemResponse> listItems() {
        return inventoryItemRepository.findAllByOrderByNameAsc().stream()
                .map(InventoryItemResponse::from)
                .toList();
    }

    public InventorySummaryResponse summary() {
        List<InventoryItem> items = inventoryItemRepository.findAll();
        long lowStock = items.stream().filter(item -> item.getQuantity() > 0 && item.getQuantity() <= item.getReorderLevel()).count();
        long outOfStock = items.stream().filter(item -> item.getQuantity() == 0).count();
        long totalUnits = items.stream().mapToLong(InventoryItem::getQuantity).sum();
        return new InventorySummaryResponse(items.size(), lowStock, outOfStock, totalUnits);
    }

    public InventoryItemResponse create(InventoryItemRequest request) {
        if (inventoryItemRepository.existsBySku(request.sku())) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "SKU already exists");
        }

        InventoryItem item = new InventoryItem();
        apply(request, item);
        return InventoryItemResponse.from(inventoryItemRepository.save(item));
    }

    public InventoryItemResponse update(Long id, InventoryItemRequest request) {
        InventoryItem item = inventoryItemRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Inventory item not found"));

        if (!item.getSku().equals(request.sku()) && inventoryItemRepository.existsBySku(request.sku())) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "SKU already exists");
        }

        apply(request, item);
        return InventoryItemResponse.from(inventoryItemRepository.save(item));
    }

    public InventoryItemResponse adjust(Long id, InventoryAdjustmentRequest request) {
        InventoryItem item = inventoryItemRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Inventory item not found"));

        int nextQuantity = item.getQuantity() + request.delta();
        if (nextQuantity < 0) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Stock cannot drop below zero");
        }

        item.setQuantity(nextQuantity);
        return InventoryItemResponse.from(inventoryItemRepository.save(item));
    }

    public void delete(Long id) {
        InventoryItem item = inventoryItemRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Inventory item not found"));
        inventoryItemRepository.delete(item);
    }

    private void apply(InventoryItemRequest request, InventoryItem item) {
        item.setSku(request.sku());
        item.setName(request.name());
        item.setCategory(request.category());
        item.setLocation(emptyToNull(request.location()));
        item.setSupplier(emptyToNull(request.supplier()));
        item.setQuantity(request.quantity());
        item.setReorderLevel(request.reorderLevel());
        item.setNotes(emptyToNull(request.notes()));
    }

    private String emptyToNull(String value) {
        return value == null || value.isBlank() ? null : value;
    }
}