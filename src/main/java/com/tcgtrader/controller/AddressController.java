package com.tcgtrader.controller;

import com.tcgtrader.dto.AddressRequest;
import com.tcgtrader.dto.AddressResponse;
import com.tcgtrader.service.AddressService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/users/{userId}/addresses")
@RequiredArgsConstructor
@PreAuthorize("hasRole('ADMIN') or #userId.toString() == authentication.principal")
public class AddressController {

    private final AddressService addressService;

    @GetMapping
    public List<AddressResponse> list(@PathVariable UUID userId) {
        return addressService.list(userId);
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public AddressResponse create(@PathVariable UUID userId, @Valid @RequestBody AddressRequest request) {
        return addressService.create(userId, request);
    }

    @DeleteMapping("/{addressId}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void delete(@PathVariable UUID userId, @PathVariable UUID addressId) {
        addressService.delete(userId, addressId);
    }
}
