package com.tcgtrader.controller;

import com.tcgtrader.dto.DiscountRequest;
import com.tcgtrader.dto.DiscountResponse;
import com.tcgtrader.service.DiscountService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequiredArgsConstructor
public class DiscountController {

    private final DiscountService discountService;

    @PostMapping("/api/discounts")
    @PreAuthorize("hasRole('ADMIN')")
    @ResponseStatus(HttpStatus.CREATED)
    public DiscountResponse create(@Valid @RequestBody DiscountRequest request) {
        return discountService.create(request);
    }

    @GetMapping("/api/items/{itemId}/discounts")
    public List<DiscountResponse> findByItem(@PathVariable UUID itemId) {
        return discountService.findByItem(itemId);
    }

    @GetMapping("/api/items/{itemId}/discounts/active")
    public List<DiscountResponse> findActiveByItem(@PathVariable UUID itemId) {
        return discountService.findActiveByItem(itemId);
    }
}
